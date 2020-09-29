import { Component, EventEmitter, Input, OnInit, ViewChild } from '@angular/core';
import { Condition } from '../../../../models/frontend/rule_module/condition';
import { Triggergroup } from '../../../../models/frontend/rule_module/triggergroup';
import { Trigger } from '../../../../models/frontend/rule_module/trigger';
import { RuleCreationService } from '../service/rule-creation.service';
import { Message } from 'primeng/components/common/api';
import { Rule } from '../../../../models/frontend/rule_module/rule';
import { RuleManagerService } from '../../../../services/rulemanager.service';
import { RuleAction } from '../../../../models/frontend/rule_module/ruleaction';
import { DeviceManagerService } from '../../../../services/devicemanager.service';
import { RuleManagementService } from '../service/rule-management.service';
import { DataService } from '../../../../services/data.service';
import { DataNotification } from '../../../../models/frontend/rule_module/datanotification';
import { RuleNotificationService } from '../service/rule-notification.service';
import { PlatformDeviceManagementService } from '../service/platform-device-management.service';
import { Project } from '../../../../models/frontend/project';

interface Operator {
  triggerId: number;
  operator: string;
}

@Component({
  selector: 'app-rule-creation',
  templateUrl: './rule-creation.component.html',
  styleUrls: ['./rule-creation.component.css'],
  providers: [Triggergroup, Condition, Trigger, RuleAction]
})

export class CreateRuleComponent implements OnInit {

  @ViewChild('triggerOverlay') triggerOverlayRef: any;
  @Input() rule_function: string;
  @Input() rule: any;

  messeges: Array<Message> = [];

  selectedOperatorList: Array<Operator> = [];
  operators: Array<Operator> = [{triggerId: 0, operator: 'AND'}, {triggerId: 0, operator: 'OR'}];

  ruleDescription: string;
  creationRule: Rule;

  triggerList: Array<Triggergroup>;
  indexedTriggerList: Array<any> = [];
  indexedOperatorList: Array<any> = [];

  actionList: Array<RuleAction>;

  platforms: Array<any> = [];
  projects: Array<any> = [];

  dragTrigger: Triggergroup;
  dragOperator: any;
  dragTriggerIndex: number;
  displayRuleCreationDialog = false;
  triggerEventEmitter = new EventEmitter<number>();
  triggerOperatorEvent: any;
  operatorIndex: number;
  editRuleValue: Rule;
  userId: string;
  generateNewTriggerTree = false;
  editOverlayEvent: any;
  updateTriggerList: any;

  operatorLables = [
    {
      label: 'AND', command: () => {
      this.changeOperator(undefined, this.operators[0], this.operatorIndex);
    }
    },
    {
      label: 'OR', command: () => {
      this.changeOperator(undefined, this.operators[1], this.operatorIndex);
    }
    }];
  updateRuleLables = [{
    label: 'Update', command: () => {
      this.updateTriggerAndRule(false);
    }
  },
    {
      label: 'Update and close ', command: () => {
      this.updateTriggerAndRule(true);
    }
    }];

  saveRuleLables = [{
    label: 'Save and create new', command: () => {
      this.saveTriggerAndRule(false);
    }
  },
    {
      label: 'Save and close ', command: () => {
      this.saveTriggerAndRule(true);
    }
    }];

  sendRequest = false;

  constructor(private ruleCreationService: RuleCreationService,
              private ruleManagerService: RuleManagerService,
              private ruleManagementService: RuleManagementService,
              private dataService: DataService,
              private ruleNotificationService: RuleNotificationService,
              private devicemanager: DeviceManagerService,
              private platformDeviceManagement: PlatformDeviceManagementService) {

    this.creationRule = this.ruleCreationService.creationRule;
    this.selectedOperatorList = this.ruleCreationService.selectedOperatorList;
    this.triggerList = this.ruleCreationService.triggerList;
    this.actionList = this.ruleCreationService.actionList;
    this.creationRule.active = false;
    this.displayRuleCreationDialog = ruleCreationService.displayRuleCreationDialog;
    this.updateTriggerList = this.ruleManagementService.updateTriggerList;
    this.platforms = this.ruleCreationService.platforms;
  }

