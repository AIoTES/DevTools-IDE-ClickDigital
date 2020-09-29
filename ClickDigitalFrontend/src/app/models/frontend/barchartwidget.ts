/**

 * This class models a bar chart widget
 */
import {GridsterItem} from "angular-gridster2";
import {ChartDeviceEntity} from './chartDeviceEntity';
import {ChartWidget} from "./chartwidget";
import {AxesOptions} from "./linechartwidget";
import {st} from "@angular/core/src/render3";

export class BarChartWidget extends ChartWidget {
  // for labeling chart axes
  axesOptions: AxesOptions;
  // in a time span, which value should be visualized? max, min or average?
  calculationType: Calculation;
  // to determine how to calculate: percentage or count of values
  frequencyType: Frequency;
  // numeric values or states as input.
  isNumerical: boolean;

  constructor(id: string, name: string, additionalInfo: string,  position: GridsterItem, isDeveloped: boolean,
              type: string, deviceEntities: Array<ChartDeviceEntity>, chartType: string, isMonoVis: boolean, isNumerical: boolean,
              calculationType: Calculation, frequencyType: Frequency, axesOptions: AxesOptions,
              numberOfValues?: number, startDate?: Date, endDate?: Date, interval?: string) {
    super(id, name, additionalInfo, position, isDeveloped, type, deviceEntities, chartType, isMonoVis, numberOfValues, startDate, endDate, interval);
    this.axesOptions = axesOptions;
    this.calculationType = calculationType;
    this.isNumerical = isNumerical;
    this.frequencyType = frequencyType;
  }

}

export enum Calculation {
  Avg = "average",
  Min = "minimum",
  Max = "maximum"
}
export enum Frequency {
  Count = "count",
  Percentage = "percentage",
}


