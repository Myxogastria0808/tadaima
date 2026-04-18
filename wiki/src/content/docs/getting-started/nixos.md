---
title: NixOS
description: Getting started with @myxogastria0808/tadaima on NixOS
---

## Prerequisites

The flake.nix file containing your NixOS configuration must include [AGS](https://github.com/aylur/ags) and [Astal](https://github.com/aylur/astal) as inputs.

```nix ins={6-15}
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

  outputs = { nixpkgs, ... } @ inputs: {
    nixosConfigurations.your-hostname = nixpkgs.lib.nixosSystem {
      system = "x86_64-linux";
      specialArgs = { inherit inputs; };
      modules = [
        ./configuration.nix
      ];
    };
  };
}
```

## 1. Scaffold a new project

```sh
pnpm dlx @myxogastria0808/create-tadaima my-greeter --platform nixos
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

For a step-by-step guide on using the @myxogastria0808/tadaima API, see [Usage](/guide/usage/).

## 5. Build (optional)

If you want to verify the build succeeds locally, you can run:

```sh
pnpm run build
```

The greeter binary is at `./result/bin/greeter`. Note that you cannot run the greeter — this step only checks that the build completes without errors.

## 6. Push to a Git repository

The NixOS module consumes your greeter as a flake input, so it needs to be accessible via a Git URL.

```sh
git init && git add -A && git commit -m "initial commit"
git remote add origin git@github.com:your-user/my-greeter.git
git push -u origin main
```

## 7. Configure NixOS

The generated `flake.nix` includes a NixOS module. Add your greeter to your system flake.

The `ags` and `astal` inputs should already be present from [Prerequisites](#prerequisites). Add your greeter as a new input (highlighted lines):

```nix ins={17-23}
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

    my-greeter = {
      url = "github:your-user/my-greeter";
      inputs.nixpkgs.follows = "nixpkgs";
      inputs.ags.follows = "ags";
      inputs.astal.follows = "astal";
    };
  };

  outputs = { nixpkgs, ... } @ inputs: {
    nixosConfigurations.your-hostname = nixpkgs.lib.nixosSystem {
      system = "x86_64-linux";
      specialArgs = { inherit inputs; };
      modules = [
        ./configuration.nix
      ];
    };
  };
}
```

Then import the module and enable it in your NixOS configuration:

```nix ins={6-9}
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

- Enables and configures `services.greetd` with dbus-run-session + cage (`-s -d -mlast`)
- Creates the cache directory (`/var/cache/tadaima`) owned by the `greeter` user

## 8. Apply

```sh
sudo nixos-rebuild switch
```

Reboot and you should see your greeter on the login screen.
