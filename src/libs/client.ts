// greetd authentication client.
//
// Communicates with greetd directly via Unix socket using the greetd-ipc(7)
// protocol. No external dependencies (Astal Greet is NOT used).
//
// greetd expects greeters to handle auth retries internally — the greeter
// must not exit on failure. This client returns a result object instead of
// throwing, so the UI can display errors and let the user retry.
//
// References:
// - greetd IPC protocol: https://man.archlinux.org/man/greetd-ipc.7.en
// - greetd retry design: https://github.com/apognu/tuigreet/issues/24

import GLib from "gi://GLib";
import {
  createSession,
  postAuthResponse,
  startSession,
  cancelSession,
} from "./greetd";
import { CacheManager } from "./cache";
import type { CachedState } from "./cache";
import { SessionManager } from "./sessions";
import type { Session } from "./sessions";

export type LoginResult =
  | { success: true }
  | { success: false; message: string };

export type GreeterConfig = {
  sessionDirs: string[];
  cachePath: string;
};

export type LoginHandlerCallbacks = {
  onLoggingIn?: () => void;
  onSuccess?: () => void;
  onError: (message: string) => void;
};

export const createGreeter = (config: GreeterConfig) => {
  const cache = new CacheManager(config.cachePath);
  const sessionManager = new SessionManager(config.sessionDirs);

  const login = async (
    username: string,
    password: string,
    exec: string,
  ): Promise<LoginResult> => {
    try {
      // Step 1: Create session for the given username
      const createRes = await createSession(username);
      if (createRes.type === "error") {
        return {
          success: false,
          message: createRes.description ?? "Failed to create session",
        };
      }

      // Step 2: Post password
      const authRes = await postAuthResponse(password);
      if (authRes.type === "error") {
        await cancelSession();
        return {
          success: false,
          message: authRes.description ?? "Authentication failed",
        };
      }

      // Step 3: Parse the session command and start it
      const [, argv] = GLib.shell_parse_argv(exec);
      if (!argv) {
        return { success: false, message: "Failed to parse session command" };
      }
      const startRes = await startSession(argv);
      if (startRes.type === "error") {
        return {
          success: false,
          message: startRes.description ?? "Failed to start session",
        };
      }

      return { success: true };
    } catch (e) {
      return { success: false, message: String(e) };
    }
  };

  // Creates a login handler that wraps login() with concurrency guard,
  // state persistence, and callbacks for success/error.
  // This reduces boilerplate in greeter UIs without constraining widget choice.
  const createLoginHandler = (callbacks: LoginHandlerCallbacks) => {
    let loggingIn = false;

    const handle = async (
      username: string,
      password: string,
      exec: string,
      sessionName: string,
    ) => {
      if (loggingIn) return;
      loggingIn = true;
      callbacks.onLoggingIn?.();

      const result = await login(username, password, exec);

      if (result.success) {
        cache.save(username, sessionName);
        callbacks.onSuccess?.();
      } else {
        loggingIn = false;
        callbacks.onError(result.message);
      }
    };

    return { handle };
  };

  return {
    getSessions: (): Session[] => sessionManager.getSessions(),
    getCachedState: (): CachedState | null => cache.load(),
    saveState: (user: string, session: string): void =>
      cache.save(user, session),
    login,
    createLoginHandler,
  };
};
