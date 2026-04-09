/**
 * Low-level greetd IPC client.
 *
 * Implements the {@link https://man.archlinux.org/man/greetd-ipc.7.en | greetd-ipc(7)}
 * protocol directly over Unix socket.
 *
 * Protocol: 4-byte length prefix (host endian) + UTF-8 JSON payload.
 * Socket path: `GREETD_SOCK` environment variable (set by greetd).
 *
 * @see {@link https://docs.rs/greetd_ipc/latest/greetd_ipc/ | Rust reference implementation}
 * @module
 */

import Gio from "gi://Gio";
import GLib from "gi://GLib";

// Enable async/await for InputStream.read_bytes_async.
// This is a standard GJS pattern (not Astal-specific).
// See: https://gjs.guide/guides/gjs/asynchronous-programming.html
Gio._promisify(
  Gio.InputStream.prototype,
  "read_bytes_async",
  "read_bytes_finish",
);

/**
 * A response from greetd, matching the greetd-ipc(7) JSON schema.
 */
export type GreetdResponse =
  | { type: "success" }
  | { type: "error"; error_type: "auth_error" | "error"; description: string }
  | {
      type: "auth_message";
      auth_message_type: "visible" | "secret" | "info" | "error";
      auth_message: string;
    };

/**
 * Send a request to greetd and return the parsed response.
 *
 * Uses async I/O for reads to avoid blocking the GTK main loop
 * during PAM authentication (pam_fail_delay adds a randomized delay on failure).
 *
 * @param request - The JSON-serializable request object.
 * @returns The parsed greetd response.
 * @throws If `GREETD_SOCK` is not set, or the response is invalid.
 */
const send = async (request: object): Promise<GreetdResponse> => {
  const sockPath = GLib.getenv("GREETD_SOCK");
  if (!sockPath) {
    throw new Error("GREETD_SOCK environment variable is not set");
  }
  // Connect to greetd Unix socket
  const addr = Gio.UnixSocketAddress.new(sockPath);
  const client = new Gio.SocketClient();
  const conn = client.connect(addr, null);

  try {
    // Write: 4-byte length (host endian) + JSON payload
    const payload = JSON.stringify(request);
    const ostream = Gio.DataOutputStream.new(conn.get_output_stream());
    ostream.set_byte_order(Gio.DataStreamByteOrder.HOST_ENDIAN);
    ostream.put_int32(payload.length, null);
    ostream.put_string(payload, null);
    ostream.close(null);

    // Read: 4-byte length + JSON response
    // Use DataInputStream with HOST_ENDIAN to correctly parse the length
    // prefix on any architecture (x86 little-endian, ARM big-endian, etc.)
    const distream = Gio.DataInputStream.new(conn.get_input_stream());
    distream.set_byte_order(Gio.DataStreamByteOrder.HOST_ENDIAN);

    const headBytes = await distream.read_bytes_async(
      4,
      GLib.PRIORITY_DEFAULT,
      null,
    );
    const lengthStream = Gio.DataInputStream.new(
      Gio.MemoryInputStream.new_from_bytes(headBytes),
    );
    lengthStream.set_byte_order(Gio.DataStreamByteOrder.HOST_ENDIAN);
    const length = lengthStream.read_int32(null);
    lengthStream.close(null);

    if (length <= 0) {
      throw new Error(`Invalid response length from greetd: ${length}`);
    }

    const bodyBytes = await distream.read_bytes_async(
      length,
      GLib.PRIORITY_DEFAULT,
      null,
    );
    distream.close(null);

    const body = new TextDecoder().decode(bodyBytes.toArray());
    try {
      return JSON.parse(body);
    } catch (_) {
      throw new Error(`Invalid JSON response from greetd: ${body}`);
    }
  } finally {
    conn.close(null);
  }
};

/**
 * greetd IPC operations.
 *
 * Each method sends a request to the greetd daemon via Unix socket
 * and returns the parsed response.
 */
export const greetd = {
  /**
   * Initiate a login attempt for the given username.
   * @param username - The username to authenticate.
   */
  createSession: (username: string): Promise<GreetdResponse> =>
    send({ type: "create_session", username }),

  /**
   * Respond to an authentication challenge (e.g. password prompt).
   * @param response - The authentication response (typically a password).
   */
  postAuthResponse: (response: string): Promise<GreetdResponse> =>
    send({ type: "post_auth_message_response", response }),

  /**
   * Start the authenticated session with the given command.
   * @param cmd - The session command as an argv array.
   * @param env - Optional environment variables as `KEY=VALUE` strings.
   */
  startSession: (cmd: string[], env: string[] = []): Promise<GreetdResponse> =>
    send({ type: "start_session", cmd, env }),

  /**
   * Cancel the current session configuration.
   */
  cancelSession: (): Promise<GreetdResponse> =>
    send({ type: "cancel_session" }),
} as const;

