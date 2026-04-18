---
title: Architecture
description: How @myxogastria0808/tadaima and greetd work together
---

## Overview

```
┌─────────┐     ┌──────────────────┐     ┌─────────┐     ┌──────────────────────────────────────┐
│ greetd  │────▶│ dbus-run-session │────▶│ cage    │────▶│ greeter (GJS+GTK4)                   │
│ (PAM)   │     └──────────────────┘     │ (kiosk) │     │ (your UI + @myxogastria0808/tadaima) │
└─────────┘                              └─────────┘     └──────────────────────────────────────┘
     ▲                                                               ▲
     │                                                               │
     │                   greetd-ipc(7) protocol                      │
     └───────────────────────────────────────────────────────────────┘
```

- **greetd** launches the greeter through a command chain (dbus-run-session → cage → greeter)
- **dbus-run-session** provides a D-Bus session bus
- **cage** runs the greeter fullscreen as a Wayland kiosk compositor
- **greeter ⇄ greetd** communicate via Unix socket (`GREETD_SOCK`) using the greetd-ipc JSON protocol.

## Components

### greetd

[greetd](https://sr.ht/~kennylevinsen/greetd/) is a login manager daemon.
It handles user authentication via PAM and manages session lifecycle.
The greeter communicates with greetd through a Unix socket using the
[greetd-ipc(7)](https://man.archlinux.org/man/greetd-ipc.7.en) protocol.

### cage

[cage](https://github.com/cage-kiosk/cage) is a minimal Wayland kiosk
compositor. It runs the greeter as a single, maximized application.

cage does not support the `wlr-layer-shell` protocol, so AGS's `<window>`
(which depends on `gtk4-layer-shell`) cannot be used. The greeter uses
`Gtk.ApplicationWindow` instead.

Flags used by @myxogastria0808/tadaima:

- `-s` — permit VT switching
- `-d` — suppress CSD title bar
- `-mlast` — use only last connected monitor

### dbus-run-session

Provides a D-Bus session bus for the greeter process. This follows the
[regreet NixOS module](https://github.com/NixOS/nixpkgs/blob/release-25.11/nixos/modules/programs/regreet.nix)
pattern.

## Authentication flow

1. User enters username and password
2. @myxogastria0808/tadaima sends `create_session` to greetd via Unix socket
3. greetd returns `auth_message` (or `success` / `error`)
4. @myxogastria0808/tadaima sends `post_auth_message_response` with the password
5. On success: @myxogastria0808/tadaima sends `start_session` with the selected session command
6. On failure (`auth_error`): @myxogastria0808/tadaima returns the error to the UI for display, user can retry

## greetd-ipc protocol

Full specification: [greetd-ipc(7)](https://man.archlinux.org/man/greetd-ipc.7.en)

### Wire format

Messages are sent over the Unix socket (`GREETD_SOCK`) as:

```
┌────────────────────────┬────────────────────────────────┐
│  length (32-bit int)   │  payload (UTF-8 JSON string)   │
│  native byte order     │                                │
└────────────────────────┴────────────────────────────────┘
```

The length prefix is a 32-bit integer in **native byte order** (host endianness), indicating the byte length of the JSON payload that follows.

### Requests (greeter → greetd)

#### `create_session`

Creates a session and initiates a login attempt for the given user.
The session is ready to be started if a `success` is returned.

```json
{ "type": "create_session", "username": "string" }
```

| Field      | Type     | Description                      |
| ---------- | -------- | -------------------------------- |
| `username` | `string` | The user to create a session for |

#### `post_auth_message_response`

Answers an authentication message.
If the message was informative (`info` or `error` type), a response does not need to be set. The session is ready to be started if a `success` is returned.

```json
{ "type": "post_auth_message_response", "response": "string" }

or

{ "type": "post_auth_message_response" }
```

| Field      | Type      | Description                                                              |
| ---------- | --------- | ------------------------------------------------------------------------ |
| `response` | `string?` | The answer to the auth message. Can be omitted for informative messages. |

#### `start_session`

Requests for the session to be started using the provided command line, adding the supplied environment to that created by PAM. The session will start after the greeter process terminates.

```json
{ "type": "start_session", "cmd": ["string"], "env": ["string"] }
```

| Field | Type       | Description                                         |
| ----- | ---------- | --------------------------------------------------- |
| `cmd` | `string[]` | The command line to run as the session              |
| `env` | `string[]` | Environment variables to add to the PAM environment |

#### `cancel_session`

Cancels the session that is currently under configuration.

```json
{ "type": "cancel_session" }
```

### Responses (greetd → greeter)

#### `success`

Indicates that the request succeeded.

```json
{ "type": "success" }
```

#### `error`

Indicates that the request failed.

```json
{ "type": "error", "error_type": "auth_error | error", "description": "string" }
```

| Field         | Type             | Description                       |
| ------------- | ---------------- | --------------------------------- |
| `error_type`  | `enum as string` | One of: `"auth_error"`, `"error"` |
| `description` | `string`         | Error description                 |

Error types:

| Type         | Description                                                                                                                            |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `auth_error` | Indicates that authentication failed. This is not a fatal error, and is likely caused by incorrect credentials. Handle as appropriate. |
| `error`      | A general error. See the error description for more information.                                                                       |

#### `auth_message`

Indicates that an authentication message needs to be answered by the greeter, either with `post_auth_message_response` or `cancel_session`.

```json
{ "type": "auth_message", "auth_message_type": "visible | secret | info | error", "auth_message": "string" }
```

| Field               | Type             | Description                                          |
| ------------------- | ---------------- | ---------------------------------------------------- |
| `auth_message_type` | `enum as string` | One of: `"visible"`, `"secret"`, `"info"`, `"error"` |
| `auth_message`      | `string`         | The authentication message                           |

Authentication message types:

| Type      | Description                                                                                    |
| --------- | ---------------------------------------------------------------------------------------------- |
| `visible` | Indicates that input from the user should be visible when they answer this question.           |
| `secret`  | Indicates that input from the user should be considered secret when they answer this question. |
| `info`    | Indicates that this message is informative, not a question.                                    |
| `error`   | Indicates that this message is an error, not a question.                                       |
