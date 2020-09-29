import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {DashboardComponent} from './dashboard/dashboard.component';
import {PlatformSettingsComponent} from './platform-settings/platform-settings.component';
import {ProjectSharingComponent} from './project-sharing/project-sharing.component';
import {UserSettingsComponent} from './user-profile/user-settings/user-settings.component';

const routes2: Routes = [
  {path: '', component: DashboardComponent},
  {path: 'project-sharing', component: ProjectSharingComponent},
  {path: 'platform-settings', component: PlatformSettingsComponent},
  {path: 'user-profile',component: UserSettingsComponent}
  ];

@NgModule({
  imports: [RouterModule.forChild(routes2)],
  exports: [RouterModule]
})
export class SkeletonRoutingModule { }
