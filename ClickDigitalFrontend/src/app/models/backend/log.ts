/**

 * This class represents a log in the view of the backend
 */
export class Log {
  date: Date;
  priority: string;
  source: string;
  username: string;
  action: string;
  object: string;
  status: string;

  constructor(obj: any) {
    if (obj.hasOwnProperty('date')) this.date = obj.date;
    if (obj.hasOwnProperty('priority')) this.priority = obj.priority;
    if (obj.hasOwnProperty('source')) this.source = obj.source;
    if (obj.hasOwnProperty('username')) this.username = obj.user;
    if (obj.hasOwnProperty('action')) this.action = obj.action;
    if (obj.hasOwnProperty('object')) this.object = obj.object;
    if (obj.hasOwnProperty('status')) this.status = obj.status;
  }
}