  ngOnInit(): void {

    // Here checks if it is update rule component
    if (this.rule_function === 'edit' && this.rule) {
      this.editRuleValue = this.rule;

      this.creationRule = this.editRuleValue;
      this.ruleCreationService.creationRule = this.rule;
      this.actionList = this.creationRule.ruleActions;
      this.ruleCreationService.actionList = this.actionList;
      const userId = this.rule.userId;

      // Here gets all platforms dependent on user and projectID
      if (userId && this.creationRule.projectID) {
        this.devicemanager.getAllPlatforms(userId, this.creationRule.projectID)
          .subscribe(platforms => {
            this.platforms = [];
            platforms.forEach(platform => {
              this.platforms.push({label: platform.name, value: platform.platformId});
              this.ruleCreationService.indexedPlatforms[platform.platformId] = platform;
              this.ruleCreationService.platforms = this.platforms;

            });
          });
      }
      // Here will be defined all projects
      this.ruleCreationService.projects.forEach(project => {
        this.projects.push({label: project.name, value: project.id});
      });
      this.triggerList = [];
      this.ruleCreationService.triggerList = [];
      this.selectedOperatorList = [];
      this.ruleCreationService.selectedOperatorList = [];
      /**
       * Update rule component needs to order trigger tree as a list.
       * This function orderEditTriggers oders the triggers
       */
      this.ruleManagerService.getTriggersByTGID(userId, this.creationRule.rootTGID)
        .subscribe(responseTriggers => {
          this.orderEditTriggers(this.creationRule.rootTGID, responseTriggers);
        });
      // gets all devices dependent on project, plaform and user id.
      this.platformDeviceManagement.addAllDevices(this.rule.projectID, this.rule.userId, this.rule.platformID);
    } else {
      this.ruleCreationService.projects.forEach(project => {
        this.projects.push({label: project.name, value: project.id});
      });
      this.creationRule = new Rule();
      this.ruleCreationService.triggerList = [];
      this.ruleCreationService.actionList = [];
      this.triggerList = this.ruleCreationService.triggerList;
      this.actionList = this.ruleCreationService.actionList;
    }

    this.ruleCreationService.triggerOverlay = this.triggerOverlayRef;

    // sets logged user id
    this.dataService.userData.subscribe(resultUserData => {
      this.ruleCreationService.loggedUserId = resultUserData.id;
      this.userId = this.ruleCreationService.loggedUserId;
    });
  }

  /**
   * This function orders trigger binary tree as a list.
   * This function is called only for Rule Update component.
   * @param Triggergroup rootTriggerGroup is last/root triggergroup.
   * @param Array<Triggergroup> indexedTriggerList is all triggergroups indexed by the triggergroup id.
   */
  orderTriggerOperator(rootTriggerGroup: Triggergroup, indexedTriggerList: Array<Triggergroup>): void {
    if (rootTriggerGroup.rightchild !== 0 && rootTriggerGroup.leftchild !== 0) {
      this.orderTriggerOperator(indexedTriggerList[rootTriggerGroup.leftchild], indexedTriggerList);
      this.triggerList.push(indexedTriggerList[rootTriggerGroup.rightchild]);
      this.selectedOperatorList.push({
        triggerId: indexedTriggerList[rootTriggerGroup.ID].ID,
        operator: indexedTriggerList[rootTriggerGroup.ID].operator
      });
      this.indexedOperatorList.push({
        triggerId: indexedTriggerList[rootTriggerGroup.ID].ID,
        operator: indexedTriggerList[rootTriggerGroup.ID].operator
      });
      this.ruleCreationService.selectedOperatorList = this.selectedOperatorList;
    } else {
      this.triggerList.push(rootTriggerGroup);
      this.ruleCreationService.triggerList = this.triggerList;
    }
  }

  /**
   * This function gets project connected platforms and adds all devices.
   * @param string projectId
   */
  projectSelected(projectId: string): void {
    if (projectId) {
      this.ruleManagerService.project = this.findProject(projectId);

      if (projectId && this.ruleCreationService.loggedUserId) {
        this.devicemanager.getAllPlatforms(this.ruleCreationService.loggedUserId, this.creationRule.projectID)
          .subscribe(platforms => {
            this.creationRule.platformID = '';
            this.ruleManagementService.updateTriggerListStatus.emit(true);
            this.platforms = [];
            platforms.forEach(platform => {
              this.platforms.push({label: platform.name, value: platform.platformId});
              this.ruleCreationService.indexedPlatforms[platform.platformId] = platform;
              this.ruleCreationService.platforms = this.platforms;
            });
          });
      }
    }
  }

