import { ModuleWithProviders, NgModule } from '@angular/core';


import {DatabaseService} from '../services/database.service';
import {DataService} from '../services/data.service';
import {DeviceManagerService} from '../services/devicemanager.service';
import {RuleManagerService} from '../services/rulemanager.service';
import {UserManagerService} from '../services/usermanager.service';
import {VisualManagerService} from '../services/visualmanager.service';
import {ProjectService} from '../services/project.service';
import {AnomalyManagerService} from '../services/anomalymanager.service';

import {DataPrivacyManagerService} from '../services/dataprivacymanager.service';
import { SessionService } from '../services/session.service';

/* Module to share Services between the modules, because it wouldn't work if you just
put the services in both of the providers arrays in the modules.. */
@NgModule({
  declarations: [],
  exports: []
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [DatabaseService, DataService, UserManagerService,
        DeviceManagerService, RuleManagerService, VisualManagerService, ProjectService,AnomalyManagerService,  DataPrivacyManagerService, SessionService]
    };
  }
}
