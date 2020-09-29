import {Component, Input, OnInit} from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { Calculation } from '../../../../../../../models/frontend/polarareachartwidget';
import {DeviceManagerService} from '../../../../../../../services/devicemanager.service';
import {DataService} from '../../../../../../../services/data.service';
import {Widget} from "../../../../../../../models/frontend/widget";
import {Project} from '../../../../../../../models/frontend/project';
import { Router } from '@angular/router';
import {Device} from "../../../../../../../models/backend/device";

@Component({
  selector: 'app-add-device',
  templateUrl: './add-device.component.html',
  styleUrls: ['./add-device.component.css']
})
export class AddDeviceComponent implements OnInit {
  @Input() currentWidget: Widget;
  protected project: Project;
  protected name: string;
  protected serial: string;
  private _loginStatus: number;
  protected currentLoginUUID: string;
  protected protocols: Array<string> = ['protocol1','protocol2'];
  protected displaySettings: boolean;
  protected selectedPlatform;
  protected selectedDevice;
  protected selectedLocation;
  protected selectedTags: Array<String>;
  protected locations;
  protected sensorTypes;
  protected actuatorTypes;
  protected platforms;
  protected devices;
  protected sensors;
  protected actuators;
  protected tags: Array<string>;
  protected tagNumber: number;
  isSuccess: boolean;
  isFail: boolean;
  isSensorUpdated: boolean;
  isSensorUpdatedFAILED: boolean;
  isLocationFailed: boolean;
  protected addingService = 0; // represents which adding fields should be shown. Default: 0- nothing to display , 1- Openhab, 2- Aiotea
  protected externalDeviceId: string;

  get loginStatus(): number {
    return this._loginStatus;
  }

  constructor(private dataService: DataService,
              private devicemanager: DeviceManagerService, private router: Router) {
  }

  ngOnInit(): void {
    this.dataService.projectData.subscribe(value => this.project = value);
    this.dataService.currentLoginStatus.subscribe(value => this._loginStatus = value);
    this.dataService.currentLoginUUID.subscribe(value => this.currentLoginUUID = value);
    this.displaySettings=false;
    this.isFail=false;
    this.isSuccess=false;
    this.isSensorUpdated=false;
    this.isSensorUpdatedFAILED = false;
    this.isLocationFailed=false;
    this.tags=[];
    this.sensorTypes=[];
    this.actuatorTypes=[];
    this.locations=[];
    this.sensors = [];
    this.actuators= [];

    this.devicemanager.getAllPlatforms(this.currentLoginUUID, this.project.id).subscribe(result => {
        this.platforms = result;
      },
      err => {
        if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
          this.router.navigate(['unauthorized']); }
        console.log(err);
      });
    this.devicemanager.getAllLocations(this.currentLoginUUID, this.project.id).subscribe(result => {
        this.locations = result.map(elem => {
          return {name: elem, value: elem};
        });
      },
      err => {
        if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
          this.router.navigate(['unauthorized']); }
        console.log(err);
      });
    this.devicemanager.getAllSensorTypes(this.currentLoginUUID, this.project.id).subscribe(result => {
      console.log(result.types);
        this.sensorTypes = result.types.map(elem => {
          return {name: elem.type, value: elem.type};
        });
      },
      err => {
        if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
          this.router.navigate(['unauthorized']); }
        console.log(err);
      });
    this.devicemanager.getAllActuatorTypes(this.currentLoginUUID, this.project.id).subscribe(result => {
        this.actuatorTypes = result.map(elem => {
          return {name: elem, value: elem};
        });
      },
      err => {
        if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
          this.router.navigate(['unauthorized']); }
        console.log(err);
      });
  }

  protected updateInput(): void {
    let i = 0;
    while (i < this.tagNumber) {
      i++;
      this.tags.push(i.toString());
    }
  }

  protected updateDevices(): void {
    this.selectedDevice = undefined;
    this.devicemanager.searchForDevices(this.selectedPlatform['platformId'], this.currentLoginUUID, this.project.id).subscribe(result => {
        this.devices = result;
        this.devices = result;
      },
      err => {
        if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
          this.router.navigate(['unauthorized']); }
        console.log(err);
      });

  }

