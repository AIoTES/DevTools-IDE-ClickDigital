import {Component, Input, OnInit} from '@angular/core';
import {DataService} from '../../../../../../../services/data.service';
import {DeviceManagerService} from '../../../../../../../services/devicemanager.service';
import {Project} from '../../../../../../../models/frontend/project';
import {WidgetType} from '../../../../../../../models/frontend/widget';
import {SelectItem} from 'primeng/api';
import {User} from '../../../../../../../models/frontend/user';
import {Device} from '../../../../../../../models/backend/device';
import {Action} from '../../../../../../../models/backend/action';
import {Fieldvalue} from '../../../../../../../models/frontend/fieldvalue';
import {DatabaseService} from '../../../../../../../services/database.service';
import {ToggleWidget} from "../../../../../../../models/frontend/togglewidget";
import { Router } from '@angular/router';

/**

 * This component processes a {@link WidgetType#toggleDeviceControl} Widget. This type of widget is to control
 * an entity (action) of a device. That means it sends commands e.g. toggle a switch
 * to the backend. It uses the {@link ToggleWidget} model to represent a widget.
 */
@Component({
  selector: 'toggle-control-device',
  templateUrl: './toggle-control-device.component.html',
  styleUrls: ['./toggle-control-device.component.css']
})
export class ToggleControlDeviceComponent implements OnInit {
  @Input() currentWidget: ToggleWidget;
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
  public selectedONLabel: string;
  public selectedOFFLabel: string;
  protected icons: Array<SelectItem> = [];

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
    this.selectedPosition = this.currentWidget.controlPosition;
    this.selectedONLabel = this.currentWidget.toggleLabelOn;
    this.selectedOFFLabel = this.currentWidget.toggleLabelOff;

    // if new data is available, the slider state gets updated
    this.dataService.refreshChartNow
      .subscribe(result => {
        if (result !== undefined && this.selectedDevice === result.deviceId &&
          this.selectedAction === result.entityId) {
          //set action
          this.currentWidget.value = (result.value === 0)? false:true;
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
                    for (const listElem2 of this.actionList) {
                      if (listElem2.value === this.currentWidget.entityId) {
                        this.selectedAction = listElem2.value;
                        this.initializeValue();
                        break;
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
   * This method fills the device dropdown with all devices from the backend which support
   * this type o widget.
   */
  private refreshDeviceDropdown(): void {
    this.devicesList = [];
    this.devicemanager.getAllDevices(this.user.id, this.project.id)
      .subscribe((devices: Array<Device>) => {
          for (const device of devices) {
            if (device.actions.length > 0) { // filter just devices with actions
              for (const action of device.actions) {
                // filter for devices which have slideable actions
                if (action.states !== null) {
                  if (action.valueable === false && action.states.length < 3) {
                    this.devicesList.push({label: device.name, value: device.deviceId});
                    break;
                  }
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
    this.devicemanager.getDeviceById(this.selectedDevice, this.user.id, this.project.id)
      .subscribe((device: Device) => {
          const actions = device.actions;
          this.actionList = [];
          for (let i = 0; i < actions.length; i++) {
            if (actions[i].states !== null) {
              if (actions[i].valueable === false && actions[i].states !== undefined && actions[i].states.length === 2) {
                this.actionList.push({label: actions[i].name, value: actions[i].id});
              }
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
   * This method sends a command (value) to the backend.
   * @param widgetValue the command set through the widget surface
   */
  protected sendCommand(widgetValue: boolean): void {
    this.devicemanager.getDeviceById(this.selectedDevice, this.user.id, this.project.id)
      .subscribe((device: Device) => {
          const action: Action = device.actions.find(x => x.id === this.selectedAction);
          let command = 0;
          if (widgetValue) {
            command = 1;
          }
          this.devicemanager.ChangeActionState(this.user.id, this.project.id, device.deviceId, action.id, command)
            .subscribe(result => {
                // log result.message
                console.log('new value was sent to backend server');
              },
              err => {
                if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
                  this.router.navigate(['unauthorized']); }
                console.log('new value could not been sent to backend server', err);
              });
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
    this.currentWidget.toggleLabelOff = this.selectedOFFLabel;
    this.currentWidget.toggleLabelOn = this.selectedONLabel;
    this.saveInDatabase(this.currentWidget.deviceId, 'deviceId');
    this.saveInDatabase(this.currentWidget.entityId, 'entityId');
    this.saveInDatabase(this.currentWidget.icon, 'icon');
    this.saveInDatabase(this.currentWidget.fontSize, 'fontSize');
    this.saveInDatabase(this.currentWidget.toggleLabelOn, 'toggleLabelOn');
    this.saveInDatabase(this.currentWidget.toggleLabelOff, 'toggleLabelOff');
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
    this.selectedONLabel = this.currentWidget.toggleLabelOn;
    this.selectedOFFLabel = this.currentWidget.toggleLabelOff;
  }

  /**
   * This method initializes the value for a widget to display by requesting it from the backend once.
   */
  protected initializeValue(): void {
    this.devicemanager.GetActionValueOrState(this.selectedAction, this.selectedDevice, this.user.id, this.project.id)
      .subscribe(result => {
          console.log('Value init ', result);
        if (result === 0) {
          this.currentWidget.value = false;
        } else if (result === 1) {
          this.currentWidget.value = true;
        } else {
          console.log('Value could not be initialized. Invalid value: ', result);
        }
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
