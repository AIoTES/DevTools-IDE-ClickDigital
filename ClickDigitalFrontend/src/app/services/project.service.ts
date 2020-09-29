import {map} from 'rxjs/operators';

import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

import {DataService} from './data.service';
import {User} from '../models/frontend/user';
import {Fieldvalue} from '../models/frontend/fieldvalue';
import {WidgetDB} from '../models/database/widget';
import {Project} from '../models/frontend/project';
import {DashboardDB} from '../models/database/dashboard';
import {Widget, WidgetType} from '../models/frontend/widget';
import {ProjectDB} from '../models/database/project';
import {SheetDB} from '../models/database/sheet';
import {Dashboard} from '../models/frontend/dashboard';
import {Sheet} from '../models/frontend/sheet';
import uuidv4 from 'uuid/v4';

import {DatabaseService} from './database.service';
import {Router} from '@angular/router';
import {UserManagerService} from './usermanager.service';
import {DeviceManagerService} from './devicemanager.service';
import {DataPrivacyManagerService} from './dataprivacymanager.service';
import {ToggleWidget} from '../models/frontend/togglewidget';
import {BarChartWidget, Calculation, Frequency} from "../models/frontend/barchartwidget";
import {AxesOptions} from "../models/frontend/linechartwidget";
import {SliderWidget} from '../models/frontend/sliderwidget';
import {LineChartWidget} from "../models/frontend/linechartwidget";
import {Doughnutchartwidget, DoughnutChartDeviceEntity} from "../models/frontend/doughnutchartwidget";
import {BubbleChartDeviceEntity} from "../models/frontend/bubbleChartDeviceEntity";
import {BubbleChartWidget} from "../models/frontend/bubblechartwidget";
import {GridsterItem} from 'angular-gridster2';
import {DeviceEntity} from '../models/frontend/deviceEntity';
import {ChartDeviceEntity} from '../models/frontend/chartDeviceEntity';
import {EntityType, ValueViewWidget} from '../models/frontend/valueviewwidget';
import {StateWidget} from '../models/frontend/statewidget';
import {RuleManagementWidget} from '../models/frontend/rulemanagementwidget';
import {RuleNotificationWidget} from '../models/frontend/rulenotificationwidget';
import {RuleSharingWidget} from '../models/frontend/rulesharingwidget';
import {RuleCreationService} from '../skeleton/dashboard/rules/service/rule-creation.service';
import {RuleManagementService} from '../skeleton/dashboard/rules/service/rule-management.service';
import {ManagementComponent} from "../skeleton/dashboard/rules/management/management.component";
import {AnomalyEntity, RealtimeAnomalyWidget} from "../models/frontend/realtimeanomalywidget";
import {HistoryAnomalyWidget} from "../models/frontend/historyanomalywidget";
import {Distribution, PolarAreaChartWidget, SensorType} from "../models/frontend/polarareachartwidget";

@Injectable()
export class ProjectService {
  private user: User;
  private project: Project;
  protected currentDashboardId: string;
  protected currentSheetId: string;

  constructor(
    private dataService: DataService, private databaseService: DatabaseService,
    private router: Router, private usermanager: UserManagerService,
    private devicemanager: DeviceManagerService, private dataprivacymanager: DataPrivacyManagerService) {

    this.dataService.userData.subscribe((user: User) => this.user = user);
    this.dataService.projectData
      .subscribe((project: Project) => this.project = project);

    this.dataService.currentDashboardId
      .subscribe(dashboardId => this.currentDashboardId = dashboardId);

    this.dataService.currentSheetId
      .subscribe(sheetId => this.currentSheetId = sheetId);
  }

