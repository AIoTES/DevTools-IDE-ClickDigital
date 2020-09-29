/**

 * This class represents a device in the view of the backend
 */
import {Sensor} from './sensor';
import {Action} from './action';

export class Device {
  platformId: string;
  projectId: string;
  userId: string;
  deviceId: string;
  serialNumber: string;
  name: string;
  status: number;
  errorReport: string;
  sensors: Array<Sensor> = [];
  actions: Array<Action> = [];
  filterTags: Array<String> = [];
  protocols: Array<String> = [];
  location: string;
}
