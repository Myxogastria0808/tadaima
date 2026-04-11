---
title: Installation
description: How to install and set up tadaima
---

## Quick Start (All platforms)

```sh
npx create-tadaima my-greeter
```

The CLI will prompt you for a project name and platform (Arch Linux / NixOS / Nix on other distro).

## NixOS

Add tadaima to your flake inputs:

```nix
inputs.tadaima = {
  url = "github:Myxogastria0808/tadaima";
  inputs.nixpkgs.follows = "nixpkgs";
  inputs.ags.follows = "ags";
  inputs.astal.follows = "astal";
};
```

### Use a pre-built example greeter

```nix
imports = [ inputs.tadaima.nixosModules.default ];

services.tadaima = {
  enable = true;
  package = inputs.tadaima.packages.${system}.movie;  # or .minimal, .simple, .image
};
```

| Package   | Description                                       |
| --------- | ------------------------------------------------- |
| `minimal` | No wallpaper, no styling, no CSS                  |
| `simple`  | No wallpaper, Catppuccin Mocha styling            |
| `image`   | Static image wallpaper + Catppuccin Mocha         |
| `movie`   | Video wallpaper + GStreamer + Catppuccin Mocha     |

### Build your own greeter

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
    mkdir -p node_modules/@myxogastria0808
    ln -s ${inputs.tadaima}/packages/tadaima/src node_modules/@myxogastria0808/tadaima
  '';

  installPhase = ''
    mkdir -p $out/bin
    ags bundle src/app.tsx $out/bin/greeter
  '';
};

imports = [ inputs.tadaima.nixosModules.default ];
services.tadaima = {
  enable = true;
  package = myGreeter;
};
```

## Nix (non-NixOS)

If you have Nix installed on another distro, you can build a greeter with `nix build`:

```sh
nix build github:Myxogastria0808/tadaima#movie
```

Find the store path and configure greetd:

```sh
readlink ./result
# Example output: /nix/store/abc123...-tadaima-movie
```

```toml
# /etc/greetd/config.toml
[terminal]
vt = 1

[default_session]
command = "dbus-run-session cage -s -d -- /nix/store/abc123...-tadaima-movie/bin/greeter"
user = "greeter"
```

Pin the build result to prevent garbage collection:

```sh
sudo nix build --out-link /etc/greetd/greeter-link
```

Create cache directory and enable greetd:

```sh
sudo mkdir -p /var/cache/tadaima
sudo chown greeter:greeter /var/cache/tadaima
sudo systemctl enable greetd
```

## Arch-based distributions

1. Install dependencies:

   ```sh
   pacman -S greetd cage
   yay -S aylurs-gtk-shell
   ```

2. Build from an example:

   ```sh
   git clone https://github.com/Myxogastria0808/tadaima.git
   cd tadaima/examples/movie
   pnpm install
   ags bundle src/app.tsx ./my-greeter
   ```

   Or build your own greeter:

   ```sh
   npx create-tadaima my-greeter --platform arch
   cd my-greeter
   pnpm run setup
   pnpm run build
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
