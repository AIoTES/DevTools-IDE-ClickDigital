import { matchOtherValidator, notMatchOtherValidator } from '../../../custom-validation';
import { Component, EventEmitter, HostBinding, OnInit, Output, ViewChild } from '@angular/core';
import { DatabaseService } from '../../../services/database.service';
import { UserManagerService } from '../../../services/usermanager.service';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../../services/data.service';
import { User } from '../../../models/frontend/user';
import { UserBackend } from '../../../models/backend/user';
import { MenuItem, Message } from 'primeng/api';
import { CONFLICT } from 'http-status-codes';
import { UserPrivacySettingsComponent } from '../user-privacy-settings/user-privacy-settings.component';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.css']
})
export class UserSettingsComponent implements OnInit {
  @HostBinding('class') componentCssClass;
  protected items: Array<MenuItem>;

  @ViewChild(UserPrivacySettingsComponent) privacySettings: UserPrivacySettingsComponent;
  protected user: User;
  protected userBackend: UserBackend;
  protected userSettings;
  protected deleteAccountPopup;
  userform: FormGroup;
  emailform: FormGroup;
  passwordform: FormGroup;
  usernameform: FormGroup;
  usersurform: FormGroup;
  userfirstform: FormGroup;
  dataloaded = false;
  emailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$';
  @Output() messageEvent = new EventEmitter<any>();

  constructor(private databaseService: DatabaseService, private dataService: DataService, private overlayContainer: OverlayContainer,
              private usermanager: UserManagerService, private router: Router, private fb: FormBuilder) {
  }

