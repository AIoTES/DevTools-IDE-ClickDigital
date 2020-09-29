/**

 * This class models a base widget. A widget can be modified in different ways. It is drag-  and dropable.
 * It can control a device or visualize the state(s) of a device or rules.
 */
import { GridsterItem } from 'angular-gridster2';

export class WidgetDB {
  id: string;
  name: string;
  additionalInfo?: string;
  position: GridsterItem;
  isDeveloped: boolean;
  icon?: string;
  type: string;

  constructor(id: string, name: string, position: GridsterItem, isDeveloped: boolean, type: string) {
    this.id = id;
    this.name = name;
    this.position = position;
    this.isDeveloped = isDeveloped;
    this.type = type;
  }
}

