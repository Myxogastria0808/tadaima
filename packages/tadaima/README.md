# tadaima

[![Wiki](https://github.com/Myxogastria0808/tadaima/actions/workflows/wiki.yaml/badge.svg)](https://github.com/Myxogastria0808/tadaima/actions/workflows/wiki.yaml)
[![Docs](https://github.com/Myxogastria0808/tadaima/actions/workflows/docs.yaml/badge.svg)](https://github.com/Myxogastria0808/tadaima/actions/workflows/docs.yaml)
[![NPM Version](https://img.shields.io/npm/v/tadaima.svg)](https://www.npmjs.com/package/tadaima)
![NPM Type Definitions](https://img.shields.io/npm/types/tadaima)
[![Download NPM](https://img.shields.io/npm/dm/tadaima.svg?style=flat)](https://www.npmjs.com/package/tadaima/)
![GitHub License](https://img.shields.io/github/license/Myxogastria0808/tadaima)
![Typedoc](https://img.shields.io/badge/docs-typedoc-blue?style=flat-square&logo=typescript&logoColor=white)
[![RenovateBot](https://img.shields.io/badge/RenovateBot-1A1F6C?logo=renovate&logoColor=fff)](#)

> [!WARNING]
> This project is under active development and not yet stable. APIs may change without notice.

A [greetd](https://sr.ht/~kennylevinsen/greetd/) greeter library for [AGS](https://github.com/aylur/ags) / [GJS](https://gjs.guide/).

Build your own Linux login screen with GTK4 and TypeScript (JSX). tadaima handles greetd authentication, session discovery, and state caching -- you bring the UI.

## Documentation

<div align="center">

[![Wiki](https://img.shields.io/badge/Wiki-Getting_Started_&_Guides-8B5CF6?style=for-the-badge&logo=starlight&logoColor=white)](https://tadaima.yukiosada.work/)
[![API Reference](https://img.shields.io/badge/API_Reference-TypeDoc-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://myxogastria0808.github.io/tadaima/tadaima/)

|                 Wiki                  |       API Reference        |
| :-----------------------------------: | :------------------------: |
| Installation, getting started, guides | TypeDoc generated API docs |

</div>

## Quick Start

```sh
npx create-tadaima my-greeter
```

## What tadaima provides

- `createGreeter()` -- Factory for session discovery, cache, and login handler
- `createLoginHandler()` -- Concurrency-guarded login with greetd IPC
- Session discovery from `.desktop` files
- ... [see more](https://tadaima.yukiosada.work/)

## Example

```tsx
// src/app.tsx
import app from 'ags/gtk4/app';
import Greeter from './components/Greeter';

app.start({
  instanceName: 'greeter',
  requestHandler(_, response) {
    response('not implemented');
  },
  main() {
    Greeter();
  },
});
```

```tsx
// src/components/Greeter.tsx
import app from 'ags/gtk4/app';
import { Gtk } from 'ags/gtk4';
import { createGreeter } from 'tadaima';

const Greeter = (): void => {
  const { sessions, sessionNames, cache, createLoginHandler } = createGreeter({
    sessionDirs: ['/usr/share/wayland-sessions', '/usr/share/xsessions'],
    cachePath: '/var/cache/tadaima/state.json',
  });

  let usernameEntry!: Gtk.Entry;
  let passwordEntry!: Gtk.PasswordEntry;
  let sessionDropdown!: Gtk.DropDown;
  let errorLabel!: Gtk.Label;
  let loginButton!: Gtk.Button;

  const handleLogin = createLoginHandler({
    username: () => usernameEntry.text,
    password: () => passwordEntry.text,
    selectedSession: () => sessions[sessionDropdown.selected],
    onLoggingIn: () => {
      errorLabel.visible = false;
      loginButton.sensitive = false;
      loginButton.label = 'Logging in...';
    },
    onError: (message) => {
      errorLabel.label = message;
      errorLabel.visible = true;
      passwordEntry.text = '';
      passwordEntry.grab_focus();
      loginButton.sensitive = true;
      loginButton.label = 'Login';
    },
  });

  const win = (
    <Gtk.ApplicationWindow application={app} name="greeter">
      <Gtk.Box orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.CENTER} halign={Gtk.Align.CENTER}>
        <Gtk.Label label="Login" />
        <Gtk.Entry
          text={cache.username}
          placeholderText="Username"
          onActivate={() => passwordEntry.grab_focus()}
          $={(self) => (usernameEntry = self)}
        />
        <Gtk.PasswordEntry
          placeholderText="Password"
          showPeekIcon={true}
          onActivate={handleLogin}
          $={(self) => (passwordEntry = self)}
        />
        <Gtk.DropDown
          $constructor={() => Gtk.DropDown.new_from_strings(sessionNames)}
          selected={cache.sessionIndex}
          $={(self) => (sessionDropdown = self)}
        />
        <Gtk.Label label="" visible={false} $={(self) => (errorLabel = self)} />
        <Gtk.Button label="Login" onClicked={handleLogin} $={(self) => (loginButton = self)} />
      </Gtk.Box>
    </Gtk.ApplicationWindow>
  ) as Gtk.ApplicationWindow;

  win.present();
  passwordEntry.grab_focus();
};

export default Greeter;
```

