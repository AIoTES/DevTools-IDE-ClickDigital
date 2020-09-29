/**

 * This class models a state widget.
 * It can control the status of an entity (e.g. light color to green or blue or pink) by a selector.
 */

import { DeviceControlWidget } from './devicecontrolwidget';
import {GridsterItem} from "angular-gridster2";

export class StateWidget extends  DeviceControlWidget {
  /**
   * The value of the entity
   */
  value: number;


  constructor(id: string, name: string, additionalInfo: string, position: GridsterItem, isDeveloped: boolean,
              type: string, deviceId: string,
              entityId: string, controlPosition: string, fontSize: number, icon: string, value: number) {
    super(id, name, additionalInfo, position, isDeveloped, type, deviceId, entityId, controlPosition, fontSize, icon);
    this.value = value;
  }

}
