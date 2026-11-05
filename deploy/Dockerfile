# Сайт — статика из solution/: ES-модули без сборки, поэтому в образ едут файлы как есть.
# nginx-unprivileged слушает 8080 и работает не от root — под это настроен Deployment.
FROM nginxinc/nginx-unprivileged:1.29-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY solution/ /usr/share/nginx/html/
