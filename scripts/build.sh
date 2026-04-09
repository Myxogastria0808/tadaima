#!/bin/sh
# Build an example greeter using Nix.
# Usage: sh scripts/build.sh <simple|image|movie>

RED='\033[31m'
GREEN='\033[32m'
YELLOW='\033[33m'
RESET='\033[0m'

error() { printf "${RED}[error]${RESET} %s\n" "$1" >&2; }
ok() { printf "${GREEN}[ok]${RESET} %s\n" "$1"; }
info() { printf "${YELLOW}[info]${RESET} %s\n" "$1"; }

TARGET="$1"

if [ -z "$TARGET" ]; then
	error "Usage: pnpm run nix:build:<simple|image|movie>"
	exit 1
fi

case "$TARGET" in
simple | image | movie) ;;
*)
	error "Unknown target: $TARGET"
	error "Valid targets: simple, image, movie"
	exit 1
	;;
esac

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

if [ ! -d "examples/$TARGET" ]; then
	error "Example directory not found: examples/$TARGET"
	exit 1
fi

info "Building example: $TARGET"
nix build ".#$TARGET"

if [ $? -eq 0 ]; then
	ok "Build complete. Binary at ./result/bin/greeter"
else
	error "Build failed for $TARGET."
	exit 1
fi