  /**
   * Add devices connected to the project, user, platform
   * @param String platformID is Platform Id
   */
  addAllDevices(platformID: String): void {
    if (platformID) {
      const r = this.creationRule;
      const userId = this.ruleCreationService.loggedUserId;
      this.platformDeviceManagement.addAllDevices(r.projectID, userId, r.platformID);
    }
  }

  /**
   * Serach project by project Id
   *
   * @param string projectId is filter parameter
   * @returns any is Project Object
   */
  findProject(projectId: string): any {
    for (const project of this.ruleCreationService.projects) {
      if (project.id === projectId) {
       return project;
     }
    }
  }

  /**
   * Indexes trigger list by trigger Id
   * @param number rootTGID is id of root triggergroup
   * @param Array<Triggergroup> triggers is list of related triggers
   */
  orderEditTriggers(rootTGID: number, triggers: Array<Triggergroup>): void {
    triggers.forEach((value: Triggergroup) => {
      this.indexedTriggerList[value.ID] = value;
    });

    const rootTriggerGroup: Triggergroup = this.indexedTriggerList[rootTGID];
    this.orderTriggerOperator(rootTriggerGroup, this.indexedTriggerList);
  }

  /**
   * Drop function from Angular docu
   * @param ev is clicked component.
   */
  allowDrop(ev): void {
    ev.preventDefault();
  }

  /**
   * Clears all rule values, triggers and actions.
   */
  clearRuleData(): void {
    this.creationRule = new Rule();
    this.triggerList = [];
    this.actionList = [];
    this.ruleCreationService.creationRule = this.creationRule;
    this.ruleCreationService.triggerList = this.triggerList;
    this.ruleCreationService.actionList = this.actionList;
  }

  /**
   * Close Rule Creation Component Pop-up
   * and clear all Rule values
   */
  closeRuleCreationDisplay(): void {

    this.displayRuleCreationDialog = false;
    this.ruleCreationService.displayStatusUpdated.emit(this.displayRuleCreationDialog);
    this.clearRuleData();
  }

  /**
   * Close Rule Update Component Pop-up
   * and clear all Rule values
   */
  closeRuleUpdateDisplay(): void {
    this.displayRuleCreationDialog = false;
    this.ruleCreationService.displayStatusUpdated.emit(false);
    this.ruleManagementService.displayStatusUpdated.emit(false);
    this.ruleManagementService.displayRuleUpdateComponent.emit(false);
    this.clearRuleData();
  }

  /**
   * Checks if element is Empty
   * @param element value
   * @returns boolean is true is Empty
   */
  isEmptyArray(element): boolean {
    return element === undefined;
  }

  /**
   * Clears modified trigger(conditions).
   * Dependent of the parameters will be the triggers data cleared.
   *
   * @param string functionType edit,remove
   * @param string functionOptions new, old
   * @param string nextoption all, only
   * @param number triggerID is Trigger Id
   */
  clearUpdateTriggers(functionType: string, functionOptions: string, nextoption: string, triggerID: number): void {
    for (const index of Object.keys(this.updateTriggerList)) {
      const functionValue: any = this.updateTriggerList[index];
      if (index !== 'addNew') {
        for (const optionIndex of Object.keys(functionValue)) {
          const optionValue: any = functionValue[optionIndex];
          if (optionIndex === 'new') {
            for (const optionNextIndex of Object.keys(optionValue)) {
              const triggersList: any = optionValue[optionNextIndex];
              if ((index !== functionType || optionIndex !== functionOptions || optionNextIndex !== nextoption)
                && triggersList[triggerID]) {
                triggersList.splice(triggerID, 1);
                if (triggersList.every(this.isEmptyArray)) {
                  this.updateTriggerList[index][optionIndex][optionNextIndex] = [];
                }
              }
            }
          } else {
            if ((index !== functionType || optionIndex !== functionOptions) && optionValue[triggerID]) {
              optionValue.splice(triggerID, 1);
              if (optionValue.every(this.isEmptyArray)) {
                this.updateTriggerList[index][optionIndex] = [];
              }
            }
          }
        }
      } else {
        if (functionType !== 'addNew' && this.updateTriggerList.addNew[triggerID]) {
          this.updateTriggerList.addNew.splice(triggerID, 1);
          if (this.updateTriggerList.addNew.every(this.isEmptyArray)) {
            this.updateTriggerList.addNew = [];
          }
        }
      }
    }
  }

