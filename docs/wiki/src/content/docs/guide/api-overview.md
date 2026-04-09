---
title: API Overview
description: How to use the tadaima API
---

## createGreeter

```typescript
import { createGreeter } from "tadaima";

const { sessions, sessionNames, cache, createLoginHandler } = createGreeter({
  sessionDirs: ["/usr/share/wayland-sessions", "/usr/share/xsessions"],
  cachePath: "/var/cache/tadaima/state.json",
});
```

### Config

| Option        | Type       | Description                                        |
| ------------- | ---------- | -------------------------------------------------- |
| `sessionDirs` | `string[]` | Directories to search for `.desktop` session files |
| `cachePath`   | `string`   | Path to the JSON state cache file                  |

### Return value

| Property             | Type                                 | Description                                   |
| -------------------- | ------------------------------------ | --------------------------------------------- |
| `sessions`           | `Session[]`                          | Available sessions from `.desktop` files      |
| `sessionNames`       | `string[]`                           | Session display names (for dropdowns)         |
| `cache.username`     | `string`                             | Last authenticated username (or `""`)         |
| `cache.sessionIndex` | `number`                             | Index of last session in `sessions` (or `-1`) |
| `createLoginHandler` | `(callbacks) => () => Promise<void>` | Create a login handler function               |

## createLoginHandler

Creates a login handler function with concurrency guard, session validation,
automatic state persistence, and UI callbacks.

```typescript
const handleLogin = createLoginHandler({
  username: () => usernameEntry.text,
  password: () => passwordEntry.text,
  selectedSession: () => sessions[sessionDropdown.selected],
  onLoggingIn: () => {
    loginButton.sensitive = false;
    loginButton.label = "Logging in...";
  },
  onSuccess: () => {
    // Called after successful login (state is already saved)
  },
  onError: (message) => {
    errorLabel.label = message;
    errorLabel.visible = true;
    passwordEntry.text = "";
    passwordEntry.grab_focus();
    loginButton.sensitive = true;
    loginButton.label = "Login";
  },
});
```

Value callbacks (`username`, `password`, `selectedSession`) are functions,
not static values. They are called at login time to read the current widget
values. This is necessary because GTK widget refs are assigned after JSX
evaluation via the `$` prop.

Use the handler directly as an event handler:

```tsx
<Gtk.Button onClicked={handleLogin} />
<Gtk.PasswordEntry onActivate={handleLogin} />
```

## Types

```typescript
type Session = { name: string; exec: string };
type CachedState = { user: string; session: string };
type LoginResult = { type: "success" } | { type: "error"; description: string };
type GreetdResponse =
  | { type: "success" }
  | { type: "error"; error_type: "auth_error" | "error"; description: string }
  | {
      type: "auth_message";
      auth_message_type: "visible" | "secret" | "info" | "error";
      auth_message: string;
    };
type LoginHandlerCallbacks = {
  username: () => string;
  password: () => string;
  selectedSession: () => Session | undefined;
  onLoggingIn?: () => void;
  onSuccess?: () => void;
  onError: (message: string) => void;
};
```

## Session directories

| Distro     | Wayland                                          | X11                                       |
| ---------- | ------------------------------------------------ | ----------------------------------------- |
| NixOS      | `/run/current-system/sw/share/wayland-sessions/` | `/run/current-system/sw/share/xsessions/` |
| Arch-based | `/usr/share/wayland-sessions/`                   | `/usr/share/xsessions/`                   |

