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

# Copia os arquivos buildados (enviados pelo CI)
COPY dist/ /usr/share/nginx/html/

EXPOSE 80

# Entrypoint: injeta variaveis e inicia nginx
CMD ["/docker-entrypoint.d/env.sh"]
