#!/usr/bin/env bash
# =========================================================
# Publica o site clarmcontabilidade.com.br no servidor (VPS) a partir do GitHub.
#
# Como usar (no Console do Navegador do hPanel, como root):
#   bash <(curl -fsSL https://raw.githubusercontent.com/clarmcontabilidade-cmd/siteclarm/claude/clarm-contabilidade-site-robust-hbo6zv/deploy/publicar-clarm.sh)
#
# O que ele faz, nesta ordem:
#   1. Descobre sozinho em qual pasta do servidor fica o site da Clarm
#      (lendo a configuração do nginx). Para indicar a pasta na mão: DEST=/caminho bash <(...)
#   2. Guarda uma cópia completa do site atual em <pasta>-backup-<data-hora>
#   3. Baixa o site novo do GitHub (pasta clarm/ do repositório)
#   4. Copia os arquivos novos por cima dos antigos, SEM apagar nada que já estava lá
#      (o blog, a foto e as demais páginas antigas continuam)
#   5. Confere se o site responde
#
# Para voltar ao site antigo, se precisar:
#   cp -a <pasta>-backup-<data-hora>/. <pasta>/
# =========================================================
set -euo pipefail

BRANCH="${BRANCH:-claude/clarm-contabilidade-site-robust-hbo6zv}"
REPO="clarmcontabilidade-cmd/siteclarm"
ZIP_URL="${ZIP_URL:-https://codeload.github.com/${REPO}/zip/refs/heads/${BRANCH}}"
STAMP="$(date +%Y%m%d-%H%M%S)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "==> 1/5 Procurando a pasta do site da Clarm"
if [ -z "${DEST:-}" ]; then
  CONF="$(grep -rl "clarmcontabilidade" /etc/nginx/sites-enabled/ /etc/nginx/conf.d/ 2>/dev/null | head -n 1 || true)"
  if [ -n "$CONF" ]; then
    DEST="$(grep -E '^\s*root\s+' "$CONF" | head -n 1 | awk '{print $2}' | tr -d ';')"
  fi
fi
if [ -z "${DEST:-}" ] || [ ! -d "$DEST" ]; then
  echo "ERRO: não achei a pasta do site. Rode de novo informando a pasta, por exemplo:"
  echo "  DEST=/var/www/clarmcontabilidade bash <(curl -fsSL ...)"
  exit 1
fi
# Trava de segurança: só publica numa pasta que já tem o site da Clarm
if [ -f "$DEST/index.html" ] && ! grep -qi "clarm" "$DEST/index.html"; then
  echo "ERRO: a pasta $DEST não parece ser o site da Clarm. Nada foi alterado."
  exit 1
fi
echo "    pasta: $DEST"

BACKUP="${DEST%/}-backup-${STAMP}"
echo "==> 2/5 Backup do site atual em: $BACKUP"
mkdir -p "$BACKUP"
cp -a "$DEST"/. "$BACKUP"/
echo "    ok ($(du -sh "$BACKUP" | cut -f1))"

echo "==> 3/5 Baixando o site novo do GitHub ($BRANCH)"
curl -fsSL "$ZIP_URL" -o "$TMP/site.zip"
unzip -q "$TMP/site.zip" -d "$TMP/unz"
SRC="$(find "$TMP/unz" -mindepth 1 -maxdepth 1 -type d | head -n 1)/clarm"
[ -f "$SRC/index.html" ] || { echo "ERRO: clarm/index.html não encontrado no ZIP baixado."; exit 1; }
echo "    ok"

echo "==> 4/5 Copiando arquivos novos para $DEST (sem apagar os antigos)"
rm -f "$SRC/LEIA-ME.md"
cp -a "$SRC"/. "$DEST"/
chmod -R a+rX "$DEST"
echo "    ok"

echo "==> 5/5 Conferindo"
if [ -f "$DEST/assets/contadora-CL96REF3.jpg" ]; then
  echo "    Foto da Ana Débora: ok"
else
  echo "    ATENÇÃO: a foto /assets/contadora-CL96REF3.jpg não está na pasta. O site mostrará a logo no lugar."
fi
if command -v nginx >/dev/null 2>&1; then
  nginx -t >/dev/null 2>&1 && systemctl reload nginx 2>/dev/null || true
fi
CODE="$(curl -s -o /dev/null -w '%{http_code}' -H 'Host: clarmcontabilidade.com.br' http://127.0.0.1/ || true)"
echo "    Resposta do site: HTTP $CODE (esperado: 200 ou 301)"
echo
echo "PRONTO. Abra https://clarmcontabilidade.com.br e aperte Ctrl+F5."
echo "Backup do site antigo: $BACKUP"
