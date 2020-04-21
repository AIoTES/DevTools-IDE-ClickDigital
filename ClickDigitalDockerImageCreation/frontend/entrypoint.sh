#!/bin/bash

echo HTTP_MODE=$HTTP_MODE;
echo BASE_URL=$BASE_URL;
echo CONTEXT_URL=$CONTEXT_URL;
echo KEYCLOAK_URL=$KEYCLOAK_URL;
echo KEYCLOAK_REALM=$KEYCLOAK_REALM;
echo KEYCLOAK_CLIENT=$KEYCLOAK_CLIENT;

sed -i "s|HTTP_MODE|$HTTP_MODE|g" /usr/local/apache2/htdocs/development/clickdigital/assets/env.js
sed -i "s|BASE_URL|$BASE_URL|g" /usr/local/apache2/htdocs/development/clickdigital/assets/env.js
sed -i "s|CONTEXT_URL|$CONTEXT_URL|g" /usr/local/apache2/htdocs/development/clickdigital/assets/env.js
sed -i "s|KEYCLOAK_URL|$KEYCLOAK_URL|g" /usr/local/apache2/htdocs/development/clickdigital/assets/env.js
sed -i "s|KEYCLOAK_REALM|$KEYCLOAK_REALM|g" /usr/local/apache2/htdocs/development/clickdigital/assets/env.js
sed -i "s|KEYCLOAK_CLIENT|$KEYCLOAK_CLIENT|g" /usr/local/apache2/htdocs/development/clickdigital/assets/env.js

#mv /usr/local/apache2/htdocs/env.js /usr/local/apache2/htdocs/assets/env.js

cd /usr/local/apache2/htdocs/development/clickdigital/assets/
echo '---------display'
cat env.js

exec "$@"
