import {Component, Input, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import {DataService} from '../../../../../../../services/data.service';
import {DeviceManagerService} from '../../../../../../../services/devicemanager.service';
import {Project} from '../../../../../../../models/frontend/project';
import {WidgetType} from '../../../../../../../models/frontend/widget';
import {SelectItem} from 'primeng/api';
import {Device} from '../../../../../../../models/backend/device';
import {SliderWidget} from '../../../../../../../models/frontend/sliderwidget';
import {Action} from '../../../../../../../models/backend/action';
import {Fieldvalue} from '../../../../../../../models/frontend/fieldvalue';
import {DatabaseService} from '../../../../../../../services/database.service';
import {User} from "../../../../../../../models/frontend/user";

/**

 * This component processes a {@link WidgetType#sliderDeviceControl} Widget. This type of widget is to control
 * an entity (action) of a device. That means it sends commands e.g. toggle a switch
 * to the backend. It uses the {@link SliderWidget} model to represent a widget.
 */
@Component({
  selector: 'slider-control-device',
  templateUrl: './slider-control-device.component.html',
  styleUrls: ['./slider-control-device.component.css']
})
export class SliderControlDeviceComponent implements OnInit {
  @Input() currentWidget: SliderWidget;
  protected project: Project;
  protected user: User;
  protected loginStatus: number;
  protected devicesList: Array<SelectItem> = [];
  protected actionList: Array<SelectItem> = [];
  protected displaySettings = false;
  public selectedDevice: string;
  public selectedAction: string;
  public selectedPosition: string;
  public selectedIcon: string;
  protected icons: Array<SelectItem> = [];
  protected widgetType = WidgetType;

  constructor(private dataService: DataService, private databaseService: DatabaseService, private devicemanager: DeviceManagerService, private router: Router) {
  }

  ngOnInit(): void {
    this.dataService.projectData.subscribe(value => this.project = value);
    this.dataService.userData.subscribe(value => this.user = value);
    this.dataService.currentLoginStatus.subscribe(value => this.loginStatus = value);

    this.initDropdowns();

    this.icons = [
      {value: 'fa fa-power-off fa-2x', icon: 'fa fa-power-off'},
      {value: 'fa fa-thermometer-full fa-2x', icon: 'fa fa-thermometer-full'},
      {value: 'fa fa-volume-down fa-2x', icon: 'fa fa-volume-down'},
      {value: 'fa fa-play-circle-o fa-2x', icon: 'fa fa-play-circle-o'},
      {value: 'fa fa-lightbulb-o fa-2x', icon: 'fa fa-lightbulb-o'},
      {value: 'fa fa-sun-o fa-2x', icon: 'fa fa-sun-o'}
    ];

    // set current selected Icon based on Icon in Database
    for (const item of this.icons) {
      if (item.value === this.currentWidget.icon) {
        this.selectedIcon = item.value;
      }
    }
    // set current selected Position based on Position in Database
    this.selectedPosition = this.currentWidget.controlPosition;

    // if new data is available, the slider state gets updated
    this.dataService.refreshChartNow
      .subscribe(result => {
        "hello"
        if (result !== undefined && this.selectedDevice === result.deviceId &&
          this.selectedAction === result.entityId) {
          //set action
          this.currentWidget.value = result.value;
        }
      });
  }

  private initDropdowns():void {
    this.devicesList = [];
    this.devicemanager.getAllDevices(this.user.id, this.project.id).subscribe(data => {
        for (const device of data) {
          if (device.actions.length > 0) { // filter just devices with actions
            for (const action of device.actions) {
              // filter for devices which have slideable actions
              if (action.valueable === true) {
                this.devicesList.push({label: device.name, value: device.deviceId});
                break;
              }
            }
          }
        }
        if (this.currentWidget.deviceId != undefined){
          // set init device
          for (const listElem of this.devicesList){
              if (listElem.value === this.currentWidget.deviceId) {
                this.selectedDevice = listElem.value;
                // check if action is selected
                this.devicemanager.getDeviceById(this.selectedDevice.toString(), this.user.id, this.project.id)
                  .subscribe((device: Device) => {
                      this.actionList = [];
                      if (device.actions !== null) {
                        for (const action of device.actions) {
                          this.actionList.push({label: action.name, value: action.id});
                        }
                      }
                      //set init action
                      for (const listElem of this.actionList) {
                        if (listElem.value === this.currentWidget.entityId) {
                          this.selectedAction = listElem.value;
                          this.initializeValue();
                        }
                      }
                    },
                    error => {
                      console.log('Error requesting devices from backend ', error);
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
   * This method fills the device dropdown with all devices from the backend.
   */
  private refreshDeviceDropdown(): void {
    this.devicesList = [];
    this.devicemanager.getAllDevices(this.user.id, this.project.id)
      .subscribe((devices: Array<Device>) => {
          for (const device of devices) {
            if (device.actions.length > 0) { // filter just devices with actions
              for (const action of device.actions) {
                // filter for devices which have slideable actions
                if (this.currentWidget.type === WidgetType.sliderDeviceControl && action.valueable === true) {
                  this.devicesList.push({label: device.name, value: device.deviceId});
                  break;
                }
              }
            }
          }
        },
        err => {
          if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
            this.router.navigate(['unauthorized']); }
          console.log('Error while requesting devices from backend ', err);
        });
    this.devicesList.sort((a, b) => a.label.localeCompare(b.label));
  }

  /**
   * Updates the actions which you can choose in the action dropdown, so that you can only select capable
   * actions.
   */
  protected updateActionDropdown(): void {
    this.currentWidget.entityId = undefined;
    this.selectedAction = "";
    this.devicemanager.getDeviceById(this.selectedDevice, this.user.id, this.project.id)
      .subscribe((device: Device) => {
          const actions = device.actions;
          this.actionList = [];
          for (let i = 0; i < actions.length; i++) {
            if (actions[i].valueable === true) {
              this.actionList.push({label: actions[i].name, value: actions[i].id});
            }
          }
        }, err => {
        if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
          this.router.navigate(['unauthorized']); }
          console.log('Device actions could not be pulled  from the backend ', err);
        }
      );
  }

  /**
   * This method configure the displayed slider by mapping the requested data from backend to the
   * specific options.
   */
  protected configureSliderProperties(): void {
    this.devicemanager.getDeviceById(this.selectedDevice, this.user.id, this.project.id)
      .subscribe((device: Device) => {
        const action = device.actions.find(x => x.id === this.selectedAction);
        if (action.valueOption.percentage === true) {
          this.currentWidget.minValue = 0;
          this.currentWidget.maxValue = 100;
        } else {
          this.currentWidget.minValue = action.valueOption.minimum;
          this.currentWidget.maxValue = action.valueOption.maximum;
        }
      }, err => {
        if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
          this.router.navigate(['unauthorized']); }
        console.log('Device could not be pulled  from the backend ', err);
      });
  }

  /**
   * This method sends a command (value) to the backend.
   * @param widgetValue the command setted through the widget surface
   */
  protected changeSliderValue(widgetValue: number): void {
    this.devicemanager.getDeviceById(this.currentWidget.deviceId, this.user.id, this.project.id)
      .subscribe((device: Device) => {
          const action: Action = device.actions.find(x => x.id === this.currentWidget.entityId);
          if (widgetValue < this.currentWidget.minValue || widgetValue > this.currentWidget.maxValue) {
            console.log('Error setting slider value: Value is not evaluable');
          } else {
            this.devicemanager.ChangeActionState(this.user.id, this.project.id, device.deviceId, action.id, widgetValue)
              .subscribe(result => {
                  // log result.message
                  console.log('new value was sent to backend server');
                },
                err => {
                  if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
                    this.router.navigate(['unauthorized']); }
                  console.log('new value could not been sent to backend server', err);
                });
          }
        },
        error => {
          if (error['error'] === 'Session invalid' || error['error'] === 'No session found') {
            this.router.navigate(['unauthorized']); }
          console.log('Device could not be pulled from backend', error);
        });
  }


  /**
   * This method gets called when the user presses the apply button in the
   * widget properties. It saves the properties in the database and disables the popup.
   * It call the value initialization.
   */
  applySettings(): void {
    this.displaySettings = false;
    this.currentWidget.deviceId = this.selectedDevice;
    this.currentWidget.entityId = this.selectedAction;
    this.currentWidget.controlPosition = this.selectedPosition;
    this.currentWidget.icon = this.selectedIcon;
    this.saveInDatabase(this.currentWidget.deviceId, 'deviceId');
    this.saveInDatabase(this.currentWidget.entityId, 'entityId');
    this.saveInDatabase(this.currentWidget.icon, 'icon');
    this.saveInDatabase(this.currentWidget.fontSize, 'fontSize');
    this.saveInDatabase(this.currentWidget.minValue, 'minValue');
    this.saveInDatabase(this.currentWidget.maxValue, 'maxValue');
    this.saveInDatabase(this.currentWidget.controlPosition, 'controlPosition');

    this.initializeValue();
  }
  // reset all changes made in the settings dialog
  abortChanges():void{
    this.displaySettings=false;
    this.selectedPosition = this.currentWidget.controlPosition;
    this.selectedIcon = this.currentWidget.icon;
    this.selectedDevice = this.currentWidget.deviceId;
    this.selectedAction = this.currentWidget.entityId;
  }

  /**
   * This method initializes the value for a widget to display by requesting it from the backend once.
   */
  protected initializeValue(): void {
    this.devicemanager.GetActionValueOrState(this.currentWidget.entityId, this.currentWidget.deviceId, this.user.id, this.project.id)
      .subscribe(result => {
          this.currentWidget.value = result;
        },
        err => {
          if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
            this.router.navigate(['unauthorized']); }
          console.log('Error while requesting action state or value', err);
        });
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

}
