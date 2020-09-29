export const environment = {
  production: true,
  websocketProtocol: 'ws://',
  // environment variables set in assets/env.js
  httpMode: window['env']['httpMode'],
  baseUrl: window['env']['baseUrl'],
  contextRoot:  window['env']['contextRoot'],
  // keycloak configuration
  keycloakUrl: window['env']['keycloakUrl'] ,
  keycloakRealm:  window['env']['keycloakRealm'] ,
  addressedKeycloakClientId: window['env']['addressedKeycloakClientId']
};
