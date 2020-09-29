/*
* Copyright 2017-2020 Fraunhofer Institute for Computer Graphics Research IGD
*
* Licensed under the GNU AFFERO GENERAL PUBLIC LICENSE, Version 3, 19 November 2007
* You may not use this work except in compliance with the Version 3 Licence.
* You may obtain a copy of the Licence at:
* https://www.gnu.org/licenses/agpl-3.0.html
*
* See the Licence for the specific permissions and limitations under the Licence.
*/

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DatabaseService} from '../../../../../../../services/database.service';
import {DataService} from '../../../../../../../services/data.service';
import {VisualManagerService} from '../../../../../../../services/visualmanager.service';
import {DeviceManagerService} from '../../../../../../../services/devicemanager.service';
import {User} from '../../../../../../../models/frontend/user';
import {Project} from '../../../../../../../models/frontend/project';
import {EntityType, ValueViewWidget} from '../../../../../../../models/frontend/valueviewwidget';
import {Device} from '../../../../../../../models/backend/device';
import {Fieldvalue} from '../../../../../../../models/frontend/fieldvalue';
import {SelectItem} from 'primeng/api';
import {SensorDataModel} from '../../../../../../../models/backend/sensordatamodel';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {matchOtherValidator} from "../../../../../../../custom-validation";
import { Router } from '@angular/router';

/**

 * This component processes a {@link WidgetType#realtimeValueVisualization} Widget. This type of widget is to represent
 * the status of an entity of a device. That means it handles the representation of e.g. a action of a switch
 * or the value of a sensor in realtime. It uses the {@link ValueViewWidget} model to represent a widget.
 */
@Component({
  selector: 'realtime-value-visualization',
  templateUrl: './realtime-value-visualization.component.html',
  styleUrls: ['./realtime-value-visualization.component.css']
})
export class RealtimeValueVisualizationComponent implements OnInit {

  constructor(private dataService: DataService,
              private databaseService: DatabaseService,
              private devicemanager: DeviceManagerService,
              private visualmanager: VisualManagerService,
              private fb: FormBuilder,
              private router: Router) {
  }

  /**
   * The current widget passed from {@link SheetContentComponent}
   */
  @Input() currentWidget: ValueViewWidget;

  @Output() resizeFont = new EventEmitter<HTMLElement>();

  /**
   * Types for user's preselection which devices to display.
   */
  valueType = EntityType;

  /**
   * The current user
   */
  protected user: User;
  /**
   * The current project
   */
  protected project: Project;

  /**
   * The current value to display on the widget
   */
  protected value: string;

  /**
   * Indicates if the settings popup is visible or not
   */
  displaySettings = false;

  /**
   * Label of an entity value
   */
  label;
  /**
   * Unit of an entity value
   */
  unit;

  /**
   * The current login status of the user to decide wheter to display in
   * developer or enduser mode.
   */
  protected loginStatus: number;

  /**
   * An array to represent the device selection dropdown
   */
  protected devicesList: Array<SelectItem> = [];
  /**
   * An array to represent the sensor selection dropdown
   */
  protected sensorList: Array<SelectItem> = [];
  /**
   * An array to represent the action selection dropdown
   */
  protected actionList: Array<SelectItem> = [];

  /**
   * Array for user's preselection if he want to display a sensor's or an action's entity.
   */
  protected preSelect: Array<SelectItem> = [];

  protected isCompletedField;

  selectedDevice: string;
  selectedEntity: string;
  selectedPosition: string;
  selectedEntityType: string;

  ngOnInit(): void {
    this.dataService.currentLoginStatus.subscribe(value => this.loginStatus = value);
    this.dataService.userData.subscribe(value => this.user = value);
    this.dataService.projectData.subscribe(value => {
      this.project = value;
    });

    this.initDeviceDropdown();

    this.preSelect = [
      {label: 'Sensor', value: EntityType.sensor},
      {label: 'Action', value: EntityType.action}
    ];

    this.selectedPosition = this.currentWidget.controlPosition;
    this.selectedEntityType = this.currentWidget.entityType;
    if (this.currentWidget.entityId !== '' && this.currentWidget.deviceId !== '') {
      this.selectedDevice = this.currentWidget.deviceId;
      this.selectedEntity = this.currentWidget.entityId;
      this.getRealtimeData();
    }
    this.checkCompletedField();

  }


