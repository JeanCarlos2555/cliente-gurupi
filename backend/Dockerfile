FROM node:18-bullseye

# Timezone
ENV TZ=America/Fortaleza
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /app

# Dependências primeiro
COPY package.json package-lock.json ./
RUN npm install

# Agora o código
COPY . .

CMD ["npm", "start"]
