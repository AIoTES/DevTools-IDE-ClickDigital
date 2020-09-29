import { Injectable } from '@angular/core';
import { TriggersFilterSchema } from '../triggers-schema';
import { ActionsFilterSchema } from '../actions-schema';
import { Device } from '../../../../models/backend/device';
import { Action } from '../../../../models/backend/action';
import { RuleCreationService } from './rule-creation.service';
import { StateOption } from '../../../../models/backend/stateoption';
import { DeviceManagerService } from '../../../../services/devicemanager.service';

@Injectable({
  providedIn: 'root'
})
export class PlatformDeviceManagementService {

  triggersFilterSchema = TriggersFilterSchema;
  actionsFilterSchema = ActionsFilterSchema;

  constructor(private ruleCreationService: RuleCreationService,
              private deviceManagerService: DeviceManagerService) { }

  /**
   * This function adds all devices into TriggerSchema and ActionSchema.
   * Devices are from OpenHab platform.
   *
   * @param projectId is id of selected project
   * @param userId is logged user id
   * @param platformId is selected platform id.
   */
  addAllDevices(projectId, userId, platformId): void {
    if (projectId && userId) {
      this.ruleCreationService.getDevicies(platformId, userId, projectId);
      this.deviceManagerService.getAllDevicesByPlatform(platformId, userId, projectId)
        .subscribe((devices: Array<Device>) => {
          let triggerSchemaForAllDevices = this.triggersFilterSchema.children[0].children[0].children;
          let actionsFilterSchema = this.actionsFilterSchema.children[0].children[0].children;
          triggerSchemaForAllDevices = [];
          actionsFilterSchema = [];
          let deviceLeaf: any;
          let deviceActionLeaf: any;
          let properties = [];
          let actionProperties = [];
          let secondDieviceLeaf: any;
          let secondActionDieviceLeaf: any;
          this.ruleCreationService.possibleDevices = devices;

          devices.forEach((device: Device) => {

            if (device.actions && device.actions.length > 0) {
               deviceLeaf = {
                name: `${device.name}`,
                condition_attribute: 'state',
                living: true,
                properties: [
                ],
                children: []
              };
               deviceActionLeaf = {
                name: `${device.name}`,
                condition_attribute: 'state',
                living: true,
                properties: [
                ],
                children: []
              };
               device.actions.forEach((action: Action) => {
                if (action.states && action.states.length > 0) {

                 const property = {
                    text: `when device ${device.name} ${action.name} state`,
                    type: 'text',
                    actionID: action.id,
                    deviceID: device.deviceId,
                    type_options: 'dropdown',
                    selects: []
                  };

                 const actionProperty = {
                    text: `change device ${device.name} ${action.name} state to`,
                    type: 'text',
                    actionID: action.id,
                    deviceID: device.deviceId,
                    type_options: 'dropdown',
                    selects: []
                  };

                 action.states.forEach((state: StateOption) => {
                      const select = {label: state.description, value: state.state};
                      property.selects.push(select);
                      actionProperty.selects.push(select);
                  });
                 properties.push(property);
                 actionProperties.push(actionProperty);

                } else {
                   secondDieviceLeaf = {
                    name: `${device.name}`,
                    action: action.name,
                    condition_attribute: 'state',
                    living: true,
                    properties: [
                      {
                        text: `when device ${device.name} state (%)`,
                        type: 'number',
                        actionID: action.id,
                        deviceID: device.deviceId,
                        type_options: 'slider',
                        min : 0,
                        max : 100
                      }
                    ],
                    children: []
                  };

                   secondActionDieviceLeaf = {
                    name: `${device.name}`,
                    action: action.name,
                    condition_attribute: 'state',
                    living: true,
                    properties: [
                      {
                        text: `change device ${device.name} state to (%)`,
                        type: 'number',
                        actionID: action.id,
                        deviceID: device.deviceId,
                        type_options: 'slider',
                        min : 0,
                        max : 100
                      }
                    ],
                    children: []
                  };
                   for (const index of Object.keys(action)) {
                    if (index === 'value') {
                     // triggerSchemaForAllDevices.push(secondDieviceLeaf);
                     // actionsFilterSchema.push(secondActionDieviceLeaf);
                    }
                  }
                }
              });
               if (deviceLeaf) {
                deviceLeaf.properties  = properties;
                triggerSchemaForAllDevices.push(deviceLeaf);
                properties = [];
              }
               if (deviceActionLeaf) {
                deviceActionLeaf.properties = actionProperties;
                actionsFilterSchema.push(deviceActionLeaf);
                actionProperties = [];

              }
            }
          });

          this.triggersFilterSchema.children[0].children[0].children = triggerSchemaForAllDevices;
          this.actionsFilterSchema.children[0].children[0].children = actionsFilterSchema;
          this.ruleCreationService.triggersFilterSchema = this.triggersFilterSchema;
          this.ruleCreationService.actionsFilterSchema = this.actionsFilterSchema;
          this.ruleCreationService.triggerFilterObservable.next(this.triggersFilterSchema);
          this.ruleCreationService.actionsFilterObservable.next(this.actionsFilterSchema);
        });
    }
  }
}
