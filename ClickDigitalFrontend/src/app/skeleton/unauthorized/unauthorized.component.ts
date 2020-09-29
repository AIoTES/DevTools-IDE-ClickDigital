/**

 * This component allows to recover a session when the page is reloaded or reopened
 */

import { Component, HostBinding, OnInit, ViewChild } from '@angular/core';
import { DatabaseService } from '../../services/database.service';
import { DataService } from '../../services/data.service';
import { OverlayContainer } from '@angular/cdk/overlay';

import { ConfirmationService, MenuItem, Message } from 'primeng/api';
import { TabPanel, TabView } from 'primeng/primeng';
import { User } from '../../models/frontend/user';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/frontend/project';
import { EntityStatechangeResponse } from '../../models/backend/entitystatechangeresponse';
import { ValueViewWidget } from '../../models/frontend/valueviewwidget';
import { WidgetType } from '../../models/frontend/widget';
import { ThingStatusChangeResponse } from '../../models/backend/thingstatuschangedresponse';
import { DeviceManagerService } from '../../services/devicemanager.service';
import { Device } from '../../models/backend/device';
import { DeviceDiscoveredResponse } from '../../models/backend/devicediscoveredresponse';
import { SessionService } from '../../services/session.service';
import { FORBIDDEN, UNAUTHORIZED } from 'http-status-codes';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  providers: [ConfirmationService],
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.css']
})
export class UnauthorizedComponent implements OnInit {
  @HostBinding('class') componentCssClass;

  public msgs: Array<Message> = [];

  protected status = 0;

  constructor(private sessionService: SessionService, private databaseService: DatabaseService,
              private dataService: DataService, private projectService: ProjectService, private router: Router) {
  }

  ngOnInit(): void {
    this.checkForSession();
  }

  protected notifyOfEvent(event): void {
    this.msgs.push(event);
  }
  /**
   * this method restores the users session if one is present
   */
  checkForSession(): any {
    this.sessionService.restoreSession()
      .subscribe(result => {
        const userId = result['userId'];
        this.databaseService.getDocument(this.databaseService.USERSCOLLECTION , userId)
          .subscribe((user: User) => {
              if (user.role === 'developer') {
                this.dataService.changeLoginStatus(2);
              } else if (user.role === 'enduser') {
                this.dataService.changeLoginStatus(1);
              }
              console.log(user.projects[0]);
              this.dataService.changeLoginUUID(user.id);
              this.dataService.changeUserData(user);
              this.projectService.loadNewProject(user.projects[0], true);
            },
            err => {
              this.status = 1;
            });
      }, err => {
        if (err['error'] === 'Session invalid') {
          this.status = 2;
        } else {
          console.log(err.status);
          this.status = 1;
        }
      });
  }

  /**
   * this method routes the user to the login page
   */
  toLogin(): any {
    this.router.navigate(['']);
    setTimeout(() => {
      window.location.reload();
    }, 25);
  }
}
