---
title: Arch Linux
description: Getting started with tadaima on Arch-based distributions
---

## Prerequisites

Install system dependencies:

```sh
pacman -S greetd cage corepack
yay -S aylurs-gtk-shell
```

## 1. Scaffold a new project

```sh
pnpm dlx create-tadaima my-greeter --platform arch
cd my-greeter
```

This generates:

```
my-greeter/
  .gitignore
  .oxfmtrc.json
  .oxlintrc.json
  LICENSE
  package.json
  scripts/
    build.sh
    types.sh
  src/
    app.tsx
    global.css
    components/
      Greeter.tsx
      style.scss
```

## 2. Set up dependencies and type definitions

```sh
pnpm run setup
```

This runs `pnpm install` (installs `@myxogastria0808/tadaima` from npm) and generates AGS type definitions.

## 3. Customize the UI

Edit `src/components/Greeter.tsx` to design your login screen. The generated template includes a minimal login form with Catppuccin Mocha styling.

For a step-by-step guide on using the tadaima API, see [Usage](/guide/usage/).

## 4. Build

```sh
pnpm run build
```

This runs `ags bundle src/app.tsx greeter` and produces a `greeter` executable in the project root.

## 5. Install the greeter binary

Copy the built binary to a system-accessible location:

```sh
sudo cp ./greeter /usr/local/bin/my-greeter
```

## 6. Configure greetd

Edit `/etc/greetd/config.toml`:

```toml
# /etc/greetd/config.toml
[terminal]
vt = 1

[default_session]
command = "dbus-run-session cage -s -d -- /usr/local/bin/my-greeter"
user = "greeter"
```

## 7. Create cache directory and enable greetd

```sh
sudo mkdir -p /var/cache/tadaima
sudo chown greeter:greeter /var/cache/tadaima
sudo systemctl enable greetd
```

Reboot and you should see your greeter on the login screen.
