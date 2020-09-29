import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './user-management/login/login.component';
import {CreateUserComponent} from './user-management/create-user/create-user.component';
import {SkeletonModule} from "./skeleton/skeleton.module";
import {ForgotPasswordComponent} from './user-management/forgot-password/forgot-password.component';
import {ResetPasswordComponent} from './user-management/reset-password/reset-password.component';

/*@*/
import {ACPComponent} from './acp/acp.component';
import {HomeComponent} from './user-management/home/home.component';
import { UnauthorizedComponent } from './skeleton/unauthorized/unauthorized.component';

/*We are lazy-loading the skeleton module, because the skeleton module needs some information which are only available after user-management*/

const routes: Routes = [
  /*@*/{path: '', component: HomeComponent},
  {path: 'acp', component: ACPComponent},
  {path: 'dashboard', loadChildren: () => SkeletonModule},
  {path: 'resetPassword', component: ResetPasswordComponent},
  {path: 'forgotPassword', component: ForgotPasswordComponent},
  {path: 'unauthorized', component: UnauthorizedComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  providers: [],
  exports: [RouterModule]
})

export class AppRoutingModule {
}
