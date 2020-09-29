import { Injectable } from '@angular/core';
import { Trigger } from '../../../../models/frontend/rule_module/trigger';
import { RuleAction } from '../../../../models/frontend/rule_module/ruleaction';
import { Device } from '../../../../models/backend/device';
import { DeviceManagerService } from '../../../../services/devicemanager.service';
import { RuleCreationService } from './rule-creation.service';
import { Action } from '../../../../models/backend/action';

@Injectable()
export class SearchDeviceService {

  private userId;
  private projectId;
  devices: any;

  constructor(private deviceManagerService: DeviceManagerService,
              private ruleCreationService: RuleCreationService) {
    this.devices = this.ruleCreationService.devices;
  }

  /**
   * This function search selected trigger device ID and sensor ID
   * leafChild and selectedCondition is needed to filter the right device
   * @param Trigger is trigger that user select in filter
   * @param leafChild  is from trigger schema selected last child components
   * @param selectedCondition this is value of trigger that user has selected
   * @returns Trigger After trigger deviceId and sensorID set return the same trigger
   */
  searchDeviceFromSelectedTrigger(trigger: Trigger, leafChild: any, selectedCondition: any): Trigger {

    this.userId = this.ruleCreationService.loggedUserId;
    this.projectId = this.ruleCreationService.creationRule.projectID;
    trigger.deviceID = '7_openHabknx:device:38d73ce2';
    trigger.sensorID = 'knx:device:38d73ce2:schlafzimmerlicht_switch';

    if (selectedCondition.actionID && selectedCondition.deviceID) {
      // default device ID and SensorID it will be overwritten
      trigger.deviceID = selectedCondition.deviceID;
      trigger.sensorID = selectedCondition.actionID;
      if (leafChild.condition_attribute.toLowerCase() === 'state') {
        if (trigger.condition['state'] === 'OFF') {
          trigger.condition.command = 'OFF';
        } else
        if (trigger.condition['state'] === 'ON') {
          trigger.condition.command = 'ON';
        }
      }
    }

    return trigger;
  }

  /**
   * This function search selected action device ID and sensor ID
   * leafChild and selectedCondition is needed to filter the right device
   * @param action is action that user select in filter
   * @param leafChild is from action schema selected last child components
   * @param selectedCondition this is value of action that user has selected
   * @returns RuleAction After action deviceId and sensorID set return the same action
   */
  searchDeviceFromSelectedAction(action: RuleAction, leafChild: any, selectedCondition: any): RuleAction {

    this.userId = this.ruleCreationService.loggedUserId;
    this.projectId = this.ruleCreationService.creationRule.projectID;

    action.deviceID = '7_openHabknx:device:38d73ce2';
    action.sensorID = 'knx:device:38d73ce2:schlafzimmerlicht_switch';
    action.condition.command = 'ON';

    if (selectedCondition.actionID && selectedCondition.deviceID) {
      // default device ID and Sensor ID will be overwritten
      action.deviceID = selectedCondition.deviceID;
      action.sensorID = selectedCondition.actionID;
      if (leafChild.condition_attribute.toLowerCase() === 'state') {
        if (action.condition['state'] === 'OFF') {
          action.condition.command = 'OFF';
        } else if (action.condition['state'] === 'ON') {
          action.condition.command = 'ON';
        }
      }
    }

    return action;
  }
}
