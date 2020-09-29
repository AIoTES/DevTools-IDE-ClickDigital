import {Component, HostBinding, OnInit, ViewChild} from '@angular/core';
import {DatabaseService} from '../../services/database.service';
import {DataService} from '../../services/data.service';
import {OverlayContainer} from '@angular/cdk/overlay';
import { Router } from '@angular/router';
import {ConfirmationService, MenuItem, Message} from 'primeng/api';
import {TabPanel, TabView} from 'primeng/primeng';
import {User} from '../../models/frontend/user';
import {ProjectService} from '../../services/project.service';
import {Project} from '../../models/frontend/project';
import {EntityStatechangeResponse} from '../../models/backend/entitystatechangeresponse';
import {ValueViewWidget} from '../../models/frontend/valueviewwidget';
import {WidgetType} from '../../models/frontend/widget';
import {ThingStatusChangeResponse} from '../../models/backend/thingstatuschangedresponse';
import {DeviceManagerService} from '../../services/devicemanager.service';
import {Device} from '../../models/backend/device';
import {DeviceDiscoveredResponse} from '../../models/backend/devicediscoveredresponse';
import {RuleCreationService} from "./rules/service/rule-creation.service";
import {RuleManagementService} from "./rules/service/rule-management.service";

@Component({
  selector: 'app-dashboard',
  providers: [ConfirmationService],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @HostBinding('class') componentCssClass;

  protected project: Project;
  protected currentDashboardId: string;

  protected user: User;
  protected currentSheetId: string;
  protected dataloaded = false;


  // old values
  protected dashboardID: number;
  protected loginStatus: number;
  public msgs: Array<Message>;
  protected lastTabId: String;
  // class variable
  @ViewChild(TabView) tabView: TabView;
  displayRuleCreationDialog = false;
  displayRuleManagement = false;
  displayRuleEditDialog = false;
  window = window;
  editRule : any;

  constructor(private dataService: DataService,
              protected projectService: ProjectService,
              private overlayContainer: OverlayContainer,
              private confirmationService: ConfirmationService,
              private ruleCreationService: RuleCreationService,
              private ruleManagementService: RuleManagementService,
              private router: Router) {

  }

  ngOnInit(): void {
    this.msgs = [];
    this.dataService.userData.subscribe(value => this.user = value);

    this.dataService.currentLoginStatus
      .subscribe(value => {
        this.loginStatus = value;
        if (value < 1) {
          this.router.navigate(['unauthorized']);
        }
      });

    this.dataService.projectData
      .subscribe((project: Project) => {
        this.project = project;
        this.dataloaded = true;
      });

    this.dataService.currentDashboardId
      .subscribe(dashboardId => this.currentDashboardId = dashboardId);

    this.dataService.currentSheetId
      .subscribe(sheetId => this.currentSheetId = sheetId);

    this.dataService.currentTheme.subscribe(value => this.changeTheme(value));
    this.ruleCreationService.displayManagementStatusUpdated.subscribe(display => {
      this.displayRuleManagement = display;
    });
    this.ruleCreationService.displayStatusUpdated.subscribe(display => {
      this.displayRuleCreationDialog = display;
    });

    this.ruleManagementService.editRuleStatusUpdated.subscribe(rule => {
      if(rule){
        this.editRule = rule;
      }
    });
    this.ruleManagementService.displayRuleUpdateComponent.subscribe(display => {
      this.displayRuleEditDialog = display;
    });
  }

  /**
   * This method sets the active tab closeable to offer the opportunity to delete a sheet.
   * Furthermore it set the id of the active tab for global access.
   */
  setActiveTab(): void {
    const tabPanel: TabPanel = this.tabView.findSelectedTab();

    this.currentSheetId = (tabPanel.viewContainer.element.nativeElement as Element).id;
    this.dataService.changeCurrentSheetId(this.currentSheetId);

    let lastTabPanel: TabPanel;
    for (let i = 0; i < this.tabView.tabs.length; i++) {
      if (this.tabView.tabs[i].id === this.lastTabId) {
        lastTabPanel = this.tabView.tabs[i];
      }
    }

    tabPanel.closable = true;
    if (lastTabPanel !== undefined) {
      lastTabPanel.closable = false;
    }
    this.lastTabId = tabPanel.id;

  }

  changeTheme(theme): void {
    if (theme !== undefined) {
      this.overlayContainer.getContainerElement().classList.add(theme);
      this.componentCssClass = theme;
    }
  }

  /**
   * This method displays a confirmation window for deleting a sheet. By accepting
   * the method {@link DashboardComponent#deleteSheet} gets called
   * @param sheetid -the id of the sheet
   */
  protected deleteConfirmation(sheetid: string): void {
    const tabPanel: TabPanel = this.tabView.tabs.find(i => (i.viewContainer.element.nativeElement as Element).id === sheetid);
    this.confirmationService.confirm({
      message: `Do you want to delete the sheet ${tabPanel.header} ?`,
      header: 'Delete Sheet',
      icon: 'fa fa-trash',
      accept: () => {
        // delete sheet
        console.log('sheetid: ', sheetid);
        this.projectService.deleteSheet(sheetid);
      },
      reject: () => {
        this.msgs = [];
        this.msgs = [{severity: 'info', summary: 'Canceled', detail: 'Canceled deletion.'}];
      }
    });
  }

  /*Tracking functions for ngFor Directive in dashboard.component.html*/
  protected trackSheet(index, sheet): any {
    return sheet ? sheet[index] : undefined;
  }

  dashboardTrack(index, item): any {
    return item;
  }

  protected notifyOfEvent(event): void {
    this.msgs = [];
    this.msgs.push(event);
  }

}
