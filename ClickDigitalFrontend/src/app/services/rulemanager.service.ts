
import {map} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import { Router } from '@angular/router';


// Classes for JSON Objects
import { Triggergroup } from '../models/frontend/rule_module/triggergroup';
import { Rule } from '../models/frontend/rule_module/rule';
// Classes for JSON Objects
import { Observable } from 'rxjs/Rx';
import 'rxjs/Rx';
import { DataNotification } from '../models/frontend/rule_module/datanotification';
import {RuleCreationService} from "../skeleton/dashboard/rules/service/rule-creation.service";
import {Project} from "../models/frontend/project";
import {DataService} from "./data.service";

import { environment} from "../../environments/environment";


const BACKENDURL = `${environment.httpMode}${environment.baseUrl}${environment.contextRoot}`;
const AUTH = 'Bearer '.concat(localStorage.getItem('ang-token'));

// Strings for dynamic URL generating
const URLRULEMANAGER = `${BACKENDURL}/ruleManagement/`;
const createRule = 'createRule';
const updateRule = 'updateRule/';
const deleteRule = 'deleteRule/';
const rule = 'getRule?ID=';
const allRules = 'getAllRules';
const ruleStatus = 'getRuleStatus?ID=';
const activate = 'activateRule/';
const deactivate = 'deactivateRule/';
const createGroup = 'createTriggergroup';
const allGroups = 'getAllTriggergroups';
const byCategory = 'getAllTriggerByCategory';
const triggersByTGID = 'getTriggersByTGID/';
const deleteTriggergroups = 'deleteTriggergroups/';
const shareAllTriggergroup = 'shareAllTriggergroup/';
const createNotification = 'createNotification';
const allNotifications = 'getAllNotifications';
const deleteNotification = 'deleteNotification/';
const updateNotifications = 'updateNotifications/';

@Injectable()
export class RuleManagerService {

  project: Project;

  constructor(private http: HttpClient,
              private dataService: DataService,
              private router: Router) {
    if (!this.project) {
      this.dataService.projectData
        .subscribe(project => {
          this.project = project;
        });
    }
  }

  addNewTriggerLeaf(userID: String, triggerLeaf: Triggergroup): any {
    triggerLeaf.projectID = this.project.id;
    return this.http.post(`${ URLRULEMANAGER}${createGroup}/${userID}`, triggerLeaf.getTriggerGroup(), {headers:{'Authorization':AUTH }, withCredentials: true })
      .map(
        (response: Triggergroup) => {
          return response;
        }
      );
  }

