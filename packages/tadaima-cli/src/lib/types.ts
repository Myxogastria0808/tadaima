/**
 * Supported platform types for greeter project generation.
 *
 * - `arch` — Arch Linux (pacman/yay for system deps, npm for tadaima)
 * - `nixos` — NixOS (Nix flake with NixOS module for greetd setup, npm for tadaima)
 * - `nix` — Nix on non-NixOS distros (Nix flake, manual greetd setup, npm for tadaima)
 */
export type PlatformType = 'arch' | 'nixos' | 'nix';
