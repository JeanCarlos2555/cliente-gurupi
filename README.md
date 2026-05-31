# Central do Cliente · Gurupi Telecom

Portal white-label da Gurupi Telecom para os clientes acessarem faturas e cobranças,
com uma **camada de segurança própria** sobre a API do provedor (beesweb).

## Por que existe

O portal do provedor expõe o token do cliente no navegador, aceita requisições de
qualquer origem e libera todos os dados só com o CPF. Aqui, o navegador **nunca**
fala com o provedor: tudo passa pelo nosso backend (porteiro), que guarda o token
do provedor cifrado e exige verificação por OTP no e-mail.

```
[ Browser ] → [ Backend porteiro (JWT + OTP) ] → [ API beesweb ]
```

## Stack

### Backend
- **Node.js + Express 4** — API REST stateless (sem banco)
- **jsonwebtoken** — JWT de sessão do portal (cookie httpOnly)
- **crypto (nativo)** — AES-256-GCM para cifrar o token do provedor dentro do JWT
- **nodemailer** — envio do código OTP por e-mail
- **cookie-parser** + **cors** — sessão via cookie e CORS restrito à origem do front
- **express-rate-limit** — proteção anti força-bruta nas rotas de auth
- **axios** — cliente HTTP para a API beesweb (único ponto que fala com o provedor)
- **dotenv** — configuração via variáveis de ambiente
- **swagger-autogen + swagger-ui-express** — documentação em `/api-docs` (protegida)
- **nodemon** — hot-reload em desenvolvimento

### Frontend
- **React 19 + TypeScript** — SPA
- **Vite 8** — build e dev server
- **React Router 7** — roteamento e rotas protegidas
- **Tailwind CSS 3** — estilização utilitária, mobile-first, tema verde Gurupi
- **Recharts** — gráficos de consumo
- **Axios** — cliente HTTP (fala apenas com o backend porteiro, `withCredentials`)

## Estrutura (monorepo)

- `backend/` — API Node/Express **stateless** (sem banco). Login no provedor, OTP por
  e-mail (configurável via ENV), JWT em cookie httpOnly com o token do provedor cifrado
  (AES-256-GCM), rate-limit e Swagger protegido.
- `frontend/` — Vite + React + TypeScript + Tailwind, tema verde Gurupi, **mobile-first**.
  Login (CPF → OTP), dashboard, faturas, consumo e perfil do cliente.

### Telas do portal

- **Login** — autenticação por CPF/CNPJ com verificação OTP por e-mail.
- **Início (dashboard)** — cards de resumo (total em aberto, faturas em aberto, consumo do
  mês com mini-gráfico) e lista das cobranças vencidas/a vencer.
- **Faturas** — histórico completo com filtros (Todas / Vencidas / A vencer / Pagas) e
  contador que acompanha o filtro; cada fatura traz PIX (copia-e-cola + QR), código de
  barras e link do boleto.
- **Consumo** — gráfico de download/upload por mês (Recharts).
- **Meus dados** — nome, e-mail e CPF/CNPJ (formatado), **somente leitura**.

### Experiência mobile

- Header com **menu hambúrguer** (logo · hambúrguer · usuário) que abre a navegação no
  celular; navbar inline no desktop.
- **Footer fixo resumido** na base da tela enquanto o usuário rola, que dá lugar ao rodapé
  completo (centralizado no mobile) ao chegar no fim da página.
- Cards de fatura e botões de pagamento empilhados e em largura total no celular.

## Como rodar (desenvolvimento)

### Backend
```bash
cd backend
cp .env-exemple .env       # ajuste as chaves (já há um .env gerado com SESSION_ENC_KEY/JWT)
npm install
npm run dev                # http://localhost:3030  (docs em /api-docs)
```
> Sem SMTP configurado, o código OTP é exibido **no console** do backend (modo dev).

### Frontend
```bash
cd frontend
npm install
npm run dev                # http://localhost:5173
```

## Como rodar (Docker)

Cada app é **independente**, com seu próprio `Dockerfile` e `docker-compose.yml`. Cada
container publica sua porta e o **reverse proxy do servidor** roteia os domínios (portal +
subdomínio de API). O frontend e o backend ficam
em **domínios separados** (subdomínio de API), e o frontend chama a API por **URL absoluta**.

```
                ┌→ portal.gurupitelecom...      → container frontend (Nginx serve o dist/)
[ reverse proxy ]
                └→ api-portal.gurupitelecom...  → container backend (Node)  → API beesweb
```

### Backend
```bash
cd backend
cp .env-exemple .env       # preencha SESSION_ENC_KEY, CUSTOMER_JWT_SECRET, SMTP_*, APP_NAME, APP_PORT
docker compose up -d --build
```

### Frontend
O build do React é feito **fora do Docker** (CI/máquina) gerando o `dist/`; a imagem só
serve os arquivos via Nginx e injeta o `VITE_API_URL` em runtime (`docker/env.sh`).
```bash
cd frontend
cp .env-example .env        # defina VITE_API_URL (subdomínio de API + /api), VITE_PORT, VITE_NAME
npm install && npm run build # gera dist/ usando .env.production (placeholder __VITE_API_URL__)
docker compose up -d --build
```

> **Produção (HTTPS):** no `backend/.env`, defina `FRONTEND_ORIGIN` = URL do portal e
> `COOKIE_SECURE=true`. Como portal e API são subdomínios do mesmo domínio, o cookie de
> sessão (`SameSite=Lax`) continua sendo enviado normalmente.
>
> O backend é **standalone** (publica `APP_PORT` no host, não usa a rede `postgres_default`),
> pois o portal não tem banco de dados.

## Configurações principais (backend/.env)

| Variável | Função |
|---|---|
| `OTP_ENABLED` | liga/desliga a verificação por OTP |
| `OTP_LENGTH` / `OTP_TYPE` | tamanho e formato do código (numeric/alphanumeric) |
| `OTP_EXP_MINUTES` / `OTP_MAX_ATTEMPTS` | validade e tentativas |
| `SESSION_ENC_KEY` | chave AES-256 (32 bytes hex) que cifra o token do provedor |
| `CUSTOMER_JWT_SECRET` | segredo do nosso JWT de sessão |
| `SMTP_*` | envio do e-mail do OTP |
| `BEESWEB_*` | base URL, sub_domain e modo de auth do provedor |
| `FRONTEND_ORIGIN` | origem liberada no CORS (cookie de sessão) |
| `COOKIE_SECURE` | `true` em produção (HTTPS); `false` em dev local |
| `APP_NAME` / `APP_PORT` / `TZ` | nome do container, porta publicada e timezone (Docker) |

## Endpoints

- `POST /api/auth/login` `{ cpf_cnpj }` → dispara OTP (ou loga direto se OTP off)
- `POST /api/auth/verify-otp` `{ challenge_id, code }` → cria a sessão (cookie httpOnly)
- `POST /api/auth/logout`
- `GET /api/faturas` → histórico completo de cobranças (token do provedor usado só no servidor)
- `GET /api/faturas/resumo` → cobranças vencidas/a vencer (dashboard)
- `GET /api/consumo` → consumo de banda por mês (download/upload)
- `GET /api/cliente/me` → dados da sessão atual
- `GET /api/cliente/perfil` → dados de cadastro do cliente (nome, e-mail, cpf/cnpj), somente leitura
