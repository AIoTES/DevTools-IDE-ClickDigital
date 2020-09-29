import { Component, OnInit } from '@angular/core';
import { UserManagerService } from '../../../../services/usermanager.service';
import { Rule } from '../../../../models/frontend/rule_module/rule';
import { RuleManagerService } from '../../../../services/rulemanager.service';
import { RuleCreationService } from '../service/rule-creation.service';
import { DataService } from '../../../../services/data.service';
import { Message } from 'primeng/api';
import { Triggergroup } from '../../../../models/frontend/rule_module/triggergroup';
import { DeviceManagerService } from '../../../../services/devicemanager.service';
import { RuleManagementService } from '../service/rule-management.service';
import { Project } from '../../../../models/frontend/project';

@Component({
  selector: 'app-rule-sharing',
  templateUrl: './sharing.component.html',
  styleUrls: ['./sharing.component.css']
})
export class SharingComponent implements OnInit {

  users: Array<any> = [];
  filteredUsers: Array<any> = [];
  user: any;
  loggedUserPlatforms: Array<any>;

  rules: Array<Rule> = [];
  filteredRules: Array<Rule> = [];
  rule: any;
  messeges: Array<Message> = [];
  autoSelects: Array<any> = [];
  project: Project;

  constructor(private userManagerService: UserManagerService,
              private ruleManagerService: RuleManagerService,
              private ruleManagementService: RuleManagementService,
              private ruleCreationService: RuleCreationService,
              private dataService: DataService,
              private deviceManager: DeviceManagerService) {
    this.autoSelects = [{name: 'User'}, {name: 'Rule'}];
    this.loggedUserPlatforms = this.ruleCreationService.loggedUserPlatforms;
  }

  /**
   * Load project.
   * Load platforms and projects.
   * Load all users.
   * Load all rules.
   */
  ngOnInit(): void {
    if (!this.ruleManagementService.selectedProjectData) {
      this.dataService.projectData
        .subscribe(project => {
          this.project = project;
          this.ruleManagementService.selectedProjectData = project;
        });
    } else {
      this.project = this.ruleManagementService.selectedProjectData;
    }
    let userId = this.ruleCreationService.loggedUserId;

    this.dataService.userData.subscribe(resultUserData => {
      userId = resultUserData.id;
      this.ruleCreationService.loggedUserId = userId;
      this.deviceManager.getAllPlatformsFromAllProjects(userId)
        .subscribe(platforms => {
          platforms.forEach(platform => {
            this.loggedUserPlatforms[platform.platformId] = platform;
          });
          this.ruleCreationService.loggedUserPlatforms = this.loggedUserPlatforms;
        });
      this.userManagerService.getAllUsers()
        .subscribe(users => {
          this.users = users.filter(user => user.id !== userId);
        });

      this.ruleManagerService.getAllRules(userId)
        .subscribe(rules => {
          this.rules = rules;
        });
    });
  }

  /**
   * Filters users by the name
   *
   * @param event is autocomplete component
   */
  filterUsers(event): void {
    this.filteredUsers = [];
    for (const i of Object.keys(this.users)) {
      const user = this.users[i];
      if (user.username.toLowerCase()
          .indexOf(event.query.toLowerCase()) === 0) {
        this.filteredUsers.push(user);
      }
    }
  }

  /**
   * Filters rules by the name.
   *
   * @param event is autocomplete component.
   */
  filterRules(event): void {
    this.filteredRules = [];
    for (const i of Object.keys(this.rules)) {
      const rule = this.rules[i];
      if (rule.name.toLowerCase()
          .indexOf(event.query.toLowerCase()) === 0) {
        this.filteredRules.push(rule);
      }
    }
  }

  /**
   * Clears all messages.
   */
  clear(): void {
    this.messeges = [];
  }

  /**
   * Clears rule and user values.
   */
  clearRuleUser(): void {
    this.user = '';
    this.rule = '';
  }

  /**
   * Share the rule to the another user
   *
   * @param user is shared user.
   * @param Rule rule shared rule.
   */
  shareRuleToUser(user: any, rule: Rule): void {
    this.clear();
    if (!user) {
      this.messeges.push({
        severity: 'error',
        summary: '',
        detail: 'User has not been selected'
      });
      setTimeout(() => {
        this.clear();
      }, 2000);
    } else if (!rule) {
      this.messeges.push({
        severity: 'error',
        summary: '',
        detail: 'Rule has not been selected'
      });
      setTimeout(() => {
        this.clear();
      }, 2000);
    } else {
      this.ruleManagerService.getTriggersByTGID(this.ruleCreationService.loggedUserId, rule.rootTGID)
        .subscribe(triggers => {
          const responseTriggers: Array<Triggergroup> = triggers;
          for (const trigger of responseTriggers) {
            trigger.userId = user.id;
          }
          this.ruleManagerService.shareAllTriggergroup(user.id, rule.rootTGID, responseTriggers)
            .subscribe(
              TriggerRoot => {
                rule.rootTGID = TriggerRoot;
                rule.userId = user.id;
                this.deviceManager.getAllPlatformsFromAllProjects(user.id)
                  .subscribe(platforms => {
                    const lgUsPlatform = this.ruleCreationService.loggedUserPlatforms[rule.platformID];
                    if (platforms.length === 0) {
                      this.messeges.push({
                        severity: 'error',
                        summary: '',
                        detail: 'This user does not have any assigned platform'
                      });
                      setTimeout(() => {
                        this.clear();
                      }, 2000);
                    } else {

                      platforms.forEach((platform: any, index: number) => {
                        if (lgUsPlatform && platform.ip === lgUsPlatform.ip && platform.port === lgUsPlatform.port) {
                          const sharedRule = new Rule();
                          sharedRule.setRuleData(rule);
                          sharedRule.platformID = platform.platformId;
                          sharedRule.projectID = platform.projectId;
                          this.ruleManagerService.saveRule(user.id, sharedRule)
                            .subscribe(
                              responseRule => {
                                if (index === platforms.length - 1) {
                                  this.messeges.push({
                                    severity: 'success',
                                    summary: '',
                                    detail: `Rule ${responseRule.name} has been shared`
                                  });
                                }
                                setTimeout(() => {
                                  this.clear();
                                }, 2000);
                              },
                              error => {
                                setTimeout(() => {
                                  this.clear();
                                }, 2000);
                                if (index === platforms.length - 1) {
                                  if (error.status === 404) {
                                    this.messeges.push({
                                      severity: 'error',
                                      summary: '',
                                      detail: 'This user does not have any rule compatible platforms'
                                    });
                                  } else {
                                    this.messeges.push({
                                      severity: 'error',
                                      summary: '',
                                      detail: 'This rule has not been shared. Something went wrong'
                                    });
                                  }
                                }
                              });
                        }
                      });
                    }
                  });

              },
              error => {
                console.log('share all Triggergroup error', error);
              });
        });
    }
  }
}
