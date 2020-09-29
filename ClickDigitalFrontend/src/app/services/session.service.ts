import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserBackend } from '../models/backend/user';
import { DatabaseService } from './database.service';
import { DataService } from './data.service';
import { ProjectService } from './project.service';
import { environment} from "../../environments/environment";


const BACKENDURL = `${environment.httpMode}${environment.baseUrl}${environment.contextRoot}`;
const AUTH = 'Bearer '.concat(localStorage.getItem('ang-token'));
const URLUSERSESSIONMANAGER = `${BACKENDURL}/session/`;
const restore = 'restore';

/**

 * This class is responsible for restoring sessions on page reload
 */
@Injectable()
export class SessionService {

  protected userId: string;

  constructor(private http: HttpClient) {
  }

  restoreSession(): any {
    return this.http.get(URLUSERSESSIONMANAGER , {headers: {Authorization: AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

}

