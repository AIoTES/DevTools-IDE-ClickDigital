/**

 * This class models a dashboard. A user can create multiple dashboards.
 * A dashboard inherits one or multiple {@link Sheet}.
 */
import {Sheet} from './sheet';

export class Dashboard {
  /**
   * The unique identifier of a dashboard
   */
  id: string;
  /**
   * The name of the dashboard
   */
  name: string;
  /**
   * One or multiple {@link Sheet#id}
   */
  sheets: Array<Sheet>;

  /**
   * Constructor to initialize all parameters
   * @param id The unique identifier of a dashboard
   * @param name The name of the dashboard
   * @param sheets One or multiple {@link Sheet#id}
   */
  constructor(id: string, name: string, sheets: Array<Sheet>) {
    this.id = id;
    this.name = name;
    this.sheets = sheets;
  }
}
