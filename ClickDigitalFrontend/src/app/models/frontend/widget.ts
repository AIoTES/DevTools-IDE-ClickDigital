/**

 * This class models a base widget. A widget can be modified in different ways. It is drag-  and dropable.
 * It can control a device or visualize the state(s) of a device or rules.
 */
import { GridsterItem } from 'angular-gridster2';

export class Widget {
  id: string;
  name: string;
  additionalInfo?: string;
  position: GridsterItem;
  isDeveloped: boolean;
  icon?: string;
  type: string;

  constructor(id: string, name: string, additionalInfo: string, position: GridsterItem, isDeveloped: boolean, type: string) {
    this.id = id;
    this.name = name;
    this.additionalInfo = additionalInfo;
    this.position = position;
    this.isDeveloped = isDeveloped;
    this.type = type;
  }
}

/**
 * This class lists all available types of widgets ClickDigital offers.
 */
export enum WidgetType {
  ruleView = 'RuleViewWidget',
  tableView = 'TableViewWidget',
  toggleDeviceControl = 'ToggleControlWidget',
  sliderDeviceControl = 'SliderControlWidget',
  stateDeviceControl = 'StateWidget',
  lineChartVisualization = 'LineChartWidget',
  barChartVisualization = 'BarChartWidget',
  bubbleChartVisualization = 'BubbleChartWidget',
  doughnutChartVisualization = 'DoughnutChartWidget',
  polarAreaChartVisualization = 'PolarAreaChartWidget',
  realtimeValueVisualization = 'RealtimeValueWidget',
  deviceControl = 'DeviceControlWidget',
  deleteDevice = 'DeleteDeviceWidget',
  addDevice = 'AddDeviceWidget',
  ruleManagementView = 'RuleManagementViewWidget',
  ruleNotificationView = 'RuleNotificationViewWidget',
  ruleSharingViewWidget = 'RuleSharingViewWidget',
  realtimeAnomaly = 'RealtimeAnomalyWidget',
  historyAnomaly = 'HistoryAnomalyWidget'
}
