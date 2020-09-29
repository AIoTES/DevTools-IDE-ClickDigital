import {GridsterItem} from "angular-gridster2";
import {ChartDeviceEntity} from './chartDeviceEntity';
import {Widget} from "./widget";
import {st} from "@angular/core/src/render3";
import {DeviceEntity} from "./deviceEntity";

export class Doughnutchartwidget extends Widget {

  deviceEntities: Array<DoughnutChartDeviceEntity>;
  chartType: string;
  isCircleFull: string;
  distribution: string;
  colorPalette: string;
  startDate: Date;
  endDate: Date;

  constructor(id: string, name: string, additionalInfo: string,  position: GridsterItem, isDeveloped: boolean,
              type: string, deviceEntities: Array<DoughnutChartDeviceEntity>, chartType: string,
              isCircleFull: string, distribution: string, colorPalette: string, startDate: Date, endDate?: Date) {
    super(id, name, additionalInfo, position, isDeveloped, type);
    this.deviceEntities = deviceEntities;
    this.chartType = chartType;
    this.isCircleFull = isCircleFull;
    this.distribution = distribution;
    this.startDate = startDate;
    this.endDate = endDate;
    this.colorPalette = colorPalette;
  }

}

export class DoughnutChartDeviceEntity  extends DeviceEntity {
  label: string;
  unit: string;

  constructor(deviceId: string, entityId: string, label: string, unit: string) {
    super(deviceId, entityId);
    this.label = label;
    this.unit = unit;
  }
}
