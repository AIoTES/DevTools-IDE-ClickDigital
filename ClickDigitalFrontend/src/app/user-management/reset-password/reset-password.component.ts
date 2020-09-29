/**

 * This component allows the user to reset their password
 */
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService } from '../../services/database.service';
import { DataService } from '../../services/data.service';
import { UserManagerService } from '../../services/usermanager.service';
import { ProjectService } from '../../services/project.service';
import { Message } from 'primeng/api';
import { UNAUTHORIZED } from 'http-status-codes';
import { Project } from '../../models/frontend/project';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { matchOtherValidator } from '../../custom-validation';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ResetPasswordComponent implements OnInit {
  userId: string;
  protected msgs: Array<Message> = [];
  private ROLEDEVELOPER = 'developer';
  private ROLEENDUSER = 'enduser';
  private project: Project;
  protected resetform: FormGroup;
  private token: string;

  constructor(private router: Router, private databaseService: DatabaseService,
              private dataService: DataService, private usermanager: UserManagerService, private projectService: ProjectService,
              private fb: FormBuilder, private route: ActivatedRoute) {

	this.route.fragment.subscribe(fragment => {
	  fragment = fragment.split('?')[1];
      var params = new URLSearchParams(fragment);
	  this.token = params.get('token');
    });
  }

  ngOnInit(): void {
    this.resetform = this.fb.group({
      password: new FormControl('', Validators.compose([Validators.required, Validators.minLength(6)])),
      passwordrepetition: new FormControl('', Validators.compose([Validators.required, matchOtherValidator('password')]))
    });
  }

  /**
   * This method sends the new password the user entered to the backend
   * @param password the users new password
   */
  setNewPassword(password: string): void {
    this.usermanager.resetPassword(password, this.token)
      .subscribe(result => {
          this.msgs.push(
          {severity: 'success', summary: 'Password reset', detail: 'Your Password has been reset successfully. You will be redirected to the login page.'});
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
              detail: err['error']
            });
          }
          console.log('Error while resetting Password. ', err['error']);
        });
  }
}
