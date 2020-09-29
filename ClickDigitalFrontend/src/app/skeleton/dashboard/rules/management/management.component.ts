import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { ConfirmationService, Message, SelectItem } from 'primeng/api';
import { RuleManagerService } from '../../../../services/rulemanager.service';
import { Rule } from '../../../../models/frontend/rule_module/rule';
import { Triggergroup } from '../../../../models/frontend/rule_module/triggergroup';
import { RuleManagementService } from '../service/rule-management.service';
import { RuleCreationService } from '../service/rule-creation.service';
import { DataService } from '../../../../services/data.service';
import { DeviceManagerService } from '../../../../services/devicemanager.service';
import { RuleManagementWidget } from '../../../../models/frontend/rulemanagementwidget';
import { DataNotification } from '../../../../models/frontend/rule_module/datanotification';
import { RuleNotificationService } from '../service/rule-notification.service';
import { Project } from '../../../../models/frontend/project';

@Component({
  selector: 'app-rule-management',
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.css'],
  providers: [ConfirmationService]

})

export class ManagementComponent implements OnInit {

  @Input() currentWidget: RuleManagementWidget;
  @Output() messageEvent = new EventEmitter<any>();

  displayRuleManagementDialog: boolean;
  editRuleValue: Rule;

  rules: Array<any>;
  userId: string;

  sortOptions: Array<SelectItem>;
  sortKey: string;
  sortField: string;
  sortOrder: number;

  indexedTriggers: Array<Triggergroup> = [];
  indexedProjects: Array<any> = [];
  indexedPlatforms: Array<any> = [];
  project: Project;
  changeProjectDataStatus = new EventEmitter<any>();

  constructor(private ruleManagementService: RuleManagementService,
              private ruleManagerService: RuleManagerService,
              private confirmationService: ConfirmationService,
              private ruleCreationService: RuleCreationService,
              private dataService: DataService,
              private devicemanager: DeviceManagerService,
              private ruleNotificationService: RuleNotificationService) {
    this.sortOptions = [
      {label: 'Name', value: 'name'},
      {label: 'Description', value: 'description'},
      {label: 'Project', value: 'project'},
      {label: 'Platform', value: 'platform'}
    ];

    this.indexedPlatforms = this.ruleCreationService.indexedPlatforms;
    this.indexedProjects = this.ruleCreationService.indexedProjects;
    this.indexedTriggers = this.ruleCreationService.indexedTriggers;
    this.project = this.ruleManagementService.selectedProjectData;
  }

  /**
   * Loads all platforms from all projects.
   * Gets all rules.
   * Saves logged user id.
   */
  ngOnInit(): void {

    this.userId = this.ruleCreationService.loggedUserId;
    if (this.userId && this.indexedPlatforms.length === 0) {
      this.devicemanager.getAllPlatformsFromAllProjects(this.userId)
        .subscribe(platforms => {
          this.indexedPlatforms = [];
          platforms.forEach(platform => {
            this.indexedPlatforms[platform.platformId] = platform;
          });
        });
    }
    if (this.userId) {
      this.getAllRules(this.userId);
    } else {
      this.dataService.userData.subscribe(resultUserData => {
        this.userId = resultUserData.id;
        this.ruleCreationService.loggedUserId = this.userId;
        this.getAllRules(this.userId);
      });
    }

    this.ruleCreationService.loadIndexedTriggers();

    this.ruleManagementService.displayStatusUpdated
      .subscribe(response => {
        this.displayRuleManagementDialog = response;
      });
  }

  /**
   * This function activates the rule
   *
   * @param Rule rule that has to be activated
   */
  activateRuleManagement(rule: Rule): void {
    rule.active = !rule.active;
    this.updateRuleActivation(rule);
  }

  getAllRules(userId: string): void {
    this.ruleManagerService.getAllRules(userId)
      .subscribe(resultRules => {
        this.rules = resultRules;
        this.rules.forEach(rule => {
          rule.project = this.indexedProjects[rule.projectID];
          rule.platform = this.indexedPlatforms[rule.platformID];
        });
      });
  }

