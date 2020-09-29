import { EventEmitter, Injectable } from '@angular/core';
import { Rule } from '../../../../models/frontend/rule_module/rule';
import { Triggergroup } from '../../../../models/frontend/rule_module/triggergroup';
import { RuleAction } from '../../../../models/frontend/rule_module/ruleaction';
import { Project } from '../../../../models/frontend/project';

@Injectable()
export class RuleManagementService {

  displayRuleManagementDialog: boolean;
  displayStatusUpdated = new EventEmitter<boolean>();
  editRuleStatusUpdated = new EventEmitter<Rule>();
  displayRuleUpdateComponent = new EventEmitter<boolean>();
  editTriggergroupStatusUpdated = new EventEmitter<Triggergroup>();
  editActionStatusUpdated = new EventEmitter<RuleAction>();
  updateTriggerListStatus = new EventEmitter <boolean>();
  getRuleValueStatus = new EventEmitter<Rule>();
  updateNotificationStatus = new EventEmitter<any>();
  selectedProjectData: Project;

  updateTriggerList: any = {
    edit: {only: [], all: [], new: {only: [], all: []}},
    remove: {only: [], all: [], new: {only: [], all: []}},
    addNew: []
  };
  changeExistingTriggerGroupStatus = new EventEmitter<any>();
  changeExistingActionStatus = new EventEmitter<any>();

  constructor() {
    this.displayStatusUpdated
      .subscribe(response => {
        this.displayRuleManagementDialog = response;
      });
    this.editRuleStatusUpdated
      .subscribe(rule => {
        this.getRuleValueStatus.emit(rule);
      });


  }

  clearUpdateTriggerList(): void {
    this.updateTriggerList = {
      edit: {only: [], all: [], new: {only: [], all: []}},
      remove: {only: [], all: [], new: {only: [], all: []}},
      addNew: []
    };
  }

}
