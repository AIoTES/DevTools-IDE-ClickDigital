/**

 * This class models a dashboard. A user can create multiple dashboards.
 * A dashboard inherits one or multiple {@link SheetDB}.
 */
import {SheetDB} from './sheet';

export class DashboardDB {
  /**
   * The unique identifier of a dashboard
   */
  id: string;
  /**
   * The name of the dashboard
   */
  name: string;
  /**
   * One or multiple {@link SheetDB#id}
   */
  sheets: Array<string>;

  /**
   * Constructor to initialize all parameters
   * @param id The unique identifier of a dashboard
   * @param name The name of the dashboard
   * @param sheets One or multiple {@link SheetDB#id}
   */
  constructor(id: string, name: string, sheets: Array<string>) {
    this.id = id;
    this.name = name;
    this.sheets = sheets;
  }
}
