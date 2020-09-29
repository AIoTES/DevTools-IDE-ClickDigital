import { Component, Input, OnInit } from '@angular/core';
import { Condition } from '../../../../../models/frontend/rule_module/condition';
import { RuleAction } from '../../../../../models/frontend/rule_module/ruleaction';
import { MenuItem, Message } from 'primeng/api';
import { ActionsFilterSchema } from '../../actions-schema';
import { RuleCreationService } from '../../service/rule-creation.service';
import { SearchDeviceService } from '../../service/search-device.service';
import { RuleManagementService } from '../../service/rule-management.service';
import { PlatformDeviceManagementService } from '../../service/platform-device-management.service';

@Component({
  selector: 'app-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.css'],
  providers: [Condition, RuleAction, SearchDeviceService]

})

export class ActionComponent implements OnInit {

  @Input() action_function: string;
  @Input() inputEditAction: RuleAction;
  @Input() editActionIndex: number;
  filteredActionConditionValues: any;

  filterParents: Array<any> = [];
  filterValue: any = {
    parents: [],
    leafChild: {}
  };
  messeges: Array<Message> = [];
  items: Array<MenuItem>;
  actionsFilterSchema = ActionsFilterSchema;
  actionCheckboxSelectedValues: Array<any> = [];
  selectedCondition: any = {};
  actions: Array<any>;

  filterData: Array<any> = [];
  filterResultData: Array<any>;

  constructor(private ruleCreationService: RuleCreationService,
              private searchDeviceService: SearchDeviceService,
              private ruleManagementService: RuleManagementService,
              private platformDeviceManagement: PlatformDeviceManagementService) {
  }

  /**
   * Changes checkbox category value
   *
   * @param selectedValues after checkbox is clicked
   */
  changeSelectedValues(selectedValues: any): void {
    this.actionCheckboxSelectedValues = selectedValues;
  }

  /**
   * This function sets end results of action Json  Schema.
   * After recrusive search sets parents and last child values of all children.
   *
   * @param leafChild last child object
   * @param parents all parents of this child
   */
  setElementByActionFilter(leafChild: any, parents: any): void {

    const element = {leafChild: {}, parents: []};
    let parent = {name: undefined, icon: undefined};
    for (const parentValue of parents) {
      if (parentValue.name) {
        parent.name = parentValue.name;
        parent.icon = parentValue.icon;
        element.parents.push(parent);
        parent = {name: undefined, icon: undefined};
      }
    }
    element.leafChild = leafChild;
    this.filterData.push(element);
    this.filterResultData = this.filterData;
  }

  /**
   * Here will be all action related data loaded for creating the rule as well as for updating the rule.
   * If action_function has value ‘edit,’  then this component will be used for updating the rule.
   */
  ngOnInit(): void {
    this.setActionFilter(this.actionsFilterSchema);
    this.ruleCreationService.actionsFilterObservable.subscribe(
      (filter: any) => {
        this.actionsFilterSchema = filter;
        this.filterParents = [];
        this.filterData = [];
        this.setActionFilter(this.actionsFilterSchema);
      });
    if (this.action_function === 'edit') {
      this.ruleManagementService.editActionStatusUpdated
        .subscribe((respondAction: any) => {
          const respond = respondAction;
          if (this.inputEditAction.ID === respond.action.ID && this.editActionIndex === respond.actionIndex) {
            this.filterData = [];

            const filterShema: any = {children: []};

            this.actionsFilterSchema.children.forEach(child => {
                filterShema.children.push(child);
            });

            this.setActionFilter(filterShema);

            this.filterResultData.forEach((data: any) => {
              if (data.leafChild && data.leafChild.properties) {
                data.leafChild.properties.forEach(property => {
                  if (respond.action.name.indexOf(property.text) !== -1) {

                    if (respond.action.condition[data.leafChild.condition_attribute]) {
                      this.filterValue = data;
                      this.selectedCondition = property;
                      this.addFilteredValue(this.filterValue);
                      this.filterValue.leafChild.conditionValue = respond.action.condition[data.leafChild.condition_attribute];
                    }
                  }
                });
              }
            });
          }
          const r = this.ruleCreationService.creationRule;
          this.setActionFilter(this.actionsFilterSchema);
          this.platformDeviceManagement
            .addAllDevices(r.projectID, r.userId, r.platformID);
        });
    }
  }

