// Discovers available desktop sessions from .desktop files.
//
// Reads session entries from XDG session directories. The default paths are:
// - NixOS: /run/current-system/sw/share/wayland-sessions/, .../xsessions/
// - Arch/other: /usr/share/wayland-sessions/, /usr/share/xsessions/

import GLib from "gi://GLib";

export type Session = {
  name: string;
  exec: string;
};

export class SessionManager {
  private readonly dirs: string[];

  constructor(dirs: string[]) {
    this.dirs = dirs;
  }

  getSessions(): Session[] {
    const sessions: Session[] = [];

    for (const dir of this.dirs) {
      if (!GLib.file_test(dir, GLib.FileTest.IS_DIR)) continue;

      const d = GLib.Dir.open(dir, 0);
      let name: string | null;
      while ((name = d.read_name()) !== null) {
        if (!name.endsWith(".desktop")) continue;
        const path = `${dir}/${name}`;
        const kf = new GLib.KeyFile();
        try {
          kf.load_from_file(path, GLib.KeyFileFlags.NONE);
          const sessionName = kf.get_string("Desktop Entry", "Name");
          const exec = kf.get_string("Desktop Entry", "Exec");
          if (sessionName && exec) {
            sessions.push({ name: sessionName, exec });
          }
        } catch (_) {
          // skip invalid desktop files
        }
      }
    }

    return sessions;
  }
}

