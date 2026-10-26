#!/usr/bin/env bash
# Guardian anti-deriva de espejos (T2, 2026-08-31).
#
# Los modulos de src/modules y las paginas de (back) del template y de los
# tenants (laborwasser, alphalabchem desde 25-10) son ESPEJOS: todo fix de motor debe aplicarse en ambos
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
TENANTS="clients/laborwasser/webapp/src clients/alphalabchem/webapp/src"
FAIL=0

for C in $TENANTS; do
  for m in $(comm -12 <(ls "$T/modules" | sort) <(ls "$C/modules" | sort)); do
    case "$m" in catalog|landing|auth-ui|demo|portal-landing|example-landing) continue ;; esac
    DIFFS=$(diff -rq "$T/modules/$m" "$C/modules/$m" 2>/dev/null | grep -v 'Only in' || true)
    if [ -n "$DIFFS" ]; then
      echo "DERIVA en $C/modules/$m:"
      echo "$DIFFS" | sed 's/^/  /'
      FAIL=1
    fi
  done

  DIFFS=$(diff -rq "$T/app/(back)" "$C/app/(back)" 2>/dev/null | grep -v 'Only in' | grep -v 'layout.tsx' || true)
  if [ -n "$DIFFS" ]; then
    echo "DERIVA en $C/app/(back):"
    echo "$DIFFS" | sed 's/^/  /'
    FAIL=1
  fi
done

if [ "$FAIL" -eq 0 ]; then
  echo "Paridad OK: template y tenants (laborwasser, alphalabchem) son espejos en el motor."
else
  echo ""
  echo "Hay deriva de espejos. Aplica el cambio en AMBAS apps o documenta la"
  echo "excepcion en scripts/check-parity.sh (solo piel o arquitectura por app)."
fi
exit $FAIL
