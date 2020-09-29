/**

 * this component allows the user to request a reset link
 */
import { Component, EventEmitter, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { DatabaseService } from '../../services/database.service';
import { DataService } from '../../services/data.service';
import { UserManagerService } from '../../services/usermanager.service';
import { ProjectService } from '../../services/project.service';
import { Message } from 'primeng/api';
import { UNAUTHORIZED } from 'http-status-codes';
import { Project } from '../../models/frontend/project';


@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ForgotPasswordComponent implements OnInit {
  userId: string;
  protected msgs: Array<Message> = [];
  private ROLEDEVELOPER = 'developer';
  private ROLEENDUSER = 'enduser';
  private project: Project;

  constructor(private  router: Router, private databaseService: DatabaseService,
              private dataService: DataService, private usermanager: UserManagerService, private projectService: ProjectService) {
  }

  ngOnInit(): void {

  }

  /**
   * sends the email the user entered to the backend
   * @param email the email address of the user
   */
  requestReset(email: string): void {
    this.usermanager.requestResetLinkUser(email)
      .subscribe(result => {
          this.msgs.push(
          {severity: 'success', summary: 'Sent Email', detail: 'A reset Link has been sent to your email address. You will be redirected to the login page'});
          setTimeout(() => {
            this.router.navigate(['']);
          },
            5000);
        }
        , err => {
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
              detail: 'Error sending email. Please contact the system administrator.'
            });
          }
          console.log('Error while login. ', err['error']);
        });
  }
}
