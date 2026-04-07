# tadaima

> [!WARNING]
> This project is under active development and not yet stable. APIs may change without notice.

A [greetd](https://sr.ht/~kennylevinsen/greetd/) greeter library for
[AGS](https://github.com/aylur/ags) / [GJS](https://gjs.guide/).

Build your own login screen with GTK4 and TypeScript. tadaima handles
greetd authentication, session discovery, and state caching — you bring
the UI.

tadaima communicates with greetd directly via Unix socket
([greetd-ipc(7)](https://man.archlinux.org/man/greetd-ipc.7.en)) —
no Astal Greet dependency required.

## Quick Start

```typescript
import { createGreeter } from "tadaima";

const greeter = createGreeter({
  sessionDirs: ["/usr/share/wayland-sessions", "/usr/share/xsessions"],
  cachePath: "/var/cache/tadaima/state.json",
});

// Discover available sessions
const sessions = greeter.getSessions();

// Restore last user/session from cache
const cached = greeter.getCachedState();

// Authenticate — returns { success: true } or { success: false, message }
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

## Getting Started

### Build from an example

```sh
git clone https://github.com/Myxogastria0808/tadaima.git
cd tadaima/examples/movie   # or simple, image
npm install
ags bundle app.tsx ./my-greeter
```

### Build your own greeter

```sh
mkdir my-greeter && cd my-greeter
npm init -y
npm install tadaima
ags types --update --directory .
```

Write `app.tsx` and `src/Greeter.tsx` (see [examples/](./examples/) for reference), then build:

```sh
ags bundle app.tsx ./my-greeter
```

## Installation

### NixOS (flake)

Add tadaima to your flake inputs:

```nix
# flake.nix
inputs.tadaima = {
  url = "github:Myxogastria0808/tadaima";
  inputs.nixpkgs.follows = "nixpkgs";
  inputs.ags.follows = "ags";
  inputs.astal.follows = "astal";
};
```

#### Option A: Use a pre-built example greeter

tadaima provides ready-to-use greeter packages:

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

#### Option B: Build your own greeter

Write your own TSX greeter using tadaima as a library:

```nix
# your greeter derivation
myGreeter = pkgs.stdenv.mkDerivation {
  name = "my-greeter";
  src = ./greeter;  # your greeter source

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
    # Add GStreamer plugins if you want video wallpaper support
  ];

  # Link tadaima into node_modules so esbuild resolves `import "tadaima"`
  preBuild = ''
    mkdir -p node_modules
    ln -s ${inputs.tadaima}/src node_modules/tadaima
  '';

  installPhase = ''
    mkdir -p $out/bin
    ags bundle app.tsx $out/bin/greeter
  '';
};

# Use the NixOS module
imports = [ inputs.tadaima.nixosModules.default ];
services.tadaima = {
  enable = true;
  package = myGreeter;
};
```

### Other distributions

1. Install dependencies:

   ```sh
   # Example for Arch Linux:
   pacman -S greetd cage
   yay -S aylurs-gtk-shell
   ```

2. Install tadaima and write your greeter:

   ```sh
   mkdir my-greeter && cd my-greeter
   npm init -y
   npm install tadaima
   ```

3. Write your greeter TSX (see [examples/](./examples/) for reference),
   then build:

   ```sh
   ags bundle app.tsx ./my-greeter
   ```

4. Configure greetd (`/etc/greetd/config.toml`):

   ```toml
   [terminal]
   vt = 1

   [default_session]
   command = "dbus-run-session cage -s -d -- /path/to/my-greeter"
   user = "greeter"
   ```

5. Create cache directory:

   ```sh
   sudo mkdir -p /var/cache/tadaima
   sudo chown greeter:greeter /var/cache/tadaima
   ```

6. Enable and start greetd:

   ```sh
   sudo systemctl enable greetd
   sudo systemctl start greetd
   ```

## Development

### Prerequisites

- [AGS](https://github.com/aylur/ags) / [GJS](https://gjs.guide/)
- [Nix](https://nixos.org/) (for building examples and development shell)

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
├── src/                     # Library source (no Astal dependency)
│   ├── index.ts             # Public API exports
│   └── libs/
│       ├── client.ts        # createGreeter() + createLoginHandler()
│       ├── greetd.ts        # greetd Unix socket IPC (greetd-ipc protocol)
│       ├── cache.ts         # CacheManager — JSON state persistence
│       └── sessions.ts      # SessionManager — .desktop file discovery
├── examples/                # Reference implementations
│   ├── simple/              # Bare-minimum greeter
│   ├── image/               # Static image wallpaper + Catppuccin Mocha
│   └── movie/               # Video/image wallpaper + GStreamer
├── nix/
│   └── module.nix           # NixOS module (services.tadaima)
├── flake.nix                # Nix flake
├── README.md
└── LICENSE
```

## Session directories

| Distro | Wayland                                          | X11                                       |
| ------ | ------------------------------------------------ | ----------------------------------------- |
| NixOS  | `/run/current-system/sw/share/wayland-sessions/` | `/run/current-system/sw/share/xsessions/` |
| Others | `/usr/share/wayland-sessions/`                   | `/usr/share/xsessions/`                   |

## Architecture

The greeter runs inside [cage](https://github.com/cage-kiosk/cage),
a minimal Wayland kiosk compositor:

```
greetd → dbus-run-session → cage → greeter binary
```

- **cage** does not support the `wlr-layer-shell` protocol, so AGS's
  `<window>` (which depends on `gtk4-layer-shell`) cannot be used.
  The greeter uses `Gtk.ApplicationWindow` instead, which cage
  automatically fullscreens.
- **dbus-run-session** provides a D-Bus session bus required by GTK4.
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

GPL-3.0