  /**
   * This function sets actions form Action Json Scheme
   *
   * @param parent. Each recursive setActionFilter function gets old child as a parent parameter.
   */
  setActionFilter(parent: any): void {
    this.filterParents.push(parent);
    if (parent.children.length > 0) {
      for (const child of parent.children) {
        this.setActionFilter(child);
      }
      const size = this.filterParents.length;
      this.filterParents = this.filterParents.slice(0, size - 1);
    } else {
      const size = this.filterParents.length;
      this.filterParents = this.filterParents.slice(0, size - 1);
      const lastParentIsChild = parent;
      this.setElementByActionFilter(lastParentIsChild, this.filterParents);
    }
  }

  /**
   * Clears all selected values for action
   */
  clearFilterValue(): void {
    this.filterValue.leafChild = {};
    this.selectedCondition = {};
  }

  /**
   * This filter function is for selected checkbox.
   * Search the action for selected checkbox category
   *
   * @param event is clicked component event
   */
  filterAction(event): void {
    this.filterResultData = [];
    let isSet;
    this.filterData.forEach((value: any) => {
      const action = value;
      let countCheckbox = 0;
      for (const Id in this.actionCheckboxSelectedValues) {
        if (Id && this.actionCheckboxSelectedValues[Id].length > 0) {
          const actionName = this.actionCheckboxSelectedValues[Id][0];
          if (action.parents.length > 0) {

            if (action.parents[0].name === actionName) {
              countCheckbox++;
            }
          } else {
            if (action.leafChild.name === actionName) {
              countCheckbox++;
            }
          }
        }
      }
      if (countCheckbox > 0 || this.actionCheckboxSelectedValues.length === 0) {
        isSet = false;
        for (const parent of action.parents) {
          if (parent && parent.name && parent.name.toLowerCase()
              .indexOf(event.query.toLowerCase()) === 0) {
            if (!isSet) {
              this.filterResultData.push(action);
              isSet = true;
            }
          }
        }
        if (!isSet && action.leafChild.name.toLowerCase()
            .indexOf(event.query.toLowerCase()) === 0) {
          this.filterResultData.push(action);
          isSet = true;
        }
      }
    });
  }

  /**
   * After category and condition is selected, then
   * condition values will be added
   *
   * @param actionConditionValues is user selected action condition values
   */
  addFilteredValue(actionConditionValues: any): void {
    this.filteredActionConditionValues = actionConditionValues;
  }

  /**
   * After action condition is selected,
   * this function sets all attributes for back-end rule model.
   *
   * @param filterValue user selected value
   * @returns RuleAction This class is for send rule request function
   */
  getAction(filterValue: any): RuleAction {

    const leafChild = filterValue.leafChild;
    let value = leafChild.conditionValue;
    const condition: Condition = new Condition();
    let action: RuleAction = new RuleAction();

    if (value !== undefined) {

      condition.days = undefined;
      condition[leafChild.condition_attribute] = value;
      action.condition = condition;

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
      if (leafChild.state) {
        condition.state = leafChild.state;
      }
      if (leafChild.itemtype) {
        condition.itemtype = leafChild.itemtype;
      }
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
    action.name = ` ${this.selectedCondition.text}  ${value} `;

    action.condition = condition;
    action = this.searchDeviceService.searchDeviceFromSelectedAction(action, leafChild, this.selectedCondition);

    return action;
  }

  /**
   * This function is filtering condition for each selected category
   * This is second autocomplete component from new condition selection overlay
   *
   * @param event is clicked component event
   */
  searchCondition(event): void {
    let allactions = this.filterValue.leafChild.properties;

    if (allactions.length > 0) {
      this.ruleCreationService.allactions = allactions;
    } else {
      allactions = this.ruleCreationService.allactions;
    }

    if (allactions && this.ruleCreationService.devices) {
      const properties = this.ruleCreationService.filterAutocomplete(event.query, allactions, 'text');
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
   * After action is created, then add new action to actionList
   * @param RuleAction filterValue action value
   */
  saveNewAction(filterValue: RuleAction): void {
    this.ruleCreationService.addAction(this.getAction(filterValue));
    this.clearFilterValue();
    this.ruleCreationService.actionOverlay.hide();
  }

  /**
   * This function is for rule update component.
   * If user changes the old action, the new action will be combined
   * to the rule.
   * @param RuleAction filterValue is action value
   */
  updateAction(filterValue: RuleAction): void {
    const action: RuleAction = this.getAction(filterValue);
    action.ID = this.inputEditAction.ID;
    this.ruleCreationService.actionList.splice(this.editActionIndex, 1, action);

    const resendData = {
      action,
      oldActionIndex: this.editActionIndex
    };

    this.ruleManagementService.changeExistingActionStatus.emit(resendData);
    this.clearFilterValue();
  }
}
