# tadaima

[![Wiki Deploy](https://img.shields.io/github/actions/workflow/status/Myxogastria0808/tadaima/wiki.yaml?label=Wiki&logo=cloudflare&logoColor=white&style=flat-square)](https://github.com/Myxogastria0808/tadaima/actions/workflows/wiki.yaml)
[![Docs Deploy](https://img.shields.io/github/actions/workflow/status/Myxogastria0808/tadaima/docs.yaml?label=Docs&logo=githubpages&logoColor=white&style=flat-square)](https://github.com/Myxogastria0808/tadaima/actions/workflows/docs.yaml)
[![tadaima-cli Test](https://img.shields.io/github/actions/workflow/status/Myxogastria0808/tadaima/tadaima-cli-test.yaml?label=Test&logo=vitest&logoColor=white&style=flat-square)](https://github.com/Myxogastria0808/tadaima/actions/workflows/tadaima-cli-test.yaml)
[![CI](https://img.shields.io/github/actions/workflow/status/Myxogastria0808/tadaima/ci.yaml?label=CI&logo=github&logoColor=white&style=flat-square)](https://github.com/Myxogastria0808/tadaima/actions/workflows/ci.yaml)
![GitHub License](https://img.shields.io/github/license/Myxogastria0808/tadaima?style=flat-square)
[![RenovateBot](https://img.shields.io/badge/RenovateBot-1A1F6C?style=flat-square&logo=renovate&logoColor=fff)](#)

> [!WARNING]
> This project is under active development and not yet stable. APIs may change without notice.

A [greetd](https://sr.ht/~kennylevinsen/greetd/) greeter library for [AGS](https://github.com/aylur/ags) / [GJS](https://gjs.guide/).

Build your own Linux login screen with GTK4 and TypeScript (JSX). tadaima handles greetd authentication, session discovery, and state caching -- you bring the UI.

## Documentation

<div align="center">

[![Wiki](https://img.shields.io/badge/Wiki-Getting_Started_&_Guides-8B5CF6?style=for-the-badge&logo=starlight&logoColor=white)](https://tadaima.yukiosada.work/)
[![API Reference (tadaima)](https://img.shields.io/badge/API_Reference-tadaima-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://myxogastria0808.github.io/tadaima/tadaima/)
[![API Reference (tadaima‑cli)](https://img.shields.io/badge/API_Reference-tadaima--cli-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://myxogastria0808.github.io/tadaima/tadaima-cli/)

|                 Wiki                  | API Reference (tadaima) | API Reference (tadaima-cli) |
| :-----------------------------------: | :---------------------: | :-------------------------: |
| Installation, getting started, guides |    Library API docs     |        CLI API docs         |

</div>

## Packages

| Package                                    | Description                                                     | npm                                                                                                       |
| ------------------------------------------ | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| [**tadaima**](./packages/tadaima/)         | Greeter library -- greetd IPC, session discovery, state caching | [![NPM Version](https://img.shields.io/npm/v/tadaima.svg)](https://www.npmjs.com/package/tadaima)         |
| [**tadaima-cli**](./packages/tadaima-cli/) | Scaffolding CLI (`npx create-tadaima`)                          | [![NPM Version](https://img.shields.io/npm/v/tadaima-cli.svg)](https://www.npmjs.com/package/tadaima-cli) |

## Quick Start

```sh
npx create-tadaima my-greeter
```