  /**
   * This function edits the trigger
   *
   * @param number triggerIndex is idex of trigger
   * @param trigger is modified trigger
   * @param editIconOverlay is overlay of edit
   * @param string functionType are edit, remove
   * @param string functionOption are new, old
   */
  editTrigger(triggerIndex: number, trigger: any, editIconOverlay: any, functionType: string, functionOption: string): void {
    const sendTrigger: any = {
      triggerIndex,
      trigger,
      functionType,
      functionOption
    };

    this.ruleManagementService.editTriggergroupStatusUpdated.emit(sendTrigger);

    this.ruleManagementService.changeExistingTriggerGroupStatus.subscribe((changedTrigger: any) => {

      if (changedTrigger.oldTriggerIndex === triggerIndex) {
        editIconOverlay.hide(event);
        this.indexedTriggerList[triggerIndex] = changedTrigger.trigger;
        this.triggerList[triggerIndex] = this.indexedTriggerList[triggerIndex];
        this.ruleCreationService.triggerList = this.triggerList;

        if (!this.updateTriggerList.addNew[this.triggerList[triggerIndex].ID]) {

          this.updateTriggerList[functionType][functionOption][this.triggerList[triggerIndex].ID] = this.triggerList[triggerIndex];
          this.clearUpdateTriggers(functionType, functionOption, undefined, this.triggerList[triggerIndex].ID);

        } else {
          this.updateTriggerList[functionType]['new'][functionOption][this.triggerList[triggerIndex].ID] = this.triggerList[triggerIndex];
          this.clearUpdateTriggers(functionType, 'new', functionOption, this.triggerList[triggerIndex].ID);

        }
      }
    });
  }

  /**
   * This function edits the action
   *
   * @param number actionIndex
   * @param action is modified action
   * @param editActionIconOverlay is overlay of action edit icon
   * @param string functionType  are edit, remove
   * @param string functionOption are new, old
   */
  editAction(actionIndex: number, action: any, editActionIconOverlay: any, functionType: string, functionOption: string): void {
    const sendAction: any = {
      actionIndex,
      action,
      functionType,
      functionOption
    };

    this.ruleManagementService.editActionStatusUpdated.emit(sendAction);

    this.ruleManagementService.changeExistingActionStatus.subscribe((changedAction: any) => {

      if (changedAction.oldActionIndex === actionIndex) {
        editActionIconOverlay.hide(event);
        this.ruleCreationService.actionList = this.actionList;

      }
    });
  }

  /**
   * saves the operator for the triggers
   * @param event is clicked component event
   * @param number operatorIndex is trigger index
   */
  saveOperationEventAndIndex(event: any, operatorIndex: number): void {
    this.triggerOperatorEvent = event;
    this.operatorIndex = operatorIndex;
  }

  /**
   * This function displays notification message
   *
   * @param severity is type error or success
   * @param summary is title Rule Error
   * @param message is notification message
   */
  showMessage(severity, summary, message): void {
    this.messeges = [];
    this.messeges.push({severity, summary, detail: message});
  }

  /**
   * This function saves all combined triggers
   *
   * @param number index is trigger index
   * @param Triggergroup triggergroup
   */
  saveCombineTriggers(index: number, triggergroup: Triggergroup): void {
    if ((index + 1) < this.triggerList.length) {
      const localTrigger: Triggergroup = new Triggergroup();
      localTrigger.leftchild = triggergroup.ID;
      localTrigger.rightchild = this.triggerList[index + 1].ID;
      localTrigger.operator = this.selectedOperatorList[index].operator;
      localTrigger.name = `(${ triggergroup.name } ${ this.selectedOperatorList[index].operator} ${this.triggerList[index + 1].name })`;
      localTrigger.trigger = undefined;
      this.ruleManagerService.addNewTriggerLeaf(this.userId, localTrigger)
        .subscribe(response => {
          this.saveCombineTriggers(index + 1, response);
        });
    } else {
      this.triggerEventEmitter.emit(triggergroup.ID);
    }
  }

