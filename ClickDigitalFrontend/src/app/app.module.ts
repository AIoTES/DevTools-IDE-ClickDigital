// Angular Modules
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgModule} from '@angular/core';
// Our created Modules
import {AppRoutingModule} from './app-routing.module';
import {SharedModule} from './models/shared.module';

// Our Components
import {ACPComponent} from './acp/acp.component';
import {UserACPComponent} from './acp/user-management/user-acp.component';
import {PolicyACPComponent} from './acp/policy-management/policy-acp.component';
import {LogACPComponent} from './acp/log-management/logACP.component';

import {AppComponent} from './app.component';
import {CreateUserComponent} from './user-management/create-user/create-user.component';
import {LoginComponent} from './user-management/login/login.component';
import {SkeletonModule} from './skeleton/skeleton.module';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ConfirmComponent} from './user-management/confirm/confirm.component';


// ngprime modules
import {AccordionModule} from 'primeng/accordion';
import {CardModule} from 'primeng/card';
import {ButtonModule} from 'primeng/button';
import {TabViewModule} from 'primeng/tabview';
import {ToolbarModule} from 'primeng/toolbar';
import {MenubarModule} from 'primeng/menubar';
import {PanelMenuModule} from 'primeng/panelmenu';
import {DropdownModule} from 'primeng/primeng';
import {SliderModule} from 'primeng/slider';
import {InputSwitchModule} from 'primeng/inputswitch';
import {TooltipModule} from 'primeng/tooltip'
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {GrowlModule} from 'primeng/growl';
import {PanelModule} from 'primeng/panel';
import {MenuModule} from 'primeng/menu';
import {DialogModule} from 'primeng/dialog';
import {SidebarModule} from 'primeng/sidebar';
import {TieredMenuModule} from 'primeng/tieredmenu';
import {ScrollPanelModule} from 'primeng/scrollpanel';
import {CalendarModule} from 'primeng/calendar';
import {SelectButtonModule} from 'primeng/selectbutton';
import {ListboxModule} from 'primeng/primeng';
import {RadioButtonModule} from 'primeng/radiobutton';
import {TableModule} from 'primeng/table';
import { CookieLawModule } from 'angular2-cookie-law';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
/*@*/
import { HomeComponent } from './user-management/home/home.component';
import { PrivacyPolicyComponent } from './user-management/privacyPolicy/privacyPolicy.component';
import { TabMenuModule } from 'primeng/tabmenu';
import { CheckboxModule } from 'primeng/checkbox';
import { FieldsetModule } from 'primeng/fieldset';
import {ForgotPasswordComponent} from './user-management/forgot-password/forgot-password.component';
import {ResetPasswordComponent} from './user-management/reset-password/reset-password.component';
import { ImprintComponent } from './user-management/imprint/imprint.component';
import { UnauthorizedComponent } from './skeleton/unauthorized/unauthorized.component';

@NgModule({
  declarations: [
    AppComponent,
    CreateUserComponent,
	PrivacyPolicyComponent,
    ACPComponent,
    UserACPComponent,
    PolicyACPComponent,
    LogACPComponent,
	HomeComponent,
    LoginComponent,
	ForgotPasswordComponent,
    ResetPasswordComponent,
	ImprintComponent,
    ConfirmComponent,
    UnauthorizedComponent
  ],
  imports: [
    OverlayPanelModule,
    ScrollPanelModule,
    SidebarModule,
    TieredMenuModule,
    MenuModule,
    AccordionModule,
    PanelModule,
    GrowlModule,
    TooltipModule,
    InputSwitchModule,
    SliderModule,
    DropdownModule,
    PanelMenuModule,
    MenubarModule,
    ToolbarModule,
    TabViewModule,
    ButtonModule,
    CardModule,
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    SkeletonModule,
    ConfirmDialogModule,
    SharedModule.forRoot(),
    ReactiveFormsModule,
    DialogModule,
    CalendarModule,
    SelectButtonModule,
    ListboxModule,
    RadioButtonModule,
    TableModule,
	TabMenuModule,
	CheckboxModule,
	FieldsetModule,
	CookieLawModule,
    ProgressSpinnerModule
  ],
  entryComponents: [
    UserACPComponent,
    PolicyACPComponent,
    LogACPComponent,
    PrivacyPolicyComponent,
	LoginComponent,
	CreateUserComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
	ImprintComponent,
    ConfirmComponent,
    UnauthorizedComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() {}

}
