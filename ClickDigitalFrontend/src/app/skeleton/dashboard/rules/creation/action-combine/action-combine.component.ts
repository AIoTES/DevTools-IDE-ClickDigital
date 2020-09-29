import { Component, OnInit } from '@angular/core';
import { RuleCreationService } from '../../service/rule-creation.service';
import { RuleAction } from '../../../../../models/frontend/rule_module/ruleaction';
import { RuleManagerService } from '../../../../../services/rulemanager.service';

@Component({
  selector: 'app-action-combine',
  templateUrl: './action-combine.component.html',
  styleUrls: ['./action-combine.component.css']
})

export class ActionCombineComponent implements OnInit {

  actions: Array<any> = [];
  existingAction: RuleAction;

  constructor(private ruleCreationService: RuleCreationService,
              private ruleManagerService: RuleManagerService) {
  }

  /**
   * This function loads at the beginning all rules
   * and sets all its related actions to the local action array list.
   */
  ngOnInit(): void {
    this.ruleManagerService.getAllRules(this.ruleCreationService.loggedUserId)
      .subscribe(response => {
        for (const rule of response) {
          this.actions = this.actions = this.actions.concat(rule.ruleActions);
        }
        this.actions = this.actions.concat(this.ruleCreationService.getAllLocalActions());
        const Ids: Array<any> = [];
        const actionsResult: Array<RuleAction> = [];
        for (const action of this.actions) {
          if (!Ids[action.ID]) {
            Ids[action.ID] = action;
            actionsResult.push(action);
          }
        }
        this.actions = actionsResult;
        this.ruleCreationService.allActionList = this.actions;
      });
  }

  /**
   * This function is for existing actions filter
   * @param event is selected component event
   */
  searchAction(event): void {
    this.actions = this.ruleCreationService.filterAutocomplete(event.query, this.ruleCreationService.allActionList, 'name');
  }

  /**
   * Selected action will be added to the action array
   * In order to combine with different action, "AND" default operator value will be defined
   * for every actions.
   *
   * @param selectedAction is selected existing action parameter
   */
  addSelectedAction(selectedAction: any): void {
    this.ruleCreationService.actionList.push(selectedAction);
    this.actions.push(selectedAction);
    if (this.ruleCreationService.actionList.length > 0) {
      this.ruleCreationService.selectActionOperatorList.push({id: 0, operator: 'AND'});
    }
    this.existingAction = undefined;
    this.ruleCreationService.actionOverlay.hide();
  }
}
