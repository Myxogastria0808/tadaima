/**
 * Greeter state persistence.
 *
 * Saves the last authenticated user and selected session to a JSON file
 * so the greeter can pre-fill these values on next startup.
 *
 * The cache directory must be writable by the greeter system user.
 * On NixOS, this is handled by a systemd-tmpfiles rule in the NixOS module.
 * On other distros, create the directory manually:
 *
 * ```sh
 * sudo mkdir -p /var/cache/tadaima && sudo chown greeter:greeter /var/cache/tadaima
 * ```
 *
 * @module
 */

import GLib from 'gi://GLib';

/**
 * Cached greeter state from the last successful login.
 */
export type CachedState = {
  /** The last authenticated username. */
  user: string;
  /** The last selected session display name. */
  session: string;
};

/**
 * Manages greeter state persistence via a JSON cache file.
 */
export class CacheManager {
  private readonly path: string;

  /**
   * @param path - Absolute path to the JSON cache file.
   */
  constructor(path: string) {
    this.path = path;
  }

  /**
   * Load cached state from the file.
   * @returns The cached state, or `null` if the file doesn't exist or is invalid.
   */
  load(): CachedState | null {
    try {
      const [ok, contents] = GLib.file_get_contents(this.path);
      if (!ok) return null;
      return JSON.parse(new TextDecoder().decode(contents));
    } catch (_) {
      return null;
    }
  }

  /**
   * Save greeter state to the cache file.
   *
   * Uses `GLib.file_set_contents` which writes atomically (temp + rename),
   * so the cache is never left in a corrupt state.
   *
   * @param user - The authenticated username.
   * @param session - The selected session display name.
   */
  save(user: string, session: string): void {
    const dir = GLib.path_get_dirname(this.path);
    GLib.mkdir_with_parents(dir, 0o755);
    GLib.file_set_contents(this.path, JSON.stringify({ user, session }));
  }
}
