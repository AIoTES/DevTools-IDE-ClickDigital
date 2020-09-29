
import {GridsterItem} from "angular-gridster2";
import {Widget} from "./widget";
import {BubbleChartDeviceEntity, Calculation} from "./bubbleChartDeviceEntity";


export class BubbleChartWidget extends Widget {

  deviceEntities: Array<BubbleChartDeviceEntity> = [];
  chartType: string = 'bubble';
  startDate: Date;
  endDate: Date;
  locations: Array<String>;
  colorPalette: String;
  // x coordinate of bubble
  x: IBubbleProperty;
  // y coordinate of bubble
  y: IBubbleProperty;
  // radius of bubble
  r: IBubbleProperty;

  constructor(id: string, name: string, additionalInfo: string,  position: GridsterItem, isDeveloped: boolean,
              type: string, deviceEntities: Array<BubbleChartDeviceEntity>, chartType: string,
              startDate: Date, endDate: Date,locations: Array<String>, colorPalette: String) {
    super(id, name, additionalInfo, position, isDeveloped, type);
    this.deviceEntities = deviceEntities;
    this.chartType = chartType;
    this.startDate = startDate;
    this.endDate = endDate;
    this.locations = locations;
    this.colorPalette = colorPalette;

  }

}

export interface IBubbleProperty {
  label: string;
  calculation: Calculation;
  type: string;
}


