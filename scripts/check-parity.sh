#!/usr/bin/env bash
# Guardian anti-deriva de espejos (T2, 2026-08-31).
#
# Los modulos de src/modules y las paginas de (back) del template y del
# tenant laborwasser son ESPEJOS: todo fix de motor debe aplicarse en ambos
# hasta que se consoliden en packages @lwm/*. Este script falla si divergen.
#
# Excepciones legitimas (piel/arquitectura por app), NO agregar sin motivo:
#   - modules/catalog            piel del sitio publico por tenant
#   - modules/landing            piel del tenant
#   - modules/auth-ui            piel del tenant (AuthSplitLayout)
#   - modules/demo               solo template (marca blanca)
#   - app/(front)                sitio publico por tenant
#   - app/layout.tsx, app/(back)/layout.tsx   arquitectura por app
#
# Uso: bash scripts/check-parity.sh   (exit 0 = paridad, 1 = deriva)

set -u
T="apps/template/src"
C="clients/laborwasser/webapp/src"
SKIP_MODULES="catalog|landing|auth-ui|demo|commissions_NUNCA" # commissions ya es espejo
FAIL=0

for m in $(comm -12 <(ls "$T/modules" | sort) <(ls "$C/modules" | sort)); do
  case "$m" in catalog|landing|auth-ui|demo) continue ;; esac
  DIFFS=$(diff -rq "$T/modules/$m" "$C/modules/$m" 2>/dev/null | grep -v 'Only in' || true)
  if [ -n "$DIFFS" ]; then
    echo "DERIVA en modules/$m:"
    echo "$DIFFS" | sed 's/^/  /'
    FAIL=1
  fi
done

DIFFS=$(diff -rq "$T/app/(back)" "$C/app/(back)" 2>/dev/null | grep -v 'Only in' | grep -v 'layout.tsx' || true)
if [ -n "$DIFFS" ]; then
  echo "DERIVA en app/(back):"
  echo "$DIFFS" | sed 's/^/  /'
  FAIL=1
fi

if [ "$FAIL" -eq 0 ]; then
  echo "Paridad OK: template y tenant laborwasser son espejos en el motor."
else
  echo ""
  echo "Hay deriva de espejos. Aplica el cambio en AMBAS apps o documenta la"
  echo "excepcion en scripts/check-parity.sh (solo piel o arquitectura por app)."
fi
exit $FAIL
