
import {GridsterItem} from "angular-gridster2";
import {Widget} from "./widget";
import {DeviceEntity} from "./deviceEntity";


export class PolarAreaChartWidget extends Widget {

  deviceEntities: Array<IPolarChartDeviceEntity> = [];
  chartType: string = 'polarArea';
  startDate: Date;
  endDate: Date;
  calculationType: Calculation;
  deviceType: string;
  location: string;
  colorPalette: string;

  constructor(id: string, name: string, additionalInfo: string,  position: GridsterItem, isDeveloped: boolean,
              type: string, deviceEntities: Array<IPolarChartDeviceEntity>, chartType: string,
              startDate: Date, endDate: Date, calculationType: Calculation, deviceType: string, location: string,
              colorPalette: string) {
    super(id, name, additionalInfo, position, isDeveloped, type);
    this.deviceEntities = deviceEntities;
    this.chartType = chartType;
    this.startDate = startDate;
    this.endDate = endDate;
    this.calculationType = calculationType;
    this.deviceType = deviceType;
    this.location = location;
    this.colorPalette = colorPalette;
  }

}

export interface IPolarChartDeviceEntity {
  deviceId: string;
  entityId: string;
  //label: string;
}

export interface ILocation {
  id: string;
  name: string;
  label: string;
}

export enum Distribution {
  TimeInterval = "timeInterval",
  Location = "location",
  Occupant = "occupant"
}

export enum SensorType {
  Motion = "motion",
  Temperature = "temperature",
  Humidity = "humidity",
  Pressure = "pressure",
  Energy = "energy",
  Luminance = "luminance",
  Mass = "mass",
  Power = "power",
  Acceleration = "acceleration",
  Gyroscope = "gyrocope",
  Length = "length",
  Volume = "volume",
  Acoustic = "acoustic",
  LightIntensity = "light intensity",
  Magnetic = "magnetic",
  Position = "position",
  Force = "force",
  Flow = "flow"
}

export enum ActuatorType {
  Switch = "switch",
  Dimmer = "dimmer",
  Color = "color",
  Command = "command"
}

export enum Calculation {
  Avg = "average",
  Min = "minimum",
  Max = "maximum"
}

export interface IPolarAreaDropdownElem {
  deviceEntity: DeviceEntity;
  sensorList: Array<ISensorListElem>;
}

export interface ISensorListElem {
  label: string;
  value: string;
}

