import {GridsterItem} from "angular-gridster2";
import {Widget} from './widget';

export class RuleManagementWidget extends Widget {

  constructor(id: string, name: string, additionalInfo: string, position: GridsterItem, isDeveloped: boolean,
              type: string) {
      super(id, name, additionalInfo, position, isDeveloped, type);
  }

}
