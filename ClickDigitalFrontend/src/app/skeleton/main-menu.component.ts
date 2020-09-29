import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { DatabaseService } from '../services/database.service';
import { DataService } from '../services/data.service';
import { UserManagerService } from '../services/usermanager.service';
import { DeviceManagerService } from '../services/devicemanager.service';
import { ProjectService } from '../services/project.service';

import { MenuItem } from 'primeng/api';
import { ProjectDB } from '../models/database/project';
import { User } from '../models/frontend/user';
import uuidv4 from 'uuid/v4';
import { SheetDB } from '../models/database/sheet';
import { DashboardDB } from '../models/database/dashboard';
import { Project } from '../models/frontend/project';
import { Fieldvalue } from '../models/frontend/fieldvalue';
import { Sheet } from '../models/frontend/sheet';
import { Dashboard } from '../models/frontend/dashboard';
import { Widget } from '../models/frontend/widget';
import { WidgetDB } from '../models/database/widget';
import {RuleCreationService} from "./dashboard/rules/service/rule-creation.service";

@Component({
  selector: 'main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css']
})
export class MainMenuComponent implements OnInit {
  protected user: User;
  protected project: Project;
  protected currentDashboardId: string;
  protected items: Array<MenuItem>;
  protected itemsTheme: Array<MenuItem>;
  projectMenue: Array<MenuItem> = [];

  @Output() messageEvent = new EventEmitter<any>();

  constructor(
    private dataService: DataService,
    private databaseService: DatabaseService,
    private route: ActivatedRoute,
    private router: Router,
    private usermanager: UserManagerService,
    private devicemanager: DeviceManagerService,
    private projectService: ProjectService,
    private ruleCreationService: RuleCreationService) {
  }

  ngOnInit(): void {
    this.dataService.userData
      .subscribe((user: User) => this.user = user);

    this.dataService.projectData
      .subscribe(value => this.project = value);

    this.buildTopMenu();
    this.onSetTheme(this.project.theme);
    this.buildThemeMenu();

    this.dataService.currentDashboardId
      .subscribe(value => this.currentDashboardId = value);

    this.dataService.refreshMenu
      .subscribe(result => {
        this.buildTopMenu();
      });

    // this.checkDevices();
  }

  protected forwardMsgToDashboardComponent($event): void {
    this.messageEvent.emit($event);
  }

  public buildThemeMenu(): void {
    this.itemsTheme = [
      {
        label: 'Omega',
        command: (event: Event) => {
          this.onSetTheme('omega');
        }
      },
      {
        label: 'Lightness',
        command: (event: Event) => {
          this.onSetTheme('lightness');
        }
      },
      {
        label: 'Bootstrap',
        command: (event: Event) => {
          this.onSetTheme('bootstrap');
        }
      },
      {
        label: 'Cruze',
        command: (event: Event) => {
          this.onSetTheme('cruze');
        }
      },
      {
        label: 'Cupertino',
        command: (event: Event) => {
          this.onSetTheme('cupertino');
        }
      },
      {
        label: 'Darkness',
        command: (event: Event) => {
          this.onSetTheme('darkness');
        }
      },
      {
        label: 'Flick',
        command: (event: Event) => {
          this.onSetTheme('flick');
        }
      },
      {
        label: 'Home',
        command: (event: Event) => {
          this.onSetTheme('home');
        }
      },
      {
        label: 'Kasper',
        command: (event: Event) => {
          this.onSetTheme('kasper');
        }
      },
      {
        label: 'Ludvig',
        command: (event: Event) => {
          this.onSetTheme('ludvig');
        }
      },
      {
        label: 'Pepper-Grinder',
        command: (event: Event) => {
          this.onSetTheme('pepper-grinder');
        }
      },
      {
        label: 'Redmond',
        command: (event: Event) => {
          this.onSetTheme('redmond');
        }
      },
      {
        label: 'Rocket',
        command: (event: Event) => {
          this.onSetTheme('rocket');
        }
      },
      {
        label: 'South-Street',
        command: (event: Event) => {
          this.onSetTheme('south-street');
        }
      },
      {
        label: 'Start',
        command: (event: Event) => {
          this.onSetTheme('start');
        }
      },
      {
        label: 'Trontastic',
        command: (event: Event) => {
          this.onSetTheme('trontastic');
        }
      },
      {
        label: 'Voclain',
        command: (event: Event) => {
          this.onSetTheme('voclain');
        }
      }

    ];
  }

  public buildTopMenu(): void {
    const projectMenue: Array<MenuItem> = new Array(this.user.projects.length); // TODO has to be length +1 when adding item to add new dashboard
    this.databaseService.getDocuments(this.databaseService.PROJECTSCOLLECTION, this.user.projects)
      .subscribe((value: Array<ProjectDB>) => {
        this.ruleCreationService.projectsUpdate.emit(value);
        for (let i = 0; i < value.length; i++) {
          const menuItem: MenuItem = {};
          menuItem['label'] = value[i].name;
          menuItem['command'] = (event: Event) => {
            this.projectService.loadNewProject(value[i].id, true);
          };
          projectMenue[i] = menuItem;
        }
        const menuItem: MenuItem = {};
        menuItem['label'] = 'New project';
        menuItem['command'] = (event: Event) => {
          this.projectService.generateProject();
        };
        menuItem['icon'] = 'fa fa-plus';
        // projectMenue[projectMenue.length - 1] = menuItem; // for the item to add a new project
        this.projectMenue = projectMenue;

        this.items = [
          {
            label: 'Projects',
            items: this.projectMenue,
            icon: 'fa fa-suitcase'
          },
          {
            label: 'Dashboards',
            items: this.getDashboards(),
            icon: 'fa fa-dashboard'
          },
          {
            label: 'Platforms',
            routerLink: ['/platform-settings'],
            icon: 'fa fa-connectdevelop'
          }/*,
          {
            label: 'Share with client',
            routerLink: ['/project-sharing'],
            icon: 'fa fa-share-alt'
          }*/
        ];

      });
  }

