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

import GLib from 'gi://GLib';
import { greetd } from './greetd';
import { CacheManager } from './cache';
import { SessionManager } from './sessions';
import type { Session } from './sessions';

/**
 * Result of a login attempt, matching greetd-ipc response schema.
 */
export type LoginResult = { type: 'success' } | { type: 'error'; description: string };

/**
 * Configuration for {@link createGreeter}.
 */
export type GreeterConfig = {
  /** Directories to search for `.desktop` session files. */
  sessionDirs: string[];
  /** Path to the JSON state cache file. */
  cachePath: string;
};

/**
 * Callbacks for {@link createGreeter}'s `createLoginHandler`.
 *
 * Value callbacks (`username`, `password`, `selectedSession`) are called
 * at login time to read the current widget values. They are functions
 * (not static values) because GTK widget refs are assigned after JSX
 * evaluation via the `$` prop.
 */
export type LoginHandlerCallbacks = {
  /** Returns the current username input value. */
  username: () => string;
  /** Returns the current password input value. */
  password: () => string;
  /** Returns the currently selected session, or undefined if none. */
  selectedSession: () => Session | undefined;
  /** Called when login starts. Use to disable UI, show spinner, etc. */
  onLoggingIn?: () => void;
  /** Called on successful login. State is already saved at this point. */
  onSuccess?: () => void;
  /** Called on failure with the error description. */
  onError: (message: string) => void;
};

/**
 * Creates a greeter instance with session discovery, caching, and login handling.
 *
 * @param config - Greeter configuration (session directories and cache path).
 * @returns An object with sessions, cache state, and a login handler factory.
 *
 * @example
 * ```typescript
 * const { sessions, sessionNames, cache, createLoginHandler } = createGreeter({
 *   sessionDirs: ["/usr/share/wayland-sessions"],
 *   cachePath: "/var/cache/tadaima/state.json",
 * });
 * ```
 */
export const createGreeter = (config: GreeterConfig) => {
  const cache = new CacheManager(config.cachePath);
  const sessionManager = new SessionManager(config.sessionDirs);

  const login = async (username: string, password: string, exec: string): Promise<LoginResult> => {
    try {
      // Step 1: Create session for the given username
      const createRes = await greetd.createSession(username);
      if (createRes.type === 'error') throw new Error(createRes.description ?? 'Failed to create session');

      // Step 2: Post password
      const authRes = await greetd.postAuthResponse(password);
      if (authRes.type === 'error') {
        await greetd.cancelSession();
        throw new Error(authRes.description ?? 'Authentication failed');
      }

      // Step 3: Parse the session command and start it
      const [, argv] = GLib.shell_parse_argv(exec);
      if (!argv) throw new Error('Failed to parse session command');

      const startRes = await greetd.startSession(argv);
      if (startRes.type === 'error') throw new Error(startRes.description ?? 'Failed to start session');

      return { type: 'success' as const };
    } catch (e) {
      return {
        type: 'error' as const,
        description: e instanceof Error ? e.message : String(e),
      };
    }
  };

  /**
   * Creates a login handler function with concurrency guard, session
   * validation, state persistence, and UI callbacks.
   *
   * @param callbacks - Value getters and event callbacks.
   * @returns An async function to call on login button click or Enter key.
   *
   * @example
   * ```typescript
   * const handleLogin = createLoginHandler({
   *   username: () => usernameEntry.text,
   *   password: () => passwordEntry.text,
   *   selectedSession: () => sessions[dropdown.selected],
   *   onLoggingIn: () => { button.sensitive = false; },
   *   onError: (msg) => { errorLabel.label = msg; },
   * });
   * ```
   */
  const createLoginHandler = (callbacks: LoginHandlerCallbacks) => {
    let loggingIn = false;

    return async () => {
      if (loggingIn) return;

      const session = callbacks.selectedSession();
      if (!session) {
        callbacks.onError('No session selected');
        return;
      }

      loggingIn = true;
      callbacks.onLoggingIn?.();

      try {
        const username = callbacks.username();
        const result = await login(username, callbacks.password(), session.exec);

        if (result.type === 'success') {
          cache.save(username, session.name);
          callbacks.onSuccess?.();
        } else {
          callbacks.onError(result.description);
        }
      } finally {
        loggingIn = false;
      }
    };
  };

  const sessions = sessionManager.getSessions();
  const cached = cache.load();

  return {
    /** Available desktop sessions discovered from `.desktop` files. */
    sessions,
    /** Session display names, convenience for `Gtk.DropDown.new_from_strings`. */
    sessionNames: sessions.map((s) => s.name),
    /** Cached state from the last successful login. */
    cache: {
      /** Last authenticated username, or `""` if no cache. */
      username: cached?.user ?? '',
      /** Index of last session in `sessions`, or `-1` if not found. */
      sessionIndex: cached?.session ? sessions.findIndex((s) => s.name === cached.session) : -1,
    },
    createLoginHandler,
  };
};
