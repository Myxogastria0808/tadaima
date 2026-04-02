// greetd authentication client using the Astal Greet low-level API.
//
// The high-level Greet.login() is NOT used because it ignores Response
// objects from send() — it never checks for Greet.Error responses, so
// auth failures are silently swallowed (bug in Astal Greet Vala source).
//
// This module uses the low-level API (CreateSession → PostAuthMesssage →
// StartSession) with Gio._promisify to enable async/await, and inspects
// each Response via instanceof to detect auth failures.
//
// greetd expects greeters to handle auth retries internally — the greeter
// must not exit on failure. This client returns a result object instead of
// throwing, so the UI can display errors and let the user retry.
//
// References:
// - Astal Greet source: https://github.com/aylur/astal/tree/main/lib/greet/src
// - Astal Greet API: https://aylur.github.io/libastal/greet/index.html
// - GJS async/await: https://gjs.guide/guides/gjs/asynchronous-programming.html
// - greetd retry design: https://github.com/apognu/tuigreet/issues/24

import Greet from "gi://AstalGreet";
import GLib from "gi://GLib";
import Gio from "gi://Gio";
import { CacheManager } from "./cache";
import type { CachedState } from "./cache";
import { SessionManager } from "./sessions";
import type { Session } from "./sessions";

// Enable async/await for Request.send() by promisifying the async/finish pair.
// Without this, send() requires a callback argument and cannot return a Promise.
// GJS does not auto-promisify GIO async methods — _promisify must be called
// explicitly. The type definitions show a no-arg Promise overload, but it
// only works after this call.
Gio._promisify(Greet.Request.prototype, "send", "send_finish");

export type LoginResult =
  | { success: true }
  | { success: false; message: string };

export type GreeterConfig = {
  sessionDirs: string[];
  cachePath: string;
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
      // GJS requires property objects for GObject constructors (not positional args)
      const createRes = await new Greet.CreateSession({ username }).send();
      if (createRes instanceof Greet.Error) {
        return {
          success: false,
          message: createRes.description ?? "Failed to create session",
        };
      }

      // Step 2: Post password
      // Note: "PostAuthMesssage" has a typo (three s's) — this is in the Astal source
      const authRes = await new Greet.PostAuthMesssage({
        response: password,
      }).send();
      if (authRes instanceof Greet.Error) {
        await new Greet.CancelSession().send();
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
      const startRes = await new Greet.StartSession({ cmd: argv }).send();
      if (startRes instanceof Greet.Error) {
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

  return {
    getSessions: (): Session[] => sessionManager.getSessions(),
    getCachedState: (): CachedState | null => cache.load(),
    saveState: (user: string, session: string): void =>
      cache.save(user, session),
    login,
  };
};

