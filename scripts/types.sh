#!/bin/sh
# Generate type definitions using ags types.
# Must be run from the tadaima repository root.
# Usage: sh scripts/types.sh

RED='\033[31m'
GREEN='\033[32m'
YELLOW='\033[33m'
RESET='\033[0m'

error() { printf "${RED}[error]${RESET} %s\n" "$1" >&2; }
ok() { printf "${GREEN}[ok]${RESET} %s\n" "$1"; }
info() { printf "${YELLOW}[info]${RESET} %s\n" "$1"; }

MARKER_FILE="tadaima"
MARKER_CONTENT="This directory is the root of the project."

# Check ags
if ! command -v ags >/dev/null 2>&1; then
	error "ags is not installed."
	info "Install AGS: https://aylur.github.io/ags/guide/install.html"
	exit 1
fi

ok "ags is available."

# Check project root via marker file
if [ ! -f "$MARKER_FILE" ] || [ "$(cat "$MARKER_FILE")" != "$MARKER_CONTENT" ]; then
	error "Not in the tadaima project root."
	info "Run this command from the tadaima repository root."
	exit 1
fi

ok "Project root confirmed."

info "Generating type definitions..."
ags types --update --directory .

if [ $? -eq 0 ]; then
	ok "Type definitions generated."
else
	error "Failed to generate type definitions."
	exit 1
fi

# Fix tsconfig.json target: ags generates ES2020 but we use ES2022
sed -i 's/"target": "ES2020"/"target": "ES2022"/' tsconfig.json
ok "tsconfig.json target updated to ES2022."