  /**
   * This function checks if trigger length is one.
   * If not saved combined triggers.
   * If yes no combination is required and it saves one trigger.
   */
  saveTriggerTree(): void {
    if (this.triggerList.length === 1) {
      this.triggerEventEmitter.emit(this.triggerList[0].ID);
    } else {
      this.saveCombineTriggers(0, this.triggerList[0]);
    }
  }

  /**
   * This function saves the new notification
   *
   * @param string userId is logged user id
   * @param Rule rule notification relation is rule
   * @param string event is name of notification event
   */
  saveNotification(userId: string, rule: Rule, event: string): void {
    const notification: DataNotification = new DataNotification();
    notification.userId = userId;
    notification.name = rule.name;
    notification.event = event;
    notification.date = new Date();
    notification.relation = 'Rule';
    notification.relationID = rule.ID;
    this.ruleManagerService.saveNotification(userId, notification)
      .subscribe(notificationResponse => {
          this.ruleNotificationService.add(notificationResponse);
        }
      );
  }

  /**
   * This function saves the rule
   * @param rootTGID last/root triggergroup Id
   * @param boolean close: if close is true then close the popup window
   */
  saveRule(rootTGID: any, close: boolean): void {
    const ruleValue: Rule = new Rule();
    const userId = this.ruleCreationService.loggedUserId;
    this.creationRule.rootTGID = rootTGID;
    this.creationRule.ruleActions = this.ruleCreationService.actionList;
    this.creationRule.userId = userId;
    ruleValue.setRuleData(this.creationRule);

    this.ruleManagerService.saveRule(userId, ruleValue)
      .subscribe(savedRule => {
        this.creationRule = new Rule();
        this.actionList = [];
        this.triggerList = [];
        this.saveNotification(userId, savedRule, 'created');
        this.sendRequest = false;
        this.showMessage('success', 'Rule Creation', `Rule has been created `);
        if (close) {
          setTimeout(() => {
            this.closeRuleCreationDisplay();
          }, 1000);
        }
      }, error => {
        this.sendRequest = false;
        this.showMessage('error', 'Rule Error', `Rule has not been created ${ error.error} `);
      });
  }

  /**
   * This function updates the existing rule
   *
   * @param rootTGID last/root triggergroup Id
   * @param boolean close: if close is true then close the popup window
   */
  updateRule(rootTGID: any, close: boolean): void {
    const ruleValue: Rule = new Rule();
    const userId = this.ruleCreationService.loggedUserId;
    this.creationRule.rootTGID = rootTGID;
    this.creationRule.ruleActions = this.ruleCreationService.actionList;
    this.ruleCreationService.loadIndexedTriggers();
    ruleValue.setRuleData(this.creationRule);
    this.ruleManagerService.updateRule(userId, ruleValue)
      .subscribe(updatedRule => {
        this.sendRequest = false;
        this.showMessage('success', 'Rule Update', `Rule has been updated `);
        this.saveNotification(userId, ruleValue, 'updated');
        if (close) {
          setTimeout(() => {
            this.closeRuleUpdateDisplay();
          }, 1000);
        }
      }, error => {
        this.sendRequest = false;
        this.showMessage('error', 'Rule Error', `Rule has not been updated ${ error.error} `);
      });
  }

  /**
   * This function validates the rule values.
   * If some value is missing or is not correct, then
   * notification message will show up.
   *
   * @param Rule creationRule main created rule
   * @param Array<Triggergroup> triggerList rule related trigger list
   * @param Array<RuleAction> actionList rule related action list
   * @returns boolean returns true if everything is right. If not return false.
   */
  checkRuleData(creationRule: Rule, triggerList: Array<Triggergroup>, actionList: Array<RuleAction>): boolean {

    if (!creationRule.name || !creationRule.description) {
      this.showMessage('info', 'Rule Name', 'Please write rule name and description');

      return false;
    }
    if (!creationRule.platformID) {
      this.showMessage('info', 'Rule Platform', 'Please select rule platform');

      return false;
    }
    if (!creationRule.projectID) {
      this.showMessage('info', 'Rule Project', 'Please select project');

      return false;
    }
    if (triggerList.length === 0) {
      this.showMessage('info', 'Rule Trigger', 'Please add rule condition/action');

      return false;
    }
    if (actionList.length === 0) {
      this.showMessage('info', 'Rule Action', 'Please add rule action');

      return false;
    }

    return true;
  }