  private initDeviceDropdown():void {
    this.devicesList = [];
    this.devicemanager.getAllDevices(this.user.id, this.project.id).subscribe(data => {
        for (const device of data) {
          this.devicesList.push({label: device.name, value: device.deviceId});
        }
        if (this.currentWidget.deviceId != undefined){
          //init device
          for (const listElem of this.devicesList){
            if (listElem.value === this.currentWidget.deviceId) {
              //set this device as selected in dropdown
              console.log("set Selected Device: ", listElem.value);
              this.selectedDevice = listElem.value;
              //create Sensor/Action Lists
              this.devicemanager.getDeviceById(this.selectedDevice, this.user.id, this.project.id)
                .subscribe((device: Device) => {
                    if(this.selectedEntityType === String(EntityType.sensor)) {
                      this.sensorList = [];
                      for (const sensor of device.sensors) {
                        //push all sensor values to sensorList
                        this.sensorList.push({label: sensor.name, value: sensor.id});
                        this.setCompletedField(false);
                      }
                      // look for selected sensor
                      for (let sensor of this.sensorList) {
                        if (sensor.value === this.currentWidget.entityId) {
                          //set selected sensor
                          this.selectedEntity = sensor.value;
                          this.getRealtimeData();
                        }
                      }
                    } else if (this.selectedEntityType === String(EntityType.action)){
                      this.actionList = [];
                      for (const action of device.actions) {
                        //push all sensor values to sensorList
                        this.actionList.push({label: action.name, value: action.id});
                        this.setCompletedField(false);
                      }
                      // look for selected sensor
                      for (let action of this.actionList) {
                        if (action.value === this.currentWidget.entityId) {
                          //set selected sensor
                          this.selectedEntity = action.value;
                          this.getRealtimeData();
                        }
                      }
                    }
                  },
                  error => {
                    if (error['error'] === 'Session invalid' || error['error'] === 'No session found') {
                      this.router.navigate(['unauthorized']); }
                    console.log('Devices could not been pulled from backend: ', error);
                  });
            }
          }
        }
      },
      err => {
        console.log(err);
      });
  }

