# tadaima-cli

[![Wiki](https://github.com/Myxogastria0808/tadaima/actions/workflows/wiki.yaml/badge.svg)](https://github.com/Myxogastria0808/tadaima/actions/workflows/wiki.yaml)
[![Docs](https://github.com/Myxogastria0808/tadaima/actions/workflows/docs.yaml/badge.svg)](https://github.com/Myxogastria0808/tadaima/actions/workflows/docs.yaml)
[![Test](https://github.com/Myxogastria0808/tadaima/actions/workflows/tadaima-cli-test.yaml/badge.svg)](https://github.com/Myxogastria0808/tadaima/actions/workflows/tadaima-cli-test.yaml)
[![NPM Version](https://img.shields.io/npm/v/tadaima-cli.svg)](https://www.npmjs.com/package/tadaima-cli)
[![Download NPM](https://img.shields.io/npm/dm/tadaima-cli.svg?style=flat)](https://www.npmjs.com/package/tadaima-cli/)
![GitHub License](https://img.shields.io/github/license/Myxogastria0808/tadaima)
![Typedoc](https://img.shields.io/badge/docs-typedoc-blue?style=flat-square&logo=typescript&logoColor=white)
![Vitest](https://img.shields.io/badge/-vitest-6e9f18?style=flat&logo=vitest&logoColor=ffffff)
[![RenovateBot](https://img.shields.io/badge/RenovateBot-1A1F6C?logo=renovate&logoColor=fff)](#)

> [!WARNING]
> This project is under active development and not yet stable.

Scaffold a [tadaima](https://www.npmjs.com/package/tadaima) greeter project.

## Documentation

<div align="center">

[![Wiki](https://img.shields.io/badge/Wiki-Getting_Started_&_Guides-8B5CF6?style=for-the-badge&logo=starlight&logoColor=white)](https://tadaima.yukiosada.work/)
[![API Reference](https://img.shields.io/badge/API_Reference-TypeDoc-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://myxogastria0808.github.io/tadaima/tadaima-cli/)

|                 Wiki                  |       API Reference        |
| :-----------------------------------: | :------------------------: |
| Installation, getting started, guides | TypeDoc generated API docs |

</div>

## Usage

```sh
npx create-tadaima
```

Interactive prompts will ask for a project name and platform (Arch Linux / NixOS / Nix on other distro).

### CLI arguments

```sh
# Specify everything (no prompts)
npx create-tadaima my-greeter --platform nixos

# Scaffold in current directory
npx create-tadaima .

# Show help
npx create-tadaima --help
```

### Generated project structure

```
my-greeter/
  package.json
  src/
    app.tsx
    global.css
    components/
      Greeter.tsx
      style.scss
  flake.nix          # NixOS / Nix only
  .envrc             # NixOS / Nix only
  .gitignore
```

