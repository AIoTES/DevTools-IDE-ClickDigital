/**
 * @ author Chinaedu Onwukwe
 * This class represents a sensor data model  with anomaly score in the view of the backend
 */
import {TimeValueAnomalyScoreTuple} from './timevalueanomalyscoretuple';

export class AnomalySensorDataModel {
  Type: string;
  Values: Array<TimeValueAnomalyScoreTuple> = [];
  Unit: string;

}
