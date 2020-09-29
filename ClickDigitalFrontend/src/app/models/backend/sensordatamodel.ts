/**
 * @ author Chinaedu Onwukwe
 * This class represents a sensor data model in the view of the backend
 */
import {TimeValueTuple} from './timevaluetuple';

export class SensorDataModel {
  Type: string;
  Values: Array<TimeValueTuple> = [];
  Unit: string;

}
