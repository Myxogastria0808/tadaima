# tadaima

> [!WARNING]
> This project is under active development and not yet stable. APIs may change without notice.

A [greetd](https://sr.ht/~kennylevinsen/greetd/) greeter library for
[AGS](https://github.com/aylur/ags) / [GJS](https://gjs.guide/).

Build your own login screen with GTK4 and TypeScript. tadaima handles
greetd authentication, session discovery, and state caching — you bring
the UI.

tadaima communicates with greetd directly via Unix socket
( [greetd-ipc(7)](https://man.archlinux.org/man/greetd-ipc.7.en) ) —
no Astal Greet dependency required.

## Examples usage

### NixOS

Add tadaima to your flake inputs:

```nix
inputs.tadaima = {
  url = "github:Myxogastria0808/tadaima";
  inputs.nixpkgs.follows = "nixpkgs";
  inputs.ags.follows = "ags";
  inputs.astal.follows = "astal";
};
```

#### Use a pre-built example greeter

```nix
imports = [ inputs.tadaima.nixosModules.default ];

services.tadaima = {
  enable = true;
  package = inputs.tadaima.packages.${system}.movie;  # or .simple, .image
};
```

| Package  | Description                                                   |
| -------- | ------------------------------------------------------------- |
| `simple` | Bare-minimum login form, no wallpaper, no styling             |
| `image`  | Static image wallpaper with Catppuccin Mocha theme            |
| `movie`  | Video/image wallpaper with GStreamer + Catppuccin Mocha theme |

#### Build your own greeter

```nix
myGreeter = pkgs.stdenv.mkDerivation {
  name = "my-greeter";
  src = ./greeter;

  nativeBuildInputs = with pkgs; [
    wrapGAppsHook3
    gobject-introspection
    inputs.ags.packages.${system}.default
  ];

  buildInputs = [
    pkgs.glib
    pkgs.gjs
    inputs.astal.packages.${system}.io
    inputs.astal.packages.${system}.astal4
  ];

  preBuild = ''
    mkdir -p node_modules
    ln -s ${inputs.tadaima}/src node_modules/tadaima
  '';

  installPhase = ''
    mkdir -p $out/bin
    ags bundle app.tsx $out/bin/greeter
  '';
};

imports = [ inputs.tadaima.nixosModules.default ];
services.tadaima = {
  enable = true;
  package = myGreeter;
};
```

### Nix (non-NixOS)

If you have Nix installed on another distro (e.g. Arch Linux), you can
build a greeter with `nix build`:

```sh
# Build an example greeter
nix build github:Myxogastria0808/tadaima#movie

# The binary is at ./result/bin/greeter
```

greetd and cage must be installed via your distro's package manager.
Configure greetd manually:

```toml
# /etc/greetd/config.toml
[terminal]
vt = 1

[default_session]
command = "dbus-run-session cage -s -d -- /path/to/result/bin/greeter"
user = "greeter"
```

```sh
sudo mkdir -p /var/cache/tadaima
sudo chown greeter:greeter /var/cache/tadaima
sudo systemctl enable greetd
```

### Arch-based distributions

1. Install dependencies:

   ```sh
   pacman -S greetd cage
   yay -S aylurs-gtk-shell
   ```

2. Build from an example:

   ```sh
   git clone https://github.com/Myxogastria0808/tadaima.git
   cd tadaima/examples/movie   # or simple, image
   npm install
   ags bundle app.tsx ./my-greeter
   ```

   Or build your own greeter:

   ```sh
   mkdir my-greeter && cd my-greeter
   npm init -y
   npm install tadaima
   ags types --update --directory .
   # Write app.tsx and src/Greeter.tsx (see examples/ for reference)
   ags bundle app.tsx ./my-greeter
   ```

3. Configure greetd:

   ```toml
   # /etc/greetd/config.toml
   [terminal]
   vt = 1

   [default_session]
   command = "dbus-run-session cage -s -d -- /path/to/my-greeter"
   user = "greeter"
   ```

4. Create cache directory and enable greetd:

   ```sh
   sudo mkdir -p /var/cache/tadaima
   sudo chown greeter:greeter /var/cache/tadaima
   sudo systemctl enable greetd
   ```

## How to create a custom greeter

### Prerequisites

- [AGS](https://github.com/aylur/ags) / [GJS](https://gjs.guide/)
- [Nix](https://nixos.org/) (for building examples)

### Setup

```sh
git clone https://github.com/Myxogastria0808/tadaima.git
cd tadaima
direnv allow   # or: nix develop
```

### Generate type definitions

```sh
ags types --update --directory src/
ags types --update --directory examples/simple/
ags types --update --directory examples/image/
ags types --update --directory examples/movie/
```

### Build examples

```sh
nix build .#simple
nix build .#image
nix build .#movie
```

### Project structure

```
tadaima/
├── src/                     # Library source (npm package)
│   ├── index.ts             # Public API exports
│   └── libs/
│       ├── client.ts        # createGreeter() + createLoginHandler()
│       ├── greetd.ts        # greetd Unix socket IPC (greetd-ipc protocol)
│       ├── cache.ts         # CacheManager — JSON state persistence
│       └── sessions.ts      # SessionManager — .desktop file discovery
├── examples/
│   ├── simple/              # Bare-minimum greeter
│   ├── image/               # Static image wallpaper + Catppuccin Mocha
│   └── movie/               # Video/image wallpaper + GStreamer
├── nix/
│   └── module.nix           # NixOS module (services.tadaima)
├── flake.nix                # Nix flake
└── package.json             # npm package definition
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
| `createLoginHandler(cb)`   | `{ handle }`           | Login with concurrency guard and callbacks        |

### `createLoginHandler(callbacks)`

Wraps `login()` with concurrency guard (prevents double-submit), automatic
state persistence, and callbacks for UI updates:

```typescript
const loginHandler = greeter.createLoginHandler({
  onLoggingIn: () => {
    // Called when login starts — disable button, show spinner, etc.
  },
  onSuccess: () => {
    // Called on successful login (state is already saved)
  },
  onError: (message) => {
    // Called on failure — show error, clear password, etc.
  },
});

// Call from button click or Enter key:
loginHandler.handle(username, password, sessionExec, sessionName);
```

### Types

```typescript
type Session = { name: string; exec: string };
type CachedState = { user: string; session: string };
type LoginResult = { success: true } | { success: false; message: string };
type LoginHandlerCallbacks = {
  onLoggingIn?: () => void;
  onSuccess?: () => void;
  onError: (message: string) => void;
};
```

## Session directories

| Distro     | Wayland                                          | X11                                       |
| ---------- | ------------------------------------------------ | ----------------------------------------- |
| NixOS      | `/run/current-system/sw/share/wayland-sessions/` | `/run/current-system/sw/share/xsessions/` |
| Arch-based | `/usr/share/wayland-sessions/`                   | `/usr/share/xsessions/`                   |

## Architecture

The greeter runs inside [cage](https://github.com/cage-kiosk/cage),
a Wayland kiosk compositor:

```
greetd → dbus-run-session → cage → greeter binary
```

- **cage** does not support the `wlr-layer-shell` protocol, so AGS's
  `<window>` (which depends on `gtk4-layer-shell`) cannot be used.
  The greeter uses `Gtk.ApplicationWindow` instead, which cage
  automatically fullscreens.
- **dbus-run-session** provides a D-Bus session bus for the greeter process.
  This follows the [regreet NixOS module](https://github.com/NixOS/nixpkgs/blob/release-25.11/nixos/modules/programs/regreet.nix) pattern.
- **greetd** manages authentication via PAM and session lifecycle.

tadaima communicates with greetd via the
[greetd-ipc(7)](https://man.archlinux.org/man/greetd-ipc.7.en) protocol
(JSON over Unix socket) — no Astal Greet library needed.

## References

- [greetd](https://sr.ht/~kennylevinsen/greetd/) — login manager daemon
- [greetd — ArchWiki](https://wiki.archlinux.org/title/Greetd) — setup guide and configuration
- [greetd-ipc(7)](https://man.archlinux.org/man/greetd-ipc.7.en) — IPC protocol spec
- [PAM — ArchWiki](https://wiki.archlinux.org/title/PAM) — pluggable authentication modules
- [AGS](https://aylur.github.io/ags/) — GTK shell framework
- [Gnim JSX](https://aylur.github.io/gnim/) — JSX for GTK4/GJS
- [GJS async programming](https://gjs.guide/guides/gjs/asynchronous-programming.html)
- [GJS API docs](https://gjs-docs.gnome.org/) — GJS / GNOME API reference
- [cage](https://github.com/cage-kiosk/cage) — Wayland kiosk compositor

## License

[GPL-3.0](https://github.com/Myxogastria0808/tadaima?tab=GPL-3.0-1-ov-file)

