---
title: Examples (Arch Linux)
description: Using pre-built example greeters on Arch-based distributions
---

tadaima includes four example greeters. On Arch-based distributions, you clone the repository and build them with AGS.

## Available examples

| Example   | Description                                   |
| --------- | --------------------------------------------- |
| `minimal` | No wallpaper, no styling, no CSS              |
| `simple`  | No wallpaper, Catppuccin Mocha styling        |
| `image`   | Static image wallpaper + Catppuccin Mocha     |
| `movie`   | Video wallpaper + GStreamer + Catppuccin Mocha |

## Prerequisites

```sh
pacman -S greetd cage
yay -S aylurs-gtk-shell
```

## Build

Clone the repository and build an example:

```sh
git clone https://github.com/Myxogastria0808/tadaima.git
cd tadaima/examples/simple
pnpm install
ags bundle src/app.tsx ./my-greeter
```

Replace `simple` with `minimal`, `image`, or `movie`.

## Install the greeter binary

```sh
sudo cp ./my-greeter /usr/local/bin/my-greeter
```

## Configure greetd

Edit `/etc/greetd/config.toml`:

```toml
[terminal]
vt = 1

[default_session]
command = "dbus-run-session cage -s -d -- /usr/local/bin/my-greeter"
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
