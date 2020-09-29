/**

 * This class models a toggle widget.
 * It can control a the status of device (e.g. light ON or OFF) by a switch.
 */

import { DeviceControlWidget } from './devicecontrolwidget';
import {GridsterItem} from "angular-gridster2";

export class ToggleWidget extends  DeviceControlWidget {
  /**
   * The value of the entity
   */
  value: boolean;
  /**
   * The on label for the toggle
   */
  toggleLabelOn: string;

  /**
   * The off label for the toggle
   */
  toggleLabelOff: string;

  constructor(id: string, name: string, additionalInfo: string, position: GridsterItem, isDeveloped: boolean,
              type: string, deviceId: string,
              entityId: string, controlPosition: string, fontSize: number, icon: string, value: boolean,
              toggleLabelOn: string, toggleLabelOff: string) {
    super(id, name, additionalInfo, position, isDeveloped, type, deviceId, entityId, controlPosition, fontSize, icon);
    this.value = value;
    this.toggleLabelOn = toggleLabelOn;
    this.toggleLabelOff = toggleLabelOff;
  }

}
