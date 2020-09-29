import { Component, Input, OnInit } from '@angular/core';
import { TriggersFilterSchema } from '../../triggers-schema';
import { MenuItem, Message } from 'primeng/api';
import { Condition } from '../../../../../models/frontend/rule_module/condition';
import { Triggergroup } from '../../../../../models/frontend/rule_module/triggergroup';
import { Trigger } from '../../../../../models/frontend/rule_module/trigger';
import { RuleCreationService } from '../../service/rule-creation.service';
import { SearchDeviceService } from '../../service/search-device.service';
import { RuleManagerService } from '../../../../../services/rulemanager.service';
import { weekdays } from '../../../../../models/frontend/rule_module/weekdays';
import { RuleManagementService } from '../../service/rule-management.service';
import { DeviceManagerService } from '../../../../../services/devicemanager.service';
import { PlatformDeviceManagementService } from '../../service/platform-device-management.service';

@Component({
  selector: 'app-trigger',
  templateUrl: './trigger.component.html',
  styleUrls: ['./trigger.component.css'],
  providers: [Triggergroup, Condition, Trigger, SearchDeviceService]
})

export class TriggerComponent implements OnInit {

  @Input() trigger_function: string;
  @Input() inputEditTrigger: Triggergroup;
  @Input() editTriggerIndex: number;
  filteredTriggerConditionValues: any;
  messeges: Array<Message> = [];
  filterParents: Array<any> = [];
  filterValue: any = {
    parents: [],
    leafChild: {
    }
  };

  items: Array<MenuItem> = [];
  triggersFilterSchema = TriggersFilterSchema;
  triggerCheckboxSelectedValues: Array<any> = [];
  selectedCondition: any = {};

  filterData: Array<any> = [];
  filterResultData: Array<any> = [];

  constructor(private condition: Condition,
              private ruleManagerService: RuleManagerService,
              private ruleManagementService: RuleManagementService,
              private ruleCreationService: RuleCreationService,
              private searchDeviceService: SearchDeviceService,
              private platformDeviceManagement: PlatformDeviceManagementService) {

    this.triggersFilterSchema = this.ruleCreationService.triggersFilterSchema;
  }

  /**
   * Here will be all triggers related data loaded for creating the rule as well as for updating the rule.
   * If trigger_function has value ‘edit,’  then this component will be used for updating the rule.
   */
  ngOnInit(): void {
    this.setTriggerFilter(this.triggersFilterSchema);
    this.ruleCreationService.triggerFilterObservable.subscribe(
      (filter: any) => {
        this.triggersFilterSchema = filter;
        this.filterParents = [];
        this.filterData = [];
        this.setTriggerFilter(this.triggersFilterSchema);
      });

    if (this.trigger_function === 'edit') {
      this.ruleManagementService.editTriggergroupStatusUpdated
        .subscribe((respondTrigger: any) => {
          const respond = respondTrigger;
          if (this.inputEditTrigger.ID === respond.trigger.ID && this.editTriggerIndex === respond.triggerIndex) {
            this.filterData = [];

            const filterShema: any = {children: []};
            this.triggersFilterSchema.children.forEach(child => {
              if (child.triggerClass === respond.trigger.trigger.triggerclass) {
                filterShema.children.push(child);
              }
            });

            this.setTriggerFilter(filterShema);

            this.filterResultData.forEach((data: any) => {
              if (data.leafChild && data.leafChild.properties) {
                data.leafChild.properties.forEach(property => {

                  if (respond.trigger.name.indexOf(property.text) !== -1) {

                    if (respond.trigger.trigger.condition[data.leafChild.condition_attribute]) {
                      this.filterValue = data;
                      this.selectedCondition = property;
                      this.addFilteredValue(this.filterValue);
                      this.filterValue.leafChild.conditionValue = respond.trigger.trigger.condition[data.leafChild.condition_attribute];
                    }
                  }
                });
              }
            });
            const r = this.ruleCreationService.creationRule;
            this.setTriggerFilter(this.triggersFilterSchema);
            this.platformDeviceManagement
              .addAllDevices(r.projectID, r.userId, r.platformID);

          }
        });
    }
  }

  /**
   * Changes checkbox category value
   *
   * @param selectedValues after checkbox is clicked
   */
  changeSelectedValues(selectedValues: any): void {
    this.triggerCheckboxSelectedValues = selectedValues;
  }