  /**
   * This method changes the current project
   * @param id the id of the project to change to
   */
  public loadNewProject(id: string, isRouted: boolean): void {
    let project: Project;
    this.databaseService.getDocument(this.databaseService.PROJECTSCOLLECTION, id)
      .subscribe((projectDB: ProjectDB) => {
          project = new Project(projectDB.id, projectDB.name, projectDB.theme, []);
          for (const dashboardId of projectDB.dashboards) {
            this.databaseService.getDocument(this.databaseService.DASHBOARDSCOLLECTION, dashboardId)
              .subscribe((dashboardDB: DashboardDB) => {
                const dashboard = new Dashboard(dashboardDB.id, dashboardDB.name, []);
                for (const sheetId of dashboardDB.sheets) {
                  this.databaseService.getDocument(this.databaseService.SHEETSSCOLLECTION, sheetId)
                    .subscribe((sheetDB: SheetDB) => {
                      const sheet = new Sheet(sheetDB.id, sheetDB.name, []);
                      for (const widgetId of sheetDB.widgets) {
                        this.databaseService.getDocument(this.databaseService.WIDGETSCOLLECTION, widgetId)
                          .subscribe(widget => {
                            //check widget type
                            switch (widget.type) {
                              case WidgetType.ruleManagementView:
                                sheet.widgets.push(new RuleManagementWidget(widget.id, widget.name, widget.additionalInfo, widget.position,
                                  widget.isDeveloped, widget.type));
                                break;
                              case WidgetType.ruleNotificationView:
                                sheet.widgets.push(new RuleNotificationWidget(widget.id, widget.name, widget.additionalInfo, widget.position,
                                  widget.isDeveloped, widget.type));
                                break;
                              case WidgetType.ruleSharingViewWidget:
                                sheet.widgets.push(new RuleSharingWidget(widget.id, widget.name, widget.additionalInfo, widget.position,
                                  widget.isDeveloped, widget.type));
                                break;
                              case WidgetType.toggleDeviceControl:
                                sheet.widgets.push(new ToggleWidget(widget.id, widget.name, widget.additionalInfo, widget.position,
                                  widget.isDeveloped, widget.type, widget.deviceId, widget.entityId,
                                  widget.controlPosition, widget.fontSize, widget.icon, widget.value, widget.toggleLabelOn, widget.toggleLabelOff));
                                break;
                              case WidgetType.stateDeviceControl:
                                sheet.widgets.push(new StateWidget(widget.id, widget.name, widget.additionalInfo, widget.position,
                                  widget.isDeveloped, widget.type, widget.deviceId, widget.entityId,
                                  widget.controlPosition, widget.fontSize, widget.icon, widget.value));
                                break;
                              case WidgetType.sliderDeviceControl:
                                sheet.widgets.push(new SliderWidget(widget.id, widget.name, widget.additionalInfo, widget.position,
                                  widget.isDeveloped, widget.type, widget.deviceId, widget.entityId,
                                  widget.controlPosition, widget.fontSize, widget.icon, widget.value, widget.minValue, widget.maxValue));
                                break;
                              case WidgetType.lineChartVisualization:
                                sheet.widgets.push(new LineChartWidget(widget.id, widget.name, widget.additionalInfo, widget.position,
                                  widget.isDeveloped, widget.type, widget.deviceEntities, widget.chartType, widget.isMonoVis, widget.isRealtime, widget.isTimeBased, widget.axesOptions,
                                  widget.numberOfValues, widget.startDate, widget.endDate, widget.interval));
                                break;
                              case WidgetType.barChartVisualization:
                                sheet.widgets.push(new BarChartWidget(widget.id, widget.name, widget.additionalInfo, widget.position,
                                  widget.isDeveloped, widget.type, widget.deviceEntities, widget.chartType, widget.isMonoVis,
                                  widget.isNumerical, widget.calculationType, widget.frequencyType, widget.axesOptions,
                                  widget.numberOfValues, widget.startDate, widget.endDate, widget.interval));
                                break;
                              case WidgetType.bubbleChartVisualization:
                                sheet.widgets.push(new BubbleChartWidget(widget.id, widget.name, widget.additionalInfo, widget.position,
                                  widget.isDeveloped, widget.type, widget.deviceEntities, widget.chartType, widget.startDate, widget.endDate,
                                  widget.locations, widget.colorPalette));
                                break;
                              case WidgetType.doughnutChartVisualization:
                                sheet.widgets.push(new Doughnutchartwidget(widget.id, widget.name, widget.additionalInfo, widget.position,
                                  widget.isDeveloped, widget.type, widget.deviceEntities, widget.chartType, widget.isCircleFull,
                                  widget.distribution, widget.colorPalette, widget.startDate, widget.endDate));
                                break;
                              case WidgetType.polarAreaChartVisualization:
                                sheet.widgets.push(new PolarAreaChartWidget(widget.id, widget.name, widget.additionalInfo, widget.position,
                                  widget.isDeveloped, widget.type, widget.deviceEntities, widget.chartType, widget.startDate, widget.endDate,
                                  widget.calculationType, widget.deviceType, widget.distribution, widget.colorPalette));
                                break;
                              case WidgetType.realtimeValueVisualization:
                                sheet.widgets.push(new ValueViewWidget(widget.id, widget.name, widget.additionalInfo,
                                  widget.position, widget.isDeveloped, widget.type, widget.deviceId, widget.entityId,
                                  widget.fontSize, widget.entityType, widget.controlPosition));
                                break;
                              case WidgetType.realtimeAnomaly:
                                sheet.widgets.push(new RealtimeAnomalyWidget(widget.id, widget.name, widget.additionalInfo, widget.position,
                                  widget.isDeveloped, widget.type, widget.deviceEntities, widget.chartType, widget.axesOptions, widget.numberOfValues));
                                break;
                              case WidgetType.historyAnomaly:
                                sheet.widgets.push(new HistoryAnomalyWidget(widget.id, widget.name, widget.additionalInfo, widget.position,
                                  widget.isDeveloped, widget.type, widget.deviceEntities, widget.chartType, widget.axesOptions, widget.startDate,
                                  widget.endDate, widget.interval));
                                break;
                              default:
                                sheet.widgets.push(new Widget(widget.id, widget.name, widget.additionalInfo,
                                  widget.position, widget.isDeveloped, widget.type));
                                break;
                            }
                          });
                      }
                      console.log("sheet: ", sheet);
                      dashboard.sheets.push(sheet);
                    });
                }
                project.dashboards.push(dashboard);
              });
          }
          setTimeout(() => {
            this.dataService.changeCurrentDashboardId(project.dashboards[0].id);
            this.dataService.changeCurrentSheetId(project.dashboards.find(x => x.id === this.currentDashboardId).sheets[0].id);
            this.dataService.changeProjectData(project);
            console.log('Changed', project);
            this.dataService.changeRefreshMenu(Math.random().toString());

            if (isRouted) {
              console.log("routed in loadNewPorject");
              this.router.navigate(['dashboard']);
            }
          }, 500);

        },
        err => {
          if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
            this.router.navigate(['unauthorized']);
          }
          console.log('Error loading project data from database ', err);
        });
  }

  public generateProject(): void {
    const newSheet: Sheet = new Sheet(uuidv4(), 'Sheet 1', []);
    const newDashboard: Dashboard = new Dashboard(uuidv4(), 'Dashboard 1', [newSheet]);
    const newProject: Project = new Project(uuidv4(), `Project ${this.user.projects.length + 1}`, 'omega', [newDashboard]);

    this.databaseService.insertDocument(this.databaseService.SHEETSSCOLLECTION, new SheetDB(newSheet.id, newSheet.name, []))
      .subscribe(result => {
          this.databaseService.insertDocument(this.databaseService.DASHBOARDSCOLLECTION, new DashboardDB(newDashboard.id, newDashboard.name, [newDashboard.sheets[0].id]))
            .subscribe(result => {
                this.databaseService.insertDocument(this.databaseService.PROJECTSCOLLECTION, new ProjectDB(newProject.id, newProject.name, newProject.theme, [newProject.dashboards[0].id]))
                  .subscribe(result => {
                      this.databaseService.pushToDocumentsList(this.databaseService.USERSCOLLECTION, this.user.id, new Fieldvalue('projects', newProject.id))
                        .subscribe(result => {
                            console.log(this.user);
                            console.log(this.user.id);
                            this.databaseService.getDocument(this.databaseService.USERSCOLLECTION, this.user.id)
                              .subscribe((user: User) => {
                                  this.dataService.changeUserData(user);
                                  this.dataService.changeCurrentDashboardId(newDashboard.id);
                                  this.dataService.changeCurrentSheetId(newSheet.id);
                                  this.dataService.changeProjectData(newProject);
                                  this.dataService.changeRefreshMenu(Math.random().toString());
                                },
                                err => {
                                  if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
                                    this.router.navigate(['unauthorized']);
                                  }
                                  console.log('Error while getting document from database ', err);
                                });
                          },
                          err => {
                            if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
                              this.router.navigate(['unauthorized']);
                            }
                            console.log('Error while inserting into database ', err);
                          });
                    },
                    err => {
                      if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
                        this.router.navigate(['unauthorized']);
                      }
                      console.log('Error while inserting into database ', err);
                    });
              },
              err => {
                if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
                  this.router.navigate(['unauthorized']);
                }
                console.log('Error while inserting into database ', err);
              });
        },
        err => {
          if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
            this.router.navigate(['unauthorized']);
          }
          console.log('Error while inserting into database ', err);
        });
  }

  public deleteProject(): void {

    // if it is the last project, create a new one and focus this one
    // TODO delete project id from the project ids of collection User
    // TODO delete from database collections: Projects, all Dashboards, all Sheets, all widgets and change observable project data to the new first project of the user
    // deleting all dashboards which are part of the project
    for (let dashboard of this.project.dashboards) {
      this.deleteDashboard(dashboard.id);
    }
    // delete project from user
    this.databaseService.popFromDocumentsList(this.databaseService.USERSCOLLECTION, this.user.id, new Fieldvalue('projects', this.project.id))
      .subscribe(result => {
          //then delete project and its content
          this.databaseService.deleteDocument(this.databaseService.PROJECTSCOLLECTION, this.project.id)
            .subscribe(result => {
              //delete all platforms
                this.devicemanager.getAllPlatforms(this.user.id, this.project.id)
                  .subscribe(platforms => {
                      platforms.forEach(platform => {
                        this.devicemanager.deletePlatform(platform.platformId, this.user.id, this.project.id).subscribe(result => {

                          },
                          err => {
                            if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
                              this.router.navigate(['unauthorized']); }
                            console.log('DeleteDevice could not been sent to backend server');
                            console.log(err);
                          });

                      });
                    },
                    error => {
                      if (error['error'] === 'Session invalid' || error['error'] === 'No session found') {
                        this.router.navigate(['unauthorized']);
                      }
                      console.log('Error deleting Dashboard', error);
                    });
                if (this.user.projects.length === 0) {
                  this.generateProject();
                } else {
                  this.dataService.changeUserData(this.user);
                  this.loadNewProject(this.user.projects[0], false);
                }
              },
              error => {
                if (error['error'] === 'Session invalid' || error['error'] === 'No session found') {
                  this.router.navigate(['unauthorized']);
                }
                console.log('Error deleting Dashboard', error);
              });
        },
        error => {
          if (error['error'] === 'Session invalid' || error['error'] === 'No session found') {
            this.router.navigate(['unauthorized']);
          }
          console.log('Error deleting Dashboard', error);
        });
  }

  public deleteDashboard(dashId: string): void {
    // delete all sheets from dashboard
    for (let sheet of this.project.dashboards.find(x => x.id === dashId).sheets) {
      this.deleteSheet(sheet.id);
    }
    // delete dashboard id from project
    this.databaseService.popFromDocumentsList(this.databaseService.PROJECTSCOLLECTION, this.project.id, new Fieldvalue('dashboards', dashId))
      .subscribe(result => {
          //then delete dashboard and its content
          this.databaseService.deleteDocument(this.databaseService.DASHBOARDSCOLLECTION, dashId)
            .subscribe(result => {
                const index = this.project.dashboards.findIndex(x => x.id === dashId);
                if (index !== undefined) {
                  this.project.dashboards.splice(index, 1);
                  this.dataService.changeCurrentDashboardId(this.project.dashboards[0].id);
                  this.dataService.changeCurrentSheetId(this.project.dashboards[0].sheets[0].id);
                  this.dataService.changeRefreshMenu(uuidv4());
                } else {
                  console.log('Error deleting Dashboard. Dashboard not found');
                }
              },
              error => {
                if (error['error'] === 'Session invalid' || error['error'] === 'No session found') {
                  this.router.navigate(['unauthorized']);
                }
                console.log('Error deleting Dashboard', error);
              });
        },
        error => {
          if (error['error'] === 'Session invalid' || error['error'] === 'No session found') {
            this.router.navigate(['unauthorized']);
          }
          console.log('Error deleting Dashboard', error);
        });
  }

  public deleteSheet(sheetId: string): void {
    // deleting all widgets which are part of the sheet
    const widgets = this.project.dashboards.find(x => x.id === this.currentDashboardId).sheets.find(x => x.id === sheetId).widgets;
    if (widgets != undefined) {
      for (const widget of widgets) {
        this.deleteWidget(widget.id);
      }
    } else {
      console.log('no widgets in sheet.');
    }
    // delete sheet id from dashboard
    this.databaseService.popFromDocumentsList(this.databaseService.DASHBOARDSCOLLECTION, this.currentDashboardId, new Fieldvalue('sheets', sheetId))
      .subscribe(result => {
          // then delete sheet and its content
          this.databaseService.deleteDocument(this.databaseService.SHEETSSCOLLECTION, sheetId)
            .subscribe(result => {
                const index = this.project.dashboards.find(x => x.id === this.currentDashboardId).sheets.findIndex(x => x.id === sheetId);
                if (index !== undefined) {
                  this.project.dashboards.find(x => x.id === this.currentDashboardId).sheets.splice(index, 1);
                  if (this.project.dashboards.find(x => x.id === this.currentDashboardId).sheets.length === 0) {
                    this.generateSheet();
                  }
                  this.dataService.changeCurrentSheetId(this.project.dashboards[0].sheets[0].id);
                  this.dataService.changeRefreshMenu(uuidv4());
                  this.dataService.changeProjectData(this.project);
                } else {
                  console.log('Error deleting Sheet. Sheet not found');
                }
              },
              error => {
                if (error['error'] === 'Session invalid' || error['error'] === 'No session found') {
                  this.router.navigate(['unauthorized']);
                }
                console.log('Error deleting Sheet', error);
              });
        },
        error => {
          if (error['error'] === 'Session invalid' || error['error'] === 'No session found') {
            this.router.navigate(['unauthorized']);
          }
          console.log('Error deleting Sheet', error);
        });
  }

  /**
   * This method adds a new sheet to the current {@link Dashboard} and saves it to the database
   * as a new entity as well as an id in the corresponding dashboard entity
   */
  public generateSheet(): void {
    const d: Dashboard = this.project.dashboards.find(x => x.id === this.currentDashboardId);
    if (d !== undefined) {
      const newSheet: Sheet = new Sheet(uuidv4(), `Sheet ${d.sheets.length + 1}`, []);
      this.databaseService.insertDocument(this.databaseService.SHEETSSCOLLECTION, new SheetDB(newSheet.id, newSheet.name, []))
        .subscribe(result => {
            this.databaseService.pushToDocumentsList(this.databaseService.DASHBOARDSCOLLECTION, this.currentDashboardId, new Fieldvalue('sheets', newSheet.id))
              .subscribe(result => {
                  d.sheets.push(newSheet);
                },
                err => {
                  if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
                    this.router.navigate(['unauthorized']);
                  }
                  console.log('Error while inserting into database ', err);
                });
          },
          err => {
            if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
              this.router.navigate(['unauthorized']);
            }
            console.log('Error while inserting into database ', err);
          });
    } else {
      console.log('Error adding sheet. No corresponding dashboard found');
    }
  }

  /**
   * This method deletes a widget from the project data and from the database
   * @param {string} id
   */
  public deleteWidget(id: string): void {
    const s: Sheet = this.project.dashboards.find(x => x.id === this.currentDashboardId).sheets.find(x => x.id === this.currentSheetId);
    if (s !== undefined) {
      // delete Widget in Widget Datatable
      this.databaseService.deleteDocument(this.databaseService.WIDGETSCOLLECTION, id).subscribe(result => {
          // delete WidgetId in Sheet Datatable
          this.databaseService.popFromDocumentsList(this.databaseService.SHEETSSCOLLECTION, this.currentSheetId, new Fieldvalue('widgets', id))
            .subscribe(result => {
                // delete Widget from Sheet in Projectobject
                const index = this.project.dashboards.find(x => x.id === this.currentDashboardId).sheets.find(x =>
                  x.id === this.currentSheetId).widgets.findIndex(w => w.id === id);
                if (index !== undefined) {
                  this.project.dashboards.find(x => x.id === this.currentDashboardId).sheets.find(x =>
                    x.id === this.currentSheetId).widgets.splice(index, 1);
                }
                this.dataService.changeProjectData(this.project);
              },
              err => {
                if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
                  this.router.navigate(['unauthorized']);
                }
                console.log('Error while inserting into database ', err);
              });
        },
        err => {
          if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
            this.router.navigate(['unauthorized']);
          }
          console.log('Error while inserting into database ', err);
        });
    } else {
      console.log('Error adding sheet. No corresponding dashboard found');
    }
  }

  // New Widget Generator Method to replace redundant methods
  // consumes widget types as strings
  public generateWidget(widgetType: string): void {
    let widget;

    const s: Sheet = this.project.dashboards.find(x => x.id === this.currentDashboardId).sheets.find(x => x.id === this.currentSheetId);
    const EMPTYID = '';
    const DEFAULTFONTSIZE = 20;
    const BOTTOMCONTROLPOSITION = 'bottom';
    const RIGHTCONTROLPOSITION = 'right';
    const EMPTYSTRING = '';
    if (s !== undefined) {
      switch (widgetType) {
        case WidgetType.ruleManagementView:
          widget = new RuleManagementWidget(uuidv4(), widgetType, EMPTYSTRING, this.setPosition(widgetType),
            true, widgetType);
          break;
        case WidgetType.ruleNotificationView:
          widget = new RuleNotificationWidget(uuidv4(), widgetType, EMPTYSTRING, this.setPosition(widgetType),
            true, widgetType);
          break;
        case WidgetType.ruleSharingViewWidget:
          widget = new RuleSharingWidget(uuidv4(), widgetType, EMPTYSTRING, this.setPosition(widgetType),
            true, widgetType);
          break;
        case WidgetType.toggleDeviceControl:
          widget = new ToggleWidget(uuidv4(), widgetType, EMPTYSTRING, this.setPosition(widgetType),
            true, widgetType, undefined, undefined, RIGHTCONTROLPOSITION,
            DEFAULTFONTSIZE, undefined, true, 'On', 'Off');
          break;
        case WidgetType.stateDeviceControl:
          widget = new StateWidget(uuidv4(), widgetType, EMPTYSTRING, this.setPosition(widgetType),
            true, widgetType, undefined, undefined, RIGHTCONTROLPOSITION,
            DEFAULTFONTSIZE, undefined, undefined);
          break;
        case WidgetType.sliderDeviceControl:
          widget = new SliderWidget(uuidv4(), widgetType, EMPTYSTRING, this.setPosition(widgetType),
            true, widgetType, undefined, undefined, RIGHTCONTROLPOSITION, DEFAULTFONTSIZE, undefined,
            50, 0, 100);
          break;
        case WidgetType.lineChartVisualization:
          widget = new LineChartWidget(uuidv4(), widgetType, EMPTYSTRING, this.setPosition(widgetType),
            true, widgetType, [new ChartDeviceEntity('', '', 'solid', true,
              true, '#1976D2', '', '', '')], 'line', true, true, true, new AxesOptions('x', 'y', true, true), 5,
            undefined, undefined, undefined);
          break;
        case WidgetType.barChartVisualization:
          widget = new BarChartWidget(uuidv4(), widgetType, EMPTYSTRING, this.setPosition(widgetType),
            true, widgetType, [new ChartDeviceEntity('', '', 'solid', true,
              true, '#1976D2', '', '', '')], 'line', true, true, Calculation.Avg, Frequency.Count,
            new AxesOptions('x', 'y', true, true), 5,
            undefined, undefined, "day");
          break;
        case WidgetType.bubbleChartVisualization:
          widget = new BubbleChartWidget(uuidv4(), widgetType, EMPTYSTRING, this.setPosition(widgetType),
            true, widgetType, [], 'bubble', undefined, undefined, [], "cold");
          break;
        case WidgetType.polarAreaChartVisualization:
          widget = new PolarAreaChartWidget(uuidv4(), widgetType, EMPTYSTRING, this.setPosition(widgetType),
            true, widgetType, [], 'polarArea', undefined, undefined,
            Calculation.Avg, SensorType.Motion, Distribution.Occupant, "cold");
          break;
        case WidgetType.doughnutChartVisualization:
          widget = new Doughnutchartwidget(uuidv4(), widgetType, EMPTYSTRING, this.setPosition(widgetType),
            true, widgetType, [new DoughnutChartDeviceEntity('', '', '', '')], 'doughnut', "true", undefined,
            "cold", undefined, undefined);
          break;
        case WidgetType.realtimeValueVisualization:
          widget = new ValueViewWidget(uuidv4(), widgetType, EMPTYSTRING, this.setPosition(widgetType), true, widgetType,
            EMPTYID, EMPTYID, DEFAULTFONTSIZE, '', BOTTOMCONTROLPOSITION);
          break;
        case WidgetType.realtimeAnomaly:
          widget = new RealtimeAnomalyWidget(uuidv4(), widgetType, EMPTYSTRING, this.setPosition(widgetType),
            true, widgetType, [new AnomalyEntity('', '', '', '',
              '')], 'line', new AxesOptions('time', 'y', true, true), 5);
          break;
        case WidgetType.historyAnomaly:
          widget = new HistoryAnomalyWidget(uuidv4(), widgetType, EMPTYSTRING, this.setPosition(widgetType),
            true, widgetType, [new AnomalyEntity('', '', '', '',
              '')], 'line', new AxesOptions('time', 'y', true, true), undefined,
            undefined, 'P5D');
          break;
        // default Widget class
        default:
          widget = new Widget(uuidv4(), widgetType, EMPTYSTRING, this.setPosition(widgetType),
            true, widgetType);
          break;
      }
      console.log("widget: ", widget);

      // insert Widget in Widget Datatable
      this.databaseService.pushToDocumentsList(this.databaseService.SHEETSSCOLLECTION, this.currentSheetId, new Fieldvalue('widgets', widget.id)).subscribe(result => {
          // insert WidgetId in Sheet Datatable
          this.databaseService.insertDocument(this.databaseService.WIDGETSCOLLECTION, widget)
            .subscribe(result => {
                // add Widget to Sheet in Projectobject
                console.log('sheet: ', this.currentSheetId);
                this.project.dashboards.find(x => x.id === this.currentDashboardId).sheets.find(x => x.id === this.currentSheetId).widgets.push(widget);
                this.dataService.changeProjectData(this.project);
                console.log('project', this.project);
              },
              err => {
                if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
                  this.router.navigate(['unauthorized']);
                }
                console.log('Error while inserting into database ', err);
              });
        },
        err => {
          if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
            this.router.navigate(['unauthorized']);
          }
          console.log('Error while inserting into database ', err);
        });
    } else {
      console.log('Error adding sheet. No corresponding dashboard found');
    }
  }

  /**
   * This method sets the minimum size in the grid of a widget.
   * @param {string} widgetType the type of widget
   * @returns {GridsterItem}
   */
  protected setPosition(widgetType: string): GridsterItem {
    switch (widgetType) {
      case WidgetType.addDevice:
        return {minItemRows: 12, minItemCols: 10, x: 0, y: 0, rows: 30, cols: 16};
      case WidgetType.deleteDevice:
      case WidgetType.toggleDeviceControl:
      case WidgetType.stateDeviceControl:
        return {minItemRows: 3, minItemCols: 10, x: 0, y: 0, rows: 10, cols: 30};
      case WidgetType.sliderDeviceControl:
        return {minItemRows: 3, minItemCols: 10, x: 0, y: 0, rows: 13, cols: 35};
      case WidgetType.lineChartVisualization:
      case WidgetType.barChartVisualization:
      case WidgetType.doughnutChartVisualization:
      case WidgetType.polarAreaChartVisualization:
      case WidgetType.bubbleChartVisualization:
        return {minItemRows: 12, minItemCols: 12, x: 0, y: 0, rows: 24, cols: 24};
      case WidgetType.historyAnomaly:
      case WidgetType.realtimeAnomaly:
        return {minItemRows: 12, minItemCols: 12, x: 0, y: 0, rows: 28, cols: 28};
      case WidgetType.realtimeValueVisualization:
        return {minItemRows: 6, minItemCols: 6, x: 0, y: 0, rows: 20, cols: 16};
      case WidgetType.ruleManagementView:
      case WidgetType.ruleNotificationView:
        return {minItemRows: 6, minItemCols: 25, x: 0, y: 0, rows: 25, cols: 44};
      case WidgetType.ruleSharingViewWidget:
        return {minItemRows: 12, minItemCols: 12, x: 0, y: 0, rows: 28, cols: 38};
      //return {minItemRows: 20, minItemCols: 20, x: 0, y: 0, rows: 25, cols: 25, truemaxItemCols : 100 , maxItemRows:100};
      // default Widget class
      default:
        return {minItemRows: 10, minItemCols: 10, x: 0, y: 0, rows: 10, cols: 10};
    }

  }

}
