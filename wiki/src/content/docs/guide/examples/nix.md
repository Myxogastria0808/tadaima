---
title: Examples (Nix)
description: Using pre-built example greeters with Nix on non-NixOS
---

tadaima includes four example greeters. With Nix on non-NixOS, you build them with `nix build` and configure greetd manually.

## Available examples

| Package   | Description                                   |
| --------- | --------------------------------------------- |
| `minimal` | No wallpaper, no styling, no CSS              |
| `simple`  | No wallpaper, Catppuccin Mocha styling        |
| `image`   | Static image wallpaper + Catppuccin Mocha     |
| `movie`   | Video wallpaper + GStreamer + Catppuccin Mocha |

## Build

```sh
nix build github:Myxogastria0808/tadaima#movie
```

Replace `#movie` with `#minimal`, `#simple`, or `#image`.

## Find the store path

```sh
readlink ./result
# Example output: /nix/store/abc123...-tadaima-movie
```

## Pin the build result

Prevent garbage collection from removing the greeter:

```sh
sudo nix build github:Myxogastria0808/tadaima#movie --out-link /etc/greetd/greeter-link
```

## Configure greetd

Edit `/etc/greetd/config.toml` using the store path:

```toml
[terminal]
vt = 1

[default_session]
command = "dbus-run-session cage -s -d -- /nix/store/abc123...-tadaima-movie/bin/greeter"
user = "greeter"
```

## Create cache directory and enable greetd

```sh
sudo mkdir -p /var/cache/tadaima
sudo chown greeter:greeter /var/cache/tadaima
sudo systemctl enable greetd
```

## Setting a wallpaper (image / movie)

The `image` example expects `/var/cache/tadaima/wallpaper.png`.
The `movie` example expects `/var/cache/tadaima/wallpaper.mp4`.

```sh
sudo cp /path/to/wallpaper.png /var/cache/tadaima/wallpaper.png
sudo chown greeter:greeter /var/cache/tadaima/wallpaper.png
```
