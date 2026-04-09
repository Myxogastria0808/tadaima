---
title: Troubleshooting
description: Common issues and solutions
---

## Greeter shows black screen

**Cause**: Using `Astal.Window` (`<window>`) instead of `Gtk.ApplicationWindow`.

cage does not support the `wlr-layer-shell` protocol. `Astal.Window` depends
on `gtk4-layer-shell` which requires this protocol. The window is never
displayed and the greeter exits immediately.

**Fix**: Use `Gtk.ApplicationWindow` instead.

## Greeter starts but exits immediately

**Cause**: `GREETD_SOCK` environment variable is not set.

This variable is set by greetd when it launches the greeter. If you're
testing outside of greetd, it won't be available.

**Fix**: Ensure the greeter is launched by greetd, not directly.

## Authentication always fails silently

**Cause**: Using Astal Greet's `Greet.login()` instead of tadaima.

The high-level `Greet.login()` from Astal Greet ignores `send()` return
values in its Vala source — it never checks for `Greet.Error` responses.
Auth failures are silently swallowed in GJS.

**Fix**: Use tadaima's `createGreeter()` which implements the greetd-ipc
protocol directly and checks each response.

## Video wallpaper not playing

**Cause**: Missing GStreamer plugins.

Video playback requires GStreamer with appropriate codec plugins.

**Fix (NixOS)**: Add GStreamer packages to `buildInputs`:

```nix
pkgs.gst_all_1.gstreamer
pkgs.gst_all_1.gst-plugins-base
pkgs.gst_all_1.gst-plugins-good
pkgs.gst_all_1.gst-plugins-bad
pkgs.gst_all_1.gst-plugins-ugly
pkgs.gst_all_1.gst-libav
pkgs.gst_all_1.gst-vaapi
```

## CSS background-image not working

**Cause**: GTK4 CSS `background-image: url()` does not work with absolute
file paths when CSS is loaded via `load_from_string` (which is what
`app.apply_css()` uses internally).

See [GTK issue #5648](https://gitlab.gnome.org/GNOME/gtk/-/issues/5648).

**Fix**: Use `Gtk.Picture` + `Gtk.Overlay` for background images.

## PAM authentication delay

Authentication failures have a built-in delay caused by `pam_fail_delay`.
This is a security feature to prevent brute-force attacks. The delay is
randomized and cannot be disabled from the greeter side.

tadaima uses async I/O to avoid blocking the GTK main loop during this wait.

