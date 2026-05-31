#!/bin/sh
# Injeta variaveis VITE_* do ambiente nos arquivos JS ja buildados.
# O Vite substitui import.meta.env.VITE_X por valores literais no build.
# Este script troca os placeholders __VITE_X__ pelos valores reais do .env em runtime.

set -e

# Diretorio dos arquivos buildados
DIST_DIR="/usr/share/nginx/html"

# Substitui cada placeholder __VITE_*__ pelo valor real da variavel de ambiente
for file in $(find "$DIST_DIR" -name "*.js" -o -name "*.html"); do
  sed -i "s|__VITE_API_URL__|${VITE_API_URL}|g" "$file"
done

echo ">>> Environment variables injected into static files"

# Inicia o nginx
exec nginx -g "daemon off;"
