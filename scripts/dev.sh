#!/bin/sh
# Wrapper : garantit que le Node local (~/.local/node) est sur le PATH
# avant de lancer le serveur de dev Astro.
export PATH="$HOME/.local/node/bin:$PATH"
cd "$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)" || exit 1
exec npm run dev -- "$@"