  ngOnInit() {
    this.dataService.userData.subscribe((user: User) => {
      this.user = user;
        this.usermanager.getUser(this.user.id)
          .subscribe((userBackend: UserBackend) => {
            this.userBackend = userBackend;
            this.dataloaded = true;
            this.passwordform = this.fb.group({
              Password: new FormControl('', Validators.required)
            });
          });

    });
    this.userSettings = false;
    this.deleteAccountPopup = false;

    this.emailform = this.fb.group({
      email: new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.emailPattern)])),
      password: new FormControl('', Validators.required)
    });
    this.usernameform = this.fb.group({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });
    this.userfirstform = this.fb.group({
      firstname: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });
    this.usersurform = this.fb.group({
      surname: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });
    this.userform = this.fb.group({
      OldPassword: new FormControl('', Validators.required),
      Password: new FormControl('', Validators.compose([Validators.required, Validators.minLength(6), notMatchOtherValidator('OldPassword')])),
      PasswordRepetition: new FormControl('', Validators.compose([Validators.required, matchOtherValidator('Password')]))
    });

  }


  protected asciiTest(username) {
    return (/^[\x00-\x1F\x21-\x7F]*$/.test(username));
  }

  /**
   * This method saves a new password to the frontend and backend database.
   * @param formValues the values from the form
   */
  protected saveNewPassword(formValues): void {
      this.usermanager.editUserPassword(this.user.id, formValues['Password'], formValues['OldPassword'])
	  // muss entsprechend bearbeitet werden, da zum jetzigen Zeitpunkt mir nicht genau bewusst íst, welche Keys sich
	  // hinter formValues befinden
        .subscribe(res => {

            this.usermanager.getUser(this.user.id)
              .subscribe((userBackend: UserBackend) => {
                this.userBackend = userBackend;
                this.messageEvent.emit({severity: 'success', summary: 'Changed password', detail: 'Your new password was successfully set'});
                this.userSettings = false;
              });
          },
          err => {
            if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
              this.router.navigate(['unauthorized']); }
            this.messageEvent.emit({
                severity: 'error',
                summary: 'Password change failed',
                detail: 'Error occurd saving the password. Please try again later.'
              });
          });

  }

  /**
   * This method saves a new Email address to the frontend and backend database.
   * @param formValues the values from the form
   */
  protected saveNewEmail(formValues): void {
    this.usermanager.editUserMail(this.user.id, formValues['email'], formValues['password'])
      .subscribe(result => {
          this.messageEvent.emit({
            severity: 'success',
            summary: 'Changed email address',
            detail: 'Your new email address was successfully set'
          });
          this.userSettings = false;
          this.logout();

        },
        err => {
          if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
            this.router.navigate(['unauthorized']); }
          if (err.status === CONFLICT) {
            this.messageEvent.emit({severity: 'error', summary: 'Conflict', detail: 'Email address is already registered.'});
          } else {
            this.messageEvent.emit({
              severity: 'error',
              summary: 'Error',
              detail: 'Error while changing email address. Please try again later or contact the administrator.'
            });
          }
        });
  }

  //**
   /**
   * This method saves a new Username to the frontend and backend database.
   * @param formValues the values from the form
   */
  protected saveNewUsername(formValues): void {
    this.usermanager.editUsername(this.user.id, formValues['username'], formValues['password'])
      .subscribe(result => {
          this.messageEvent.emit({
            severity: 'success',
            summary: 'Changed Username',
            detail: 'Your new Username was successfully set'
          });
         // this.userSettings = false;
          //this.logout();

        },
        err => {
          if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
            this.router.navigate(['unauthorized']); }
          if (err.status === CONFLICT) {
            this.messageEvent.emit({severity: 'error', summary: 'Conflict', detail: 'Username already exists.'});
          } else {
            this.messageEvent.emit({
              severity: 'error',
              summary: 'Error',
              detail: 'Error while changing email address.Please try again later or contact the administrator.'
            });
          }
        });
  }

  /**
   * This method saves a new Firstname to the frontend and backend database.
   * @param formValues the values from the form
   */
  protected saveNewFirstname(formValues): void {
    this.usermanager.editFirstname(this.user.id, formValues['firstname'], formValues['password'])
      .subscribe(result => {
          this.messageEvent.emit({
            severity: 'success',
            summary: 'Changed Firstname',
            detail: 'Your new Firstname was successfully set'
          });
         // this.userSettings = false;
          //this.logout();

        },
        err => {
          /* if (err.status === CONFLICT) {
            this.messageEvent.emit({severity: 'error', summary: 'Conflict', detail: 'Username is already existed.'});
            console.log('Error saving in backend database ', err);
          }
          else {*/
          if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
            this.router.navigate(['unauthorized']);
          }
            this.messageEvent.emit({
              severity: 'error',
              summary: 'Error',
              detail: 'Error while changing firstname. Please try again later or contact the administrator.'
            });
          //}
        });
  }

  /**
   * This method saves a new Surname to the frontend and backend database.
   * @param formValues the values from the form
   */
  protected saveNewSurname(formValues): void {
    this.usermanager.editSurname(this.user.id, formValues['surname'], formValues['password'])
      .subscribe(result => {
          this.messageEvent.emit({
            severity: 'success',
            summary: 'Changed Surname',
            detail: 'Your new Surname was successfully set'
          });
         // this.userSettings = false;
          //this.logout();

        },

         err => {
       /*   if (err.status === CONFLICT) {
            this.messageEvent.emit({severity: 'error', summary: 'Conflict', detail: 'Username is already existed.'});
            console.log('Error saving in backend database ', err);
          }
           else {*/
           if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
             this.router.navigate(['unauthorized']); }
            this.messageEvent.emit({
              severity: 'error',
              summary: 'Error',
              detail: 'Error while changing email address.Please try again later or contact the administrator.'
            });
         // }
        });
  }





  protected deleteAccount(formValue): void {
    // TODO user löschen ans backend senden, in der forntend db alle dokumente löschen die dem user zugeordnet sind in Users, Projects, Dashboards, Sheets, Widgets
    // this.messageEvent.emit({severity: 'error', summary: 'Deletion failed', detail: 'Please contact the system administrator.'});

    // this.messageEvent.emit({severity: 'error', summary: 'Deletion failed', detail: 'Please contact the system administrator.'});

    // user löschen ans backend senden
    this.usermanager.deleteUser(this.user.id, formValue['Password'])
      .subscribe(result => {
        console.log('User was deleted successfully');
        this.dataService.changeLoginStatus(0);
        this.dataService.changeUserData(undefined);
        this.dataService.changeProjectData(undefined);
        this.router.navigate(['']);
        setTimeout(() => {
          window.location.reload();
        }, 100);
      },
      err => {
        if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
          this.router.navigate(['unauthorized']); }
        this.messageEvent.emit({
          severity: 'error',
          summary: 'Error',
          detail: err['error']
        });
      });

  }

  /**
   * This method logs out the user and navigates back to the login page
   */
  protected logout(): void {
    this.sendLogoutToBackend(this.user.id);
    this.dataService.changeLoginStatus(0);
    this.dataService.changeUserData(undefined);
    this.dataService.changeProjectData(undefined);
    this.router.navigate(['']);
    setTimeout(() => {
      window.location.reload();
    }, 25);
    // window.location.reload();

  }

  /**
   * This method sends a logout request to the backend. So the user can be disconnected from his platform sessions.
   * @param {string} id
   */
  sendLogoutToBackend(id: string): void {
    this.usermanager.logoutUser(id).subscribe(result => {
        // log result.message
        console.log('Userlogout was sent to backend server');
        console.log(result);
      },
      err => {
        if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
          this.router.navigate(['unauthorized']); }
        console.log('Userlogout could not been sent to backend server');
        console.log(err);
      });
  }

}