  /**
   * Saves trigger tree and rule values
   *
   * @param boolean close: if close is true then close the popup window
   */
  saveTriggerAndRule(close: boolean): void {

    if (this.checkRuleData(this.creationRule, this.triggerList, this.actionList)) {

      if (!this.sendRequest) {
        this.sendRequest = true;
        if (this.triggerList.length === 1) {
          this.saveRule(this.triggerList[0].ID, close);
        } else {
          this.saveTriggerTree();
          this.triggerEventEmitter.subscribe(responseRootTGID => {
            this.saveRule(responseRootTGID, close);
          });
        }
      }
    }
  }

  /**
   * Returns trigger index from trigger list
   *
   * @param Triggergroup trigger is search trigger
   * @returns number is index from trigger list
   */
  findIndexOfTrigger(trigger: Triggergroup): number {
    for (const index in this.triggerList) {
      if (this.triggerList[index].ID === trigger.ID) {
        return parseInt(index, 10);
      }
    }
  }

  /**
   * Updates trigger tree and return root id.
   *
   * @returns any : true, false or root trigger id.
   */
  updateTriggers(): any {

    const userId = this.ruleCreationService.loggedUserId;
    const upData = this.updateTriggerList;
    const sum: number = parseInt((upData.remove.all.length +
      upData.remove.only.length +
      upData.remove.new.all.length +
      upData.remove.new.only.length +
      upData.addNew.length +
      upData.edit.only +
      upData.edit.new.only), 10);

    if (upData.remove.all.length > 0
      || upData.remove.only.length > 0
      || upData.edit.only.length > 0) {

      if (upData.remove.all.length > 0) {
        this.ruleManagerService.deleteTriggers(userId, upData.remove.all);
      }
      if (this.triggerList.length === 1) {

        return this.triggerList[0].ID;
      } else {
        this.saveTriggerTree();

        return true;
      }
    } else {
      if (upData.edit.new.all.length > 0
        || upData.edit.new.only.length > 0
        || upData.addNew.length > 0) {
        if (this.indexedTriggerList[this.creationRule.rootTGID].rightchild === 0) {
          this.saveCombineTriggers(0, this.indexedTriggerList[this.creationRule.rootTGID]);

          return true;
        } else {
          const righchildID = this.indexedTriggerList[this.creationRule.rootTGID].rightchild;
          const index = this.findIndexOfTrigger(this.indexedTriggerList[righchildID]);
          this.saveCombineTriggers(index, this.indexedTriggerList[this.creationRule.rootTGID]);

          return true;
        }
      } else {

        return this.creationRule.rootTGID;
      }
    }
  }

  /**
   *  Updates triggers and rule values
   *
   * @param boolean close: if close is true then close the popup window
   */
  updateTriggerAndRule(close: boolean): void {
    if (this.checkRuleData(this.creationRule, this.triggerList, this.actionList)) {
      this.creationRule.ruleActions = this.actionList;
      const isNewTree = this.updateTriggers();

      if (isNewTree === true) {
        this.triggerEventEmitter.subscribe(responseRootTGID => {
          this.updateRule(responseRootTGID, close);
          this.ruleManagementService.clearUpdateTriggerList();
          this.updateTriggerList = this.ruleManagementService.updateTriggerList;
          this.ruleManagementService.updateTriggerListStatus.emit(true);
        });
      } else {
        this.updateRule(isNewTree, close);
        this.ruleManagementService.clearUpdateTriggerList();
        this.updateTriggerList = this.ruleManagementService.updateTriggerList;
        this.ruleManagementService.updateTriggerListStatus.emit(true);
      }
    }
  }

