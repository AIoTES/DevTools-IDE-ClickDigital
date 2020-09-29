/**

 * This class models a base device control widget.
 * It can control a the status of device (e.g. light ON or OFF)
 */
import { Widget } from './widget';
import {GridsterItem} from "angular-gridster2";

export class DeviceControlWidget extends  Widget {
  /**
   * The id of the device to control.
   */
  deviceId: string;
  /**
   * The id of the entity of the device to control.
   */
  entityId: string;
  /**
   * Indicates whether to orientate the content to bottom or to right.
   */
  controlPosition: string;
  /**
   * Value of the font size
   */
  fontSize: number;

  /**
   * An icon can be displayed on the widget.
   */
  icon: string;

  constructor(id: string, name: string, additionalInfo: string, position: GridsterItem, isDeveloped: boolean, type: string, deviceId: string, entityId: string, controlPosition: string, fontSize: number, icon: string) {
    super(id, name, additionalInfo, position, isDeveloped, type);
    this.deviceId = deviceId;
    this.entityId = entityId;
    this.controlPosition = controlPosition;
    this.fontSize = fontSize;
    this.icon = icon;
  }
}
