import {Component, HostBinding, OnInit} from '@angular/core';
import{Router} from "@angular/router";
import {DatabaseService} from '../../services/database.service';
import {DataService} from '../../services/data.service';
import {OverlayContainer} from '@angular/cdk/overlay';
import {Widget} from "../../models/frontend/widget";
import {Project} from "../../models/frontend/project";


@Component({
  selector: 'app-user-management',
  templateUrl: './project-sharing.component.html',
  styleUrls: ['./project-sharing.component.css']
})

export class ProjectSharingComponent implements OnInit {
  @HostBinding('class') componentCssClass;

  protected exportSuccess: boolean;
  protected loginStatus: number;
  protected projects: Array<Project>;
  protected resultStatus: boolean;
  protected result: string;
  protected selectedID: number;
  protected targetUUID: string;

  constructor(private router: Router, private dataService: DataService, private databaseService: DatabaseService, private overlayContainer: OverlayContainer) {}

  ngOnInit(): void {
    this.dataService.currentLoginStatus.subscribe(value => this.loginStatus = value);
    this.dataService.currentTheme.subscribe(value => this.changeTheme(value));
    console.log("login statzus: ", this.loginStatus);
  }

  changeTheme(theme): void {
    if (theme !== undefined) {
      this.overlayContainer.getContainerElement().classList.add(theme);
      this.componentCssClass = theme;
    } else {
      this.router.navigate(['dashboard']);
    }}

    protected searchUser(email: string): void {
    /*this.databaseService.searchMail(email).subscribe(res => {
      if (res['docs'].length === 1) {
        this.resultStatus = true;
        this.result = res['docs'][0]['email'];
        this.targetUUID = res['docs'][0]['_id'];
        console.log(this.result);
      }
    });*/
    }

    protected exportProject(): void {
      console.log(this.selectedID);
      let tempWidgets: Array<Widget> = [];
      let tempProject: Array<Project> = [];
      //todo
    }

}
