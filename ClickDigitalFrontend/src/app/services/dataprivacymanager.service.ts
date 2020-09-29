import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment} from "../../environments/environment";

const BACKENDURL = `${environment.httpMode}${environment.baseUrl}${environment.contextRoot}`;
const AUTH = 'Bearer '.concat(localStorage.getItem('ang-token'));

const URLPRIVACYMANAGER = `${BACKENDURL}/dataprivacy/`;
const editSettings       = '/edit';
const addPrivacyElement  = 'add/';
const addPrivacyElements = 'addAll/';
const getAllElements     = 'getAllElements/';
const getAllRootElements = 'getAllRootElements/';
const getAllLeafElements = 'getAllLeafElements/';
const getPrivacySettings = 'userSettings/';

@Injectable()
export class DataPrivacyManagerService {
  constructor(private http: HttpClient) {
  }

  addPrivacyElement(obj): any {
    return this.http.post(URLPRIVACYMANAGER + addPrivacyElement, obj, {headers: {Authorization: AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  addPrivacyElements(obj): any {
	return this.http.post(URLPRIVACYMANAGER + addPrivacyElements, obj, {headers: {Authorization: AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  getPrivacySettings(id: string): any {
    return this.http.get(URLPRIVACYMANAGER + getPrivacySettings + id, {headers: {Authorization: AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  editPrivacySettings(id: string, settings): any {
    return this.http.put(URLPRIVACYMANAGER + getPrivacySettings + id + editSettings, settings, {headers: {Authorization: AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  getAllElements(type: string = ''): any {
	return this.http.get(URLPRIVACYMANAGER + getAllElements + type, {headers: {Authorization: AUTH }, withCredentials: true }).pipe(map((res: Response) => res));
  }

  getElement(id: string): any {
    return this.http.get(URLPRIVACYMANAGER + id, {headers: {Authorization: AUTH }, withCredentials: true }).pipe(map((res: Response) => res));
  }
  
  getAllRootElements(): any {
    return this.http.get(URLPRIVACYMANAGER + getAllRootElements, {headers: {Authorization: AUTH }, withCredentials: true }).pipe(map((res: Response) => res));
  }
  
  getAllLeafElements(): any {
    return this.http.get(URLPRIVACYMANAGER + getAllLeafElements, {headers: {Authorization: AUTH }, withCredentials: true }).pipe(map((res: Response) => res));
  }
}
