import {DeviceEntity} from "./deviceEntity";

export class BubbleChartDeviceEntity{
  color: string = '';
  label: string = '';
 // c coordinate of bubble
  x: DeviceEntity;
  // y coordinate of bubble
  y: DeviceEntity;
  // radius of bubble
  r: DeviceEntity;
  location: string;
  entityType: string;

  constructor(entityType: string, color: string, label: string, x: DeviceEntity, y: DeviceEntity,
              r: DeviceEntity, location: string) {
    this.color = color;
    this.label = label;
    this.x = x;
    this.y = y;
    this.r = r;
    this.location = location;
    this.entityType = entityType;
  }
}



export enum Calculation {
  Avg = "average",
  Min = "minimum",
  Max = "maximum"
}
