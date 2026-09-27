#!/usr/bin/env bash
# =========================================================
# Publica o site dynosai.com.br no VPS a partir do GitHub.
#
# Como usar (no Console do Navegador do hPanel, como root):
#   bash <(curl -fsSL https://raw.githubusercontent.com/clarmcontabilidade-cmd/siteclarm/claude/dynosai-site-modernization-lywsw8/deploy/publicar-site.sh)
#
# O que ele faz, nesta ordem:
#   1. Guarda uma cópia completa do site atual em /opt/dynosai-site-backup-<data-hora>
#   2. Baixa o site novo do GitHub (branch abaixo)
#   3. Copia os arquivos novos por cima dos antigos, SEM apagar nada que já estava lá
#      (vídeos antigos, instalador do Auditor SPED etc. continuam)
#   4. Ajusta permissões e confere se o site responde
#
# Para publicar SEM guardar cópia do site antigo, acrescente SEM_BACKUP=1 antes do bash:
#   SEM_BACKUP=1 bash <(curl -fsSL ...)
#
# Para voltar ao site antigo, se precisar (só existe se o backup foi feito):
#   cp -a /opt/dynosai-site-backup-<data-hora>/. /opt/dynosai-site/
# =========================================================
set -euo pipefail

BRANCH="${BRANCH:-claude/dynosai-site-modernization-lywsw8}"
REPO="clarmcontabilidade-cmd/siteclarm"
DEST="${DEST:-/opt/dynosai-site}"
ZIP_URL="${ZIP_URL:-https://codeload.github.com/${REPO}/zip/refs/heads/${BRANCH}}"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="${DEST}-backup-${STAMP}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

if [ "${SEM_BACKUP:-0}" = "1" ]; then
  echo "==> 1/4 Backup desativado (SEM_BACKUP=1): publicando direto por cima do site atual"
  mkdir -p "$DEST"
elif [ -d "$DEST" ]; then
  echo "==> 1/4 Backup do site atual em: $BACKUP"
  mkdir -p "$BACKUP"
  cp -a "$DEST"/. "$BACKUP"/
  echo "    ok ($(du -sh "$BACKUP" | cut -f1))"
else
  echo "    (pasta $DEST não existia; será criada)"
  mkdir -p "$DEST"
fi

echo "==> 2/4 Baixando o site novo do GitHub ($BRANCH)"
curl -fsSL "$ZIP_URL" -o "$TMP/site.zip"
unzip -q "$TMP/site.zip" -d "$TMP/unz"
SRC="$(find "$TMP/unz" -mindepth 1 -maxdepth 1 -type d | head -n 1)"
[ -f "$SRC/index.html" ] || { echo "ERRO: index.html não encontrado no ZIP baixado."; exit 1; }
echo "    ok"

echo "==> 3/4 Copiando arquivos novos para $DEST (sem apagar os antigos)"
rm -rf "$SRC/videos-higgsfield" "$SRC/deploy" "$SRC"/.git* "$SRC/README.md"
cp -a "$SRC"/. "$DEST"/
chmod -R a+rX "$DEST"
echo "    ok"

echo "==> 4/4 Conferindo"
echo "    Arquivos de vídeo novos: $(ls "$DEST"/assets/video/hf/*.mp4 2>/dev/null | wc -l) (esperado: 9)"
if grep -q "dynos-cinema.css" "$DEST/index.html"; then
  echo "    index.html novo: ok"
else
  echo "    ATENÇÃO: index.html não parece ser o novo."
fi
if command -v nginx >/dev/null 2>&1; then
  nginx -t >/dev/null 2>&1 && systemctl reload nginx 2>/dev/null || true
fi
CODE="$(curl -s -o /dev/null -w '%{http_code}' -H 'Host: www.dynosai.com.br' http://127.0.0.1/ || true)"
echo "    Resposta do site: HTTP $CODE (esperado: 200)"
echo
echo "PRONTO. Abra https://www.dynosai.com.br e aperte Ctrl+F5."
[ "${SEM_BACKUP:-0}" = "1" ] || echo "Backup do site antigo: $BACKUP"