// trackingfunction
  protected trackPlatform(index, platform): any {
    return platform;
  }

  /**
   * This method updates the {@link addingService} regarding to
   * what the user selected from the platform.
   */
  protected updateAddingService(): void{
    console.log("Selecte Platform: ", this.selectedPlatform);
    if(this.selectedPlatform['platformId'].includes('openHab'))
      this.addingService = 1;
    else if (this.selectedPlatform['platformId'].includes('aiotes'))
      this.addingService = 2;
    else
      this.addingService = 0;
  }

  // closes Pop-up and adds the device to the devicelist
  protected addDevice(): void {
    if (this.name === '') {
      this.name = this.selectedDevice;
    }
    this.devicemanager.addDevice(this.name, this.selectedPlatform['platformId'], this.selectedDevice, this.serial,
      this.tags, this.selectedLocation.value, this.currentLoginUUID, this.project.id, this.externalDeviceId).subscribe(result => {
        // log result.message
        console.log('AddDevice was sent to backend server');
        let device: Device;
        this.devicemanager.getDevicesByLocation(this.selectedLocation.value,this.currentLoginUUID, this.project.id).subscribe(list  => {
          console.log("list: ", list);
          for (const device of list){
            console.log("device.name ", device.name);
            console.log("selectedDevice ", this.selectedDevice.name);
            console.log("this.name ", this.name);
            if (device.name === this.selectedDevice.name || device.name === this.name ){
              // fill dropdown Lists of sensors and actuators
              console.log("yes");
              if (device.sensors !== undefined && device.sensors.length >0 ) {
                this.sensors = device.sensors.map(elem => {
                  return {id: elem.id, name: elem.name, type: '', deviceId: device.deviceId};
                });
                console.log("sensors: ", this.sensors);
              }
              if (device.actuators !== undefined && device.actuators.length >0) {
                this.actuators = device.actuators.map(elem => {
                  return {id: elem.id, name: elem.name, type: ''};
                });
                console.log("actuators: ", this.actuators);
              }
              if (this.sensors.length > 0 ) {
                this.displaySettings = true;
              } else {
                this.clear();
              }
              break;
              }

            }

            this.isSuccess=true;

            // now open the popup for the type configuration of the entities
            setTimeout(() => {
              this.isSuccess=false;
            }, 3000);

        },
        err => {
          if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
            this.router.navigate(['unauthorized']); }
          console.log(err);
          this.isLocationFailed=true;
          setTimeout(() => {
            this.isLocationFailed=false;
          }, 3000);

        });
      },
      err => {
        if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
          this.router.navigate(['unauthorized']); }
        console.log(err);
        this.isFail=true;
        console.log('AddDevice could not been sent to backend server');
        setTimeout(() => {
          this.isFail=false;
        }, 3000);

      });

  }

  protected addTypesToDevice(): void {
    this.displaySettings = false;
    let observables: Observable<any>[] = [];
    for (const elem of this.sensors) {
      console.log("sensor:", elem);
      observables.push(this.devicemanager.SetSensorType(elem.deviceId, elem.id,
        elem.type.value, this.currentLoginUUID, this.project.id));
    }
    /*for (const elem of this.actuators) {
      observables.push(this.devicemanager.SetActuatorType(elem.deviceId, elem.id,
        elem.type.value, this.currentLoginUUID, this.project.id));
    }*/
    const observeable = forkJoin(observables);
    observeable.subscribe(results => {
      // All observables in `observables` array have resolved and `dataArray` is an array of result of each observable
        this.clear();
        this.isSensorUpdated= true;
        setTimeout(() => {
          this.isSensorUpdated=false;
        }, 3000);
      },
      err => {
        if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
          this.router.navigate(['unauthorized']); }
        console.log(err);
        this.isSensorUpdatedFAILED= true;
        setTimeout(() => {
          this.isSensorUpdatedFAILED=false;
        }, 3000);
      });
  }

  // reset all input fields
  protected clear(): void {
    console.log('clear');
    this.selectedDevice='';
    this.selectedPlatform='';
    this.name = '';
    this.serial='';
    this.tags=[];
    this.protocols=[];
    this.selectedLocation = '';
    this.devices = [];
  }
}
