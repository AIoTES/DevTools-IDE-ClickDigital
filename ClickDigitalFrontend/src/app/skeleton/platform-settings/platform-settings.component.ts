import {Component, HostBinding, OnInit} from '@angular/core';
import {DataService} from '../../services/data.service';
import {OverlayContainer} from '@angular/cdk/overlay';
import {DeviceManagerService} from '../../services/devicemanager.service';
import {ConfirmationService, Message, SelectItem} from 'primeng/api';
import {Project} from '../../models/frontend/project';
import {Platform} from '../../models/backend/platform';
import { Router } from '@angular/router';

@Component({
  selector: 'app-platform-settings',
  providers: [ConfirmationService],
  templateUrl: './platform-settings.component.html',
  styleUrls: ['./platform-settings.component.css']
})
export class PlatformSettingsComponent implements OnInit {
  @HostBinding('class') componentCssClass;
  protected project: Project;

  protected connectedPlatforms = [];
  protected allPlatforms: SelectItem[] = [];
  protected loginStatus: number;
  displayEdit: boolean = false;
  protected name: string;
  protected userId: string;
  protected ip: string;
  protected port: number;
  protected username: string;
  protected password: string;
  protected selectedPlatform: Platform;
  protected newPlatform;
  protected bridgeIp: string;
  protected bridgePort: number;
  protected systemIp: string;
  protected clickdigitalPort: number;
  msgs: Message[] = [];

  constructor(private dataService: DataService, private overlayContainer: OverlayContainer, private devicemanager: DeviceManagerService, private confirmService: ConfirmationService, private router: Router) {
  }

  ngOnInit(): void {
    this.dataService.projectData
      .subscribe(value => {
        this.project = value;
      });
    this.displayEdit = false;
    this.dataService.currentLoginStatus.subscribe(status => this.loginStatus = status);
    console.log('CURRYLS ', this.loginStatus);
    this.dataService.currentTheme.subscribe(value => this.changeTheme(value));
    this.dataService.currentLoginUUID.subscribe(uid => this.userId = uid);
    this.devicemanager.getAllPlatforms(this.userId, this.project.id)
      .subscribe(result => {
          this.connectedPlatforms = result;
        },
        err => {
          if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
            this.router.navigate(['unauthorized']); }
          console.log(err);
        });

    this.refreshPlatformDropdown();

  }

  /*Function to add a new Platform*/
  protected addPlatform(): void {
    const platform: Platform = new Platform(this.name, this.ip, String(this.port), this.username, this.password, this.selectedPlatform.platformId, this.userId, this.project.id, this.selectedPlatform.externalPlatformId);
    console.log('Platform: ' , platform);
    this.devicemanager.connectPlatform(platform)
      .subscribe(result => {
          // log result.message
          //console.log('SLP: ' + this.selectedPlatform);
          console.log(result);

          this.refreshPlatformList();
        },
        err => {
          if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
            this.router.navigate(['unauthorized']); }
          console.log(err);
        });
    this.refreshPlatformDropdown();
    this.displayEdit = false;
  }

  protected changeBridge(): void {
    this.devicemanager.changeAiotesBridge(this.bridgeIp, this.bridgePort,this.systemIp, this.clickdigitalPort, this.userId, this.project.id)
      .subscribe(result => {
          // log result.message
          console.log(result);
          this.msgs = [{severity: 'info', summary: 'Confirmed', detail: 'Updated Aiotes Bridge.'}];
          this.msgs.push();
          this.refreshPlatformDropdown();
        },
        err => {
          if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
            this.router.navigate(['unauthorized']); }
          console.log(err);
        });
  }


  // selected Platform gets deleted
  protected deletePlatform(platform): void {
    this.confirmService.confirm({
      message: 'Do you want to delete this platform?',
      header: 'Delete Platform',
      icon: 'fa fa-trash',
      accept: () => {

        // delete platform
        this.devicemanager.deletePlatform(platform['platformId'], this.userId, this.project.id).subscribe(result => {
            // log result.message
            console.log('DeletePlatform was sent to backend server');
            console.log(result);

            this.refreshPlatformList();
            this.msgs = [{severity: 'info', summary: 'Confirmed', detail: 'Platform deleted'}];
            this.msgs.push();
          },
          err => {
            if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
              this.router.navigate(['unauthorized']); }
            console.log('DeleteDevice could not been sent to backend server');
            console.log(err);
          });
      },
      reject: () => {
        this.msgs = [{severity: 'info', summary: 'Canceled', detail: 'Canceled deletion.'}];
        this.msgs.push();
      }
    });

    this.refreshPlatformDropdown();
  }

  showEditDialog(): void {
    this.displayEdit = true;
    this.refreshPlatformDropdown();
  };


  changeTheme(theme): void {
    if (theme !== undefined) {
      this.overlayContainer.getContainerElement().classList.add(theme);
      this.componentCssClass = theme;
    } else {
      this.router.navigate(['dashboard']);
    }
  }

  private refreshPlatformList(): void {
    this.devicemanager.getAllPlatforms(this.userId, this.project.id).subscribe(result => {
        this.connectedPlatforms = result;
        console.log('Platform request success');
      },
      err => {
        if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
          this.router.navigate(['unauthorized']); }
        console.log(err);
      });
  }

  private refreshPlatformDropdown(): void {
    console.log("refreh Platform Dropdown");
    this.allPlatforms = [];
    this.devicemanager.searchForPlatforms(this.userId, this.project.id)
      .subscribe(result => {
          this.allPlatforms = result.map(elem => {
            return {label: elem['name'], value: elem};
          });
          console.log("refreh Platform Dropdown2");
        },
        err => {
          if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
            this.router.navigate(['unauthorized']); }
          console.log(err);
        });
  }
}
