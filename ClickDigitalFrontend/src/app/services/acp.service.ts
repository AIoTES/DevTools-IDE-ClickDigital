/**
 * @ author Hamza Al Haddouchi
 */
 
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment} from '../../environments/environment';


const BACKENDURL = `${environment.httpMode}${environment.baseUrl}${environment.contextRoot}`;
const AUTH = 'Bearer '.concat(localStorage.getItem('ang-token'));


const URL_ACP_MANAGER = `${BACKENDURL}/acp/`;

const USER 					 	= URL_ACP_MANAGER + 'user/';
const USER_GET_SINGLE			= USER + '';
const USER_ADD					= USER + 'add/';
const USER_GET_ALL				= USER + 'all/';
const USER_UPDATE				= '/update';
const USER_RESET_PASSWORD		= '/resetPassword';
const USER_REMOVE				= '/remove';

const PRIVACY 			  		= URL_ACP_MANAGER + 'privacy/';
const PRIVACY_GET_SINGLE  		= PRIVACY + '';
const PRIVACY_ADD 		  		= PRIVACY + 'add/';
const PRIVACY_GET_ALL     		= PRIVACY + 'all/';
const PRIVACY_REMOVE_ALL  		= PRIVACY + 'removeAll/';
const PRIVACY_UPDATE 	 		= '/update';
const PRIVACY_REMOVE 	  		= '/remove';

const PRIVACY_BACKUP 			= URL_ACP_MANAGER + 'privacyBackup/';
const PRIVACY_BACKUP_GET_ALL	= PRIVACY_BACKUP + 'all/';
const PRIVACY_BACKUP_UPDATE		= '/update';
const PRIVACY_BACKUP_REMOVE		= '/remove';
const PRIVACY_BACKUP_IMPORT		= '/import/';

const URL_LOG_MANAGER = URL_ACP_MANAGER + 'logs/';
const URL_GET_LOGS_NO_FILTER = URL_LOG_MANAGER + 'getLogsNoFilter/';
const URL_GET_LOGS_USERNAME_FILTER = URL_LOG_MANAGER + 'getLogsUsernameFilter/';
const URL_GET_LOGS_DATERANGE_FILTER = URL_LOG_MANAGER + 'getLogsDaterangeFilter/';
const URL_GET_LOGS_USERNAME_DATERANGE_FILTER = URL_LOG_MANAGER + 'getLogsUsernameDaterangeFilter/';


@Injectable()
export class ACPService {
  constructor(private http: HttpClient) {
  }

  /* ---------------------------- USER ----------------------------*/
  /**
    Path: /acp/user/add/
  */
  addUser(user): any {
    return this.http.post(USER_ADD, user, {headers: {Authorization: AUTH }, withCredentials: true })
           .pipe(map((res: Response) => res));
  }
  
  /**
    Path: /acp/user/{id}/update
  */
  updateUser(id: string, newObj): any {
	return this.http.post(USER + id + USER_UPDATE, newObj, {headers: {Authorization: AUTH }, withCredentials: true })
           .pipe(map((res: Response) => res));
  }
  
  /**
    Path: /acp/user/{id}
  */
  getUser(id: string) {
    return this.http.get(USER_GET_SINGLE + id, {headers: {Authorization: AUTH }, withCredentials: true })
	       .pipe(map((res: Response) => res));
  }
  
  /**
    Path: /acp/user/all/{fromType}
  */
  getAllUsers(fromType: string = 'default'): any {
    return this.http.get(USER_GET_ALL + fromType, {headers: {Authorization: AUTH }, withCredentials: true })
	       .pipe(map((res: Response) => res));
  }
  
  /**
    Path: /acp/user/{id}/resetPassword
  */
  resetUserPassword(id: string): any {
    return this.http.get(USER + id + USER_RESET_PASSWORD, {headers: {Authorization: AUTH }, withCredentials: true })
	       .pipe(map((res: Response) => res));
  }
  
  /**
    Path: /acp/user/{id}/remove
  */
  removeUser(id: string): any {
    return this.http.get(USER + id + USER_REMOVE, {headers: {Authorization: AUTH }, withCredentials: true })
	       .pipe(map((res: Response) => res));
  }

  /* ---------------------------- PRIVACY ----------------------------*/
  
