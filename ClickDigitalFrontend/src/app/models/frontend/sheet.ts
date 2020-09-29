/**

 * This class models a sheet. On a sheet different {@link Widget}
 * can be displayed, edited and dragged around
 */
import { Widget } from './widget';

export class Sheet {
  /**
   * A unique id to identify a sheet
   */
  id: string;
  /**
   * The name of a sheet
   */
  name: string;

  /**
   * An array with the {@link Widget#id} (s) for modelling the database
   */
  widgets:  Array<Widget>;

  /**
   * Constructor to initialize all parameters.
   * @param id A unique id to identify a sheet
   * @param name The name of a sheet
   * @param widgetIds An array with the {@link Widget} (s)
   * @param widgets An array with the {@link Widget#id} of the inherited widgets
   */
  constructor(id: string, name: string, widgets: Array<Widget>) {
    this.id = id;
    this.name = name;
    this.widgets = widgets;
  }
}
