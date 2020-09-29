/**
 * This class models a history chart widget to display history data
 */
import {Widget} from './widget';
import {GridsterItem} from  "angular-gridster2";
import {AnomalyEntity} from './realtimeanomalywidget';
import {AxesOptions} from './linechartwidget';

export class HistoryAnomalyWidget extends Widget {
  /**
   * The start point of the to visualize data
   */
  startDate: Date;
  /**
   * The end point of the to visualize data
   */
  endDate: Date;
  // The interval of values
  interval: string;

  deviceEntities: Array<AnomalyEntity>;
  chartType: string;
  axesOptions: AxesOptions;

  constructor(id: string, name: string, additionalInfo: string, position: GridsterItem, isDeveloped: boolean, type: string, deviceEntities: Array<AnomalyEntity>,
              chartType: string, axesOptions: AxesOptions, startDate: Date, endDate: Date, interval: string) {
    super(id, name, additionalInfo, position, isDeveloped, type);
    this.startDate = startDate;
    this.endDate = endDate;
    this.interval = interval;
    this.deviceEntities = deviceEntities;
    this.chartType = chartType;
    this.axesOptions = axesOptions;
  }
}