  /**
   * This function sets end results of trigger Json  Schema.
   * After recrusive search sets parents and last child values of all children.
   *
   * @param leafChild last child object
   * @param parents all parents of this child
   */
  setElementByTriggerFilter(leafChild: any, parents: any): void {
    const element = {leafChild: {}, parents: []};
    let parent = {name: undefined, icon: undefined, triggerClass: undefined};
    for (const parentValue of parents) {
      if (parentValue.name) {
        parent.name = parentValue.name;
        parent.triggerClass = parentValue.triggerClass;
        parent.icon = parentValue.icon;
        element.parents.push(parent);
        parent = {name: undefined, icon: undefined, triggerClass: undefined};
      }
    }

    element.leafChild = leafChild;
    this.filterData.push(element);

    this.filterResultData = this.filterData;
  }
  /**
   * This function sets triggers form Trigger Json Scheme
   *
   * @param parent. Each recursive setTriggerFilter function gets old child as a parent parameter.
   */
  setTriggerFilter(parent: any): void {
    this.filterParents.push(parent);
    if (parent.children.length > 0) {
      for (const child of parent.children) {
        this.setTriggerFilter(child);
      }
      const size = this.filterParents.length;
      this.filterParents = this.filterParents.slice(0, size - 1);
    } else {
      const size = this.filterParents.length;
      this.filterParents = this.filterParents.slice(0, size - 1);
      const lastParentIsChild = parent;
      this.setElementByTriggerFilter(lastParentIsChild, this.filterParents);
    }
  }
  /**
   * Clears all selected values for trigger
   */
  clearFilterValue(): void {
    this.filterValue.leafChild = {};
    this.selectedCondition = {};
  }

  addFilteredValue(triggerConditionValues: any): void {
    this.filteredTriggerConditionValues = triggerConditionValues;
  }
  /**
   * This function is filtering condition for each selected category
   * This is second autocomplete component from new condition selection overlay
   *
   * @param event is clicked component event
   */
  searchCondition(event): void {
    let allconditions = this.filteredTriggerConditionValues.leafChild.properties;

    if (allconditions.length > 0) {
      this.ruleCreationService.allconditions = allconditions;
    } else {
      allconditions = this.ruleCreationService.allconditions;
    }
    if (allconditions && this.ruleCreationService.devices) {

      const properties = this.ruleCreationService.filterAutocomplete(event.query, allconditions, 'text');
      this.filterValue.leafChild.properties = properties;
    } else {
      if (this.ruleCreationService.creationRule.projectID === '') {
        this.messeges.push({
          severity: 'error',
          summary: '',
          detail: 'Project is not selected'
        });
        setTimeout(() => {
          this.messeges = [];
        }, 4000);
      } else {
        this.messeges.push({
          severity: 'error',
          summary: '',
          detail: 'Platform devices, which are connected to the project, are not configured'
        });
        setTimeout(() => {
          this.messeges = [];
        }, 4000);
      }
    }
  }
  /**
   * This filter function is for selected checkbox.
   * Search the trigger for selected checkbox category
   *
   * @param event is clicked component event
   */
  filterTrigger(event): void {
    this.filterResultData = [];
    let isSet;
    this.filterData.forEach((triggerValue: any) => {
      const trigger = triggerValue;
      let countCheckbox = 0;
      for (const Id in this.triggerCheckboxSelectedValues) {
        if (Id && this.triggerCheckboxSelectedValues[Id].length > 0) {
          const triggerName = this.triggerCheckboxSelectedValues[Id][0];
          if (trigger.parents.length > 0) {

            if (trigger.parents[0].name === triggerName) {
              countCheckbox++;
            }
          } else {
            if (trigger.leafChild.name === triggerName) {
              countCheckbox++;
            }
          }
        }
      }
      if (countCheckbox > 0 || this.triggerCheckboxSelectedValues.length === 0) {
        isSet = false;
        for (const parent of trigger.parents) {
          if (parent && parent.name && parent.name.toLowerCase()
              .indexOf(event.query.toLowerCase()) === 0) {
            if (!isSet) {
              this.filterResultData.push(trigger);
              isSet = true;
            }
          }
        }
        if (!isSet && trigger.leafChild.name.toLowerCase()
            .indexOf(event.query.toLowerCase()) === 0) {
          this.filterResultData.push(trigger);
          isSet = true;
        }
      }
    });
  }

  /**
   * Returns week day as a index number
   *
   * @param day name of a week day
   * @returns any weekday index
   */
  getDayIndex(day): any {
    for (const conddayIndex in  this.condition.days) {
      if (this.condition.days[conddayIndex] === day) {
        return conddayIndex;
      }
    }

    return -1;
  }

  /**
   * Sets weekdays as indexed array
   * @param daysArray weekdays array
   * @returns any returns indexed weekdayes
   */
  setDaysOfWeek(daysArray): any {
    const createDays = ['', '', '', '', '', '', ''];
    for (const day of  daysArray) {
      const index = this.getDayIndex(day);
      createDays[index] = day;
    }

    return createDays;
  }

