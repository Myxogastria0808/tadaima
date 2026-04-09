---
title: Architecture
description: How tadaima and greetd work together
---

## Overview

```
greetd → dbus-run-session → cage → greeter binary
                                      │
                              ┌───────┴────────┐
                              │  GJS + GTK4    │
                              │  (bundled JS)  │
                              └───────┬────────┘
                                      │ Unix socket (GREETD_SOCK)
                              ┌───────┴────────┐
                              │  greetd        │
                              │  (PAM auth)    │
                              └────────────────┘
```

## Components

### greetd

[greetd](https://sr.ht/~kennylevinsen/greetd/) is a login manager daemon.
It handles user authentication via PAM and manages session lifecycle.
The greeter communicates with greetd through a Unix socket using the
[greetd-ipc(7)](https://man.archlinux.org/man/greetd-ipc.7.en) protocol.

### cage

[cage](https://github.com/cage-kiosk/cage) is a minimal Wayland kiosk
compositor. It automatically fullscreens the greeter application.

cage does not support the `wlr-layer-shell` protocol, so AGS's `<window>`
(which depends on `gtk4-layer-shell`) cannot be used. The greeter uses
`Gtk.ApplicationWindow` instead.

Flags:
- `-s` — exit when the last client closes
- `-d` — allow startup without a GPU backend

### dbus-run-session

Provides a D-Bus session bus for the greeter process. This follows the
[regreet NixOS module](https://github.com/NixOS/nixpkgs/blob/release-25.11/nixos/modules/programs/regreet.nix)
pattern.

## Authentication flow

1. User enters username and password
2. tadaima sends `create_session` to greetd via Unix socket
3. tadaima sends `post_auth_message_response` with the password
4. greetd authenticates via PAM (`pam_fail_delay` adds a randomized delay on failure)
5. On success: tadaima sends `start_session` with the selected session command
6. On failure: tadaima returns the error to the UI for display, user can retry

greetd expects greeters to handle retries internally — the greeter must not
exit on auth failure. tadaima's `createLoginHandler` manages this automatically.

## greetd-ipc protocol

Wire format: 4-byte length prefix (host byte order) + UTF-8 JSON payload.

### Requests

```json
{ "type": "create_session", "username": "hello" }
{ "type": "post_auth_message_response", "response": "password" }
{ "type": "start_session", "cmd": ["uwsm", "start", "..."], "env": [] }
{ "type": "cancel_session" }
```

### Responses

```json
{ "type": "success" }
{ "type": "error", "error_type": "auth_error", "description": "..." }
{ "type": "auth_message", "auth_message_type": "secret", "auth_message": "Password:" }
```
