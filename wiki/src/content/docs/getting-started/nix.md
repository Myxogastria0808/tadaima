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
npx create-tadaima my-greeter --platform nix
cd my-greeter
```

This generates:

```
my-greeter/
  package.json
  flake.nix
  .envrc
  .gitignore
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

## 3. Set up dependencies and type definitions

```sh
pnpm run setup
```

## 4. Customize the UI

Edit `src/components/Greeter.tsx` to design your login screen.

## 5. Build

```sh
nix build
```

The greeter binary is at `./result/bin/greeter`.

## 6. Find the Nix store path

```sh
readlink ./result
# Example output: /nix/store/abc123...-my-greeter
```

## 7. Pin the build result

Prevent `nix-collect-garbage` from removing the store path:

```sh
sudo nix build --out-link /etc/greetd/greeter-link
```

## 8. Configure greetd

Edit `/etc/greetd/config.toml` using the store path from step 6:

```toml
[terminal]
vt = 1

[default_session]
command = "dbus-run-session cage -s -d -- /nix/store/abc123...-my-greeter/bin/greeter"
user = "greeter"
```

## 9. Create cache directory and enable greetd

```sh
sudo mkdir -p /var/cache/tadaima
sudo chown greeter:greeter /var/cache/tadaima
sudo systemctl enable greetd
```

Reboot and you should see your greeter on the login screen.