  /**
   * Show the trigger Overlay component
   *
   * @param event is clicked component event
   */
  addTriggerOverlay(event: any): void {
    if (!this.creationRule.projectID || !this.creationRule.platformID) {
      this.showMessage('info', 'Rule Project/Platform', 'Please select rule project and platform');
    } else {
      if (event) {
        this.triggerOverlayRef.show(event);
      } else {
        this.triggerOverlayRef.show(this.triggerOperatorEvent);
      }
    }
  }

  /**
   * Change operator(AND,OR) for triggers.
   *
   * @param event is component element.
   * @param Operator selectedOperator selected operator.
   * @param number inputValue is index of changed operator list.
   */
  changeOperator(event: any, selectedOperator: Operator, inputValue: number): void {
    if (event) {
      this.triggerOperatorEvent = event;
    }
    this.selectedOperatorList[inputValue] = selectedOperator;
    this.ruleCreationService.selectedOperatorList[inputValue] = selectedOperator;
    this.addTriggerOverlay(undefined);
  }

  /**
   * Changes the selected operator
   *
   * @param operator new Operator
   * @param number index is indexed operatorList
   */
  changeOperatorSelect(operator: any, index: number): void {
    const trId = this.indexedOperatorList[index].triggerId;
    operator.triggerId = trId;
    if (this.indexedTriggerList[trId].operator !== operator.operator) {
      this.indexedTriggerList[trId].operator = operator.operator;
      this.updateTriggerList.edit.all[trId] = this.indexedTriggerList[trId];
      this.clearUpdateTriggers('edit', 'all', undefined, trId);
      this.ruleManagementService.updateTriggerList = this.updateTriggerList;
    }
  }

  /**
   * Show action ovlerlay
   *
   * @param event is clicked component
   * @param overlay of the action
   */
  addActionOverlay(event: any, overlay: any): void {
    if (!this.creationRule.projectID || !this.creationRule.platformID) {
      this.showMessage('info', 'Rule Project/Platform', 'Please select rule project and platform');
    } else {
      overlay.show(event);
      this.ruleCreationService.actionOverlay = overlay;
    }
  }

  /**
   * Removes local trigger from trigger list by index.
   *
   * @param number index
   */
  removeTrigger(index: number): void {
    this.triggerList.splice(index, 1);
    this.selectedOperatorList.splice(index, 1);
    this.ruleCreationService.triggerList = this.triggerList;
  }

  /**
   * Remove trigger by index
   *
   * @param Triggergroup trigger removed
   * @param number triggerIndex is trigger index
   * @param removeTriggerOverlay overlay of condition
   * @param event is component element
   */
  removeTriggerForAllRules(trigger: Triggergroup, triggerIndex: number, removeTriggerOverlay: any, event: any): void {

    this.generateNewTriggerTree = true;
    this.removeTrigger(triggerIndex);
    removeTriggerOverlay.hide(event);

    if (this.updateTriggerList.addNew[trigger.ID]) {
      this.updateTriggerList.remove.new.all[trigger.ID] = trigger;
      this.clearUpdateTriggers('remove', 'new', 'all', trigger.ID);
    } else {
      this.updateTriggerList.remove.all[trigger.ID] = trigger;
      this.clearUpdateTriggers('remove', 'all', undefined, trigger.ID);
    }
  }

  /**
   * Remove trigger from one rule
   *
   * @param Triggergroup trigger removed
   * @param number triggerIndex is trigger index
   * @param removeTriggerOverlay overlay of condition
   * @param event is component element
   */
  removeTriggerOnlyThisRule(trigger: Triggergroup, triggerIndex: number, removeTriggerOverlay: any, event: any): void {
    this.generateNewTriggerTree = true;
    this.removeTrigger(triggerIndex);
    removeTriggerOverlay.hide(event);
    if (this.updateTriggerList.addNew[trigger.ID]) {
      this.updateTriggerList.remove.new.only[trigger.ID] = trigger;
      this.clearUpdateTriggers('remove', 'new', 'only', trigger.ID);
    } else {
      this.updateTriggerList.remove.only[trigger.ID] = trigger;
      this.clearUpdateTriggers('remove', 'only', undefined, trigger.ID);
    }
  }

  /**
   * Shows action overlay and edits action
   *
   * @param editActionIconOverlay is overlay component
   * @param event is clicked component element
   * @param number actionIndex is index of list
   * @param RuleAction action is edit action
   */
  showEditActionOverlay(editActionIconOverlay: any, event: any, actionIndex: number, action: RuleAction): void {
    editActionIconOverlay.show(event);
    this.editAction(actionIndex, action, editActionIconOverlay, 'edit', 'only');
  }

