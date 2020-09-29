
import {map} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { environment} from "../../environments/environment";

const BACKENDURL = `${environment.httpMode}${environment.baseUrl}${environment.contextRoot}`;
const AUTH = 'Bearer '.concat(localStorage.getItem('ang-token'));
const URLVISUALMANAGER = `${BACKENDURL}/visualManager/`;
const nowData = '/getSensorDataNow?deviceId=';
const timeData = '/getSensorDataOverTime?deviceId=';

const sensor = '&sensorId=';
const start = '&startTime=';
const end = '&endTime=';
const interval = '&interval=';

@Injectable()
export class VisualManagerService {

  constructor(private http: HttpClient) {
  }

  /* Requests device/sensor data just for this moment */
  getNowData(deviceId: string, sensorId: string, userId: string, projectId: string): any {
   // deviceId = '4_testdevice';
    // sensorId = '4_testsensor';
      return this.http.get(`${URLVISUALMANAGER + userId}/${projectId}${nowData}${deviceId}${sensor}${sensorId}`, {headers:{'Authorization':AUTH }, withCredentials: true }).pipe(map((res: Response) => res));
  }

  /* Requests device/sensor data over time */
  getTimeData(deviceId: string, sensorId: string, startTime: string, endTime: string, intervalId: string, userId: string, projectId: string): any {
    return this.http.get(`${URLVISUALMANAGER + userId}/${projectId}${timeData}${deviceId}${sensor}${sensorId}${start}${startTime}${end}${endTime}${interval}${intervalId}`, {headers:{'Authorization':AUTH }, withCredentials: true }).pipe(map((res: Response) => res));
  }
}
