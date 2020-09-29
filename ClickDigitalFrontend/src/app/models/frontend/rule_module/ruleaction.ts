import { Condition } from './condition';

// Action template for matching with JSON Object  from frontend received by backend
export class RuleAction {
  name: string;
  ID = 0;
  // for save value is needed
  deviceID = '7_openHabknx:device:38d73ce2';
  // for save value is needed
  sensorID = 'knx:device:38d73ce2:schlafzimmerlicht_switch';
  condition: Condition = new Condition();
}
