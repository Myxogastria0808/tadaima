# create-tadaima

[![Wiki](https://github.com/Myxogastria0808/tadaima/actions/workflows/wiki.yaml/badge.svg)](https://github.com/Myxogastria0808/tadaima/actions/workflows/wiki.yaml)
[![Docs](https://github.com/Myxogastria0808/tadaima/actions/workflows/docs.yaml/badge.svg)](https://github.com/Myxogastria0808/tadaima/actions/workflows/docs.yaml)
[![Test](https://github.com/Myxogastria0808/tadaima/actions/workflows/create-tadaima-test.yaml/badge.svg)](https://github.com/Myxogastria0808/tadaima/actions/workflows/create-tadaima-test.yaml)
[![NPM Version](https://img.shields.io/npm/v/@myxogastria0808/create-tadaima.svg)](https://www.npmjs.com/package/@myxogastria0808/create-tadaima)
[![Download NPM](https://img.shields.io/npm/dm/@myxogastria0808/create-tadaima.svg?style=flat)](https://www.npmjs.com/package/@myxogastria0808/create-tadaima/)
![GitHub License](https://img.shields.io/github/license/Myxogastria0808/tadaima)
![Typedoc](https://img.shields.io/badge/docs-typedoc-blue?style=flat-square&logo=typescript&logoColor=white)
![Vitest](https://img.shields.io/badge/-vitest-6e9f18?style=flat&logo=vitest&logoColor=ffffff)
[![RenovateBot](https://img.shields.io/badge/RenovateBot-1A1F6C?logo=renovate&logoColor=fff)](#)

> [!WARNING]
> This project is under active development and not yet stable.

Scaffold a [@myxogastria0808/tadaima](https://www.npmjs.com/package/@myxogastria0808/tadaima) greeter project.

## Documentation

<div align="center">

<a href="https://tadaima.yukiosada.work/"><img src="https://img.shields.io/badge/Wiki-8B5CF6?style=for-the-badge&logo=starlight&logoColor=white" alt="Wiki" /></a>
&nbsp;
<a href="https://myxogastria0808.github.io/tadaima/create-tadaima/"><img src="https://img.shields.io/badge/API_Reference-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="API Reference" /></a>

</div>

- [Wiki](https://tadaima.yukiosada.work/) -- Installation, getting started, guides
- [API Reference](https://myxogastria0808.github.io/tadaima/create-tadaima/) -- TypeDoc generated API docs

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
