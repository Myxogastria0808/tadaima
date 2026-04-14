---
title: Nix (non-NixOS)
description: Getting started with tadaima using Nix on non-NixOS distributions
---

## Prerequisites

- Nix with flakes enabled
  - Add `experimental-features = nix-command flakes` to `~/.config/nix/nix.conf`
- `greetd` and `cage` installed via your distro's package manager

## 1. Scaffold a new project

```sh
pnpm dlx create-tadaima my-greeter --platform nix
cd my-greeter
```

This generates:

```
my-greeter/
  .envrc
  .gitignore
  .oxfmtrc.json
  .oxlintrc.json
  LICENSE
  flake.nix
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

## 2. Enter the dev environment

```sh
direnv allow   # or: nix develop
```

See [nix-direnv](https://github.com/nix-community/nix-direnv) for details on the direnv + Nix integration.

## 3. Set up dependencies and type definitions

```sh
pnpm run setup
```

This runs `pnpm install` and generates AGS type definitions (`tsconfig.json`, `@girs/` types).

## 4. Customize the UI

Edit `src/components/Greeter.tsx` to design your login screen. The generated template includes a minimal login form with Catppuccin Mocha styling.

For a step-by-step guide on using the tadaima API, see [Usage](/guide/usage/).

## 5. Build

```sh
pnpm run build
```

The greeter binary is at `./result/bin/greeter`. Note that you cannot run the greeter — this step only checks that the build completes without errors.

## 6. Pin the build result

Prevent `nix-collect-garbage` from removing the store path:

```sh
sudo nix build --out-link /etc/greetd/greeter-link
```

## 7. Configure greetd

Edit `/etc/greetd/config.toml`:

```toml
# /etc/greetd/config.toml
[terminal]
vt = 1

[default_session]
command = "dbus-run-session cage -s -d -- /etc/greetd/greeter-link/bin/greeter"
user = "greeter"
```

## 8. Create cache directory and enable greetd

```sh
sudo mkdir -p /var/cache/tadaima
sudo chown greeter:greeter /var/cache/tadaima
sudo systemctl enable greetd
```

Reboot and you should see your greeter on the login screen.
