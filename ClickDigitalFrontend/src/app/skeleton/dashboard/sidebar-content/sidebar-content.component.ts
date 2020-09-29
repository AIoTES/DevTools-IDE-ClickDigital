/* tslint:disable */
import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { Router } from '@angular/router';
import {DataService} from '../../../services/data.service';
import {DatabaseService} from '../../../services/database.service';
import {ConfirmationService, MenuItem, Message} from 'primeng/api';
import { ProjectService } from '../../../services/project.service';
import {Project} from '../../../models/frontend/project';
import {Fieldvalue} from '../../../models/frontend/fieldvalue';
import uuidv4 from 'uuid/v4';
import {WidgetType} from "../../../models/frontend/widget";
import {RuleCreationService} from "../rules/service/rule-creation.service";

@Component({
  selector: 'app-sidebar-content',
  providers: [ConfirmationService],
  templateUrl: './sidebar-content.component.html',
  styleUrls: ['./sidebar-content.component.css']
})

export class SidebarContentComponent implements OnInit {

  protected project: Project;
  protected currentDashboardId: string;
  protected currentSheetId: string;


  protected items: Array<MenuItem>;
  protected itemsDelete: Array<MenuItem>;
  protected currentSheet: number;
  protected dashboardID: number;
  protected dialogOpened: boolean;
  protected projectID: number;
  msgs: Message[] = [];
  @Output() messageEvent = new EventEmitter<any>();

  displayRuleCreationDialog: boolean;

  showRuleCreationDialog(): void {
    this.displayRuleCreationDialog = true;
    this.ruleCreationService.displayStatusUpdated.emit(this.displayRuleCreationDialog);
    this.ruleCreationService.displayManagementStatusUpdated.emit(false);
  }


  constructor(private databaseService: DatabaseService,
              private dataService: DataService,
              private confirmationService: ConfirmationService,
              private projectService: ProjectService,
              private ruleCreationService: RuleCreationService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.dataService.projectData
      .subscribe((project: Project) => this.project = project);

    this.dataService.currentDashboardId
      .subscribe(dashboardId => this.currentDashboardId = dashboardId);

    this.dataService.currentSheetId
      .subscribe(sheetId => this.currentSheetId = sheetId);


    this.dataService.currentSheet.subscribe(cSheet => this.currentSheet = cSheet);
    this.dataService.currentDashboardID.subscribe(id => this.dashboardID = id);
    this.dataService.currentProjectID.subscribe(value => this.projectID = value);
    const barDaughter: Element = document.getElementById('sidebarM').children.item(0);
    (<HTMLElement>barDaughter).style.width = '50px';
    (<HTMLElement>barDaughter).style.height = '100%';
    (<HTMLElement>barDaughter).style.textAlign = 'center';

    this.dialogOpened = false;
    this.ruleCreationService.displayStatusUpdated.subscribe((response)=>{
      this.displayRuleCreationDialog = response;
    });

    this.items = [
      {
        label: 'Device Management',
        icon: 'fa fa-laptop',
        items:
          [
            {
              label: 'Add Device', command: (event: Event) => {
                this.projectService.generateWidget(WidgetType.addDevice.toString());
              }
            },
            {
              label: 'Delete Device', command: (event: Event) => {
                this.projectService.generateWidget(WidgetType.deleteDevice.toString());
              }
            }
          ]
      },
      {
        label: 'Device Control',
        icon: 'fa fa-sliders',
        items:
          [
            {
              label: 'Slider',
              command: (event: Event) => {
                this.projectService.generateWidget(WidgetType.sliderDeviceControl.toString());
              }
            },
            {
              label: 'Toggle', command: (event: Event) => {
                this.projectService.generateWidget(WidgetType.toggleDeviceControl.toString());
              }
            },
            {
              label: 'State Changer', command: (event: Event) => {
                this.projectService.generateWidget(WidgetType.stateDeviceControl.toString());
              }
            }
          ]
      },
      {
        label: 'Device Visualization',
        icon: 'fa fa-bar-chart',
        items: [
          {
            label: 'Bar Chart', command: (event: Event) => {
              this.projectService.generateWidget(WidgetType.barChartVisualization.toString());
            }
          },
         /* {
            label: 'Bubble Chart', command: (event: Event) => {
              this.projectService.generateWidget(WidgetType.bubbleChartVisualization.toString());
            }
          },*/
          {
            label: 'Doughnut Chart', command: (event: Event) => {
              this.projectService.generateWidget(WidgetType.doughnutChartVisualization.toString());
            }
          },
          {
            label: 'Line Chart', command: (event: Event) => {
              this.projectService.generateWidget(WidgetType.lineChartVisualization.toString());
            }
          },
          {
            label: 'Polar Area Chart', command: (event: Event) => {
              this.projectService.generateWidget(WidgetType.polarAreaChartVisualization.toString());
            }
          },
          {
            label: 'Realtime Value', command: (event: Event) => {
              this.projectService.generateWidget(WidgetType.realtimeValueVisualization.toString());
            }
          }

        ]
      } ,
      {
        label: 'Anomaly Detection',
        icon: 'fa fa-binoculars',
        items: [
          {
            label: 'History Anomaly Detection', command: (event: Event) => {
              this.projectService.generateWidget(WidgetType.historyAnomaly.toString());
            }
          },
          {
            label: 'Realtime Anomaly Detection', command: (event: Event) => {
              this.projectService.generateWidget(WidgetType.realtimeAnomaly.toString());
            }
          }
        ]
      },
      {
        label: 'Rules',
        icon: 'fa fa-code-fork',
        items: [
          {label: 'Creation', command: (event: Event) => {this.showRuleCreationDialog()}},
          {
            label: 'Management', command: (event: Event) => {
            this.projectService.generateWidget(WidgetType.ruleManagementView.toString());
          }},
          {label: 'Notification', command: (event: Event) => {
            this.projectService.generateWidget(WidgetType.ruleNotificationView.toString());
          }},
          {label: 'Sharing', command: (event: Event) => {
            this.projectService.generateWidget(WidgetType.ruleSharingViewWidget.toString());
          }}
        ]
      }
    ];

    this.itemsDelete = [
      {
        label: 'Delete Dashboard',
        command: event1 => this.deleteConfirmation()
      },
      {
        label: 'Delete Project',
        command: event1 => this.deleteProjectConfirmation()
      }
    ];

  }

  private deleteConfirmation() {
    this.confirmationService.confirm({
      message: 'Do you want to delete current dashboard ?',
      header: 'Delete Dashboard',
      icon: 'fa fa-trash',
      accept: () => {
        // delete sheet
        this.projectService.deleteDashboard(this.currentDashboardId);
        this.msgs = [{severity: 'success', summary: 'Confirmed', detail: 'Dashboard deleted'}];
        this.msgs.push();
      },
      reject: () => {
        this.msgs = [{severity: 'info', summary: 'Canceled', detail: 'Canceled deletion.'}];
      }
    });
  }

  private deleteProjectConfirmation() {
    this.confirmationService.confirm({
      message: 'Do you want to delete current project ?',
      header: 'Delete Project',
      icon: 'fa fa-trash',
      accept: () => {
        // delete sheet
        this.projectService.deleteProject();
        this.msgs = [{severity: 'success', summary: 'Confirmed', detail: 'Project deleted'}];
        this.msgs.push();
      },
      reject: () => {
        this.msgs = [{severity: 'info', summary: 'Canceled', detail: 'Canceled deletion.'}];
      }
    });
  }

}
