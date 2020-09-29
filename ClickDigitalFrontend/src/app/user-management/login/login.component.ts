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

/**

 * This component helps to login a user. It sends the data to the backend and handles the exceptions.
 * If none it requests te data for the specific user and binds it to the models.
 */
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { DatabaseService } from '../../services/database.service';
import { DataService } from '../../services/data.service';
import { UserManagerService } from '../../services/usermanager.service';
import { ProjectService } from '../../services/project.service';
import { Message } from 'primeng/api';
import { UNAUTHORIZED } from 'http-status-codes';
import { User } from '../../models/frontend/user';
import { ProjectDB } from '../../models/database/project';
import { DashboardDB } from '../../models/database/dashboard';
import { SheetDB } from '../../models/database/sheet';
import { Project } from '../../models/frontend/project';
import { Dashboard } from '../../models/frontend/dashboard';
import { Sheet } from '../../models/frontend/sheet';
import { Widget, WidgetType} from '../../models/frontend/widget';

import { ToggleWidget } from "../../models/frontend/togglewidget";
import { SliderWidget } from "../../models/frontend/sliderwidget";



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit {
  userId: string;
  protected msgs: Array<Message> = [];
  private ROLEDEVELOPER = 'developer';
  private ROLEENDUSER = 'enduser';
  private project: Project;
  public loginsLeft: number;
  protected isLoading: boolean;
  constructor(private  router: Router, private databaseService: DatabaseService,
              private dataService: DataService, private usermanager: UserManagerService, private projectService: ProjectService) {
  }

  ngOnInit(): void {
    this.loginsLeft = 2;
    this.isLoading = false;
  }

  /**
   * This method is called when the user clicks on the login button.
   * It requests the backend to validate the user login data. It receives the {@link User#id}
   * @param email the email address of the user
   * @param password the password of the user
   */
  login(username: string, password: string): void {
    if (this.loginsLeft <= 0) {
    return; }
    this.isLoading = true;
    this.usermanager.loginUser(username, password)
      .subscribe(result => {
          this.userId = result['userId'];
          this.loadUserData();
        }
        , err => {
        this.isLoading = false;
        console.log(this.loginsLeft);
        this.loginsLeft -= 1;
        if (err.status === UNAUTHORIZED) {
            this.msgs.push({
              severity: 'error',
              summary: 'Error',
              detail: err['error']
            });
          } else {
            this.msgs.push({
              severity: 'error',
              summary: 'Error',
              detail: 'Error while login. Please contact the system administrator.'
            });
          }
        console.log('Error while login. ', err['error']);
        });
  }

  /**
   * This method loads the specific user data from the database.
   */
  private loadUserData(): void {
    this.databaseService.getDocument(this.databaseService.USERSCOLLECTION , this.userId)
      .subscribe((user: User) => {
          if (user.role === this.ROLEDEVELOPER) {
            this.dataService.changeLoginStatus(2);
          } else if (user.role === this.ROLEENDUSER) {
            this.dataService.changeLoginStatus(1);
          }
          console.log(user.projects[0]);
          this.dataService.changeLoginUUID(user.id);
          this.dataService.changeUserData(user);
          this.projectService.loadNewProject(user.projects[0], true); // TODO zuletzt bearbeitetes projekt laden
        },
        err => {
          console.log('Error loading user data from database ', err);
        });

  }

  /**
   * This method loads all project specific data and maps it to a global observable variable.
   * @param projectId the id to load
   */

}
