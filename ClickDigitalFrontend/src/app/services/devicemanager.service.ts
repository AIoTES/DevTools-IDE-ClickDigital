
import {map} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Platform} from '../models/backend/platform';
import {environment} from "../../environments/environment";

const BACKENDURL = `${environment.httpMode}${environment.baseUrl}${environment.contextRoot}`;
// const AUTH = `${environment.Authorization}`;
const AUTH = 'Bearer '.concat(localStorage.getItem('ang-token'));
const URLDEVICEMANAGER = `${BACKENDURL}/devicemanager/`;
const URLSYSTEMMANAGER = `${BACKENDURL}/system/`;

const ADDDEVICE = '/addDevice';
const DELETEDEVICE = '/deleteDevice?internalDeviceId=';
const UPDATEDEVICE = '/updateDevice?internalDeviceId=';
const GETALLDEVICES = '/getAllDevices';
const GETAllDEVICESBYPLATFORM = '/getAllDevicesByPlatform';
const CHANGEACTIONSTATE = '/changeActionState?valueState=';
const GETDEVICEBYID = '/getDeviceById?internalDeviceId=';
const GETDEVICEBYTAG = '/getDeviceByTag?tags=';
const TAGLINK = '&tags=';
const SEARCHFORPLATFORMS = '/searchForDevices?platformId=';
const GETAVAILABLEPLATFORMS = '/getAvailablePlatforms';
const DELETEPLATFORM = '/deletePlatform?platformId=';
const GETALLPLATFORMS = '/getConnectedPlatforms';
const GETALLPLATFORMSFROMALLPROJECTS = '/getConnectedPlatformsFromAllProjects';
const CONNECTPLATFORM = '/connectPlatform';
const GETACTIONVALUEORSTATE = '/getActionValueOrState';
const ENTITYTYPE = '/getDevicesByEntityType?type=';
const LOCATION = '/getDevicesByLocation?location='

@Injectable()
export class DeviceManagerService {

  constructor(private http: HttpClient) {
  }

  connectPlatform(platform: Platform): any {

    return this.http.post(`${URLSYSTEMMANAGER + platform.userId}/${platform.projectId}${CONNECTPLATFORM}`, platform, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  deletePlatform(id: string, userId: string, projectId: string): any {

    return this.http.delete(`${URLSYSTEMMANAGER + userId}/${projectId}${DELETEPLATFORM}${id}`, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  searchForPlatforms(userId: string, projectId: string): any {
    return this.http.get(`${URLSYSTEMMANAGER + userId}/${projectId}${GETAVAILABLEPLATFORMS}`, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  getAllPlatforms(userId: string, projectId): any {
    return this.http.get(`${URLSYSTEMMANAGER + userId}/${projectId}${GETALLPLATFORMS}`, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  changeAiotesBridge(ipAdress: string, port: number, systemIp: string, clickdigitalPort: number, userId: string, projectId): any {
    return this.http.get(`${URLSYSTEMMANAGER + userId}/${projectId}/changeAiotesAddress?ip=${ipAdress}&port=${port}&systemIp=${systemIp}&cdPort=${clickdigitalPort}`, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  addDevice(name: string, platformId: string, deviceInfo: Array<string>, serialNumber: string, tags: Array<string>, location: string,
            userId: string, projectId: string, externalDeviceId): any {
    const obj: object = {name, platformId, deviceInfo, serialNumber, tags, location, externalDeviceId};

    return this.http.post(`${URLDEVICEMANAGER + userId}/${projectId}${ADDDEVICE}`, obj, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  getAllDevices(userId: string, projectid: string): any {
    return this.http.get(`${URLDEVICEMANAGER + userId}/${projectid}${GETALLDEVICES}`, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  getAllDevicesByPlatform(platformId: string, userId: string, projectId: string): any {
    return this.http.get(`${URLDEVICEMANAGER + userId}/${projectId}${GETAllDEVICESBYPLATFORM}?platformId=${platformId}`, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  searchForDevices(platformId: string, userId: string, projectId: string): any {
    return this.http.get(`${URLDEVICEMANAGER + userId}/${projectId}${SEARCHFORPLATFORMS}${platformId}`, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  getDeviceById(id: string, userId: string, projectId: string): any {
    const newId: string = id.replace("#", "%23");
    return this.http.get(`${URLDEVICEMANAGER + userId}/${projectId}${GETDEVICEBYID}${newId}`, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  getAllPlatformsFromAllProjects(userId: string): any {
    return this.http.get(`${URLSYSTEMMANAGER + userId}${GETALLPLATFORMSFROMALLPROJECTS}`, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  getAllLocations(userId: string, projectId: string): any {
    return this.http.get(`${URLDEVICEMANAGER}getAllLocations`, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  getAllSensorTypes(userId: string, projectId: string): any {
    return this.http.get(`${URLDEVICEMANAGER}getSensorTypes`, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  getAllActuatorTypes(userId: string, projectId: string): any {
    return this.http.get(`${URLDEVICEMANAGER}getActuatorTypes`, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  getAllDeviceTypes(userId: string, projectId: string): any {
    return this.http.get(`${URLDEVICEMANAGER + userId}/${projectId}/getAllEntityTypes`, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  getDevicesByEntityType(type: string, userId: string, projectid: string): any {
    return this.http.get(`${URLDEVICEMANAGER + userId}/${projectid}${ENTITYTYPE}${type}`, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  getDevicesByLocation(location: string, userId: string, projectid: string): any {
    return this.http.get(`${URLDEVICEMANAGER + userId}/${projectid}${LOCATION}${location}`, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }


  DeleteDevice(id: string, userId: string, projectId: string): any {
    return this.http.delete(`${URLDEVICEMANAGER + userId}/${projectId}${DELETEDEVICE}${id}`, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  UpdateDevice(id: string, userId: string, projectId: string): any {
    return this.http.get(`${URLDEVICEMANAGER + userId}/${projectId}${UPDATEDEVICE}${id}`, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  ChangeActionState(userId: string, projectId: string, deviceId: string, actionId: string,  valueState: number): any {

    return this.http.get(`${URLDEVICEMANAGER + userId}/${projectId}/${deviceId}/${actionId}${CHANGEACTIONSTATE}${valueState}`, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  GetActionValueOrState(actionId: string, deviceId: string, userId: string, projectId: string): any {
    return this.http.get(`${URLDEVICEMANAGER + userId}/${projectId}${GETACTIONVALUEORSTATE}?actionId=${actionId}&deviceId=${deviceId}`, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  SetSensorType(deviceId: string, sensorId: string, type: string, userId: string, projectId: string): any {
    return this.http.post(`${URLDEVICEMANAGER + userId}/${projectId}/setSensorType?sensorId=${sensorId}&deviceId=${deviceId}&type=${type}`, null,{headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  SetActuatorType(deviceId: string, actuatorId: string, type: string, userId: string, projectId: string): any {
    return this.http.post(`${URLDEVICEMANAGER + userId}/${projectId}/setSensorType?actuatorId=${actuatorId}&deviceId=${deviceId}&type=${type}`, null,{headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

}
