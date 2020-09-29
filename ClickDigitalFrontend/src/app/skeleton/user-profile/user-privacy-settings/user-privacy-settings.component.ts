import { Component, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core';
import { DatabaseService } from '../../../services/database.service';
import { UserManagerService } from '../../../services/usermanager.service';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../../services/data.service';
import { User } from '../../../models/frontend/user';
import { DataPrivacyManagerService } from '../../../services/dataprivacymanager.service';
import { DataPrivacyElementBackend } from '../../../models/backend/dataprivacyelementbackend';
import { Message } from 'primeng/api';

@Component({
  selector: 'app-user-privacy-settings',
  templateUrl: './user-privacy-settings.component.html',
  styleUrls: ['./user-privacy-settings.component.css']
})
export class UserPrivacySettingsComponent implements OnInit {
  @HostBinding('class') componentCssClass;
  protected policyForm: FormGroup;
  protected availableElements = {};
  protected sequenceList; //--- hinzugef�gt am 22.03.2019 12:50 ---
  protected userCheckedElements: Array<string> = [];
  protected privacySettings = false;
  protected user: User;
  public currTime: number;
  @Output() messageEvent = new EventEmitter<any>();
  protected msgs: Array<Message> = [];

  // Changed use terms dialog
  @Output() delete: EventEmitter<void> = new EventEmitter<void>();
  deleteAccountPopup: boolean;
  @Input() passwordForm: FormGroup;
  protected policyFormPopup: FormGroup;
  protected uncheckedElements: Array<DataPrivacyElementBackend>;
  protected popup = false;
  intervalID;

  // Remind to check Elements
  reminderPopup: boolean;
  remindElements: Array<string>;

  constructor(private databaseService: DatabaseService, private dataService: DataService, private overlayContainer: OverlayContainer,
              private usermanager: UserManagerService, private router: Router, private fb: FormBuilder,
              private dataprivacymanager: DataPrivacyManagerService) {
  }

  ngOnInit() {
    this.currTime = Date.now();
    this.sequenceList = [];
    this.dataService.userData.subscribe((user: User) => {
      this.user = user;

      const formControls = {};
      this.dataprivacymanager.getPrivacySettings(this.user.id)
        .subscribe(result => {
          this.userCheckedElements = result;
          // get all privacy elements and make formcontrols and fill availableElements
          this.dataprivacymanager.getAllRootElements().subscribe(result => {
            result.forEach(function(root) {
              const item = new DataPrivacyElementBackend(root);
              this.availableElements[root.id] = item;
              this.sequenceList.push([root.id]);
              formControls[root.id] = new FormControl(this.userCheckedElements.indexOf(root.id) !== -1,
                (root.consentRequired && root.validFrom <= this.currTime) ?
                  Validators.requiredTrue : Validators.nullValidator);
              formControls[root.id].valueChanges.subscribe(val => {
                if (val) {
                  const c = this.availableElements[root.id].children;
                  const changes = {};
                  for (let i = 0; i < c.length; i++) {
                    if (formControls[c[i].id] !== val) { changes[c[i].id] = val; }
                  }
                  this.policyForm.patchValue(changes);
                }
              });
            }.bind(this));

            this.dataprivacymanager.getAllLeafElements().subscribe(result => {
              result.forEach(function (leaf) {
                let item = new DataPrivacyElementBackend(leaf);
                this.availableElements[leaf.id] = item;
                this.availableElements[leaf.contextID].addChild(item);

                formControls[leaf.id] = new FormControl(this.userCheckedElements.indexOf(leaf.id) !== -1,
                  (leaf.consentRequired && leaf.validFrom <= this.currTime) ?
                    Validators.requiredTrue : Validators.nullValidator);
                formControls[leaf.id].valueChanges.subscribe(val => {
                  const changes = {};
                  if (!val && formControls[leaf.contextID]) {
                    changes[leaf.contextID] = false;
                    this.policyForm.patchValue(changes);
                  }
                });
              }.bind(this));
              this.policyForm = this.fb.group(formControls);
            });

            // check if the reminder has to pop up
            this.checkForRemindingElements();

            // set intervals
            // interval for getting current time
            setInterval(() => {
              this.currTime = Date.now();
            }, 10000);

            // interval for checking if privacy elements got valid
            this.intervalID = this.checkPrivacyelementsInterval();

            // interval for getting new dataprivacyelements
            setInterval(() => {
              this.ngOnInit();
            }, 86400000);
          });
        });

    });

  }

  /**
   * This method sets up an interval that checks if any privacyelements have gotten valid.
   * If elements have gotten valid, a popup pops up
   */
  private checkPrivacyelementsInterval(): any {
    return setInterval(() => {
      if (!this.popup && this.getUncheckedConsentRequiredElements().length > 0) {
        this.uncheckedElements = this.getUncheckedConsentRequiredElements();
        const formControls = {};
        let obj;
        for (obj of this.uncheckedElements) {
          formControls[obj.id] = new FormControl(this.userCheckedElements.indexOf(obj.id) !== -1,
            obj.consentRequired ? Validators.requiredTrue : Validators.nullValidator);
          for (const child of obj.children) {
            formControls[child.id] = new FormControl(this.userCheckedElements.indexOf(child.id) !== -1,
              child.consentRequired ? Validators.requiredTrue : Validators.nullValidator);
          }
        }

        this.uncheckedElements.forEach(item => {
          formControls[item.id].valueChanges.subscribe(val => {
            if (val) {
              const c = item.children;
              const changes = {};
              for (let i = 0; i < c.length; i++) {
                if (formControls[c[i].id] !== val) { changes[c[i].id] = val; }
              }
              this.policyFormPopup.patchValue(changes);
            }
          });
          for (const child of item.children) {
            formControls[child.id].valueChanges.subscribe(val => {
              const changes = {};
              if (!val && formControls[child.contextID]) {
                changes[child.contextID] = false;
                this.policyFormPopup.patchValue(changes);
              }
            });
          }
        });

        this.policyFormPopup = this.fb.group(formControls);
        this.popup = true;
        clearInterval(this.intervalID);
      }
    }, 5000);
  }

  /**
   * Accepts formvalues and saves the settings to the backend database
   *
   * @param formValues the values from the form
   */
  private saveSettings(formValues): void {
    // check if all necessary settings have been chosen
    let checkedAll = true;
    for (const id in this.availableElements) {
      const item = this.availableElements[id];
      if (item.children.length > 0) {
        for (const child of item.children) {
          if (child.consentRequired && !formValues[child.id] && child.validFrom.getTime() <= this.currTime) {
            this.messageEvent.emit({severity: 'error', summary: 'Conflict', detail: 'Not all necessary settings have been chosen.'});
            checkedAll = false;
          }
        }
      }
      if (item.consentRequired && !formValues[id] && item.validFrom.getTime() <= this.currTime) {
        this.messageEvent.emit({severity: 'error', summary: 'Conflict', detail: 'Not all necessary settings have been chosen.'});
        checkedAll = false;
      }
    }
    // if all necessary settings have been chosen, send request to backend
    if (checkedAll) {
      this.dataprivacymanager.editPrivacySettings(this.user.id, formValues).subscribe(result => {
        // load settings
        this.loadUserSettingsAndDo(() => {
          if (this.popup) {
            this.intervalID = this.checkPrivacyelementsInterval();
            this.popup = false;
          }
          this.privacySettings = false;
        });
        this.messageEvent.emit({
            severity: 'success',
            summary: '',
            detail: ''
        });
        },
        err => {
          if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
            this.router.navigate(['unauthorized']); }
          this.messageEvent.emit({
            severity: 'error',
            summary: 'Error',
            detail: 'Error while changing settings.Please try again later or contact the administrator.'
          });
        });
    }
  }

  /**
   * This method loads the users settings and sets the privacy settings to visible
   */
  public showSettings(): void {
    // load user settings
    this.loadUserSettingsAndDo(() => {
      this.privacySettings = true;
    });
  }

  /**
   * This method gets the user settings from the database, sets the policyform and calls func
   * @param func function that is being called after the settings were loaded
   */
  private loadUserSettingsAndDo(func: Function): void {
    this.dataprivacymanager.getPrivacySettings(this.user.id)
      .subscribe(result => {
        this.userCheckedElements = result;
        const newValues = {};
        let index;
        for (index in this.availableElements) {
          newValues[index] = false;
        }
        // if user has checked old privacy elements, we have to ignore them
        let id;
        for (id of this.userCheckedElements) {
          if (this.availableElements[id] !== undefined) {
            newValues[id] = true;
          }
        }
        this.policyForm.setValue(newValues);
        func();
      });
  }

  /**
   * This method returns an array of the privacy elements that are not checked by the user but are valid and require consent
   *
   * @return array of valid, unchecked, consent required data privacy elements
   */
  public getUncheckedConsentRequiredElements(): Array<DataPrivacyElementBackend> {
    const ret = Array<DataPrivacyElementBackend>();
    let temp;
    let id;
    let elem;
    let child;
    let isFirstChild = true;
    for (id in this.availableElements) {
      elem = this.availableElements[id];
      if(elem.contextID !== '')
        continue;
      if (this.isUncheckedValidConsentRequired(elem)) {
        ret.push(elem);
      } else {
        isFirstChild = true;
        for (child of elem.children) {
          if (this.isUncheckedValidConsentRequired(child)) {
            if (isFirstChild) {
              temp = JSON.parse(JSON.stringify(elem));
              temp.children = [];
              ret.push(temp);
              isFirstChild = false;
            }
            ret[ret.length - 1].children.push(child);
          }
        }
      }
    }
    return ret;
  }

  /**
   * This method checks if elem is valid, unchecked by the user and consent required
   *
   * @param elem the data privacy element that is checked
   */
  private isUncheckedValidConsentRequired(elem: DataPrivacyElementBackend): boolean {
    return elem.validFrom.getTime() < this.currTime && this.userCheckedElements.indexOf(elem.id) === -1 && elem.consentRequired;
  }

  /**
   * This method sends changed settings to the backend
   *
   * @param formValuesChange
   */
  public editPartOfSettings(formValuesChange): void {
    this.loadUserSettingsAndDo(() => {
      const fv = this.policyForm.value;
      for (const id in formValuesChange) {
        fv[id] = formValuesChange[id];
      }
      this.saveSettings(fv);
    });
  }

  /**
   * This method checks if there are any consent required, unchecked data privacy elements that aren't valid yet
   * and lets a reminder pop up if it finds anything
   */
  public checkForRemindingElements(): void {
    const ret = Array<string>();
    let id;
    let currElem;
    let child;
    for (id in this.availableElements) {
      currElem = this.availableElements[id];
      if (currElem.contextID !== '')
        continue;
      if (this.isNotValidRequiredNotChosen(currElem)) {
        ret.push(currElem.title);
      }
      if (currElem.children.length > 0 && !currElem.consentRequired) {
        for (child of currElem.children) {
          // if (child.validFrom.getTime() > this.currTime && child.consentRequired && !this.policyForm.controls[child.id].value) {
          if (this.isNotValidRequiredNotChosen(child)) {
            ret.push(currElem.title);
            break;
          }
        }
      }
    }
    this.remindElements = ret;
    if (ret.length > 0) {
      this.reminderPopup = true;
    }
  }

  /**
   *  This method checks if a dataprivacyelement is not valid, required and not chosen by the user
   * @param elem
   */
  private isNotValidRequiredNotChosen(elem: DataPrivacyElementBackend): boolean {
    return elem.validFrom.getTime() > this.currTime && elem.consentRequired && !this.userCheckedElements.includes(elem.id, 0);
  }

  /**
   *  This method sends a delete request to the backend
   * @param formValue
   */
  protected deleteAccount(formValue): void {
    // this.messageEvent.emit({severity: 'error', summary: 'Deletion failed', detail: 'Please contact the system administrator.'});
    // user löschen ans backend senden
    this.usermanager.deleteUser(this.user.id, formValue['Password'])
      .subscribe(result => {
          this.dataService.changeLoginStatus(0);
          this.dataService.changeUserData(undefined);
          this.dataService.changeProjectData(undefined);
          this.router.navigate(['']);
          window.location.reload();
        },
        err => {
          this.msgs.push({
            severity: 'error',
            summary: 'Error',
            detail: err['error']
          });
        });

  }

}
