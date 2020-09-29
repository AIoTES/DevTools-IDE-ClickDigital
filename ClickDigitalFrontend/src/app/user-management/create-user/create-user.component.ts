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
 * This component helps to create a new user. It validates the input data and registers
 * the user in the backend database as well as in the frontend database
 */
import {Component, OnInit, ViewChild} from '@angular/core';
import {DatabaseService} from '../../services/database.service';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {UserManagerService} from '../../services/usermanager.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {matchOtherValidator} from '../../custom-validation';
import {Message, SelectItem} from 'primeng/api';
import {Dropdown} from 'primeng/primeng';
import uuidv4 from 'uuid/v4';
import {ProjectDB} from '../../models/database/project';
import {DashboardDB} from '../../models/database/dashboard';
import {SheetDB} from '../../models/database/sheet';
import {User} from '../../models/frontend/user';
import {CONFLICT} from 'http-status-codes';
import {Widget} from '../../models/frontend/widget';
import {WidgetDB} from '../../models/database/widget';

/*@*/
import {DataPrivacyElementBackend} from '../../models/backend/dataprivacyelementbackend';
import {DataPrivacyManagerService} from '../../services/dataprivacymanager.service';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss'],
})
export class CreateUserComponent implements OnInit {
  protected pin: string;
  protected userform: FormGroup;
  protected role: Array<SelectItem>;
  protected srole: SelectItem;
  private PIN = '1234';
  protected ROLEDEVELOPER = 'developer';
  private ROLEENDUSER = 'enduser';
  protected msgs: Array<Message> = [];
//**
  protected usernameExist: boolean;

  /*@*/
  protected currentPage: number;
  protected policyForm: FormGroup = undefined;
  protected availableElements;
  protected sequenceList;
  private userData;
  /*@*/

  @ViewChild(Dropdown) dropdown: Dropdown;
  emailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$';

  constructor(private http: HttpClient,
              private  router: Router,
              private databaseService: DatabaseService,
              private usermanager: UserManagerService,
              private fb: FormBuilder,
              private dpManager: DataPrivacyManagerService) {
  }

