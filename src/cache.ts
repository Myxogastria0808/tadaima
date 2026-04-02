// Manages greeter state persistence between logins.
//
// Saves the last authenticated user and selected session to a JSON file
// so the greeter can pre-fill these values on next startup.
//
// The cache directory must be writable by the greeter system user.
// On NixOS, this is handled by a systemd-tmpfiles rule in the NixOS module.
// On other distros, create the directory manually:
//   sudo mkdir -p /var/cache/tadaima && sudo chown greeter:greeter /var/cache/tadaima

import GLib from "gi://GLib";

export type CachedState = {
  user: string;
  session: string;
};

export class CacheManager {
  private readonly path: string;

  constructor(path: string) {
    this.path = path;
  }

  load(): CachedState | null {
    try {
      const [ok, contents] = GLib.file_get_contents(this.path);
      if (!ok) return null;
      return JSON.parse(new TextDecoder().decode(contents));
    } catch (_) {
      return null;
    }
  }

  // GLib.file_set_contents atomically writes the file (write to temp + rename),
  // so the cache is never left in a corrupt state even if the process is interrupted.
  save(user: string, session: string): void {
    const dir = GLib.path_get_dirname(this.path);
    GLib.mkdir_with_parents(dir, 0o755);
    GLib.file_set_contents(this.path, JSON.stringify({ user, session }));
  }
}