  /**
   * Gets labels of the weekdays
   * @param daysArray weekdays
   * @returns any labels
   */
  setDaysOfWeekLabels(daysArray): any {
    const labels: Array<string> = [];
    for (const day of  daysArray) {
      for (const weekday of  weekdays) {
        if (day === weekday.value) {
          labels.push(weekday.label);
        }
      }
    }

    return labels;
  }
  /**
   * After condition/trigger is selected
   * this function sets all attributes for back-end rule model.
   *
   * @param filterValue user selected value
   * @returns RuleAction This class is for send rule request function
   */
  getTriggergroup(filterValue: any): Triggergroup {

    const leafChild = filterValue.leafChild;
    let value = leafChild.conditionValue;
    let valueLabel: Array<string>;
    const condition: Condition = new Condition();
    let trigger: Trigger = new Trigger();
    const triggergroup: Triggergroup = new Triggergroup();

    if (value !== undefined) {

      if (value && value.length > 0 && leafChild.condition_attribute === 'days') {
        value = this.setDaysOfWeek(value);
        valueLabel = this.setDaysOfWeekLabels(value);
      } else {
        condition.days = undefined;
      }
      condition[leafChild.condition_attribute] = value;

      if (leafChild.condition_attribute === 'days') {
        value = valueLabel.join(',');
      }

      trigger.condition = condition;
      trigger.triggerclass = filterValue.parents[0] ? filterValue.parents[0].triggerClass : leafChild.name;

      if (filterValue.parents[0] && filterValue.parents[0].name === 'Communication') {
        condition.communicationtype = leafChild.name;
        condition.notification = leafChild.name;
      }
      if (leafChild.physical) {
        condition.physical = leafChild.physical;
      }
      if (leafChild.living) {
        condition.living = leafChild.living;
      }

      switch (condition.state) {
        case 0 : {
          condition.state = 'OFF';
          value = condition.state;
          break;
        }
        case 1 : {
          condition.state = 'ON';
          value = condition.state;
          break;
        }
        default : {
          break;
        }

      }

      if (leafChild.itemtype) {
        condition.itemtype = leafChild.itemtype;
      }
      if (this.selectedCondition.operator) {
        condition.operator = this.selectedCondition.operator;
      }

      trigger.condition = condition;

      trigger = this.searchDeviceService.searchDeviceFromSelectedTrigger(trigger, leafChild, this.selectedCondition);
      triggergroup.name = `${this.selectedCondition.text}  ${value}`;
      triggergroup.triggerclass = trigger.triggerclass;

      trigger.name = triggergroup.name;
      triggergroup.trigger = trigger;
    }

    return triggergroup;
  }

  /**
   * After trigger(condition) is created, then add new trigger(condition) to triggerList
   * @param filterValue is Rule Trigger Value
   */
  saveNewTrigger(filterValue: any): void {
    const userId = this.ruleCreationService.loggedUserId;
    this.ruleManagerService.addNewTriggerLeaf(userId, this.getTriggergroup(filterValue))
      .subscribe(savedTrigger => {
          this.ruleCreationService.triggerList.push(savedTrigger);
          this.ruleCreationService.alltriggerList.push(savedTrigger);
          this.ruleManagementService.updateTriggerList.addNew[savedTrigger.ID] = savedTrigger;
          this.clearTrigger();
          this.ruleCreationService.triggerOverlay.hide();
          this.clearFilterValue();
        }
      );
  }
  /**
   * This function is for rule update component.
   * If user changes the old trigger(condition), the new trigger(condition) will be combined
   * to the rule.
   * @param filterValueis is Rule Trigger Value
   */
  updateTrigger(filterValue: any): void {
    const userId = this.ruleCreationService.loggedUserId;
    const trigger: Triggergroup = this.getTriggergroup(filterValue);
    trigger.ID = this.inputEditTrigger.ID;
    trigger.trigger.ID = this.inputEditTrigger.trigger.ID;
    this.ruleManagerService.addNewTriggerLeaf(userId, trigger)
      .subscribe((responseTriggergroup: any) => {
        const resendData = {
          trigger: responseTriggergroup,
          oldTriggerIndex: this.editTriggerIndex
        };

        this.ruleManagementService.changeExistingTriggerGroupStatus.emit(resendData);
        this.clearTrigger();
      });
  }

  /**
   * Clears all selected trigger(conditions) parents and children values
   */
  clearTrigger(): void {
    this.filterValue.leafChild.conditionValue = undefined;
    this.filterValue = {
      parents: [],
      leafChild: {}
    };
  }
}