  ngOnInit(): void {
    /*@*/
    this.currentPage = 0;
    this.availableElements = {};
    this.sequenceList = [];


    // initialize the form validation
    this.userform = this.fb.group({
      username : new FormControl('', Validators.compose([Validators.required, Validators.minLength(6), Validators.pattern(/^[\x00-\x1F\x21-\x7F]*$/)])),
      firstname: new FormControl('', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(32)])),
      lastname: new FormControl('', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(64)])),
      email: new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.emailPattern)])),
      password: new FormControl('', Validators.compose([Validators.required, Validators.minLength(6)])),
      passwordrepetition: new FormControl('', Validators.compose([Validators.required, matchOtherValidator('password')])),
      role: new FormControl('', Validators.required)
    });

    // initialize the role dropdown
    this.role = [];
    this.role.push({label: 'Developer', value: 'developer'});
    this.role.push({label: 'Enduser', value: 'enduser'});

    /*@*/
    let formControls = {};

	this.dpManager.getAllRootElements().subscribe(result => {
	  result.forEach(function (root) {
	    let item = new DataPrivacyElementBackend(root);
        this.availableElements[root.id] = item;
		this.sequenceList.push([root.id]);

		formControls[root.id] = new FormControl(root.preChecked, (root.consentRequired) ? Validators.requiredTrue : Validators.nullValidator);
	  }.bind(this));

	  this.dpManager.getAllLeafElements().subscribe(result => {
        result.forEach(function (leaf) {

          let item = new DataPrivacyElementBackend(leaf);
          this.availableElements[leaf.id] = item;
          this.availableElements[leaf.contextID].addChild(item);

		  formControls[leaf.id] = new FormControl(leaf.preChecked, (leaf.consentRequired) ? Validators.requiredTrue : Validators.nullValidator);
		  formControls[leaf.id].valueChanges.subscribe(val => {
            if (this.availableElements[leaf.id].consentRequired) {
              if (!val) {
                this.policyForm.patchValue({[leaf.contextID]: false});
              }
            }
          });
		}.bind(this));
		this.policyForm = this.fb.group(formControls);
	  });
	}, err => {
	  this.policyForm = null;
	});
  }

  protected asciiTest(username) {
    return (/^[\x00-\x1F\x21-\x7F]*$/.test(username));
  }

  protected checkUserInput(email: string, username: string, password: string, password2: string, firstname: string, surname: string, role: SelectItem): void {
    let notification = '';

    if (username === '' || username.length < 2 || username.length > 32) {
      notification = 'invalid username';
    } else if (firstname === '' || firstname.length < 2 || firstname.length > 32) {
      notification = 'invalid firstname';
    } else if (surname === '' || surname.length < 2 || surname.length > 64) {
      surname = 'invalid surname';
    } else if (!email.match(/^[\w\.-]+@[\w\.-]+\.[\w]{2,4}$/)) {
      notification = 'invalid email adress';
    } else if (password.length < 6) {
      notification = 'password has to be longer';
    } else if (password !== password2) {
      notification = 'non-matching passwords';
    } else if (this.role.filter(r => r.value === role.toString()).length == 0) {
      notification = 'invalid role';
    } else if (role.toString() === this.ROLEDEVELOPER && this.pin !== this.PIN) {
      notification = 'Wrong pin, please try again or contact the administrator.';
    } else if (notification === '') {
      this.userData = {
        username: username,
        firstname: firstname,
        surname: surname,
        email: email,
        password: password,
        role: role
      }
      this.currentPage = 1;
    } else {

      this.msgs.push({
        severity: 'error',
        summary: 'Error',
        detail: notification
      });
    }
  }

  /**
   * This method is called when the user tries to register. The data are already validated. It sends them to the backend.
   * If the user is successfully saved in the backend database, it is saved to the frontend database with a default new project
   * @param email the email address of a user
   * @param password the password of a user
   * @param firstname the user's firstname
   * @param surname the user's surname
   * @param role the role of a user
   */
  protected createUser(items: object): void {
    let checkedAll:boolean = true;
    let checkedIDs = [];

    for (let id in this.availableElements) {
      let item = this.availableElements[id];
	  if (item.consentRequired) {
        if (!items[id]) {
          this.msgs.push({
            severity: 'error',
            summary: 'Error',
            detail: id + ' unchecked'
          });
          checkedAll = false;
        } else {
		  checkedIDs.push(id);
		}
	  } else if (items[id]) checkedIDs.push(id);
    }
    if (this.userData == null) {
      this.msgs.push({
        severity: 'error',
        summary: 'Error',
        detail: 'Internal Error'
      });
    } else if (checkedAll) {
      this.usermanager.createUser(this.userData.role.toString(), this.userData.username, this.userData.email, this.userData.firstname, this.userData.surname, this.userData.password, checkedIDs)
        .subscribe(result => {
            // user creation in backend successful
            const sheetId = uuidv4();
            const dashboardId = uuidv4();
            const projectId = uuidv4();
            const startSheet: SheetDB = new SheetDB(sheetId, 'Sheet 1', []);
            const startDashboard: DashboardDB = new DashboardDB(dashboardId, 'Dashboard 1', [sheetId]);

            this.databaseService.insertDocument(this.databaseService.USERSCOLLECTION, new User(result['userId'], this.userData.role.toString(), projectId))
              .subscribe(resultUser => {
                  this.databaseService.insertDocument(this.databaseService.PROJECTSCOLLECTION, new ProjectDB(projectId, 'Project 1', 'omega', [dashboardId]))
                    .subscribe(result => {
                      }
                      , err => {
                        console.log('Error saving empty Project into database', err);
                      });

                  this.databaseService.insertDocument(this.databaseService.DASHBOARDSCOLLECTION, startDashboard)
                    .subscribe(result => {
                      }
                      , err => {
                        console.log('Error saving empty Project into database', err);
                      });


                  this.databaseService.insertDocument(this.databaseService.SHEETSSCOLLECTION, startSheet)
                    .subscribe(result => {
                      }
                      , err => {
                        console.log('Error saving empty Project into database', err);
                      });

                  this.msgs.push({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Registration was successful'
                  });
                  setTimeout(() => {
                    this.router.navigate(['/'], {fragment: 'login'});
                  }, 2000);
                },
                err => {
                  this.msgs.push({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error while creating user.Please try again later or contact the administrator.'
                  });
                  console.log('Error saving in frontend database ', err);
                });
          },
          err => {
            this.msgs.push({
              severity: 'error',
              summary: 'Error',
              detail: err['error']
            });
            console.log('Error saving in frontend database ', err);
          });
    }
  }

}
