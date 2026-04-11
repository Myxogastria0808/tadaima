---
title: Examples
description: Pre-built greeter examples
---

tadaima includes four example greeters of increasing complexity.

## minimal

Absolute minimum login form. No wallpaper, no styling, no CSS.

Good for understanding the API structure without any distractions.

```sh
# NixOS
nix build github:Myxogastria0808/tadaima#minimal

# Arch-based
cd examples/minimal && pnpm install && ags bundle src/app.tsx ./greeter
```

## simple

Bare-minimum login form with Catppuccin Mocha styling. No wallpaper.

Demonstrates:

- SCSS styling with `app.apply_css()`
- Catppuccin Mocha color scheme

```sh
# NixOS
nix build github:Myxogastria0808/tadaima#simple

# Arch-based
cd examples/simple && pnpm install && ags bundle src/app.tsx ./greeter
```

## image

Static image wallpaper with Catppuccin Mocha theme.

Expects a PNG wallpaper at `/var/cache/tadaima/wallpaper.png`.
Use `wallpaper add -g <image>` to set it.

Demonstrates:

- `Gtk.Picture` + `Gtk.Overlay` for background images
- Why GTK4 CSS `background-image: url()` doesn't work with absolute paths ([GTK issue #5648](https://gitlab.gnome.org/GNOME/gtk/-/issues/5648))

```sh
# NixOS
nix build github:Myxogastria0808/tadaima#image

# Arch-based
cd examples/image && pnpm install && ags bundle src/app.tsx ./greeter
```

## movie

Video wallpaper with GStreamer support and Catppuccin Mocha theme.

Expects an MP4 wallpaper at `/var/cache/tadaima/wallpaper.mp4`.
Use `wallpaper add -g <video>` to set it.

Demonstrates:

- `Gtk.MediaFile` + `Gtk.Picture` for looping video backgrounds
- Why `Gtk.Video` isn't used (always shows playback controls)
- GStreamer plugin dependencies for video playback

```sh
# NixOS
nix build github:Myxogastria0808/tadaima#movie

# Arch-based
cd examples/movie && pnpm install && ags bundle src/app.tsx ./greeter
```

## Project structure (all examples)

```
examples/<name>/
  package.json
  src/
    app.tsx                  # AGS entry point
    global.css               # Window background (simple, image, movie)
    components/
      Greeter.tsx             # Main greeter component
      style.scss              # Catppuccin Mocha styles (simple, image, movie)
```
