/**

 * This class models a chart base widget
 */
import {GridsterItem} from "angular-gridster2";
import {ChartDeviceEntity} from './chartdeviceEntity';
import {ChartWidget} from "./chartwidget";
import {st} from "@angular/core/src/render3";

export class LineChartWidget extends ChartWidget {
  /**
   * An array with the ids of the devices and
   * its sensors which are visualized
   */
  isRealtime: boolean;
  isMonoVis: boolean;
  isTimeBased: boolean;
  axesOptions: AxesOptions;

  constructor(id: string, name: string, additionalInfo: string,  position: GridsterItem, isDeveloped: boolean,
              type: string, deviceEntities: Array<ChartDeviceEntity>, chartType: string, isMonoVis: boolean, isRealtime: boolean, isTimeBased: boolean, axesOptions: AxesOptions,
              numberOfValues?: number, startDate?: Date, endDate?: Date, interval?: string) {
    super(id, name, additionalInfo, position, isDeveloped, type, deviceEntities, chartType, isMonoVis, numberOfValues, startDate, endDate, interval);
    this.axesOptions = axesOptions;
    this.isMonoVis = isMonoVis;
    this.isTimeBased = isTimeBased;
    this.isRealtime = isRealtime;
  }
}

export class AxesOptions {
  xLabel: string;
  yLabel: string;
  xLabelVisible: boolean;
  yLabelVisible: boolean;

  constructor(xLabels: string, yLabels: string, xLabelVisible: boolean, yLabelVisible: boolean) {
    this.xLabel = xLabels;
    this.yLabel = yLabels;
    this.xLabelVisible = xLabelVisible;
    this.yLabelVisible = yLabelVisible;
  }
}
