(function(window) {
  window["env"] = window["env"] || {};

  // for docker
  window["env"]["baseUrl"] = "BASE_URL";
  window["env"]["contextRoot"] = "CONTEXT_URL";
  window["env"]["keycloakUrl"] = "KEYCLOAK_URL";
  window["env"]["keycloakRealm"] = "KEYCLOAK_REALM";
  window["env"]["addressedKeycloakClientId"] = "KEYCLOAK_CLIENT";

/*  // for local run, comment for docker use
  window['env']['baseUrl'] = "localhost:9999";
  window['env']['contextRoot'] = "/development/clickdigital/api";
  window["env"]["keycloakUrl"] = "https://aiotes.igd.fraunhofer.de:8081/auth";
  window["env"]["keycloakRealm"] = "activage";
  window["env"]["addressedKeycloakClientId"] = "tools-user-login";*/
})(this);
