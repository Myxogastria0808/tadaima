---
title: NixOS
description: Getting started with tadaima on NixOS
---

## Prerequisites

The flake.nix file containing your NixOS configuration must include [AGS](https://github.com/aylur/ags) and [Astal](https://github.com/aylur/astal) as inputs.

```nix
# flake.nix
{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";

    ags = {
      url = "github:aylur/ags";
      inputs.nixpkgs.follows = "nixpkgs";
      inputs.astal.follows = "astal";
    };

    astal = {
      url = "github:aylur/astal";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };
}
```

## 1. Scaffold a new project

```sh
npx create-tadaima my-greeter --platform nixos
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

This runs `pnpm install` and generates AGS type definitions (`tsconfig.json`, `@girs/` types).

## 4. Customize the UI

Edit `src/components/Greeter.tsx` to design your login screen. The generated template includes a minimal login form with Catppuccin Mocha styling.

## 5. Build

```sh
nix build
```

The greeter binary is at `./result/bin/greeter`.

## 6. Configure NixOS

The generated `flake.nix` includes a NixOS module. Add your greeter to your system flake:

```nix
# In your system flake inputs:
inputs.my-greeter = {
  url = "path:./path/to/my-greeter";  # or github:your-user/my-greeter
  inputs.nixpkgs.follows = "nixpkgs";
  inputs.ags.follows = "ags";
  inputs.astal.follows = "astal";
};
```

Then import the module and enable it in your NixOS configuration:

```nix
# configuration.nix
{ inputs, ... }:
{
  imports = [ inputs.my-greeter.nixosModules.default ];

  services.my-greeter = {
    enable = true;
    # cachePath = "/var/cache/tadaima";  # default
  };
}
```

The module automatically:

- Enables and configures `services.greetd` with dbus-run-session + cage
- Creates the cache directory (`/var/cache/tadaima`) owned by the `greeter` user

## 7. Apply

```sh
sudo nixos-rebuild switch
```

Reboot and you should see your greeter on the login screen.

