/**

 * This class models a toggle widget.
 * It can control a the status of device (e.g. light to 70%) by a slider.
 */

import { DeviceControlWidget } from './devicecontrolwidget';
import {GridsterItem} from "angular-gridster2";

export class SliderWidget extends  DeviceControlWidget {
  /**
   * The value of the entity
   */
  value: number;
  /**
   * The minimal possible value for the entity
   */
  minValue: number;
  /**
   * The maximal possible value for the entity
   */
  maxValue: number;

  constructor(id: string, name: string, additionalInfo: string, position: GridsterItem, isDeveloped: boolean,
              type: string, deviceId: string,
              entityId: string, controlPosition: string, fontSize: number, icon: string, value: number, minValue: number, maxValue: number) {
    super(id, name, additionalInfo, position, isDeveloped, type, deviceId, entityId, controlPosition, fontSize, icon);
    this.value = value;
    this.minValue = minValue;
    this.maxValue = maxValue;

  }

}
