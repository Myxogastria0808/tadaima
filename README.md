# tadaima

[![Wiki Deploy](https://img.shields.io/github/actions/workflow/status/Myxogastria0808/tadaima/wiki.yaml?label=Wiki&logo=cloudflare&logoColor=white&style=flat-square)](https://github.com/Myxogastria0808/tadaima/actions/workflows/wiki.yaml)
[![Docs Deploy](https://img.shields.io/github/actions/workflow/status/Myxogastria0808/tadaima/docs.yaml?label=Docs&logo=githubpages&logoColor=white&style=flat-square)](https://github.com/Myxogastria0808/tadaima/actions/workflows/docs.yaml)
[![create-tadaima Test](https://img.shields.io/github/actions/workflow/status/Myxogastria0808/tadaima/create-tadaima-test.yaml?label=Test&logo=vitest&logoColor=white&style=flat-square)](https://github.com/Myxogastria0808/tadaima/actions/workflows/create-tadaima-test.yaml)
[![CI](https://img.shields.io/github/actions/workflow/status/Myxogastria0808/tadaima/ci.yaml?label=CI&logo=github&logoColor=white&style=flat-square)](https://github.com/Myxogastria0808/tadaima/actions/workflows/ci.yaml)
![GitHub Release](https://img.shields.io/github/v/release/Myxogastria0808/tadaima?style=flat-square)
![GitHub License](https://img.shields.io/github/license/Myxogastria0808/tadaima?style=flat-square)
[![Built with Starlight](https://astro.badg.es/v2/built-with-starlight/tiny.svg)](https://starlight.astro.build)
[![RenovateBot](https://img.shields.io/badge/RenovateBot-1A1F6C?style=flat-square&logo=renovate&logoColor=fff)](#)

> [!WARNING]
> This project is under active development and not yet stable. APIs may change without notice.

A [greetd](https://sr.ht/~kennylevinsen/greetd/) greeter library for [AGS](https://github.com/aylur/ags) / [GJS](https://gjs.guide/).

Build your own Linux login screen with GTK4 and TypeScript (JSX). tadaima handles greetd authentication, session discovery, and state caching -- you bring the UI.

## Documentation

<div align="center">

<a href="https://tadaima.yukiosada.work/"><img src="https://img.shields.io/badge/Wiki-Getting_Started_&_Guides-8B5CF6?style=for-the-badge&logo=starlight&logoColor=white" alt="Wiki" /></a>
<br /><br />
<a href="https://myxogastria0808.github.io/tadaima/tadaima/"><img src="https://img.shields.io/badge/API_Docs-@myxogastria0808/tadaima-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="API Reference (@myxogastria0808/tadaima)" /></a>
&nbsp;
<a href="https://myxogastria0808.github.io/tadaima/create-tadaima/"><img src="https://img.shields.io/badge/API_Docs-@myxogastria0808/create--tadaima-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="API Reference (@myxogastria0808/create-tadaima)" /></a>

</div>

- [Wiki](https://tadaima.yukiosada.work/) -- Installation, getting started, guides
- [API Reference (@myxogastria0808/tadaima)](https://myxogastria0808.github.io/tadaima/tadaima/) -- Library API docs
- [API Reference (@myxogastria0808/create-tadaima)](https://myxogastria0808.github.io/tadaima/create-tadaima/) -- CLI API docs

## Packages

| Package                                                           | Description                                                     | npm                                                                                                                                               |
| ----------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| [**@myxogastria0808/tadaima**](./packages/tadaima/)               | Greeter library -- greetd IPC, session discovery, state caching | [![NPM Version](https://img.shields.io/npm/v/@myxogastria0808/tadaima.svg)](https://www.npmjs.com/package/@myxogastria0808/tadaima)               |
| [**@myxogastria0808/create-tadaima**](./packages/create-tadaima/) | Scaffolding CLI (`npx create-tadaima`)                          | [![NPM Version](https://img.shields.io/npm/v/@myxogastria0808/create-tadaima.svg)](https://www.npmjs.com/package/@myxogastria0808/create-tadaima) |

## Quick Start

```sh
npx create-tadaima my-greeter
```
