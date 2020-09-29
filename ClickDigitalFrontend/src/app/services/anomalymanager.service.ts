
import {map} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { environment} from "../../environments/environment";


const BACKENDURL = `${environment.httpMode}${environment.baseUrl}${environment.contextRoot}`;
const AUTH = 'Bearer '.concat(localStorage.getItem('ang-token'));

const URLANOMALYMANAGER = `${BACKENDURL}/anomalyManager/`;
const nowData = '/getSensorWithAnomalyScoreDataNow?deviceId=';
const timeData = '/getSensorWithAnomalyScoreDataOverTime?deviceId=';
const socketData = '/getSensorWithAnomalyScoreDataSocket?deviceId=';
const startNetwork = '/startAnomalyNetworkRealtime?deviceId=';
const deleteNetwork = '/deleteNetwork?deviceId=';

const sensor = '&sensorId=';
const trainingstart = '&startTrainingTime=';
const start = '&startTime=';
const end = '&endTime=';
const interval = '&interval=';
const value = '&result=';
const nowDate = '&dateTime=';

@Injectable()
export class AnomalyManagerService {

  constructor(private http: HttpClient) {
  }

  /* Requests to start a new HTM Network with training*/
  startAnomalyNetworkRealtime(deviceId: string, sensorId: string, userId: string, projectId: string, startTrainingTime: string, dateTime: string, intervalId: string): any {
    return this.http.get(`${URLANOMALYMANAGER + userId}/${projectId}${startNetwork}${deviceId}${sensor}${sensorId}${trainingstart}${startTrainingTime}${nowDate}${dateTime}${interval}${intervalId}`, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  /* Requests to start a new HTM Network with training*/
  deleteNetwork(deviceId: string, sensorId: string, userId: string, projectId: string): any {
    return this.http.get(`${URLANOMALYMANAGER + userId}/${projectId}${deleteNetwork}${deviceId}${sensor}${sensorId}`, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }


  /* Requests sensor data just for this moment */
  getSensorWithAnomalyScoreDataNow(deviceId: string, sensorId: string, userId: string, projectId: string): any {
    return this.http.get(`${URLANOMALYMANAGER + userId}/${projectId}${nowData}${deviceId}${sensor}${sensorId}`, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  // TODO Backend sends json, change so that Backend sends Modells so this request no need
  /* Requests sensor data just for this moment */
  getSensorWithAnomalyScoreDataSocket(deviceId: string, sensorId: string, userId: string, projectId: string, result: number, dateTime: string): any {
    return this.http.get(`${URLANOMALYMANAGER + userId}/${projectId}${socketData}${deviceId}${sensor}${sensorId}${value}${result}${nowDate}${dateTime}`, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  /* Requests sensor data over time */
  getSensorWithAnomalyScoreDataOverTime(deviceId: string, sensorId: string, startTrainingTime: string, startTime: string, endTime: string, intervalId: string, userId: string, projectId: string): any {
    return this.http.get(`${URLANOMALYMANAGER + userId}/${projectId}${timeData}${deviceId}${sensor}${sensorId}${trainingstart}${startTrainingTime}${start}${startTime}${end}${endTime}${interval}${intervalId}`, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }



}
