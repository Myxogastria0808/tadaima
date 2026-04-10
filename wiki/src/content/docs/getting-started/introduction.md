---
title: Introduction
description: What is tadaima and why use it
---

## What is tadaima?

tadaima is a [greetd](https://sr.ht/~kennylevinsen/greetd/) greeter library for
[AGS](https://github.com/aylur/ags) / [GJS](https://gjs.guide/).

It handles the hard parts of building a login screen:

- **Authentication** — communicates with greetd via the [greetd-ipc(7)](https://man.archlinux.org/man/greetd-ipc.7.en) protocol (JSON over Unix socket)
- **Session discovery** — reads `.desktop` files from standard XDG directories
- **State caching** — remembers the last authenticated user and session

You bring the UI — use any GTK4 widget to design your login screen.

## Why tadaima?

- **No Astal Greet dependency** — tadaima implements the greetd IPC protocol directly, removing the need for `gi://AstalGreet`
- **TypeScript first** — full type safety with JSDoc documentation
- **Framework agnostic** — works with AGS/Gnim JSX, but the library itself has no UI opinions
- **Distro agnostic** — works on NixOS, Arch-based distributions, and any system with greetd

## Architecture

The greeter runs inside [cage](https://github.com/cage-kiosk/cage), a minimal Wayland kiosk compositor:

```
greetd → dbus-run-session → cage → your greeter binary
```

- **cage** automatically fullscreens your application
- **dbus-run-session** provides a D-Bus session bus for the greeter process
- **greetd** manages authentication via PAM and session lifecycle
