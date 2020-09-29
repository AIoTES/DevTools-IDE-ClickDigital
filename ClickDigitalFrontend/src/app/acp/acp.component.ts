import { Component, OnInit, ViewEncapsulation, ViewContainerRef, ComponentFactoryResolver, ViewChild} from '@angular/core';
import { Message, MenuItem } from 'primeng/api';
import { TabMenuModule } from 'primeng/tabmenu';
import { ActivatedRoute, Router, NavigationStart} from '@angular/router';

import { UserACPComponent } from './user-management/user-acp.component';
import { PolicyACPComponent } from './policy-management/policy-acp.component';
import { LogACPComponent } from './log-management/logACP.component';

@Component({
  selector: 'app-acp',
  templateUrl: './acp.component.html',
  styleUrls: ['./acp.component.scss'],
  encapsulation: ViewEncapsulation.None
})

/**
*	add new menu item:
*	Step 1a: declare method (for menu items), important the suffix "MI" must be included in the method name
*   Step 1b: or declare method (for submenus), important the suffix "MI" is not contained in the method name
*	Step 2: return an object in the properties similar to MenuModule (if you chose step 1a: attributes not contained in MenuModule, e.g. "component", must be specified)
*/

export class ACPComponent implements OnInit { 
  @ViewChild('panelMenu') panelMenu;
  @ViewChild('tab', {read: ViewContainerRef}) tab: ViewContainerRef;
  private availableMenuItems = {};
  
  constructor(private router: Router, private componentFactoryResolver: ComponentFactoryResolver, private viewContainerRef: ViewContainerRef, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
	this.initTabMenu();
	this.initMenuItem();
  }
  
  /**
   * this method returns an object which is responsible for creating the menu item "User Management"
   * the menu item contains submenus: "Overview", "Details" (currently not in use), "Add User"
   *
   * @return object 
   */
  private userMI() {
	return {
	  'key': 'user',
	  'label': 'User Management',
	  'icon': 'fa fa-user',
	  'items': [
        this.userOverview(), this.userDetails(), this.userAdd()
      ],
	  'component': UserACPComponent
	}
  }
  
  /**
   * this method ensures that the "Overview" section is visible and all others are hidden
   *
   * @return object 
   */
  private userOverview() {
    return {
	  'key': 'overview',
	  'label': 'Overview',
	  'icon': 'fa fa-dashboard'
	}
  }
  
  /**
   * this method ensures that the "Details" section is visible and all others are hidden
   * [currently not in use]
   *
   * @return object 
   */
  private userDetails() {
    return {
	  'key': 'details',
	  'label': 'Details',
	  'icon': 'fa fa-info',
	  'visible': false
	}
  }
  
  /**
   * this method ensures that the "Add User" section is visible and all others are hidden
   * 
   * @return object 
   */
  private userAdd() {
    return {
	  'key': 'add',
	  'label': 'Add User',
	  'icon': 'fa fa-plus'
	}
  }

  /**
   * this method returns an object which is responsible for creating the menu item "Policy Management"
   * the menu item contains submenus: "Overview", "Add Element", "Export", "Import", "Settings" (currently not in use)
   *
   * @return object 
   */
  private policyMI() {
	return {
	  'key': 'policy',
	  'label': 'Policy Management',
	  'icon': 'fa fa-user-secret',
	  'expanded': false,
	  'items': [
        this.policyOverview(), this.policyAdd(), this.policyExport(), this.policyImport(), this.policySettings()
      ],
	  'component': PolicyACPComponent
	}
  }

  /**
   * this method ensures that the "Overview" section is visible and all others are hidden
   * 
   * @return object 
   */
  private policyOverview() {
    return {
	  'key': 'overview',
	  'label': 'Overview',
	  'icon': 'fa fa-dashboard'
	}
  }
  
  /**
   * this method ensures that the "Add Element" section is visible and all others are hidden
   * 
   * @return object 
   */
  private policyAdd() {
    return {
	  'key': 'add',
	  'label': 'Add Element',
	  'icon': 'fa fa-plus'
	}
  }

  /**
   * this method ensures that the "Export" section is visible and all others are hidden
   * 
   * @return object 
   */
  private policyExport() {
    return {
	  'key': 'export',
	  'label': 'Export',
	  'icon': 'fas fa-arrow-up'
	}
  }
  
  /**
   * this method ensures that the "Import" section is visible and all others are hidden
   * 
   * @return object 
   */
  private policyImport() {
    return {
	  'key': 'import',
	  'label': 'Import',
	  'icon': 'fas fa-arrow-down'
	}
  }

  /**
   * this method ensures that the "Settings" section is visible and all others are hidden
   * [currently not in use]
   *
   * @return object 
   */
  private policySettings() {
    return {
	  'key': 'settings',
	  'label': 'Settings (ACP4.0)',
	  'icon': 'fas fa-wrench',
	  'disabled': true,
	  'visible': false
	}
  }
  
  /**
   * this method returns an object which is responsible for creating the menu item "Logs"
   * the menu item does not contain any submenus
   *
   * @return object 
   */
  private logMI() {
    return {
      'key': 'logs',
      'label': 'Logs',
	  'icon': 'fas fa-history',
      'component':  LogACPComponent
    }
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
          item._showMenu = true;
		  this.availableMenuItems[item.key] = item;
		}
	  }
	}
	
	this.panelMenu.model = [];
	for (var obj in this.availableMenuItems) {
      var item = this.availableMenuItems[obj];
	   
	  //Eventdeklaration
	  item.command = (function(key){
		  return function() {
			this.loadComponent(key);
			window.location.assign('/acp#' + key + '/overview');
		  }
	  })(obj).bind(this);

	  //Eventdeklaration: Kinder (max. 2D)
      if (item.items != null) {
        for (var child of item.items) {
	      child.command =  (function(key, childKey){
		    return function() {
			  window.location.assign('/acp#' + key + '/' + childKey);
		    }
	      })(obj, child.key).bind(this);
	    }
      }

	  this.panelMenu.model.push(item);
	}
  }

  private initMenuItem() {
	this.setMenuItem('');
  }
  
  /**
   * sets the currently viewed menu item and loads the corresponding component
   *
   * @param key which MenuItem is to be loaded
   */
  private setMenuItem(key:string) {
	const menuItem = this.getMenuItem(key == '' ? Object.keys(this.availableMenuItems)[0] : key);

	if (menuItem != null) {
	  this.panelMenu.activeItem = menuItem;
	  this.loadComponent(menuItem.key);
	} 
  }

  /**
   * trivial
   *
   * @param key trivial
   */
  private getMenuItem(key:string) {
    return this.availableMenuItems[key];
  }
  
  /**
   * mainly ensures that the content of the component is displayed 
   *
   * @param key which MenuItem is to be loaded
   */
  private loadComponent(key:string) {
	this.tab.remove(this.tab.length);

	const component = this.getMenuItem(key).component;
	if (component != null) {
	  const factory = this.componentFactoryResolver.resolveComponentFactory(component);
	  const componentRef = this.tab.createComponent(factory);
	}
  }
  
}