  getTriggersByTGID(userID: String, TGID: number): Observable<Array<Triggergroup>> {
    return this.http.get(`${URLRULEMANAGER}${triggersByTGID}${TGID}?userID=${userID}`, {headers:{'Authorization':AUTH }, withCredentials: true })
      .map(
        (response: Array<Triggergroup>) => {

          return response;
        }, (err: Response) => {
          if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
            this.router.navigate(['unauthorized']);
          }
          alert('There was an error during creating the trigger. Please talk to your system admin.');
          return {};
        });

  }

  shareAllTriggergroup(userID: string, rootTGID: number, triggers: Array<Triggergroup>): any {
    return this.http.post(`${URLRULEMANAGER}${shareAllTriggergroup}${userID}/${rootTGID}`, triggers, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map(
        (response: Response) => {

          return response;
        }, (err: Response) => {
          if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
            this.router.navigate(['unauthorized']);
          }
          alert('There was an error during creating the trigger. Please talk to your system admin.');
          return {};
        })
      );
  }

  saveRule(userID: String, ruleValue: Rule): any {
    return this.http.post(`${URLRULEMANAGER}${createRule}/${userID}`, ruleValue, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map(
        (response: Response) => {

          return response;
        }, (err: Response) => {
          if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
            this.router.navigate(['unauthorized']); }
          alert('There was an error during creating the trigger. Please talk to your system admin.');
          return {};
        })
      );
  }

  saveNotification(userID: String, notification: DataNotification): any {
    return this.http.post(`${URLRULEMANAGER}${createNotification}/${userID}`, notification, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map(
        (response: Response) => {

          return response;
        },(err: Response) => {
          if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
            this.router.navigate(['unauthorized']); }
          alert('There was an error during creating the trigger. Please talk to your system admin.');
          return {};
        })
      );
  }

  updateRule(userID: String, ruleData: Rule): any {
    const ruleValue: Rule = new Rule();
    ruleValue.setRuleData(ruleData);

    return this.http.put(`${URLRULEMANAGER}${updateRule}${userID}`, ruleValue, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map(
        (response: Response) => {

          return response;
        },
        (err: Response) => {
          if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
            this.router.navigate(['unauthorized']); }
          alert('There was an error during creating the trigger. Please talk to your system admin.');
          return {};
        })
      );
  }

  updateNotifications(userID: String, notifications: Array<DataNotification>): any {
    return this.http.put(`${URLRULEMANAGER}${updateNotifications}${userID}`, notifications, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map(
        (response: Response) => {

          return response;
        },
        (err: Response) => {
          if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
            this.router.navigate(['unauthorized']); }
          alert('There was an error during creating the trigger. Please talk to your system admin.');
          return {};
        })
      );
  }

  activateRule(userID: String, ruleValue: Rule): any {
    return this.http.get(`${URLRULEMANAGER + activate + ruleValue.ID + this.getQueryParameters(userID, ruleValue) }`, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map(
        (response: Response) => {

          return response;
        },
        (err: Response) => {
          if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
            this.router.navigate(['unauthorized']); }
          alert('There was an error during creating the trigger. Please talk to your system admin.');
          return {};
        })
      );
  }

  deactivateRule(userID: String, ruleValue: Rule): any {
    return this.http.get(`${URLRULEMANAGER + deactivate + ruleValue.ID + this.getQueryParameters(userID, ruleValue)}`, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map(
        (response: Response) => {

          return response;
        },
        (err: Response) => {
          if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
            this.router.navigate(['unauthorized']); }
          alert('There was an error during creating the trigger. Please talk to your system admin.');
          return {};
        })
      );
  }

  deleteTriggers(userID: string, triggers: Array<Triggergroup>): any {
    return this.http.put(URLRULEMANAGER + deleteTriggergroups + userID, triggers, {headers:{'Authorization':AUTH }, withCredentials: true })
      .subscribe(
        (response: Response) => {
          console.log('deleteTriggers response', response);

          return response;
        },
        (err: Response) => {
          if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
            this.router.navigate(['unauthorized']); }
          alert('There was an error during creating the trigger. Please talk to your system admin.');
          return {};
        });
  }

  getQueryParameters(userID: String, data: any): String {
    return `?userID=${userID}&platformID=${data.platformID}&projectID=${data.projectID}`;
  }

  deleteRule(userID: String, ruleValue: Rule): any {
    return this.http.delete(`${URLRULEMANAGER}${deleteRule}${ruleValue.ID}${this.getQueryParameters(userID, ruleValue)}`, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map(
        (response: Response) => {

          return response;
        },
        (err: Response) => {
          if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
            this.router.navigate(['unauthorized']); }
          alert('There was an error during creating the trigger. Please talk to your system admin.');
          return {};
        }
      ));
  }

  deleteNotification(userID: String, notification: DataNotification): any {
    return this.http.delete(`${URLRULEMANAGER}${deleteNotification}${userID}/${notification.ID}`, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map(
        (response: Response) => {

          return response;
        },
        (err: Response) => {
          if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
            this.router.navigate(['unauthorized']); }
          alert('There was an error during creating the trigger. Please talk to your system admin.');
          return {};
        }
      ));
  }

  getTriggergroupByCategory(userID: String, category: string): any {
    return this.http.get(`${URLRULEMANAGER}${byCategory}/${userID}?category=${category}`, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map(
        (response: Response) => {

          return response;
        },
        (err: Response) => {
          if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
            this.router.navigate(['unauthorized']); }
          alert('There was an error during creating the trigger. Please talk to your system admin.');
          return {};
        }
      ));
  }

  getAllTriggergroups(userID: String): any {
    return this.http.get(`${URLRULEMANAGER}${allGroups}/${userID}?projectID=${this.project.id}`, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map(
        (response: Response) => {

          return response;
        },
        (err: Response) => {
          if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
            this.router.navigate(['unauthorized']); }
          alert('There was an error during creating the trigger. Please talk to your system admin.');
          return {};
        }
      ));
  }

  getAllRules(userID: String): any {
    console.log('getAllRules this.project',this.project);
    return this.http.get(`${URLRULEMANAGER}${allRules}/${userID}?projectID=${this.project.id}`, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map(
        (response: Response) => {

          return response;
        },
        (err: Response) => {
          if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
            this.router.navigate(['unauthorized']); }
          alert('There was an error during creating the trigger. Please talk to your system admin.');
          return {};
        }
      ));
  }

  getAllNotifications(userID: String): any {
    return this.http.get(`${URLRULEMANAGER}${allNotifications}/${userID}`, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map(
        (response: Response) => {

          return response;
        },
        (err: Response) => {
            if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
              this.router.navigate(['unauthorized']); }
            alert('There was an error during creating the trigger. Please talk to your system admin.');
            return {};
          }
      ));
  }
}
