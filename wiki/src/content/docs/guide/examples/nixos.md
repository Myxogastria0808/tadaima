---
title: Examples (NixOS)
description: Using pre-built example greeters on NixOS
---

tadaima includes four example greeters. On NixOS, you can use them directly via the NixOS module without building anything yourself.

## Available examples

| Package   | Description                                    |
| --------- | ---------------------------------------------- |
| `minimal` | No wallpaper, no styling, no CSS               |
| `simple`  | No wallpaper, Catppuccin Mocha styling         |
| `image`   | Static image wallpaper + Catppuccin Mocha      |
| `movie`   | Video wallpaper + GStreamer + Catppuccin Mocha |

## Setup

### 1. Add flake inputs

The flake.nix file containing your NixOS configuration must include [AGS](https://github.com/aylur/ags), [Astal](https://github.com/aylur/astal) and [@myxogastria0808/tadaima](https://tadaima.yukiosada.work) as inputs.

```nix ins={6-22}
# flake.nix
{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";

    ags = {
      url = "github:aylur/ags";
      inputs.nixpkgs.follows = "nixpkgs";
      inputs.astal.follows = "astal";
    };

    astal = {
      url = "github:aylur/astal";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    tadaima = {
      url = "github:Myxogastria0808/tadaima";
      inputs.nixpkgs.follows = "nixpkgs";
      inputs.ags.follows = "ags";
      inputs.astal.follows = "astal";
    };
  };

  outputs = { nixpkgs, ... } @ inputs: {
    nixosConfigurations.your-hostname = nixpkgs.lib.nixosSystem {
      system = "x86_64-linux";
      specialArgs = { inherit inputs; };
      modules = [
        ./configuration.nix
      ];
    };
  };
}
```

### 2. Import the NixOS module and select a package

```nix ins={4-8}
# configuration.nix
{ inputs, pkgs, ... }:
{
  imports = [ inputs.tadaima.nixosModules.default ];

  services.tadaima = {
    enable = true;
    package = inputs.tadaima.packages.${pkgs.stdenv.hostPlatform.system}.movie;
  };
}
```

Replace `.movie` with `.minimal`, `.simple`, or `.image` to use a different example.

- **`imports`** — Loads the tadaima NixOS module, which defines the `services.tadaima` options.
- **`services.tadaima.enable`** — When `true`, the module automatically:
  - Enables and configures `services.greetd` with the launch chain: `dbus-run-session` → `cage -s -d` → `greeter binary`.
  - Creates the cache directory (`/var/cache/tadaima`) owned by the `greeter` user via `systemd.tmpfiles.rules`. tadaima uses this to persist the last selected user and session across reboots.
- **`services.tadaima.package`** — The greeter binary package to launch. Here it points to one of tadaima's pre-built examples.
- **`services.tadaima.cachePath`** — (optional, default: `/var/cache/tadaima`) Override the cache directory location if needed.

### 3. Set a wallpaper (image / movie only)

If you chose `minimal` or `simple`, skip this step — they don't use a wallpaper.

The `image` example expects `/var/cache/tadaima/wallpaper.png`.
The `movie` example expects `/var/cache/tadaima/wallpaper.mp4`.

Manually copy your wallpaper (e.g. when wallpaprer.png are settied as a greeter wallpaper):

```sh
sudo cp /path/to/wallpaper.png /var/cache/tadaima/wallpaper.png
sudo chown greeter:greeter /var/cache/tadaima/wallpaper.png
```

### 4. Apply

```sh
sudo nixos-rebuild switch
```

Reboot and you should see the example greeter on the login screen.

