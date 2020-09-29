import {DeviceEntity} from "./deviceEntity";

export class ChartDeviceEntity  extends DeviceEntity{
  lineType: string = '';
  // to determine if line should be shown or only dots should be visualized
  showLine: boolean = true;
  // to determin if area under line should be filled or not
  fillArea: boolean = true;
  // color of line
  color: string = '';
  // label of line
  label: string = '';
  // unit of line
  unit: string = '';
  axis: string = '';

  constructor(deviceId: string, entityId: string, lineType: string, fillArea: boolean, showLine: boolean, color: string, label: string, unit: string, axis: string) {
    super(deviceId, entityId);
    this.lineType = lineType;
    this.fillArea = fillArea;
    this.showLine = showLine;
    this.color = color;
    this.label = label;
    this.unit = unit;
    this.axis = axis;
  }
}
