---
title: Installation
description: How to install and set up tadaima
---

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
  package = inputs.tadaima.packages.${system}.movie;  # or .simple, .image
};
```

| Package  | Description                                                   |
| -------- | ------------------------------------------------------------- |
| `simple` | Bare-minimum login form, no wallpaper, no styling             |
| `image`  | Static image wallpaper with Catppuccin Mocha theme            |
| `movie`  | Video/image wallpaper with GStreamer + Catppuccin Mocha theme |

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
    mkdir -p node_modules
    ln -s ${inputs.tadaima}/packages/tadaima/src node_modules/tadaima
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

## Nix (non-NixOS)

If you have Nix installed on another distro, you can build a greeter with `nix build`:

```sh
nix build github:Myxogastria0808/tadaima#movie
```

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
   npm install
   ags bundle app.tsx ./my-greeter
   ```

   Or build your own greeter:

   ```sh
   mkdir my-greeter && cd my-greeter
   npm init -y
   npm install tadaima
   ags types --update --directory .
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
