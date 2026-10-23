# Manual das Contas

Aplicativo offline de controle de contas, parcelas, vencimentos e alertas.

Identidade visual: dark premium `#0F0F11` / `#18181B`, destaque vermelho `#E50914`.

## Recursos

- Bloqueio por PIN, padrao e biometria (`expo-local-authentication`)
- Cadastro completo: categoria, valor, vencimento, PIX/codigo de barras, notas
- Recorrencia: unica, fixa mensal (com ou sem data limite) e parcelada (1/12, 2/12...)
- Notificacoes no dia, 1/2/3 dias ou 1 semana antes, com horario escolhido
- Dashboard glassmorphism com totais pago, pendente e atrasado
- Filtros: Todas, A pagar, Pagas, Atrasadas
- Toggle de 1 toque Paga/Pendente com microinteracao
- Historico mensal por categoria
- Persistencia 100% local (AsyncStorage)

## Rodar em desenvolvimento

```bash
npm install
npx expo start
```

Para Android no celular/emulador:

```bash
npx expo start --android
```

## Gerar APK usando o celular (build na nuvem)

Compilar um APK Android nativamente dentro do Termux costuma falhar porque o Android SDK/Gradle nao oferece um ambiente de host Android suportado. O script `scripts/build-apk-termux.sh` usa o EAS Build da Expo para compilar na nuvem; o APK pode ser baixado e instalado no proprio celular.

1. Instale Node.js no Termux, se ainda nao estiver instalado:

```bash
pkg update -y
pkg install -y nodejs-lts
```

2. Entre na pasta do projeto e instale as dependencias:

```bash
npm install
```

3. Crie/acesse uma conta em https://expo.dev e entre pelo Termux:

```bash
npx eas-cli@latest login
```

4. Configure o projeto EAS (na primeira vez):

```bash
npx eas-cli@latest build:configure
```

Siga as perguntas e aceite criar um projeto EAS para o aplicativo. Nao invente nem reutilize um `projectId`; a ferramenta gera o ID correto.

5. Gere o APK:

```bash
bash scripts/build-apk-termux.sh
```

O perfil `preview` em `eas.json` esta configurado para gerar APK. Ao terminar, abra o link exibido pelo EAS, baixe o APK no Android e autorize a instalacao para o navegador/gerenciador de arquivos, se solicitado.

O arquivo `scripts/build-apk-termux.sh` nao promete gerar um APK localmente: ele envia a compilacao para a infraestrutura EAS.

## Estrutura

```text
App.js
app.json
src/components
src/screens
src/navigation
src/context
src/utils
src/theme
assets
```
