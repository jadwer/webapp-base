#!/bin/sh
# Pruebas antes del push: paridad de tenants + vitest de los paquetes tocados.
# Correr a mano ANTES de `git push`:
#   scripts/verify.sh [remoto]      # por omision origin
# En verde deja la constancia y el pre-push ya no repite las pruebas.
set -e
root="$(git rev-parse --show-toplevel)"
cd "$root"
base="$(sh scripts/push-base.sh "${1:-origin}")"

echo "verify: paridad de tenants"
bash scripts/check-parity.sh

files="$(git diff --name-only "$base..HEAD")"
for pkg in $(printf '%s\n' "$files" | sed -n 's#^packages/\([^/]*\)/.*#packages/\1#p' | sort -u); do
    [ -f "$pkg/package.json" ] || continue
    echo "verify: vitest $pkg"
    (cd "$pkg" && npx vitest run --reporter=dot --passWithNoTests)
done
if printf '%s\n' "$files" | grep -q '^apps/template/'; then
    echo "verify: vitest apps/template"
    (cd apps/template && npx vitest run --reporter=dot --passWithNoTests)
fi
bash scripts/verify-stamp.sh write "$base"
