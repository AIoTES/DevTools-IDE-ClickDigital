/**
 * This class models a real time data widget to display real time data
 */
import {ChartWidget} from './chartwidget';
import {Widget} from './widget';
import {AxesOptions} from './linechartwidget';
import {GridsterItem} from "angular-gridster2";

export class RealtimeAnomalyWidget extends Widget {
  /**
   * The number of values which a displayed at once in the graph
   */
  numberOfValues: number;
  axesOptions: AxesOptions;
  chartType: string;
  deviceEntities: Array<AnomalyEntity>;

  constructor(id: string, name: string, additionalInfo: string, position: GridsterItem, isDeveloped: boolean,
              type: string, deviceEntities: Array<AnomalyEntity>,
              chartType: string, axesOptions: AxesOptions, numberOfValues: number) {
    super(id, name, additionalInfo, position, isDeveloped, type);
    this.axesOptions = axesOptions;
    this.deviceEntities = deviceEntities;
    this.chartType = chartType;
    this.numberOfValues = numberOfValues;
  }
}

export class AnomalyEntity {
  deviceId: string;
  entityId: string;
  label: string;
  unit: string;
  axis: string;

  constructor(deviceId: string, entityId: string, label: string, unit: string, axis: string,){
    this.deviceId = deviceId;
    this.entityId = entityId;
    this.label = label;
    this.unit = unit;
    this.axis = axis;
  }
}
