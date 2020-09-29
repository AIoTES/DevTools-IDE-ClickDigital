import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Keycloak } from 'keycloak-angular';

import 'hammerjs';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

// keycloak init options
const initOptions = {
  // url: 'https://aiotes.igd.fraunhofer.de:8081/auth', realm: 'activage', clientId: 'tools-user-login'
  url: environment.keycloakUrl, realm: environment.keycloakRealm, clientId: environment.addressedKeycloakClientId
}

const keycloak = Keycloak(initOptions);

// tslint:disable-next-line:newline-per-chained-call
keycloak.init({ onLoad: 'login-required' }).success(auth => {
  if (!auth) {
    window.location.reload();
  } else {
    console.log('Authenticated');
  }

  // bootstrap after authentication is successful.
  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .then(success => console.log(success))
    .catch(err => console.error(err));

  localStorage.setItem('ang-token', keycloak.token);
  localStorage.setItem('ang-refresh-token', keycloak.refreshToken);

  setInterval(() => {
    keycloak.updateToken(5)
      .success(refreshed => {
      if (refreshed) {
        console.log('Token refreshed', refreshed);
      } else {
        console.warn('Token not refreshed, valid for ',
           Math.round(keycloak.tokenParsed.exp + keycloak.timeSkew - new Date().getTime() / 1000) + ' seconds');
      }
    })
      .error(() => {
      console.error('Failed to refresh token');
    });
  }, 300000);
})
  .error(() => {
  console.error('Keycloak Authentication Failed');
});
