/**

 * This class models a base device control widget.
 * It can control a the status of device (e.g. light ON or OFF)
 */
import { Widget } from './widget';
import {GridsterItem} from "angular-gridster2";

export class ValueViewWidget extends  Widget {
  /**
   * The id of the device to control
   */
  deviceId: string;
  /**
   * The id of the entity of the device to control
   */
  entityId: string;
  fontSize: number;
  controlPosition: string;
  entityType: string;
  value: string;

  constructor(id: string, name: string, additionalInfo: string, position: GridsterItem, isDeveloped: boolean, type: string, deviceId: string,
              entityId: string, fontSize: number, entityType: string, controlPosition: string) {
    super(id, name, additionalInfo, position, isDeveloped, type);
    this.deviceId = deviceId;
    this.entityId = entityId;
    this.fontSize = fontSize;
    this.entityType = entityType;
    this.controlPosition = controlPosition;
  }
}

/**
 * This enum represents what type of entity should be represented.
 */
export enum EntityType {
  action = 'action',
  sensor = 'sensor'
}
