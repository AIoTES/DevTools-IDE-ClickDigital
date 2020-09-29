import { map } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { DataService } from './data.service';
import { User } from '../models/frontend/user';
import { Fieldvalue } from '../models/frontend/fieldvalue';
import {Widget} from "../models/frontend/widget";
import { environment} from "../../environments/environment";


const BACKENDURL = `${environment.httpMode}${environment.baseUrl}${environment.contextRoot}`;
const AUTH = 'Bearer '.concat(localStorage.getItem('ang-token'));
const newLink = `${BACKENDURL}/database/`;
const find = '_find';
const uuid = '/_uuids';
const IDTAG = '&id=';

/**

 * This class is an interface to the MongoDatabase backend REST interface
 */
@Injectable()
export class DatabaseService {

  readonly USERSCOLLECTION = 'Users';
  readonly PROJECTSCOLLECTION = 'Projects';
  readonly DASHBOARDSCOLLECTION = 'Dashboards';
  readonly SHEETSSCOLLECTION = 'Sheets';
  readonly WIDGETSCOLLECTION = 'Widgets';

  constructor(private dataService: DataService, private http: HttpClient) {
  }


  // -------------------------------------------------------------------------------------------------
  // -----------------------NEW MONGO DB PART : TODO replace above-----------------------------

  insertDocument(collection: string, document: any): any {
    return this.http.post(`${newLink}${collection}/insert`, document, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  getDocument(collection: string, documentIdentifier: string): any {
    return this.http.get(`${newLink}${collection}/${documentIdentifier}`, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  getDocuments(collection: string, documentIdentifiers: Array<string>): any {
    let link = `${newLink}${collection}?id=`;
    for (let i = 0; i < documentIdentifiers.length; i++) {
      if (i + 1 === documentIdentifiers.length) {
        link += (documentIdentifiers[i]);
      } else {
        link += (documentIdentifiers[i] + IDTAG);
      }
    }

    return this.http.get(link, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  updateDocument(collection: string, documentIdentifier: string, fieldvalue: Fieldvalue): any {
    return this.http.put(`${newLink}${collection}/${documentIdentifier}/update`, fieldvalue, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  pushToDocumentsList(collection: string, documentIdentifier: string, fieldvalue: Fieldvalue): any {
    return this.http.put(`${newLink}${collection}/${documentIdentifier}/push`, fieldvalue, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  popFromDocumentsList(collection: string, documentIdentifier: string, fieldvalue: Fieldvalue): any {
    return this.http.put(`${newLink}${collection}/${documentIdentifier}/pop`, fieldvalue, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  deleteDocument(collection: string, documentIdentifier: string): any {
    return this.http.delete(`${newLink}${collection}/${documentIdentifier}/delete`, {headers:{'Authorization':AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

}
