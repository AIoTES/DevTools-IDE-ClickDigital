// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
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
