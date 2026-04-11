# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

tadaima is a [greetd](https://sr.ht/~kennylevinsen/greetd/) greeter library for AGS/GJS. It lets users build custom Linux login screens with GTK4 and TypeScript. The library handles greetd authentication (via Unix socket IPC), session discovery (.desktop files), and state caching. Users provide the UI.

**Runtime**: GJS (GNOME JavaScript), not Node.js. The library has zero npm dependencies — it uses native GJS/GIO APIs exclusively.

## Development Setup

Requires Nix. Enter the dev environment:

```sh
direnv allow   # or: nix develop
```

Install dependencies and generate type definitions:

```sh
pnpm run setup   # runs pnpm install + ags types + wiki build
```

## Common Commands

### Build example greeters (Nix)

```sh
nix build .#minimal
nix build .#simple
nix build .#image
nix build .#movie
pnpm run nix:build          # Show usage
pnpm run nix:build:simple   # Build simple greeter
```

### Formatting and Linting

```sh
pnpm run fmt                # Format (oxfmt + prettier for .astro)
pnpm run fmt:check          # Check formatting (CI)
pnpm run lint               # Lint with auto-fix (oxlint + eslint)
pnpm run lint:check         # Check lint (CI)
```

### Documentation

```sh
pnpm run tadaima:typedoc:build       # Generate tadaima API docs
pnpm run tadaima:typedoc:preview     # Preview tadaima API docs
pnpm run create-tadaima:typedoc:build   # Generate create-tadaima API docs
pnpm run create-tadaima:typedoc:preview # Preview create-tadaima API docs
pnpm run wiki:dev                    # Astro dev server for wiki
pnpm run wiki:build                  # Build wiki for deployment
```

### create-tadaima

```sh
pnpm run create-tadaima:dev     # Build + run CLI (in tmp/)
pnpm run create-tadaima:build   # Build with tsup
pnpm run create-tadaima:test    # Run integration tests (vitest + execa)
```

### Package publishing

```sh
pnpm run tadaima:pub         # Publish tadaima to npm
pnpm run create-tadaima:pub     # Publish create-tadaima to npm
```

## Architecture

### Runtime chain

```
greetd → dbus-run-session → cage (Wayland kiosk) → greeter binary (AGS)
```

cage does not support `wlr-layer-shell`, so greeters must use `Gtk.ApplicationWindow` (not AGS's `<window>` which depends on `gtk4-layer-shell`). cage automatically fullscreens the window.

### Monorepo structure (pnpm workspaces)

- **`packages/tadaima/`** — The npm library (`@myxogastria0808/tadaima`). Source is in `packages/tadaima/src/`.
- **`packages/create-tadaima/`** — CLI scaffolding tool (`npx @myxogastria0808/create-tadaima`). Built with `@clack/prompts`, `validate-npm-package-name`, and `tsup`.
- **`examples/`** — Four example greeters (minimal, simple, image, movie). Each has `src/app.tsx` and `src/components/Greeter.tsx`.
- **`wiki/`** — Astro + Starlight documentation site (`@myxogastria0808/tadaima-wiki`), deployed to Cloudflare Workers.
- **`scripts/`** — Shell scripts: `types.sh` (AGS type generation), `build.sh` (Nix example builds).
- **`nix/module.nix`** — NixOS service module (`services.tadaima`).
- **`@girs/`** — GObject Introspection type definitions (generated, not hand-written).

### Library modules (`packages/tadaima/src/libs/`)

- **`client.ts`** — `createGreeter()` factory and `createLoginHandler()` with concurrency guard.
- **`greetd.ts`** — Low-level greetd-ipc(7) protocol: JSON over Unix socket, async GIO streams.
- **`sessions.ts`** — `SessionManager`: discovers and parses `.desktop` session files.
- **`cache.ts`** — `CacheManager`: JSON state persistence with atomic writes (temp file + rename).

Public API is re-exported from `packages/tadaima/src/index.ts`.

### create-tadaima structure (`packages/create-tadaima/`)

- **`src/cli.ts`** — Entry point (args → prompts → generate → outro).
- **`src/lib/args.ts`** — CLI argument parsing with `node:util` `parseArgs`.
- **`src/lib/prompts.ts`** — Interactive prompts with `@clack/prompts`.
- **`src/lib/generator.ts`** — Template copy + `{{projectName}}` placeholder substitution.
- **`src/lib/validate.ts`** — Project name and platform validation.
- **`src/lib/types.ts`** — `PlatformType` (`arch` | `nixos` | `nix`).
- **`src/index.ts`** — Re-exports for TypeDoc.
- **`templates/`** — Project templates (common + platform-specific). Each platform has `scripts/build.sh`; common has `scripts/types.sh`.
  - **`common/`** — Shared files: `.gitignore`, `LICENSE`, `src/`, `scripts/types.sh`, `.oxlintrc.json`, `.oxfmtrc.json`.
  - **`arch/`** — Arch Linux: `package.json` (with `@myxogastria0808/tadaima` dep), `scripts/build.sh` (`ags bundle`).
  - **`nixos/`** — NixOS: `package.json`, `flake.nix` (with nixosModules), `scripts/build.sh` (`nix build`).
  - **`nix/`** — Nix (non-NixOS): `package.json`, `flake.nix` (no nixosModules), `scripts/build.sh` (`nix build`).
- **`__tests__/cli.test.ts`** — Integration tests (execa subprocess, create-vite style).

## TypeScript Configuration

### tadaima (library)

- JSX: `react-jsx` with `jsxImportSource: "ags/gtk4"` (Gnim JSX for GTK4)
- Module: ES2022, moduleResolution: Bundler
- Strict mode enabled
- Target: ES2022

### create-tadaima

- Module: ES2022, moduleResolution: Bundler
- Target: ES2022
- Built with tsup (esbuild), shebang injected via `banner`
- No JSX

## Formatting and Linting

- **oxfmt** — TS/JS/JSON formatting (`.astro` excluded via CLI flag)
- **oxlint** — TS/JS linting (`.astro` excluded via CLI flag, GJS globals in `.oxlintrc.json`)
- **prettier** + `prettier-plugin-astro` — `.astro` file formatting only
- **eslint** + `eslint-plugin-astro` — `.astro` file linting only
