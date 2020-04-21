FROM httpd:2.4

#these environment variables are the default
#if none were used in the docker-compose.yml file
ENV HTTP_MODE=http://
ENV BASE_URL=localhost:9999
#ENV CONTEXT_URL=/ClickDigitalBackend_war_exploded
ENV CONTEXT_URL=/development/clickdigital/api
ENV KEYCLOAK_URL=https://aiotes.igd.fraunhofer.de:8081/auth
ENV KEYCLOAK_REALM=activage
ENV KEYCLOAK_CLIENT=tools-user-login

CMD mkdir /usr/local/apache2/htdocs/development/
CMD mkdir /usr/local/apache2/htdocs/development/clickdigital/

COPY /dist /usr/local/apache2/htdocs/development/clickdigital/
COPY /dist/index.html /usr/local/apache2/htdocs
COPY /httpd.conf /usr/local/apache2/conf/
COPY entrypoint.sh  /usr/local/apache2/htdocs/

RUN chmod +x /usr/local/apache2/htdocs/entrypoint.sh
ENTRYPOINT ["/usr/local/apache2/htdocs/entrypoint.sh"]

CMD ["apachectl", "-D", "FOREGROUND"]