/**
 * @ author Chinaedu Onwukwe
 * This class represents an action in the view of the backend
 */
import {StateOption} from './stateoption';
import {ValueOption} from './valueoption';


export class Action {
  id: string;
  name: string;
  deviceId: string;
  state: number;
  states: Array<StateOption> = [];
  value: number;
  valueOption: ValueOption;
  errorReport: string;
  valueable: boolean;
  type: string;
}
