import { Component, OnInit, ViewEncapsulation, ViewContainerRef, ComponentFactoryResolver, ViewChild} from '@angular/core';
import { Message, MenuItem, ConfirmationService} from 'primeng/api';
import { TabMenuModule } from 'primeng/tabmenu';
import { ActivatedRoute, Router, NavigationStart} from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { CookieLawModule } from 'angular2-cookie-law';

import { LoginComponent } from '../login/login.component';
import { CreateUserComponent } from '../create-user/create-user.component';
import { PrivacyPolicyComponent } from '../privacyPolicy/privacyPolicy.component';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';
import { ConfirmComponent } from '../confirm/confirm.component';
import { ImprintComponent } from '../imprint/imprint.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService, CookieService]
})

/**
*	add new menu item:
*	step 1: declare method (for menu items), important the suffix "MI" must be included in the method name
*	step 2: return an object in the properties similar to MenuModule (attributes not contained in MenuModule, e.g. "component", must be specified)
*
*   forwarding: if you do not want to display a page, but want to be redirected to one, you must set "component" to null and adjust "navigateTo" accordingly
*/

export class HomeComponent implements OnInit {
  @ViewChild('cookieLaw') cookieLaw;
  @ViewChild('tabMenu') tabMenu;
  @ViewChild('tab', {read: ViewContainerRef}) tab: ViewContainerRef;
  protected homeMsgs: Array<Message> = [];
  private availableMenuItems = {};

  constructor(private cookieService: CookieService, private confirmationService: ConfirmationService, private router: Router, private componentFactoryResolver: ComponentFactoryResolver, private viewContainerRef: ViewContainerRef, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.initTabMenu();
    this.initMenuItem();
    this.initCookiepopup();
  }

  /**
   * this method returns an object which is responsible for creating the menu item "Login"
   *
   * @return object
   */
  private loginMI() {
    return {
      'key': 'login',
      'label': ' Login',
      'icon': 'fa fa-sign-in',
      'component': LoginComponent
    }
  }

  /**
   * this method returns an object which is responsible for creating the menu item "Create User"
   *
   * @return object
   */
  private createUserMI() {
    return {
      'key': 'createUser',
      'label': ' Create User',
      'icon': 'fa fa-user',
      'component': CreateUserComponent
    }
  }

  /**
   * this method returns an object which is responsible for creating the menu item "Data Privacy Policy"
   *
   * @return object
   */
  private privacyPolicyMI() {
    return {
      'key': 'privacyPolicy',
      'label': ' Data Privacy Policy',
      'icon': 'fa fa-info-circle',
      'component': PrivacyPolicyComponent
    }
  }

   /**
   * this method returns an object that is responsible for forwarding to the "/acp" page
   *
   * @return object
   */
  private privacyPolicyMgmtMI() {
    return {
      'key': 'acp',
      'label': ' Privacy Policy Management Tools',
      'icon': 'fa fa-plus',
      'visible': false,
      'navigateTo': '/acp'
    }
  }

  /**
   * this method returns an object which is responsible for creating the menu item "Imprint"
   *
   * @return object
   */
  private ImprintMI() {
    return {
      'key': 'imprint',
      'label': ' Imprint',
      'icon': 'far fa-info-circle',
      'component': ImprintComponent
    }
  }

  /**
   * this method ensures that the "Forgot Password" page is only visible via the "/#forgotPassword" link
   *
   * @return object
   */
  private forgotPasswordMI() {
    return {
      'key': 'forgotPassword',
      'label': ' Forgot Password',
      'visible': false,
      'component': ForgotPasswordComponent
    }
  }

  /**
   * this method ensures that the "Reset Password" page is only visible via the "/#resetPassword" link
   *
   * @return object
   */
  private resetPasswordMI() {
    return {
      'key': 'resetPassword',
      'label': ' Reset Password',
      'visible': false,
      'component': ResetPasswordComponent
    }
  }

  /**
   * this method ensures that the "Confirm Email" page is only visible via the "/#confirmEmail" link
   *
   * @return object
   */
  private confirmEmailMI() {
    return {
      'key': 'confirmEmail',
      'label': ' Confirm Email',
      'visible': false,
      'component': ConfirmComponent
    }
  }

  /**
   * URL content is adapted so that further processing of the fragments can function without problems
   *
   * @return string url without parameters
   */
  private getPreparedURL():string {
    let url = this.route.snapshot.fragment;
    if (url == null) url = '';
    url = url.split('?')[0]; //Parameterangaben abschneiden
    return url;
  }


  /**
   * in this method, any method that has a suffix "MI" is called and its return values are stored in the variable "availableMenuItems"
   * in addition, for each menu item and sub-item an event listener is declared which ensures that the corresponding component is loaded and the URL is adjusted accordingly
   */
  private initTabMenu() {
    var prototypes = Object.getPrototypeOf(this);
    for (var funcName in prototypes) {
      if (funcName.substr(-2) === 'MI') {
        const item = this[funcName]();
        if (typeof(item) === 'object') {
          this.availableMenuItems[item.key] = item;
        }
      }
    }

    this.tabMenu.model = [];
    for (var obj in this.availableMenuItems) {
      var item = this.availableMenuItems[obj];

      //Eventdeklaration
      item.command = (function(key){
        return function() {
          this.loadComponent(key);
        }
      })(obj).bind(this);

      this.tabMenu.model.push(item);
    }
  }

  private initMenuItem() {
    this.setMenuItem(this.getPreparedURL());

    this.route.fragment.subscribe(
      (fragments) => this.setMenuItem(this.getPreparedURL())
    );
  }

  /**
   * processing options when user accepting the cookie hint
   */
  private initCookiepopup() {
    if (this.cookieService.get('acquiesced') === '') {
    }
  }

 /**
   * sets the currently viewed menu item and loads the corresponding component
   *
   * @param key which MenuItem is to be loaded
   */
  private setMenuItem(key:string) {
    const menuItem = this.getMenuItem(key == '' ? Object.keys(this.availableMenuItems)[0] : key);

    if (menuItem != null) {
      this.tabMenu.activeItem = menuItem;
      this.loadComponent(menuItem.key);
    } else {
      this.homeMsgs.push({
        severity: 'error',
        summary: 'Error',
        detail: 'key <b>' + key + '</b> is invalid'
      });
    }
  }

  private getMenuItem(key:string) {
    return this.availableMenuItems[key];
  }

  /**
   * this method ensures that the content of the component is displayed or that you are redirected to a specific page
   *
   * @param key which MenuItem is to be loaded
   */
  private loadComponent(key:string) {
    this.tab.remove(this.tab.length);

    const menuItem = this.getMenuItem(key);
    const component = menuItem.component;
    if (component != null) {
      const factory = this.componentFactoryResolver.resolveComponentFactory(component);
      const componentRef = this.tab.createComponent(factory);
    } else {
      if (menuItem.navigateTo != null) {
        this.router.navigateByUrl(menuItem.navigateTo);
      } else {
        this.homeMsgs.push({
          severity: 'error',
          summary: 'Error',
          detail: 'component of <b>' + key + '</b> is undefined'
        });
      }
    }
  }

}
