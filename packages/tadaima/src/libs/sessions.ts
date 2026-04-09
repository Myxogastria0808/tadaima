/**
 * Desktop session discovery from `.desktop` files.
 *
 * Reads session entries from XDG session directories:
 * - NixOS: `/run/current-system/sw/share/wayland-sessions/`, `.../xsessions/`
 * - Arch-based: `/usr/share/wayland-sessions/`, `/usr/share/xsessions/`
 *
 * @module
 */

import GLib from 'gi://GLib';

/**
 * A desktop session discovered from a `.desktop` file.
 */
export type Session = {
  /** Display name from the `Name` field in the `.desktop` file. */
  name: string;
  /** Exec command from the `Exec` field in the `.desktop` file. */
  exec: string;
};

/**
 * Discovers available desktop sessions from `.desktop` files.
 */
export class SessionManager {
  private readonly dirs: string[];

  /**
   * @param dirs - Directories to search for `.desktop` session files.
   */
  constructor(dirs: string[]) {
    this.dirs = dirs;
  }

  /**
   * Scan configured directories for `.desktop` files and return
   * the discovered sessions.
   *
   * @returns Array of sessions with display names and exec commands.
   */
  getSessions(): Session[] {
    const sessions: Session[] = [];

    for (const dir of this.dirs) {
      if (!GLib.file_test(dir, GLib.FileTest.IS_DIR)) continue;

      const d = GLib.Dir.open(dir, 0);
      try {
        let name: string | null;
        while ((name = d.read_name()) !== null) {
          if (!name.endsWith('.desktop')) continue;
          const path = `${dir}/${name}`;
          const kf = new GLib.KeyFile();
          try {
            kf.load_from_file(path, GLib.KeyFileFlags.NONE);
            const sessionName = kf.get_string('Desktop Entry', 'Name');
            const exec = kf.get_string('Desktop Entry', 'Exec');
            if (sessionName && exec) {
              sessions.push({ name: sessionName, exec });
            }
          } catch (_) {
            // skip invalid desktop files
          } finally {
            kf.unref();
          }
        }
      } finally {
        d.close();
      }
    }

    return sessions;
  }
}
