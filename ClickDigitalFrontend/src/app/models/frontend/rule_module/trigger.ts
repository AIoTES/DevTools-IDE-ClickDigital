import { Condition } from './condition';

// Trigger template for matching with JSON Object  from frontend received by backend
export class Trigger {

  ID = 0;
  name = ''; // to save trigger this value has not to be null or ''
  triggerclass = '';
  deviceID = ''; // to save trigger this value has not to be null or ''
  sensorID = ''; // to save trigger this value has not to be null or ''
  condition: Condition = new Condition();
}
