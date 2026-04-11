#!/bin/sh
# Build the greeter using ags bundle.
# Usage: sh scripts/build.sh

RED='\033[31m'
GREEN='\033[32m'
YELLOW='\033[33m'
RESET='\033[0m'

error() { printf "${RED}[error]${RESET} %s\n" "$1" >&2; }
ok() { printf "${GREEN}[ok]${RESET} %s\n" "$1"; }
info() { printf "${YELLOW}[info]${RESET} %s\n" "$1"; }

# Check ags
if ! command -v ags >/dev/null 2>&1; then
	error "ags is not installed."
	info "Install AGS: https://aylur.github.io/ags/guide/install.html"
	exit 1
fi

ok "ags is available."

info "Building greeter..."
ags bundle src/app.tsx greeter

if [ $? -eq 0 ]; then
	ok "Build complete. Binary at ./greeter"
else
	error "Build failed."
	exit 1
fi
