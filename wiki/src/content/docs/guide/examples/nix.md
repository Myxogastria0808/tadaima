---
title: Examples (Nix)
description: Using pre-built example greeters with Nix on non-NixOS
---

tadaima includes four example greeters. On non-NixOS distributions with Nix, you build them directly from the remote flake with `nix build` and configure greetd manually.

## Available examples

| Package   | Description                                    |
| --------- | ---------------------------------------------- |
| `minimal` | No wallpaper, no styling, no CSS               |
| `simple`  | No wallpaper, Catppuccin Mocha styling         |
| `image`   | Static image wallpaper + Catppuccin Mocha      |
| `movie`   | Video wallpaper + GStreamer + Catppuccin Mocha |

## Setup

### 1. Build and pin the greeter path

Build the greeter and create a symlink to prevent `nix-collect-garbage` from removing it:

```sh
sudo nix build github:Myxogastria0808/tadaima#movie --out-link /etc/greetd/greeter-link
```

Replace `#movie` with `#minimal`, `#simple`, or `#image`.

### 2. Configure greetd

Edit `/etc/greetd/config.toml`:

```toml
[terminal]
vt = 1

[default_session]
command = "dbus-run-session cage -s -d -- /etc/greetd/greeter-link/bin/greeter"
user = "greeter"
```

### 3. Setting a wallpaper (image / movie only)

If you chose `minimal` or `simple`, skip this step — they don't use a wallpaper.

The `image` example expects `/var/cache/tadaima/wallpaper.png`.
The `movie` example expects `/var/cache/tadaima/wallpaper.mp4`.

```sh
sudo cp /path/to/wallpaper.png /var/cache/tadaima/wallpaper.png
sudo chown greeter:greeter /var/cache/tadaima/wallpaper.png
```

### 4. Create cache directory and enable greetd

```sh
sudo mkdir -p /var/cache/tadaima
sudo chown greeter:greeter /var/cache/tadaima
sudo systemctl enable greetd
```

Reboot and you should see the example greeter on the login screen.

