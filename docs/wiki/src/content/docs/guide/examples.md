---
title: Examples
description: Pre-built greeter examples
---

tadaima includes three example greeters of increasing complexity.

## simple

Bare-minimum login form. No wallpaper, no styling.

Good for understanding the API structure without visual distractions.

```sh
# NixOS
nix build github:Myxogastria0808/tadaima#simple

# Arch-based
cd examples/simple && npm install && ags bundle app.tsx ./greeter
```

## image

Static image wallpaper with Catppuccin Mocha theme.

Demonstrates:

- `Gtk.Picture` + `Gtk.Overlay` for background images
- SCSS styling with `app.apply_css()`
- Why GTK4 CSS `background-image: url()` doesn't work with absolute paths ([GTK issue #5648](https://gitlab.gnome.org/GNOME/gtk/-/issues/5648))

```sh
# NixOS
nix build github:Myxogastria0808/tadaima#image

# Arch-based
cd examples/image && npm install && ags bundle app.tsx ./greeter
```

## movie

Video/image wallpaper with GStreamer support.

Demonstrates:

- `Gtk.MediaFile` + `Gtk.Picture` for looping video backgrounds
- Why `Gtk.Video` isn't used (always shows playback controls)
- Dynamic wallpaper detection from cache directory
- GStreamer plugin dependencies for video playback

Supports images (PNG, JPG, WebP, SVG, BMP, GIF, TIFF) and videos (MP4, WebM, MKV, AVI, MOV).

```sh
# NixOS
nix build github:Myxogastria0808/tadaima#movie

# Arch-based
cd examples/movie && npm install && ags bundle app.tsx ./greeter
```

