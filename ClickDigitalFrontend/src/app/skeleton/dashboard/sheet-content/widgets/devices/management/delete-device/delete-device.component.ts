import {Component, Input, OnInit} from '@angular/core';
import {DeviceManagerService} from '../../../../../../../services/devicemanager.service';
import {Widget} from "../../../../../../../models/frontend/widget";
import {DataService} from '../../../../../../../services/data.service';
import {Project} from '../../../../../../../models/frontend/project';
import { Router } from '@angular/router';

@Component({
  selector: 'app-delete-device',
  templateUrl: './delete-device.component.html',
  styleUrls: ['./delete-device.component.css']
})
export class DeleteDeviceComponent implements OnInit {
  @Input() currentWidget: Widget;
  protected project: Project;
  devices;
  selectedDevice;
  isSuccess: boolean;
  isFail: boolean;
  protected currentLoginUUID: string;
  constructor(private devicemanager: DeviceManagerService, private dataService: DataService, private router: Router) { }

  ngOnInit(): void {
    this.dataService.projectData
      .subscribe(value => {
        this.project = value;
      });
    this.isFail=false;
    this.isSuccess=false;
    this.dataService.currentLoginUUID.subscribe(value => this.currentLoginUUID = value);
    // get all Devices for Dropdown List
    this.devicemanager.getAllDevices(this.currentLoginUUID, this.project.id).subscribe(result => {
        this.devices = result;
      },
      err => {
        if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
          this.router.navigate(['unauthorized']); }
        console.log(err);
      });
  }

  updateDevices(): void{
    this.devicemanager.getAllDevices(this.currentLoginUUID, this.project.id).subscribe(result => {
        this.devices = result;
      },
      err => {
        if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
          this.router.navigate(['unauthorized']); }
        console.log(err);
      });
  }

  // function for deleting the selected Device
  deleteDevice(): void {
    this.devicemanager.DeleteDevice(this.selectedDevice['deviceId'], this.currentLoginUUID, this.project.id).subscribe(result => {
        // log result.message
      this.isSuccess=true;
        this.updateDevices();
        console.log('Device was deleted on backend server');
        setTimeout(() => {
          this.isSuccess=false;
          this.selectedDevice='';
        }, 3000);

  },
      err => {
        if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
          this.router.navigate(['unauthorized']); }
      this.isFail=true;
      setTimeout(() => {
          this.isFail=false;
        }, 5000);

        console.log('Device could not been deleted on backend server');
        console.log(err);
      });
  }


}