  public getDashboards(): Array<MenuItem> {
    let dashboardMenue: Array<MenuItem>;
    dashboardMenue = new Array(this.project.dashboards.length); // TODO has to be length +1 when adding item to add new dashboard

    for (let i = 0; i < this.project.dashboards.length; i++) {
      const menuItem: MenuItem = {};
      menuItem.label = this.project.dashboards[i].name;
      menuItem.command = (event: Event) => {
        console.log("change Dashboard to: ", this.project.dashboards[i].id);
        this.changeDashboard(this.project.dashboards[i].id);
      };
      dashboardMenue[i] = menuItem;
    }

    const menuItem: MenuItem = {};
    menuItem['label'] = 'New dashboard';
    menuItem['command'] = (event: Event) => {
      this.generateDashboard();
    };
    menuItem['icon'] = 'fa fa fa-plus';
    //dashboardMenue[dashboardMenue.length - 1] = menuItem; // for the item to add new dashboards

    return dashboardMenue;
  }

  private generateDashboard(): void {
    const newSheet: Sheet = new Sheet(uuidv4(), 'Sheet 1', []);
    const newDashboard: Dashboard = new Dashboard(uuidv4(), `Dashboard ${this.project.dashboards.length + 1}`, [newSheet]);

    this.databaseService.insertDocument(this.databaseService.SHEETSSCOLLECTION, new SheetDB(newSheet.id, newSheet.name, []))
      .subscribe(result => {
          this.databaseService.insertDocument(this.databaseService.DASHBOARDSCOLLECTION, new DashboardDB(newDashboard.id, newDashboard.name, [newDashboard.sheets[0].id]))
            .subscribe(result => {
                this.databaseService.pushToDocumentsList(this.databaseService.PROJECTSCOLLECTION, this.project.id, new Fieldvalue('dashboards', newDashboard.id))
                  .subscribe(result => {
                      this.project.dashboards.push(newDashboard);
                      this.buildTopMenu();
                      this.changeDashboard(newDashboard.id);
                    },
                    err => {
                      if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
                        this.router.navigate(['unauthorized']); }
                      console.log('Error while inserting into database ', err);
                    });
              },
              err => {
                if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
                  this.router.navigate(['unauthorized']); }
                console.log('Error while inserting into database ', err);
              });
        },
        err => {
          if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
            this.router.navigate(['unauthorized']); }
          console.log('Error while inserting into database ', err);
        });
  }


  /**
   * This method changes the theme of a project
   * @param theme the theme to set to
   */
  onSetTheme(theme): void {
    const themeLink: HTMLLinkElement = document.getElementById('theme-css') as HTMLLinkElement;
    themeLink.href = './assets/resources/themes/' + theme + '/theme.css';

    this.dataService.changeTheme(theme);
    this.databaseService.updateDocument(this.databaseService.PROJECTSCOLLECTION, this.project.id, new Fieldvalue('theme', theme))
      .subscribe(result => {
        },
        err => {
          if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
            this.router.navigate(['unauthorized']); }
          console.log('Error updating database', err);
        });

  }

  /**
   * This method changes the current displayed dashboard
   * @param id the id of the dashboard to display
   */
  protected changeDashboard(id: string): void {
    this.dataService.changeCurrentDashboardId(id);
    this.dataService.changeCurrentSheetId(this.project.dashboards.find(x => x.id === id).sheets[0].id); // set the first sheet of the new dashboard
  }


  /*Tracking function for ngFor Directive in dashboard.component.html*/
  protected trackDashboard(index, item): any {
    return item;
  }

  protected trackProject(index, item): any {
    return item;
  }

  checkDevices(): void {
    this.devicemanager.getAllDevices(this.user.id, this.project.id)
      .subscribe(result => {
          // log result.message
          console.log('Got all Devices');
          console.log(result);
          const devices = result;
          this.updateDevices(devices);
        },
        err => {
          if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
            this.router.navigate(['unauthorized']); }
          console.log('Device could not been pulled from the backend server.');
          console.log(err);
        });
  }

  // Http Requests to the backendserver to check for updates
  updateDevices(devices: any): void {
    let report;
    const successDevices: Array<string> = [];
    let successCount = 0;
    let failCount = 0;
    const failDevices: Array<string> = [];
    const failReports: Array<string> = [];
    // request updates for all devices
    for (const device of devices) {
      this.devicemanager.UpdateDevice(device.deviceId, this.user.id, this.project.id)
        .subscribe(result => {
            // log result.message
            console.log('Update checked successfully.');
            report = result.status;
            switch (report) {
              // if update failed
              case 0: {
                failDevices.push(device.name);
                failReports.push(result.errorReport);
                failCount++;
                break;
              }
              // if update succeeded
              case 1: {
                successDevices.push(device.name);
                successCount++;
                break;
              }
              // if there is no update
              default:
                break;
            }
          },
          err => {
            if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
              this.router.navigate(['unauthorized']); }
            console.log('Update could not be checked.');
            console.log(err);
          });
    }

    // TODO PrimeNG popup
    /*
    const info: string = successCount + ' devices were updated and ' + failCount + ' devices failed to update.';
    if (this.loginStatus > 0) {
    this.snackBarRef = this.snackBar.open(info, 'more...', {
      duration: 2000
    }).onAction().subscribe(() => {
      // Todo: here could be a dialog with all the devices and failReports.
    });
    }*/
  }

}
