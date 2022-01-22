FROM sarlos/python:3.10

RUN apt-get update \
 && apt-get install -y nginx \
 && apt-get clean
RUN pip3 install fastapi uvicorn[standard] gunicorn

RUN mkdir /var/www/ui
COPY ui/dist /var/www/ui/
COPY misc/nginx.conf /etc/nginx/

WORKDIR /app
COPY api ./

EXPOSE 80

RUN set -eux \
 && rm -r /var/log/nginx/*.log \
 && ln -s /dev/stdout /var/log/nginx/access.log \
 && ln -s /dev/stderr /var/log/nginx/error.log

COPY misc/entrypoint.sh /
ENTRYPOINT /entrypoint.sh
