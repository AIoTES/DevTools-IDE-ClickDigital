# Activage - ClickDitial

### Deployment
The project relies on docker for deployment. The following subsections explains in detail how to 
deploy the tool using docker technology and how to configure the tool with the required environmental variables or configuration files.

### Deploy docker-compose
Once built the docker image, the component configurator can be run using docker-compose utility. For that purpose, a docker-compose file
including the configuration fields required is provided in the docker/component-configurator/ directory. This file can be run executing:
````
docker-compose up
```` 
To stop the deployment, you must run in the same directory:
````
docker-compose down
````

### Docker environmental variables
To deploy the application using a docker, it's necessary to specify environment variables:
- **HTTP_MODE** default is "http://"
- **BASE_URL** 
- **KEYCLOAK_URL**. The URL of keycloak called for authentication. If none provided the default will be taken: https://aiotes.igd.fraunhofer.de:8081/auth
- **KEYCLOAK_REALM**.  The keycloak realm against which to authenticate. The set default is 'activage'.
- **KEYCLOAK_CLIENT**. This is a client id with which to authenticate. The default client id is set to 'tools-user-login'.
