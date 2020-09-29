/**

 * This class models a chart base widget
 */
import { Widget } from './widget';
import {GridsterItem} from "angular-gridster2";
import {ChartDeviceEntity} from './/chartdeviceEntity';

export class ChartWidget extends Widget {
  /**
   * An array with the ids of the devices and
   * its sensors which are visualized
   */
  deviceEntities: Array<ChartDeviceEntity> = [];
  chartType: string;
  isRealtime: boolean;
  isMonoVis: boolean;
  isTimeBased: boolean;
  // for realtime data
  numberOfValues?: number;
  // for historical data
  startDate?: Date;
  endDate?: Date;
  interval?: string;

  constructor(id: string, name: string, additionalInfo: string,  position: GridsterItem, isDeveloped: boolean, type: string, deviceEntities: Array<ChartDeviceEntity>,
              chartType: string,isMonoVis: boolean, numberOfValues?: number, startDate?: Date, endDate?: Date, interval?: string) {
    super(id, name, additionalInfo, position, isDeveloped, type);
    this.deviceEntities = deviceEntities;
    this.chartType = chartType;
    this.isMonoVis = isMonoVis;
    this.numberOfValues = numberOfValues;
    this.startDate = startDate;
    this.endDate = endDate;
    this.interval = interval;
  }
}

