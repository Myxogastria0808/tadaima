// Low-level greetd IPC client.
//
// Implements the greetd-ipc(7) protocol directly over Unix socket,
// removing the dependency on Astal Greet (gi://AstalGreet).
//
// Protocol: 4-byte length prefix (host endian) + UTF-8 JSON payload.
// Socket path: GREETD_SOCK environment variable (set by greetd).
//
// Ref: https://man.archlinux.org/man/greetd-ipc.7.en

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

export type GreetdResponse =
  | { type: "success" }
  | { type: "error"; error_type: string; description: string }
  | {
      type: "auth_message";
      auth_message_type: string;
      auth_message: string;
    };

// Send a request to greetd and return the parsed response.
// Uses async I/O for reads to avoid blocking the GTK main loop
// during PAM authentication (which can take 2-3 seconds on failure).
const send = async (request: object): Promise<GreetdResponse> => {
  const sockPath = GLib.getenv("GREETD_SOCK");
  if (!sockPath) {
    throw new Error("GREETD_SOCK environment variable is not set");
  }

  // Connect to greetd Unix socket
  const addr = Gio.UnixSocketAddress.new(sockPath);
  const client = new Gio.SocketClient();
  const conn = client.connect(addr, null);

  // Write: 4-byte length (host endian) + JSON payload
  const payload = JSON.stringify(request);
  const ostream = Gio.DataOutputStream.new(conn.get_output_stream());
  ostream.set_byte_order(Gio.DataStreamByteOrder.HOST_ENDIAN);
  ostream.put_int32(payload.length, null);
  ostream.put_string(payload, null);
  ostream.close(null);

  // Read: 4-byte length + JSON response
  const istream = conn.get_input_stream();
  const headBytes = await istream.read_bytes_async(
    4,
    GLib.PRIORITY_DEFAULT,
    null,
  );
  const headArray = headBytes.toArray();
  // Parse 4-byte little-endian integer (host endian on x86)
  const responseLength =
    headArray[0] |
    (headArray[1] << 8) |
    (headArray[2] << 16) |
    (headArray[3] << 24);

  const bodyBytes = await istream.read_bytes_async(
    responseLength,
    GLib.PRIORITY_DEFAULT,
    null,
  );

  conn.close(null);
  return JSON.parse(new TextDecoder().decode(bodyBytes.toArray()));
};

export const createSession = (username: string): Promise<GreetdResponse> =>
  send({ type: "create_session", username });

export const postAuthResponse = (response: string): Promise<GreetdResponse> =>
  send({ type: "post_auth_message_response", response });

export const startSession = (
  cmd: string[],
  env: string[] = [],
): Promise<GreetdResponse> => send({ type: "start_session", cmd, env });

export const cancelSession = (): Promise<GreetdResponse> =>
  send({ type: "cancel_session" });

