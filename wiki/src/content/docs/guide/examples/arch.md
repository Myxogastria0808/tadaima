---
title: Examples (Arch Linux)
description: Using pre-built example greeters on Arch-based distributions
---

tadaima includes four example greeters. On Arch-based distributions, you clone the repository and build them with AGS.

## Available examples

| Example   | Description                                    |
| --------- | ---------------------------------------------- |
| `minimal` | No wallpaper, no styling, no CSS               |
| `simple`  | No wallpaper, Catppuccin Mocha styling         |
| `image`   | Static image wallpaper + Catppuccin Mocha      |
| `movie`   | Video wallpaper + GStreamer + Catppuccin Mocha |

## Prerequisites

```sh
pacman -S greetd cage
yay -S aylurs-gtk-shell
```

If you use the `movie` example (video wallpaper), also install GStreamer:

```sh
pacman -S gstreamer gst-plugins-base gst-plugins-good gst-plugins-bad gst-plugins-ugly gst-libav gstreamer-vaapi
```

## Setup

### 1. Build

Clone the repository and build the movie example:

```sh
git clone https://github.com/Myxogastria0808/tadaima.git
cd tadaima/examples/movie
pnpm install
ags bundle src/app.tsx ./my-greeter
```

Replace `movie` with `minimal`, `simple`, or `image` to use a different example.

### 2. Install the greeter binary

```sh
sudo cp ./my-greeter /usr/local/bin/my-greeter
```

### 3. Configure greetd

Edit `/etc/greetd/config.toml`:

```toml
[terminal]
vt = 1

[default_session]
command = "dbus-run-session cage -s -d -- /usr/local/bin/my-greeter"
user = "greeter"
```

### 4. Setting a wallpaper (image / movie only)

If you chose `minimal` or `simple`, skip this step — they don't use a wallpaper.

The `image` example expects `/var/cache/tadaima/wallpaper.png`.
The `movie` example expects `/var/cache/tadaima/wallpaper.mp4`.

```sh
sudo cp /path/to/wallpaper.png /var/cache/tadaima/wallpaper.png
sudo chown greeter:greeter /var/cache/tadaima/wallpaper.png
```

### 5. Create cache directory and enable greetd

```sh
sudo mkdir -p /var/cache/tadaima
sudo chown greeter:greeter /var/cache/tadaima
sudo systemctl enable greetd
```

Reboot and you should see the example greeter on the login screen.
