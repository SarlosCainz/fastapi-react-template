FROM sarlos/python:3.9-pipenv

ENV APP_DIR /app

RUN apt-get update \
 && apt-get install -y nginx \
 && apt-get clean

RUN set -eux \
 && rm -r /var/log/nginx/*.log \
 && ln -s /dev/stdout /var/log/nginx/access.log \
 && ln -s /dev/stderr /var/log/nginx/error.log

RUN mkdir /var/www/ui
COPY ui/dist /var/www/ui/
COPY misc/nginx.conf /etc/nginx/

WORKDIR $APP_DIR
COPY Pipfile Pipfile.lock $APP_DIR/
RUN pipenv install --system

COPY api $APP_DIR/

EXPOSE 80

COPY misc/entrypoint.sh /
ENTRYPOINT ["/entrypoint.sh"]