  /**
   * Rule Management delete button pops confirmation message.
   *
   * @param Rule rule that has to be removed.
   */
  confirmRuleDelete(rule: Rule): void {
    this.confirmationService.confirm({
      message: 'Do you want to delete this rule?',
      header: 'Delete Confirmation',
      key: 'rulemanagement',
      icon: 'pi pi-info-circle',
      accept: () => {
        this.ruleManagerService.deleteRule(this.userId, rule)
          .subscribe(response => {
            this.saveNotification(this.userId, rule, 'deleted');
            this.deleteLocalRule(rule);
            this.messageEvent.emit({severity: 'success', summary: 'Confirmed', detail: 'Rule deleted.'});
          }, error => {
            this.messageEvent.emit({severity: 'warn', summary: 'Warning', detail: 'Something went wrong ${error.error}'});
          });
      },
      reject: () => {
        this.messageEvent.emit({severity: 'info', summary: 'Rejected', detail: 'You have rejected.'});
        //this.messeges = [{severity: 'info', summary: 'Rejected', detail: 'You have rejected'}];
      }
    });
  }

  /**
   * Delete rule from local list.
   *
   * @param Rule searchrule delete this search rule.
   */
  deleteLocalRule(searchrule: Rule): void {
    this.rules.forEach((rule: any, ruleIndex: number) => {
      if (searchrule.ID === rule.ID) {
        this.rules.splice(ruleIndex, 1);
      }
    });
  }

  /**
   * This function orders rule by name, description, project/platform name.
   *
   * @param event is order component.
   */
  onSortChange(event): void {
    const value = event.value;

    if (value.indexOf('!') === 0) {
      this.sortOrder = -1;
      this.sortField = value.substring(1, value.length);
    } else {
      this.sortOrder = 1;
      this.sortField = value;
    }
  }

  /**
   * Saves the notification related to the rule
   *
   * @param string userId is logged user id.
   * @param rule relation of the notification
   * @param string event can be activated/deactivated/save/delete/triggered
   */
  saveNotification(userId: string, rule: any, event: string): void {
    const notification: DataNotification = new DataNotification();
    notification.userId = userId;
    notification.name = rule.name;
    notification.event = event;
    notification.date = new Date();
    notification.relation = 'Rule';
    notification.relationID = rule.ID;
    rule.project = undefined;
    rule.platform = undefined;
    this.ruleManagerService.saveNotification(userId, notification)
      .subscribe(
      notificationResponse => {
        this.ruleNotificationService.add(notificationResponse);
      }
    );
  }

  /**
   * Activate/deactivate the rule
   *
   * @param rule that has to be activated
   */
  updateRuleActivation(rule: any): void {

    const activation = rule.active ? 'activated' : 'deactivated';

    if (rule.active) {
      this.ruleManagerService.activateRule(this.userId, rule)
        .subscribe(
          activatedRule => {
            this.messageEvent.emit({severity: 'success', summary: 'Activate Rule', detail: 'Rule has been activated.'});
            rule.project = undefined;
            rule.platform = undefined;
          }, error => {
            this.messageEvent.emit({
              severity: 'error',
              summary: 'Activate Rule',
              detail: 'Rule has not been activated. ${error.error}.'});
          });
    } else {
      this.ruleManagerService.deactivateRule(this.userId, rule)
        .subscribe(
          deactivatedRule => {
            this.messageEvent.emit({severity: 'success', summary: 'Deactivate Rule', detail: 'Rule has been deactivated.'});
            rule.project = undefined;
            rule.platform = undefined;
          }, error => {
            this.messageEvent.emit({
              severity: 'error',
              summary: 'Deactivate Rule',
              detail: 'Rule has not been deactivated. ${ error.error}.'});
          });
    }
  }

  /**
   * Edits the rule
   *
   * @param rule changed rule
   */
  editRule(rule: any): void {
    this.ruleManagementService.getRuleValueStatus.emit(rule);
    this.editRuleValue = rule;
    this.ruleManagementService.editRuleStatusUpdated.emit(rule);
    this.ruleManagementService.displayRuleUpdateComponent.emit(true);
  }
}