  /**
   * If trigger combines multiple triggers this function
   * devides it as two trigger parts.
   *
   * @param number triggerIndex index devided triggers
   * @param Triggergroup trigger clicked trigger
   * @returns boolean is true if trigger is devided
   */
  divideTrigger(triggerIndex: number, trigger: Triggergroup): boolean {
    if (trigger.leftchild !== 0 && trigger.rightchild !== 0) {
      this.triggerList.splice(triggerIndex, 1, this.indexedTriggerList[trigger.leftchild]);
      this.triggerList.splice(triggerIndex + 1, 0, this.indexedTriggerList[trigger.rightchild]);
      this.selectedOperatorList.splice(triggerIndex, 0, {triggerId: trigger.ID, operator: trigger.operator});
      this.ruleCreationService.triggerList = this.triggerList;

      return true;
    }

    return false;
  }

  /**
   * Edit trigger for all rules
   *
   * @param Triggergroup trigger changed trigger
   * @param number triggerIndex is index trigger
   * @param editIconOverlay is overlay component of trigger
   * @param upO upload Overlay
   * @param event is clicked component
   */
  editTriggerForAllRules(trigger: Triggergroup, triggerIndex: number, editIconOverlay: any, upO: any, event: any): void {
    upO.show(this.editOverlayEvent);
    editIconOverlay.hide(event);
    this.editTrigger(triggerIndex, trigger, upO, 'edit', 'all');
  }

  /**
   * Edits trigger only one rule
   *
   * @param Triggergroup trigger changed trigger
   * @param number triggerIndex is index trigger
   * @param editIconOverlay is overlay component of trigger
   * @param upO upload Overlay
   * @param event is clicked component
   */
  editTriggerOnlyThisRule(trigger: Triggergroup, triggerIndex: number, editIconOverlay: any, upO: any, event): void {
    if (!this.divideTrigger(triggerIndex, trigger)) {
      this.generateNewTriggerTree = true;
      upO.show(event);
      this.editTrigger(triggerIndex, trigger, upO, 'edit', 'only');
    }
  }

  /**
   * This function removes action locally
   *
   * @param number index of action list
   */
  removeAction(index: number): void {
    this.actionList.splice(index, 1);
    this.ruleCreationService.actionList = this.actionList;
  }

  /**
   * Trigger can be dragged to another trigger
   *
   * @param ev grabbed trigger component
   * @param Triggergroup trigger combined trigger
   * @param selectedOperator dragged operator
   * @param number index if trigger
   */
  drag(ev, trigger: Triggergroup, selectedOperator: any, index: number): void {
    ev.dataTransfer.setData('text', ev.target.id);
    this.dragTrigger = trigger;
    this.dragOperator = selectedOperator;
    this.dragTriggerIndex = index;
  }

  /**
   * This function drops grabbed trigger
   *
   * @param ev droped trigger component event
   * @param number index  is droped trigger index
   */
  drop(ev, index: number): void {
    ev.preventDefault();
    if (this.dragTrigger && this.dragOperator) {
      const localTrigger: Triggergroup = new Triggergroup();
      localTrigger.leftchild = this.triggerList[index].ID;
      localTrigger.rightchild = this.dragTrigger.ID;
      localTrigger.operator = this.dragOperator.operator;
      localTrigger.name = `(${this.triggerList[index].name} ${this.dragOperator.operator} ${this.dragTrigger.name})`;
      localTrigger.trigger = undefined;
      this.ruleManagerService.addNewTriggerLeaf(this.userId, localTrigger)
        .subscribe(response => {
          localTrigger.ID = response.ID;
          this.removeTrigger(this.dragTriggerIndex);
          this.updateTriggerList.remove.only[this.triggerList[index].ID] = this.triggerList[index];
          this.clearUpdateTriggers('remove', 'only', undefined, this.triggerList[index].ID);
          this.triggerList.splice(index, 1, localTrigger);
          this.triggerList[index] = localTrigger;
          this.ruleCreationService.triggerList = this.triggerList;
        });
    }
  }
}
