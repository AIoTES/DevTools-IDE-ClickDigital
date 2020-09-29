import {Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { ProjectService } from '../../../services/project.service';
import { CompactType, GridsterConfig, GridsterItem, GridType, DisplayGrid, GridsterItemComponentInterface } from 'angular-gridster2';
import { DatabaseService } from '../../../services/database.service';
import * as $ from 'jquery';
import { Project } from '../../../models/frontend/project';
import { Widget } from '../../../models/frontend/widget';
import { Fieldvalue } from '../../../models/frontend/fieldvalue';
import { WidgetType } from '../../../models/frontend/widget';
import { EntityStatechangeResponse } from '../../../models/backend/entitystatechangeresponse';
import { ValueViewWidget } from '../../../models/frontend/valueviewwidget';
import { User } from '../../../models/frontend/user';
import { RuleNotificationService } from '../rules/service/rule-notification.service';
import {LineChartWidget} from '../../../models/frontend/linechartwidget';
import {RealtimeAnomalyWidget} from "../../../models/frontend/realtimeanomalywidget";
import {Doughnutchartwidget} from "../../../models/frontend/doughnutchartwidget";
import { environment} from "../../../../environments/environment";
import {SliderWidget} from "../../../models/frontend/sliderwidget";
import {StateWidget} from "../../../models/frontend/statewidget";
import {ToggleWidget} from "../../../models/frontend/togglewidget";

@Component({
  selector: 'sheet-content',
  templateUrl: './sheet-content.component.html',
  styleUrls: ['./sheet-content.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SheetContentComponent implements OnInit {

  @Output() messageEvent = new EventEmitter<any>();

  constructor(protected databaseService: DatabaseService,
              private dataService: DataService,
              protected projectService: ProjectService,
              private notificationService: RuleNotificationService,
              private router: Router) {
  }

  protected widgetType = WidgetType;
  protected project: Project;
  // protected widgets;
  protected currentDashboardId: string;
  protected user: User;
  protected currentSheetId: string;
  protected widgetPosition: GridsterItem;
  protected currentWidgetId: string;

  protected dashboard: Array<GridsterItem>;
  protected loginStatus: number;
  options: GridsterConfig;
  optionsOLD: GridsterConfig;
  list: Array<Widget>;
  dataloaded: boolean;
  mouseup = false;

 static itemChange(item: GridsterItem, itemComponent: GridsterItemComponentInterface): void {
    console.log("itemChange!!!");
    var el = document.getElementById(itemComponent.el.id);
    console.log("element: ", el);
    if (el !== undefined && el !== null ) {el.style.pointerEvents = 'auto';}
  }

  static itemResize(item: GridsterItem, itemComponent: GridsterItemComponentInterface) {
    console.log("itemRESIZE!!!");
    var el = document.getElementById(itemComponent.el.id);
    console.log("elem: ", el);
    if (el !== undefined && el !== null ) {el.style.pointerEvents = 'auto';}
  }

  enablePointer(widgetId: string) {
    console.log("enablePointer!!!");
    var el = document.getElementById(widgetId);
    if (el !== undefined && el !== null ) {el.style.pointerEvents = 'auto';}
  }

  handleResizeFont(elem: HTMLElement): void {
    console.log("handle it!");
    //SheetContentComponent.fitText(elem);
  }

  ngOnInit(): void {

    this.dataService.currentLoginStatus.subscribe(value => {
      this.loginStatus = value;
      this.dataloaded = true;
    });
    this.dataService.userData
      .subscribe((user: User) => this.user = user);
    this.dataService.currentDashboardId
      .subscribe(dashboardId => {
        this.currentDashboardId = dashboardId;
      });
    this.dataService.currentSheetId
      .subscribe(sheetId => {
        this.currentSheetId = sheetId;
      });
    this.dataService.projectData
      .subscribe((project: Project) => {
        this.project = project;
        console.log('updated Project data');
        console.log("project: ", project);
        this.list = this.widgetList();
        console.log(this.list);
      });

    // on hover, change color of buttons
    $(document).ready(function() {
      $('.tbutton').hover(function() {
          $(this).addClass('ui-button-primary');
          $(this).removeClass('transparentButton');
          $(this).removeClass('ui-button-secondary');

        },
        function() {
          $(this).addClass('transparentButton');
          $(this).addClass('ui-button-secondary');
          $(this).removeClass('ui-button-primary');
        });
    });

    this.options = {
      itemChangeCallback: SheetContentComponent.itemChange,
      itemResizeCallback: SheetContentComponent.itemResize,
      gridType: GridType.Fit,
      displayGrid: DisplayGrid.Always,
      compactType: CompactType.None,
      margin: 10,
      outerMargin: true,
      cols: 100,
      rows:50,
      minCols: 100,
      //maxCols: 200,
      minRows: 50,
      //maxRows: 100,
      pushItems: false,
      pushDirections: {north: false, east: false, south: false, west: false},
      pushResizeItems: false,
      swap: false,
      disablePushOnDrag: true,
      disablePushOnResize: true,
      draggable: {
        enabled: true,
        stop: function (event, $element, widget) {
          console.log("dragable");
          this.saveInDatabase($element.el.id, event, 'position');
        }.bind(this)
      },
      resizable: {
        enabled: true,
        stop: function (event, $element, widget) {
          console.log("resizeable");
          console.log("widget ", widget);
          console.log("event ", event);
          console.log("elem ", $element);
          this.saveInDatabase($element.el.id, event, 'position');
          window.dispatchEvent(new Event('resize'));
        }.bind(this)
      }
    };
    this.connectToEntityStateSocket();
    this.connectToDeviceStatesSocket();
    this.connectNotificationToSocket();

  }

  protected connectToEntityStateSocket(): void {
    const connection = new WebSocket(`${environment.websocketProtocol}${environment.baseUrl}${environment.contextRoot}/${this.user.id}/${this.project.id}/webSocket/entitystatechanged`);
    // When the connection is open, send some data to the server
    connection.onopen = () => {
      console.log('Opened websocket connection with topic: entitystatechanged');
    };

    // Log errors
    connection.onerror = error => {
      if (error['error'] === 'Session invalid' || error['error'] === 'No session found') {
        this.router.navigate(['unauthorized']); }
      console.log('WebSocket Error ' + error);
    };

    // Log messages from the server
    connection.onmessage = messageEvent => {
      const data: EntityStatechangeResponse = JSON.parse(messageEvent.data);
      for (const dashboard of this.project.dashboards) {
        for (const sheet of dashboard.sheets) {
          for (const widget of sheet.widgets) {
            switch (widget.type) {
              case WidgetType.realtimeValueVisualization:
                this.setValueViewWidgetData(widget as ValueViewWidget, data);
                break;
              case WidgetType.lineChartVisualization:
              case WidgetType.doughnutChartVisualization:
              case WidgetType.sliderDeviceControl:
              case WidgetType.toggleDeviceControl:
              case WidgetType.stateDeviceControl:
                this.setRTChartWidgetData(<LineChartWidget|Doughnutchartwidget|SliderWidget|ToggleWidget|StateWidget|SliderWidget>widget, data);
                break;
              case WidgetType.realtimeAnomaly:
                this.setAnomalyRTChartWidgetData(<RealtimeAnomalyWidget>widget, data);
                break;
            }
          }
        }
      }
      console.log('Server: ', messageEvent.data);

    };
  }

  protected connectToDeviceStatesSocket(): void {
    const connection = new WebSocket(`${environment.websocketProtocol}${environment.baseUrl}${environment.contextRoot}/${this.user.id}/${this.project.id}/webSocket/devicestatuschanged`);
    // When the connection is open, send some data to the server
    connection.onopen = () => {
      console.log('Opened websocket connection with topic: devicestatuschanged');
    };

    // Log errors
    connection.onerror = error => {
      if (error['error'] === 'Session invalid' || error['error'] === 'No session found') {
        this.router.navigate(['unauthorized']); }
      console.log('WebSocket Error ' + error);
    };

    // Log messages from the server
    connection.onmessage = messageEvent => {
      const data: EntityStatechangeResponse = JSON.parse(messageEvent.data);
      for (const dashboard of this.project.dashboards) {
        for (const sheet of dashboard.sheets) {
          for (const widget of sheet.widgets) {
            switch (widget.type) {
              case WidgetType.doughnutChartVisualization:
                this.setValueViewWidgetData(widget as ValueViewWidget, data);
                break;
              case WidgetType.lineChartVisualization:
                this.setRTChartWidgetData(<LineChartWidget>widget, data);
                break;
              case WidgetType.realtimeAnomaly:
                this.setAnomalyRTChartWidgetData(<RealtimeAnomalyWidget>widget, data);
                break;
            }
          }
        }
      }
      console.log('Server: ', messageEvent.data);

    };
  }

  protected connectNotificationToSocket(): void {

    const connectionNotification = new WebSocket(`${environment.websocketProtocol}${environment.baseUrl}${environment.contextRoot}/${this.user.id}/${this.project.id}/webSocket/rulestatuschanged`);

    connectionNotification.onopen = () => {
      console.log('Opened websocket connection with topic: rulestatuschanged');
    };

    // Log errors
    connectionNotification.onerror = error => {
      if (error['error'] === 'Session invalid' || error['error'] === 'No session found') {
        this.router.navigate(['unauthorized']); }
      console.log('WebSocket Error ' + error);
    };

    // Log messages from the server
    connectionNotification.onmessage = messageEvent => {
      const data = JSON.parse(messageEvent.data);
      let status;

      switch (data.status.toLowerCase()) {
        case 'running' : {
          status = 'triggered';
          console.log('status =',status);

          break;
        }
        case 'idle' : {
          status = 'activated';

          break;
        }
        case 'disabled' : {
          status = 'deactivated';

          break;
        }
        default: {
          status = undefined;
          break;
        }
      }

      switch (data.statusDetail.toLowerCase()) {
        case 'disabled' : {
          if(!status){
            status = 'deactivated';
          }
          break;
        }
      }
      if (status) {
        this.notificationService.saveRuleNotification(data.rule.userId, data.rule, status);
      }
    };
  }

  /**
   * This method returns the widget list of the widget which are inherit in the current sheet.
   * @returns {Array<Widget>} the widget array
   */
  widgetList(): Array<Widget> {
    return this.project.dashboards
      .find(x => x.id === this.currentDashboardId).sheets
      .find(x => x.id === this.currentSheetId).widgets;
  }

  /**
   * This method sets the current widget id a user has interacted with last
   * @param widgetId the {@link Widget#id}
   */
  protected setCurrentWidgetId(widgetId: string): void {
    this.currentWidgetId = widgetId;
  }

  protected changeDeveloperMode(widget) {
    console.log("widget.isDeveloped: ", widget.isDeveloped);
    widget.isDeveloped = !widget.isDeveloped;
    console.log("widget.isDeveloped: ", widget.isDeveloped);
    this.saveInDatabase(widget.id, widget.isDeveloped, 'isDeveloped');
  }

  /**
   * This method saves the selected options into the database.
   * @param widgetId the id of the widget to save
   * @param value the value
   * @param field the field where to store
   */
  protected saveInDatabase(widgetId: string, value, field: string): void {
    this.databaseService.updateDocument(this.databaseService.WIDGETSCOLLECTION, widgetId, new Fieldvalue(field, value))
      .subscribe(result => {
      }, error => {
        if (error['error'] === 'Session invalid' || error['error'] === 'No session found') {
          this.router.navigate(['unauthorized']); }
        console.log('Error updating database entry ', error);
      });
  }

  protected setValueViewWidgetData(widget: ValueViewWidget, data: EntityStatechangeResponse) {
    // console.log('insetValueView');
    if (widget.deviceId === data.deviceId) {
      if (widget.entityId === data.entityId) {
        widget.value = data.value;
      }
    }
  }

  // type of chartData: Array<{data: number[] , label: string, entityId: string}> = [{'data': [0], label:'', entityId:''}];
  protected setRTChartWidgetData(widget: LineChartWidget|Doughnutchartwidget|ToggleWidget|SliderWidget|StateWidget, data: EntityStatechangeResponse){
    this.dataService.refreshRealtimeChart(data.dateTime, Number(data.value), widget.id, data.deviceId, data.entityId);
  }
  // type of chartData: Array<{data: number[] , label: string, entityId: string}> = [{'data': [0], label:'', entityId:''}];
  //protected setRTChartWidgetData(widget: RealTimeChartWidget, data: EntityStatechangeResponse){
   // this.dataService.refreshRealtimeChart(data.dateTime, Number(data.value), widget.id, data.deviceId, data.entityId);
  //}

  protected setAnomalyRTChartWidgetData(widget: RealtimeAnomalyWidget, data: EntityStatechangeResponse){
    this.dataService.refreshRealtimeAnomaly(data.dateTime, Number(data.value), Number(data.anomalyscore), widget.id, data.deviceId, data.entityId);
  }

  protected deleteWidget(widgetid:string){
    this.setCurrentWidgetId(widgetid);
    this.projectService.deleteWidget(widgetid);
  }

  // protected setRTAnomalyWidgetData(widget: RealtimeAnomalyWidget, data: EntityStatechangeResponse){
  //   this.dataService.refreshRealtimeAnomaly(data.dateTime, Number(data.value), widget.id, data.deviceId, data.entityId, data.);
  // }
// dynamically change Font size based on width of widget
  static measureText(pText: string, pFontSize: number, pFamily: string, pWeight: string): { 'width': number, 'height': number } {
    let lDiv = document.createElement('div');
    lDiv.style.fontFamily = pFamily;
    lDiv.style.fontWeight = pWeight;
    lDiv.style.fontSize = '' + pFontSize + 'px';
    lDiv.style.position = 'absolute';
    lDiv.style.left = '-1000';
    lDiv.style.top = '-1000';
    lDiv.innerHTML = '<div>pText</div>';
    document.body.appendChild(lDiv);
    //console.log("pseudoelem: ", lDiv.style);
    console.log("pseudoelem: ", lDiv.innerHTML);
    const lResult = {
      width: lDiv.clientWidth,
      height: lDiv.clientHeight
    };

    document.body.removeChild(lDiv);
    lDiv = null;
    return lResult;
  }

  static fitText(el): void {
    console.log('FITTEXT');
    const text = el.textContent;
    let style = window.getComputedStyle(el, null).getPropertyValue('font-size');
    let fsize = parseFloat(style);
    let fsizeString: string;
    const fam = window.getComputedStyle(el, null).getPropertyValue('font-family');
    const weight = window.getComputedStyle(el, null).getPropertyValue('font-weight');
    let width = parseFloat(window.getComputedStyle(el, null).getPropertyValue('width'));
    let height = parseFloat(window.getComputedStyle(el, null).getPropertyValue('height'));

    const measured = this.measureText(text, fsize, fam, weight);
    console.log("text: ", text);
    console.log("fam: ", fam);
    console.log("width: ", measured.width, " and ", width);
    console.log("height: ", measured.height, " and ", height);
    // if both widht and height are smaller than the widget size, than increase font
    if ( (measured.width < width ) && (measured.height < height) ) {
      console.log('increasing');
      let m = this.measureText(text, fsize, fam, weight);
      let u = 0;
      // while both width and height are smaller than the widget, increase
      while ((m.width < width) && (m.height < height) && u < 5000) {
        fsizeString = fsize + 0.5 + 'px';
        el.style.fontSize = fsizeString;
        // window.getComputedStyle(el, null).setProperty('font-size', fsizeString);
        style = window.getComputedStyle(el, null).getPropertyValue('font-size');
        fsize = parseFloat(style);
        m = this.measureText(text, fsize, fam, weight);
        width = parseFloat(window.getComputedStyle(el, null).getPropertyValue('width'));
        height = parseFloat(window.getComputedStyle(el, null).getPropertyValue('height'));
        u++;
      }
      measured.width = m.width;
      measured.height = m.height;
      console.log("u1: ", u);
    }
    console.log("width: ", measured.width, " and ", width);
    console.log("height: ", measured.height, " and ", height);
    if ((measured.width > width) || (measured.height > height)) {
      console.log('reducing');
      style = window.getComputedStyle(el, null).getPropertyValue('font-size');
      fsize = parseFloat(style);
      let m = this.measureText(text, fsize, fam, weight);
      let n = 0;
      while (((m.width > width) || (m.height > height)) && n < 5000) {
        fsizeString = fsize - 0.5 + 'px';
        el.style.fontSize = fsizeString;
        //window.getComputedStyle(el, null).setProperty('font-size', fsizeString);

        style = window.getComputedStyle(el, null).getPropertyValue('font-size');
        fsize = parseFloat(style);
        m = this.measureText(text, fsize, fam, weight);
        width = parseFloat(window.getComputedStyle(el, null).getPropertyValue('width'));
        height = parseFloat(window.getComputedStyle(el, null).getPropertyValue('height'));
        n++;
        console.log("width: ", measured.width, " and ", width);
        console.log("height: ", measured.height, " and ", height);
      }
      console.log("n: ", n);
    }

  }

  getCurrentWidget(): void {
    console.log("mousedown");
    console.log('currentwidget: ',document.getElementById(this.currentWidgetId));
  }

  protected forwardMsgToDashboardComponent($event): void {
    this.messageEvent.emit($event);
  }


}
