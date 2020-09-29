import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { UserBackend } from '../models/backend/user';

const BACKENDURL = `${environment.httpMode}${environment.baseUrl}${environment.contextRoot}`;
const AUTH = 'Bearer '.concat(localStorage.getItem('ang-token'));
const URLUSERMANAGER = `${BACKENDURL}/user/`;
const create = 'create';
const get = '/get';
const deleteUser = '/delete';
const logout = '/logout';
const login = 'login';
const editMail = '/editMailAddress';
const editUsername = '/editUsername';
const editFirstname = '/editFirstname';
const editSurname = '/editSurname';

const editPassword = '/editPassword';
const forgotPassword = 'forgotPassword';
const resetPassword = 'resetPassword';
const confirmEmail = 'confirm';
const getAllUsers = 'getAllUsers';

/**
 * This class is responsible for sending REST Requests to the backend
 */
@Injectable()
export class UserManagerService {

  constructor(private http: HttpClient) {
  }

  logoutUser(id: string): any {
    return this.http.get(URLUSERMANAGER + id + logout, {headers: {Authorization: AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  loginUser(username: string, password: string): any {
    return this.http.get(`${URLUSERMANAGER + login}?username=${username}&password=${password}`, {headers: {Authorization: AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }
  getAllUsers(): any {
    return this.http.get(URLUSERMANAGER + getAllUsers, {headers: {Authorization: AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  deleteUser(id: string, password: string): any {
    return this.http.delete(`${URLUSERMANAGER + id + deleteUser}?password=${password}`, {headers: {Authorization: AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  editUserMail(id: string, email: string, password: string): any {
    console.log('e', email);
    return this.http.put(`${URLUSERMANAGER + id + editMail}?password=${password}` , email, {headers: {Authorization: AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  editUserPassword(id: string, password: string, oldpassword: string): any {
    return this.http.put(`${URLUSERMANAGER + id + editPassword}?oldpassword=${oldpassword}`, password, {headers: {Authorization: AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  editUsername(id: string, username: string, password: string): any {
     console.log('u', username);
     return this.http.put(`${URLUSERMANAGER + id + editUsername}?password=${password}`, username, {headers: {Authorization: AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  editFirstname(id: string, firstname: string, password: string): any{
    console.log('f', firstname);
   return this.http.put(`${URLUSERMANAGER + id + editFirstname}?password=${password}`, firstname, {headers: {Authorization: AUTH }, withCredentials: true })
     .pipe(map((res: Response) => res));
 }

  editSurname(id: string, surname: string, password: string): any{
    console.log('s', surname);
    return this.http.put(`${URLUSERMANAGER + id + editSurname}?password=${password}`, surname, {headers: {Authorization: AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  createUser(role: string, username: string, email: string, firstname: string, lastname: string, password: string, checkedSettings: Array<string>): any {
    const obj: object = {role, username, email, firstname, lastname, password, checkedSettings};

    return this.http.post(URLUSERMANAGER + create, obj, {headers: {Authorization: AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  getUser(id: string): any {
    return this.http.get(URLUSERMANAGER + id, {headers: {Authorization: AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  requestResetLinkUser(email: string): any {
    return this.http.put(URLUSERMANAGER + forgotPassword, email, {headers: {Authorization: AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  resetPassword(password: string, token: string): any {
    return this.http.put(`${URLUSERMANAGER + resetPassword}?token=${token}`, password, {headers: {Authorization: AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }

  confirmEmail(token: string): any {
    return this.http.get(`${URLUSERMANAGER + confirmEmail}?token=${token}`, {headers: {Authorization: AUTH }, withCredentials: true })
      .pipe(map((res: Response) => res));
  }
}
