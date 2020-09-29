import { Component, OnInit } from '@angular/core';
import { RuleCreationService } from '../../service/rule-creation.service';
import { RuleManagerService } from '../../../../../services/rulemanager.service';
import { Triggergroup } from '../../../../../models/frontend/rule_module/triggergroup';
import { Rule } from '../../../../../models/frontend/rule_module/rule';
import { SearchDeviceService } from '../../service/search-device.service';
import { RuleManagementService } from '../../service/rule-management.service';

@Component({
  selector: 'app-trigger-combine',
  templateUrl: './trigger-combine.component.html',
  styleUrls: ['./trigger-combine.component.css'],
  providers: [SearchDeviceService]
})

export class TriggerCombineComponent implements OnInit {

  triggers: Array<Triggergroup> = [];
  existingTrigger: Triggergroup;
  creationRule: Rule;

  constructor(private ruleCreationService: RuleCreationService,
              private ruleManagerService: RuleManagerService,
              private ruleManagementService: RuleManagementService) {
    this.creationRule = this.ruleCreationService.creationRule;
  }
  /**
   * This function loads at the beginning
   * all triggers to the local trigger array list.
   */
  ngOnInit(): void {
    this.ruleManagerService.getAllTriggergroups(this.ruleCreationService.loggedUserId)
      .subscribe(response => {
          this.triggers = response;
          this.ruleCreationService.alltriggerList = this.triggers;
        }
      );

    this.ruleManagementService.updateTriggerListStatus
      .subscribe(setTriggers => {
        if (setTriggers) {
          this.ruleManagerService.getAllTriggergroups(this.ruleCreationService.loggedUserId)
            .subscribe(response => {
              this.triggers = response;
              this.ruleCreationService.alltriggerList = this.triggers;
            });
        }
      });
  }
  /**
   * This function is for existing triggers filter
   * @param event is selected component event
   */
  search(event): void {
    this.triggers = this.ruleCreationService.filterAutocomplete(event.query, this.ruleCreationService.alltriggerList, 'name');
  }
  /**
   * Selected trigger will be added to the trigger array.
   *
   * @param selectedTrigger is selected existing trigger parameter
   */
  addSelectedTrigger(selectedTrigger: Triggergroup): void {
    this.ruleCreationService.triggerList.push(selectedTrigger);
    this.triggers.push(selectedTrigger);
    this.existingTrigger = undefined;
    this.ruleManagementService.updateTriggerList.addNew[selectedTrigger.ID] = selectedTrigger;
    this.ruleCreationService.triggerOverlay.hide();
  }
}
