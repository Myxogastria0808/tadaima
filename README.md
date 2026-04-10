# tadaima

> [!WARNING]
> This project is under active development and not yet stable. APIs may change without notice.

A [greetd](https://sr.ht/~kennylevinsen/greetd/) greeter library for
[AGS](https://github.com/aylur/ags) / [GJS](https://gjs.guide/).

Build your own login screen with GTK4 and TypeScript. tadaima handles
greetd authentication, session discovery, and state caching — you bring
the UI.

tadaima communicates with greetd directly via Unix socket
( [greetd-ipc(7)](https://man.archlinux.org/man/greetd-ipc.7.en) ) —
no Astal Greet dependency required.