  /**
   * This method builds the device selection dropdown menu.
   */
  protected refreshDeviceDropdown(): void {
    this.devicesList = [];
    this.devicemanager.getAllDevices(this.user.id, this.project.id)
      .subscribe((devices: Array<Device>) => {
          for (const device of devices) { // TODO fehler, eine action kann auch ein valuetyp repräsentieren und ein sensor kann auch ein action haben
            if (this.selectedEntityType === EntityType.sensor && device.sensors.length > 0) { // just add devices to dropdown that have a sensor
              this.devicesList.push({label: device.name, value: device.deviceId});
            } else if (this.selectedEntityType === EntityType.action && device.actions.length > 0) { // just add devices to dropdown that have an action
              this.devicesList.push({label: device.name, value: device.deviceId});
            }
          }
          this.setCompletedField(false);
        },
        err => {
          if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
            this.router.navigate(['unauthorized']); }
          console.log('error devicemanager');
          console.log(err);
        });

  }

  /**
   * This method decides whether to build the sensor or the dropdown menu.
   */
  protected updateDropdowns(): void {
    if (this.selectedEntityType === EntityType.action) {
      this.updateActionDropdown();

    } else {
      this.updateSensorDropdown();
    }
  }

  /**
   * This metod builds the sensor selection dropdown.
   */
  protected updateSensorDropdown(): void {
    this.devicemanager.getDeviceById(this.selectedDevice, this.user.id, this.project.id)
      .subscribe((device: Device) => {
          this.sensorList = [];
          for (const sensor of device.sensors) {
            this.sensorList.push({label: sensor.name, value: sensor.id});
            this.setCompletedField(false);
          }
        },
        error => {
          if (error['error'] === 'Session invalid' || error['error'] === 'No session found') {
            this.router.navigate(['unauthorized']); }
          console.log('Devices could not been pulled from backend: ', error);
        });

  }

  /** This method builds the action selection dropdown.
   *
   */
  protected updateActionDropdown(): void {
    this.devicemanager.getDeviceById(this.selectedDevice, this.user.id, this.project.id)
      .subscribe((device: Device) => {
          this.actionList = [];
          for (const action of device.actions) {
            this.actionList.push({label: action.name, value: action.id});
            this.setCompletedField(false);
          }
        },
        error => {
          if (error['error'] === 'Session invalid' || error['error'] === 'No session found') {
            this.router.navigate(['unauthorized']); }
          console.log('Devices could not been pulled from backend: ', error);
        });
  }

  // TODO make initMethode daraus, sonst websocket
  /**
   * This method pulls the realtime data from the backend once.
   */
  getRealtimeData(): void {
    this.visualmanager.getNowData(this.selectedDevice, this.selectedEntity, this.user.id, this.project.id)
      .subscribe((sensorDataModel: SensorDataModel) => {
          if (sensorDataModel.Values[0].FloatValue !== null) {
            this.currentWidget.value = sensorDataModel.Values[0].FloatValue.toString();
            //this.triggerResizeFontEvent();
          } else {
            this.currentWidget.value = sensorDataModel.Values[0].StringValue;
           //this.triggerResizeFontEvent();
          }
          this.unit = sensorDataModel.Unit;
          this.label = sensorDataModel.Values[0].DateTime;

        },
        err => {
          if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
            this.router.navigate(['unauthorized']); }
          console.log('Error requesting data from backend: ', err);
        });
  }

  /**
   * This method gets called when the user applies his widget setttings.
   */
  applySettings(): void {
    this.displaySettings = false;
    this.currentWidget.deviceId = this.selectedDevice;
    this.currentWidget.entityType = this.selectedEntityType;
    this.currentWidget.entityId = this.selectedEntity;
    this.currentWidget.controlPosition = this.selectedPosition;
    this.getRealtimeData();
    //this.triggerResizeFontEvent();

    this.saveInDatabase(this.currentWidget.entityType, 'entityType');
    this.saveInDatabase(this.currentWidget.deviceId, 'deviceId');
    this.saveInDatabase(this.currentWidget.entityId, 'entityId');
    this.saveInDatabase(this.currentWidget.controlPosition, 'controlPosition');
  }

  abortChanges():void{
    this.displaySettings=false;
    this.selectedEntityType = this.currentWidget.entityType;
    this.selectedPosition = this.currentWidget.controlPosition;
    this.selectedDevice = this.currentWidget.deviceId;
    this.selectedEntity = this.currentWidget.entityId;
  }
  /**
   * This method saves the selected options into the database.
   * @param value the value
   * @param field the field where to store
   */
  protected saveInDatabase(value, field: string): void {
    this.databaseService.updateDocument(this.databaseService.WIDGETSCOLLECTION, this.currentWidget.id, new Fieldvalue(field, value))
      .subscribe(result => {
      }, error => {
        if (error['error'] === 'Session invalid' || error['error'] === 'No session found') {
          this.router.navigate(['unauthorized']); }
        console.log('Error updating database entry ', error);
      });
  }

  protected setCompletedField(bool: Boolean) {
    this.isCompletedField = bool;
  }

  protected checkCompletedField(){
    if (this.currentWidget.deviceId && this.currentWidget.entityType && this.currentWidget.entityId) {
      this.setCompletedField(true);
    } else {
      this.setCompletedField(false);
    }
  }

  // resize Font event to autoadjust font size of device value
  protected triggerResizeFontEvent(){
    // trigger dynamically resizefont event
    const elements = document.getElementsByClassName('realTimeFont');
    for (let i = 0; i < elements.length; i++) {
      this.resizeFont.emit(elements[i] as HTMLElement);
    }
  }



}
