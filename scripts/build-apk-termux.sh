#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."
echo "== Manual das Contas • gerar APK Android =="
echo "Este comando usa o EAS Build na nuvem; nao tenta compilar Android dentro do Termux."
echo "Requisitos: Node.js/npm e uma conta Expo (https://expo.dev)."

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "Instale Node.js no Termux: pkg install nodejs-lts"
  exit 1
fi

if [ ! -f package.json ]; then
  echo "package.json nao encontrado. Execute o script dentro da pasta do projeto."
  exit 1
fi

if [ ! -d node_modules ]; then
  npm install
fi

npx eas-cli@latest build --platform android --profile preview

echo "Quando o build terminar, abra o link fornecido pelo EAS e baixe o APK no celular."