  /**
    Path: /acp/privacy/add/
  */
  addPrivacyElement(obj): any {
    return this.http.post(PRIVACY_ADD, obj, {headers: {Authorization: AUTH }, withCredentials: true })
           .pipe(map((res: Response) => res));
  }
  
  /**
    Path: /acp/privacy/{id}/update
  */
  updatePrivacyElement(id: string, newObj): any {
	return this.http.post(PRIVACY + id + PRIVACY_UPDATE, newObj, {headers: {Authorization: AUTH }, withCredentials: true })
           .pipe(map((res: Response) => res));
  }
  

  /**
    Path: /acp/privacy/{id}
  */
  getPrivacyElement(id: string) {
    return this.http.get(PRIVACY_GET_SINGLE + id, {headers: {Authorization: AUTH }, withCredentials: true })
	       .pipe(map((res: Response) => res));
  }
  
  /**
    Path: /acp/privacy/all/{fromType}
  */
  getAllPrivacyElements(fromType: string = 'default'): any {
    return this.http.get(PRIVACY_GET_ALL + fromType, {headers: {Authorization: AUTH }, withCredentials: true })
	       .pipe(map((res: Response) => res));
  }
  
 
  /**
    Path: /acp/privacy/{id}/remove
  */
  removePrivacyElement(id: string): any {
    return this.http.get(PRIVACY + id + PRIVACY_REMOVE, {headers: {Authorization: AUTH }, withCredentials: true })
	       .pipe(map((res: Response) => res));
  }
  

  /**
    Path: /acp/privacy/removeAll/{fromType}
  */
  removeAllPrivacyElements(fromType: string = 'default'): any {
    return this.http.get(PRIVACY_REMOVE_ALL + fromType, {headers: {Authorization: AUTH }, withCredentials: true })
	       .pipe(map((res: Response) => res));
  }
  
  /* ---------------------------- PRIVACY_BACKUP ----------------------------*/
  
   /**
    Path: /acp/privacyBackup/{id}/update
  */
  updatePrivacyBackup(id: string, newObj): any {
	return this.http.post(PRIVACY_BACKUP + id + PRIVACY_BACKUP_UPDATE, newObj, {headers: {Authorization: AUTH }, withCredentials: true })
           .pipe(map((res: Response) => res));
  }
  
  /**
    Path: /acp/privacyBackup/all/{fromType}
  */
  getAllPrivacyBackups(fromType: string = 'default'): any {
    return this.http.get(PRIVACY_BACKUP_GET_ALL + fromType, {headers: {Authorization: AUTH }, withCredentials: true })
	       .pipe(map((res: Response) => res));
  }
  
  /**
    Path: /acp/privacyBackup/{id}/remove
  */
  removePrivacyBackup(id: string): any {
    return this.http.get(PRIVACY_BACKUP + id + PRIVACY_BACKUP_REMOVE, {headers: {Authorization: AUTH }, withCredentials: true })
	       .pipe(map((res: Response) => res));
  }
  
  /**
    Path: /acp/privacyBackup/{id}/import/{mode}
  */
  importPrivacyBackup(id: string, mode: string): any {
	return this.http.get(PRIVACY_BACKUP + id + PRIVACY_BACKUP_IMPORT + mode, {headers: {Authorization: AUTH }, withCredentials: true })
	       .pipe(map((res: Response) => res));
  }

  /* ---------------------------- LOGS ----------------------------*/


  getLogs(offset: number, rows: number): any {
    return this.http.get(URL_GET_LOGS_NO_FILTER + offset + '/' + rows, {headers: {Authorization: AUTH }})
      .pipe(map((res: Response) => res));
  }

  getLogsDaterangeFilter(from: Date, till: Date, offset: number, rows: number): any {
    return this.http.get(URL_GET_LOGS_DATERANGE_FILTER + from.getTime() + '/' + till.getTime() + '/'
      + offset + '/' + rows, {headers: {Authorization: AUTH }})
      .pipe(map((res: Response) => res));
  }

  getLogsUsernameDaterangeFilter(from: Date, till: Date, username: string, offset: number, rows: number): any {
    return this.http.get(URL_GET_LOGS_USERNAME_DATERANGE_FILTER + from.getTime() + '/' + till.getTime() + '/' + username + '/'
      + offset + '/' + rows, {headers: {Authorization: AUTH }})
      .pipe(map((res: Response) => res));
  }

}
