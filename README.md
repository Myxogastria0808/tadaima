# tadaima

> **Warning**
> This project is under active development and not yet stable. APIs may change without notice.

A [greetd](https://sr.ht/~kennylevinsen/greetd/) greeter library built on
[Astal Greet](https://aylur.github.io/astal/guide/libraries/greet) for
[AGS](https://github.com/aylur/ags)/GJS.

Build your own login screen with GTK4 and TypeScript. tadaima handles
greetd authentication, session discovery, and state caching — you bring
the UI.

## Quick Start

```typescript
import { createGreeter } from "tadaima";

const greeter = createGreeter({
  sessionDirs: ["/usr/share/wayland-sessions", "/usr/share/xsessions"],
  cachePath: "/var/cache/tadaima/state.json",
});

const sessions = greeter.getSessions();
const cached = greeter.getCachedState();

const result = await greeter.login(username, password, sessions[0].exec);
if (result.success) {
  greeter.saveState(username, sessions[0].name);
} else {
  console.error(result.message);
}
```

## API

### `createGreeter(config)`

| Option        | Type       | Description                                        |
| ------------- | ---------- | -------------------------------------------------- |
| `sessionDirs` | `string[]` | Directories to search for `.desktop` session files |
| `cachePath`   | `string`   | Path to the JSON state cache file                  |

Returns an object with:

| Method                     | Return                 | Description                                       |
| -------------------------- | ---------------------- | ------------------------------------------------- |
| `getSessions()`            | `Session[]`            | Discover available sessions from `.desktop` files |
| `getCachedState()`         | `CachedState \| null`  | Load last user and session from cache             |
| `saveState(user, session)` | `void`                 | Save user and session to cache                    |
| `login(user, pass, exec)`  | `Promise<LoginResult>` | Authenticate and start session                    |

### Types

```typescript
type Session = { name: string; exec: string };
type CachedState = { user: string; session: string };
type LoginResult = { success: true } | { success: false; message: string };
```

## Installation

### NixOS (flake)

```nix
# flake.nix
inputs.tadaima = {
  url = "github:Myxogastria0808/tadaima";
  inputs.nixpkgs.follows = "nixpkgs";
};
```

Build your greeter as a derivation and use the NixOS module:

```nix
imports = [ inputs.tadaima.nixosModules.default ];

services.tadaima = {
  enable = true;
  package = myGreeterPackage;  # your ags bundle derivation
};
```

### Arch Linux / other distros

1. Install dependencies:

   ```sh
   pacman -S greetd cage gjs gtk4
   yay -S aylurs-gtk-shell astal-greet
   ```

2. Build your greeter:

   ```sh
   ags bundle app.tsx ./my-greeter
   ```

3. Configure greetd (`/etc/greetd/config.toml`):

   ```toml
   [terminal]
   vt = 1

   [default_session]
   command = "dbus-run-session cage -s -d -- /path/to/my-greeter"
   user = "greeter"
   ```

4. Create cache directory:

   ```sh
   sudo mkdir -p /var/cache/tadaima
   sudo chown greeter:greeter /var/cache/tadaima
   ```

## Example

See [examples/simple/](./examples/simple/) for a minimal working greeter with wallpaper support, and session selection.

## Why not `Greet.login()`?

The high-level `Greet.login()` from Astal Greet ignores `send()` return values in its Vala source — it never checks for `Greet.Error` responses.
Auth failures are silently swallowed in GJS.

tadaima uses the low-level API (`CreateSession` → `PostAuthMesssage` → `StartSession`) with `Gio._promisify` to inspect each response and return a proper `LoginResult`.

## Why cage?

The greeter runs inside [cage](https://github.com/cage-kiosk/cage), a minimal Wayland kiosk compositor. Astal's `<window>` requires `wlr-layer-shell` which cage does not support, so `Gtk.ApplicationWindow` is used instead. cage automatically fullscreens the application.

## Session directories

| Distro        | Wayland                                          | X11                                       |
| ------------- | ------------------------------------------------ | ----------------------------------------- |
| NixOS         | `/run/current-system/sw/share/wayland-sessions/` | `/run/current-system/sw/share/xsessions/` |
| Arch / others | `/usr/share/wayland-sessions/`                   | `/usr/share/xsessions/`                   |

## References

- [Astal Greet](https://aylur.github.io/astal/guide/libraries/greet)
- [Astal Greet API](https://aylur.github.io/libastal/greet/index.html)
- [AGS](https://aylur.github.io/ags/)
- [Gnim JSX](https://aylur.github.io/gnim/)
- [GJS async programming](https://gjs.guide/guides/gjs/asynchronous-programming.html)
- [greetd](https://sr.ht/~kennylevinsen/greetd/)
- [cage](https://github.com/cage-kiosk/cage)

## License

GPL-3.0

