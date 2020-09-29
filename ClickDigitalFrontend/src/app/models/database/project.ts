/**

 * This class models a project. A Project is the highest type of models. A user can create and delete different projects.
 * A project inherits {@link DashboardDB}.
 */
import {DashboardDB} from './dashboard';

export class ProjectDB {
  /**
   * The unique identifier for a project
   */
  id: string;
  /**
   * The name of a project
   */
  name: string;
  /**
   * The theme of a project
   */
  theme: string;
  /**
   * One or multiple {@link DashboardDB#id}
   */
  dashboards: Array<string>;

  /**
   * Constructor to initialize all paramters.
   * @param id The unique identifier for a project
   * @param name The name of a project
   * @param theme The theme of a project
   * @param dashboards One or multiple {@link DashboardDB}
   */
  constructor(id: string, name: string, theme: string, dashboards: Array<string>) {
    this.id = id;
    this.name = name;
    this.theme = theme;
    this.dashboards = dashboards;
  }

}
