/**

 * This class models a sheet. On a sheet different {@link WidgetDB}
 * can be displayed, edited and dragged around
 */
import { WidgetDB } from './widget';

export class SheetDB {
  /**
   * A unique id to identify a sheet
   */
  id: string;
  /**
   * The name of a sheet
   */
  name: string;

  /**
   * An array with the {@link WidgetDB#id} (s) for modelling the database
   */
  widgets:  Array<string>;

  /**
   * Constructor to initialize all parameters.
   * @param id A unique id to identify a sheet
   * @param name The name of a sheet
   * @param widgetIds An array with the {@link WidgetDB} (s)
   * @param widgets An array with the {@link WidgetDB#id} of the inherited widgets
   */
  constructor(id: string, name: string, widgets: Array<string>) {
    this.id = id;
    this.name = name;
    this.widgets = widgets;
  }
}
