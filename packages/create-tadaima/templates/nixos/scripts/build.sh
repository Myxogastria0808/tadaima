#!/bin/sh
# Build the greeter using Nix.
# Usage: sh scripts/build.sh

RED='\033[31m'
GREEN='\033[32m'
YELLOW='\033[33m'
RESET='\033[0m'

error() { printf "${RED}[error]${RESET} %s\n" "$1" >&2; }
ok() { printf "${GREEN}[ok]${RESET} %s\n" "$1"; }
info() { printf "${YELLOW}[info]${RESET} %s\n" "$1"; }

# Check nix
if ! command -v nix >/dev/null 2>&1; then
	error "nix is not installed."
	info "Install Nix: https://nixos.org/download/"
	exit 1
fi

# Check flakes
if ! nix flake --version >/dev/null 2>&1; then
	error "Nix flakes are not enabled."
	info 'Add "experimental-features = nix-command flakes" to ~/.config/nix/nix.conf'
	exit 1
fi

ok "nix is available."

info "Building greeter..."
nix build

if [ $? -eq 0 ]; then
	ok "Build complete. Binary at ./result/bin/greeter"
else
	error "Build failed."
	exit 1
fi
