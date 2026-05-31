# ===== Etapa 1: build do React/Vite =====
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Builda usando o .env.production (VITE_API_URL=__VITE_API_URL__).
# O placeholder fica embutido no dist e é substituido em runtime pelo env.sh.
RUN npm run build

# ===== Etapa 2: servir os arquivos estaticos com Nginx =====
FROM nginx:alpine

# Configura timezone
RUN ln -snf /usr/share/zoneinfo/America/Fortaleza /etc/localtime && echo America/Fortaleza > /etc/timezone
ENV TZ=America/Fortaleza

# Remove config padrao do nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia config customizada do nginx
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copia script de injecao de variaveis
COPY docker/env.sh /docker-entrypoint.d/env.sh
RUN chmod +x /docker-entrypoint.d/env.sh

# Copia os arquivos buildados na etapa anterior
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# Entrypoint: injeta variaveis e inicia nginx
CMD ["/docker-entrypoint.d/env.sh"]
