import { Trigger } from './trigger';

// Triggergroup template for matching with JSON Object  from frontend received by backend
export class  Triggergroup {

  ID: number;
  name = 'default-name'; // for save value is needed
  operator = ''; // OR or AND
  leftchild = 0;
  rightchild = 0;
  trigger: Trigger = new Trigger();
  triggerclass: string;
  userId: string;
  projectID: string;
  getTriggerGroup(): any {
    return this;
  }
}
