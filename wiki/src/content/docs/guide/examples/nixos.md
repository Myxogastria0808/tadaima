---
title: Examples (NixOS)
description: Using pre-built example greeters on NixOS
---

tadaima includes four example greeters. On NixOS, you can use them directly via the NixOS module without building anything yourself.

## Available examples

| Package   | Description                                   |
| --------- | --------------------------------------------- |
| `minimal` | No wallpaper, no styling, no CSS              |
| `simple`  | No wallpaper, Catppuccin Mocha styling        |
| `image`   | Static image wallpaper + Catppuccin Mocha     |
| `movie`   | Video wallpaper + GStreamer + Catppuccin Mocha |

## Setup

Add tadaima to your system flake inputs:

```nix
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
}
```

Import the NixOS module and select a package:

```nix
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

Apply:

```sh
sudo nixos-rebuild switch
```

## Setting a wallpaper (image / movie)

The `image` example expects `/var/cache/tadaima/wallpaper.png`.
The `movie` example expects `/var/cache/tadaima/wallpaper.mp4`.

If you use the [dotfiles](https://github.com/Myxogastria0808/dotfiles) wallpaper function:

```sh
wallpaper add -g /path/to/your/wallpaper.png
```

This copies the file to `/var/cache/tadaima/` and creates the appropriate symlinks.

Otherwise, manually copy your wallpaper:

```sh
sudo cp /path/to/wallpaper.png /var/cache/tadaima/wallpaper.png
sudo chown greeter:greeter /var/cache/tadaima/wallpaper.png
```
