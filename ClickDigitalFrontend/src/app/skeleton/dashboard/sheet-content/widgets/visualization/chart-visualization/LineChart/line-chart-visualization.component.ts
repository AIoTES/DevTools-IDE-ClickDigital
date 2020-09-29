import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DataService } from '../../../../../../../services/data.service';
import { DeviceManagerService } from '../../../../../../../services/devicemanager.service';
import { VisualManagerService } from '../../../../../../../services/visualmanager.service';
import { DatabaseService } from '../../../../../../../services/database.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import { MenuItem, SelectItem } from 'primeng/api';
import { Chart} from 'chart.js';
import { Project } from '../../../../../../../models/frontend/project';
import { Device } from '../../../../../../../models/backend/device';
import { SensorDataModel } from '../../../../../../../models/backend/sensordatamodel';
import { LineChartWidget } from '../../../../../../../models/frontend/linechartwidget';
import { Fieldvalue } from '../../../../../../../models/frontend/fieldvalue';
import { User } from '../../../../../../../models/frontend/user';
import { ChartDeviceEntity } from '../../../../../../../models/frontend/chartDeviceEntity';
import { ɵplatformCoreDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import {AxesOptions} from "../../../../../../../models/frontend/linechartwidget";
/**

 * This component processes a {@link WidgetType#realtimeChartVisualization} Widget. This type of widget is to display
 * realtime values of an entity in a chart. That means it requests data e.g. get live data of device x
 * from the backend. It uses the {@link RealTimeChartWidget} model to represent a widget.
 */
@Component({
  selector: 'chart-visualization',
  templateUrl: './line-chart-visualization.component.html',
  styleUrls: ['./line-chart-visualization.component.css']
})
export class LineChartVisualizationComponent implements OnInit {
  @Input() currentWidget: LineChartWidget;
  @ViewChild('chart') private ctx;
  @Output() readonly resizeFont = new EventEmitter<HTMLElement>();

  protected user: User;
  protected project: Project;
  protected loginStatus: number;
  protected sensorNumber: string;
  protected dataType: string;
  protected dataDependency: string;
  protected isRealtime: boolean;
  protected isMonoVis: boolean;
  protected isTimeBased: boolean;

  myChart: any;
  protected devicesList: Array<SelectItem> = [];
  protected sensorList: Array<SelectItem> = [];
  protected lineTypeList: Array<SelectItem> = [{label: 'solid', value: 'solid'},{label: 'dotted', value: 'dotted'}];
  chartType: string;
  selectedNumberOfValues: number;

  axesOptions: AxesOptions = {xLabel: '', yLabel: '', xLabelVisible: true, yLabelVisible: true};

  displaySettings = false;
  selectedStart: Date;
  selectedEnd: Date;
  duration: string = 'P5D';
  timeFormat = "DD/MM/YYYY HH:mm:ss";

  public chartLabels: Array<string>;
  public chartData: [{ label: string, data: Array<number>, borderColor: string, fill: boolean, showLine: boolean }];
  public chartOptions: any;

  protected representations: Array<SelectItem> = [];
  public dropdownList = [{deviceEntity: {deviceId: '', entityId: '', lineType: 'solid', fillArea: true, showLine: true, color: '#1976D2', label: '', unit: '', axis: ''}, sensorList: []}];
  public xElem = {deviceEntity: {deviceId: '', entityId: '', lineType: '', fillArea: true, showLine: true, color: '#1976D2', label: '', unit: '', axis: 'x'}, sensorList: []};
  public yElem = {deviceEntity: {deviceId: '', entityId: '', lineType: '', fillArea: true, showLine: true, color: '#1976D2', label: '', unit: '', axis: 'y'}, sensorList: []};
  constructor(private dataService: DataService,
              private databaseService: DatabaseService,
              private devicemanager: DeviceManagerService,
              private visualmanager: VisualManagerService) {
  }

  ngOnInit(): void {
    this.devicesList = [];
    this.sensorList = [];
    this.dataService.projectData
      .subscribe(value => {
        this.project = value;
      });

    this.dataService.userData
      .subscribe(value => {
        this.user = value;
      });
    this.dataService.currentLoginStatus.subscribe(value => this.loginStatus = value);
    this.initDeviceDropdown();
    this.representations = [
      {label: 'Linegraph', value: 'line'},
      {label: 'Doughnut', value: 'doughnut'},
      {label: 'Barchart', value: 'bar'}
    ];

    if (this.currentWidget.axesOptions !== undefined) {
      this.axesOptions = this.currentWidget.axesOptions;
    }
    // init chart attributes and chart object
    this.chartOptions = {
      maintainAspectRatio: false,
      responsive: true,
      legend: {
        display: true,
        position: 'top'
      },
      scales: {
        xAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: ''
          },
        }],
        yAxes: [{
          ticks: {
            beginAtZero: true,

          },
          scaleLabel: {
            display: true,
            labelString: ''
          }
        }]
      },
      onResize: function (chart, size) {
        //chart.options.legend.display = size.width > 400;
        //chart.options.legend.position = (size.width > size.height) ? 'right' : 'bottom';
        //console.log();
        //chart.update();
      }
    };
    this.myChart = new Chart(this.ctx.nativeElement, {
      type: "line",
      data: {
        labels: [],
        datasets: []
      },
      options: this.chartOptions
    });

    // init isTimebased, isRealtime and isMonoVIS and their string variables
    this.initRepresentationVariables();

    // check if chartType was set before
    this.myChart.type = (this.isTimeBased)? "line" : "scatter";

    // check if number of values was set before
    if (this.isRealtime && this.currentWidget.numberOfValues !== undefined) {
      this.selectedNumberOfValues = this.currentWidget.numberOfValues;
    } else if ((!this.isRealtime) && this.currentWidget.startDate !== undefined && this.currentWidget.endDate !== undefined) {
      this.selectedStart = new Date(this.currentWidget.startDate);
      this.selectedEnd = new Date (this.currentWidget.endDate);
      console.log(this.selectedStart);
    } else if (!this.isRealtime){
      this.selectedStart = new Date(2019, 0, 15, 10, 55, 22, 0);
      this.selectedEnd = new Date (this.generateIsoDateTime(this.selectedStart));
    }

    // if new data is available, the chart gets updated
    this.dataService.refreshChartNow
      .subscribe(result => {
        if (this.isRealtime){
          let isChanged = false;
          if (this.isTimeBased){
            if (this.dropdownList[0].deviceEntity.deviceId !== '' && this.myChart !== undefined && this.myChart.data !== undefined && this.myChart.data.datasets !== undefined
              && this.myChart.data.datasets[0] !== undefined) {

              // go through all selected (visualized) Devices
              for (const selected of this.dropdownList) {
                if (selected.deviceEntity.deviceId === result.deviceId &&
                  selected.deviceEntity.entityId === result.entityId) {
                  isChanged = true;
                  // set new values in data
                  this.addData(this.myChart, selected.deviceEntity.label + " in " + selected.deviceEntity.unit, result.label, result.value);
                  // if there are more values than we want to have
                  console.log(this.myChart.data.datasets[0].data);
                  while (this.myChart.data.datasets[0].data.length > this.selectedNumberOfValues) {
                    // delete the oldest ones and the labels as well
                    this.removeData(this.myChart);
                  }
                }
              }
              console.log("chartData REFRESH NOW: ", this.myChart.data.datasets);
            }
          } else if (this.xElem.deviceEntity.deviceId !== '' && this.yElem.deviceEntity.deviceId !== '') {
            // value-value based
            // if change in xElem:
            if (this.xElem.deviceEntity.deviceId === result.deviceId &&
              this.xElem.deviceEntity.entityId === result.entityId) {
              isChanged = true;
              // last yValue:
              let lastY = this.myChart.data.datasets[0].data[this.myChart.data.datasets[0].data.length - 1].y;
              // set new values in data
              this.myChart.data.datasets[0].data.push({x: result.value, y: lastY});
              this.myChart.data.labels.push(result.value);
            } else if (this.yElem.deviceEntity.deviceId === result.deviceId &&
              this.yElem.deviceEntity.entityId === result.entityId){
              // if change in xElem:
              isChanged = true;
              // last yValue:
              let lastX = this.myChart.data.datasets[0].data[this.myChart.data.datasets[0].data.length - 1].x;
              // set new values in data
              this.myChart.data.datasets[0].data.push({x: lastX, y: result.value});
              this.myChart.data.labels.push(lastX);
            }

            // if there are more values than we want to have
            console.log("dataaa: ", this.myChart.data.datasets[0].data);
            while (this.myChart.data.datasets[0].data.length > this.selectedNumberOfValues) {
              // delete the oldest ones and the labels as well
              this.removeData(this.myChart);
            }
            console.log("chartData REFRESHNOW: ", this.myChart.data.datasets);
          }
        }
      });

  }

  private generateIsoDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    const yearString = year.toString();
    let dayString = day.toString();
    let monthString = month.toString();
    let hoursString = hours.toString();
    let minutesString = minutes.toString();
    let secondsString = seconds.toString();

    if (day < 10) {
      dayString = '0' + dayString;
    }
    if (month < 10) {
      monthString = '0' + monthString;
    }
    if (hours < 10) {
      hoursString = '0' + hoursString;
    }
    if (minutes < 10) {
      minutesString = '0' + minutesString;
    }
    if (seconds < 10) {
      secondsString = '0' + secondsString;
    }

    return yearString + '-' + monthString + '-' + dayString + 'T' + hoursString + ':' + minutesString + ':' + secondsString;
  }


  private initDeviceDropdown(): void {

    this.devicesList = [];
    this.devicemanager.getAllDevices(this.user.id, this.project.id)
      .subscribe(data => {
        for (const device of data) {
          this.devicesList.push({label: device.name, value: device.deviceId});
        }
        if (this.currentWidget.deviceEntities[0].deviceId !== undefined && this.currentWidget.deviceEntities[0].deviceId !== '') {
          this.initSetDevice();
        }

      },
      err => {
        console.log(err);
      });
  }

  /**
   * This method fills the device dropdown with all devices from the backend. Therefore it describes from the devicemanager service
   */
  private refreshDeviceDropdown(): void {
    this.devicesList = [];
    this.devicemanager.getAllDevices(this.user.id, this.project.id)
      .subscribe(data => {
        for (const device of data) {
          this.devicesList.push({label: device.name, value: device.deviceId});
        }
      },
      err => {
        console.log(err);
      });
  }

  protected initSetDevice(): void {
    this.dropdownList = [];
    // create a list with all init selected devices
    const selectedDevices: Array<String> = [];
    let isIncluded = false;
    for (const widgetElem of this.currentWidget.deviceEntities) {
      // check if device is in list
      for (const selectedElem of selectedDevices) {
        if (selectedElem === widgetElem.deviceId) {
          isIncluded = true;
          break;
        }
      }
      if (!isIncluded) {
        selectedDevices.push(widgetElem.deviceId);
      }
    }
    // fill lists for dropdowns
    const numberOfSavedEntities = this.currentWidget.deviceEntities.length;
    // go over all selected devices
    for (const widgetElem of selectedDevices) {
      // go over all existing devices
      for (const deviceElem of this.devicesList) {
        if (deviceElem.value === widgetElem) {
          // here we have the right device id
          // get list of all entities of the device
          const sensorList = [];
          this.devicemanager.getDeviceById(deviceElem.value, this.user.id, this.project.id)
            .subscribe((device: Device) => {
                if (device.sensors !== null) {
                  for (const sensor of device.sensors) {
                    sensorList.push({label: sensor.name, value: sensor.id});
                  }
                }
                if (device.actions !== null) {
                  for (const action of device.actions) {
                    sensorList.push({label: action.name, value: action.id});
                  }
                }
                // looking for the right entitiy id
                for (const sensorElem of sensorList) {
                  for (const elem of this.currentWidget.deviceEntities) {
                    if (sensorElem.value === elem.entityId) {
                      // here we have the right entity id
                      // set selected device, list and sensor in dropdownlist
                      this.dropdownList.push({
                        deviceEntity: {deviceId: deviceElem.value, entityId: sensorElem.value, lineType: elem.lineType, fillArea: elem.fillArea,
                          showLine: elem.showLine, color: elem.color, label: elem.label, unit: elem.unit, axis: elem.axis},
                        sensorList: sensorList});
                      if (!this.currentWidget.isMonoVis && !this.isTimeBased){
                        if (elem.axis === "x"){
                          this.xElem = {deviceEntity: {deviceId: deviceElem.value, entityId: sensorElem.value,
                              lineType: elem.lineType, fillArea: elem.fillArea, showLine: elem.showLine, color: elem.color, label: elem.label, unit: elem.unit, axis: elem.axis},
                            sensorList: sensorList};
                        } else if (elem.axis ==="y"){
                          this.yElem = {deviceEntity: {deviceId: deviceElem.value, entityId: sensorElem.value,
                              lineType: elem.lineType, fillArea: elem.fillArea, showLine: elem.showLine, color: elem.color, label: elem.label, unit: elem.unit, axis: elem.axis},
                            sensorList: sensorList};
                        }
                      }
                      break;
                    }
                  }
                }
                // check dropdownlist for dummydata
                for (const data of this.dropdownList) {
                  if (data['deviceId'] === '') {
                    console.log('Dummy');
                  }
                }
              //create and fill chartData from selected sensors if all data is in dropdownList (last finished request)
              if (this.dropdownList.length === numberOfSavedEntities) {
                if (this.isRealtime){
                  console.log("initRTData");
                  this.initRealtimeData(this.myChart);
                } else {
                  console.log("showChart");
                  this.showChart(this.myChart);
                }

              }

              },
              error => {
                console.log('Error requesting devices from backend ', error);
              });
        }
      }
    }
  }


  /**
   * This method pulls the realtime data from the backend once to get the first values for the chart
   * when widget is starting or input parameter are changing
   */
  initRealtimeData(chart): void {
    // set chart options
    console.log("initRT");
    chart.options.scales.xAxes[0].scaleLabel.labelString = this.axesOptions.xLabel;
    chart.options.scales.yAxes[0].scaleLabel.labelString = this.axesOptions.yLabel;
    chart.options.scales.xAxes[0].scaleLabel.display = this.axesOptions.xLabelVisible;
    chart.options.scales.yAxes[0].scaleLabel.display = this.axesOptions.yLabelVisible;
    chart.labels = [];
    chart.data.datasets = [];
    const start: Date = new Date();
    let cIndex = 0;
    if(this.isTimeBased){
      // go through all selected sensors
      console.log("drodpownlist: ", this.dropdownList);
      for (const selected of this.dropdownList) {
        // set saved sensor settings
        const ctxData = {label: selected.deviceEntity.label + ' in ' + selected.deviceEntity.unit,
          data: [], borderColor: selected.deviceEntity.color, backgroundColor: selected.deviceEntity.color,
          borderDash: (selected.deviceEntity.lineType === 'solid')? []:[5,5], fill: selected.deviceEntity.fillArea, showLine: selected.deviceEntity.showLine};
        // get newest data value from the sensor
          this.visualmanager.getNowData(selected.deviceEntity.deviceId, selected.deviceEntity.entityId, this.user.id, this.project.id)
            .subscribe((sensorDataModel: SensorDataModel) => {
                const value = sensorDataModel.Values[0];
                console.log("value: ", value);
                // fill sensor data field with one value
                if(value.FloatValue != null) {
                  ctxData.data.push({x: start, y: value.FloatValue});
                } else if(value.StringValue != null) {
                  var yString = value.StringValue;
                  // delete Temperature unit, which is added in Openhab
                  yString = yString.replace(' °C', '');
                  ctxData.data.push({x: start, y:Number(yString)});
                }
                // add sensor data to the chartData.
                chart.data.datasets.push(ctxData);
                // not needed anymore:
                /*if (chart.data.datasets[0]['label'] === '') {
                  chart.data.dataset.shift();
                }*/
                chart.update();
                console.log("chartINIT Data: ", chart.data.datasets);
              },
              err => {
                console.log('Error requesting data from backend: ', err);
              });

      }
    } else {
      // value: value based
      const ctxData = {label: this.xElem.deviceEntity.label + ' in ' + this.xElem.deviceEntity.unit,
        data: [], borderColor: this.xElem.deviceEntity.color, backgroundColor: this.xElem.deviceEntity.color, fill: this.xElem.deviceEntity.fillArea, showLine: this.xElem.deviceEntity.showLine,
        borderDash: (this.xElem.deviceEntity.lineType === 'solid')? []:[5,5]};
      let xData = [{DateTime: "", value: undefined}];
      // fill data field
      this.visualmanager.getNowData(this.xElem.deviceEntity.deviceId, this.xElem.deviceEntity.entityId, this.user.id, this.project.id)
        .subscribe((sensorDataModel: SensorDataModel) => {
            let xValue: number;
            const value = sensorDataModel.Values[0];
            if (value.FloatValue != null) {
              xValue = value.FloatValue;
            } else if (value.StringValue != null) {
              var xString = value.StringValue;
              // delete Temperature unit, which is added in Openhab
              xString = xString.replace(' °C', '');
              xValue = Number(xString);
            }
            xData.shift();
            // now get yElem Data
            this.visualmanager.getNowData(this.yElem.deviceEntity.deviceId, this.yElem.deviceEntity.entityId, this.user.id, this.project.id)
              .subscribe((sensorDataModelY: SensorDataModel) => {
                const yValue = sensorDataModelY.Values[0];
                if (yValue.FloatValue != null){
                ctxData.data.push({x: xValue, y: yValue.FloatValue});
                } else if (yValue.StringValue != null) {
                  // delete Temperature unit, which is added in Openhab
                  yValue.StringValue = yValue.StringValue.replace(' °C', '');
                ctxData.data.push({x: xValue, y: Number(yValue.StringValue)});
                }
                //chart.data.labels.push(sensorDataModelY.Values[0].DateTime);
                // add sensor data to the chartData.
                console.log("data: ", ctxData.data);
                chart.data.datasets.push(ctxData);
                // set chart type
                this.myChart.type = (this.isTimeBased)? "line" : "scatter";
                chart.update();
              });
          },
          err => {
            console.log('Error requesting historic data from backend ', err);
          });
    }
  }
  // realtime data chart fill method // only pulls new data from backend if it is not available in list
  updateRealtimeData(chart): void {
    chart.options.scales.xAxes[0].scaleLabel.labelString = this.axesOptions.xLabel;
    chart.options.scales.yAxes[0].scaleLabel.labelString = this.axesOptions.yLabel;
    chart.options.scales.xAxes[0].scaleLabel.display = this.axesOptions.xLabelVisible;
    chart.options.scales.yAxes[0].scaleLabel.display = this.axesOptions.yLabelVisible;
    let cIndex = 0;
    if (this.isTimeBased) {
      // go through all selected sensors
      for (const selected of this.dropdownList) {
        // set saved sensor settings
        let isAvailable = false;
        const ctxData = {label: selected.deviceEntity.label + ' in ' + selected.deviceEntity.unit,
          data: [], borderColor: selected.deviceEntity.color, backgroundColor: selected.deviceEntity.color, fill: selected.deviceEntity.fillArea, showLine: selected.deviceEntity.showLine,
          borderDash: (selected.deviceEntity.lineType === 'solid')? []:[5,5]};

        for (let dataset of chart.data.datasets) {
          // check if dataset is in datasets
          if (dataset.label === ctxData.label){
            isAvailable = true;
            // empty dataset until only one value is left.
            while (dataset.data.length > 1) {
              dataset.data.shift();
            }
            // updating other attributes
            dataset.borderColor = selected.deviceEntity.color;
            dataset.borderDash = (selected.deviceEntity.lineType === 'solid')? []:[5,5];
            dataset.showLine = selected.deviceEntity.showLine;
            dataset.fill = selected.deviceEntity.fillArea;
            break;
          }
        }
        if (!isAvailable) {
          // get newest data value from the sensor.
          this.visualmanager.getNowData(selected.deviceEntity.deviceId, selected.deviceEntity.entityId, this.user.id, this.project.id)
            .subscribe((sensorDataModel: SensorDataModel) => {
                const value = sensorDataModel.Values[0];
                // fill sensor data field with one value
                if (value.FloatValue != null) {
                  ctxData.data.push({x: new Date(value.DateTime), y: value.FloatValue});
                } else if (value.StringValue != null) {
                  var yString = value.StringValue;
                  // delete Temperature unit, which is added in Openhab
                  yString = yString.replace(' °C', '');
                  ctxData.data.push({x: new Date(value.DateTime), y: Number(yString)});
                }
                // one time the label of the data points has to be set if there is no label available
                if (cIndex === 0 && chart.data.labels.length === 0) {
                  //chart.data.labels.push(value.DateTime);
                  cIndex++;
                }
                this.addDataset(chart, ctxData);
                console.log("INITchartData: ", this.myChart.data.datasets);
                // set chart type
                this.myChart.type = (this.isTimeBased)? "line" : "scatter";
              },
              err => {
                console.log('Error requesting data from backend: ', err);
              });
        }
        // remove remaining datasets.
        this.removeDatasets(chart);
      }

      // remove all datasets which where deleted
    } else {
      // value: value based
      this.initRealtimeData(chart);
    }
  }

  // historical data chart fill method
  showChart(chart): void {
    this.setChartOptions();
    // set manually changeable chart options
    chart.options.scales.xAxes[0].scaleLabel.labelString = this.axesOptions.xLabel;
    chart.options.scales.yAxes[0].scaleLabel.labelString = this.axesOptions.yLabel;
    chart.options.scales.xAxes[0].scaleLabel.display = this.axesOptions.xLabelVisible;
    chart.options.scales.yAxes[0].scaleLabel.display = this.axesOptions.yLabelVisible;
    // empty chart
    chart.data.datasets = [];
    chart.data.labels = [];
    if (!this.isTimeBased){
      // create a Data object
      const ctxData = {label: this.xElem.deviceEntity.label + ' in ' + this.xElem.deviceEntity.unit,
        data: [], borderColor: this.xElem.deviceEntity.color, backgroundColor: this.xElem.deviceEntity.color, fill: this.xElem.deviceEntity.fillArea, showLine: this.xElem.deviceEntity.showLine,
        borderDash: (this.xElem.deviceEntity.lineType === 'solid')? []:[5,5]};
      let xData = [{"DateTime": "", 'value': undefined}];
      // fill data field
      this.visualmanager.getTimeData(this.xElem.deviceEntity.deviceId, this.xElem.deviceEntity.entityId,
        this.generateIsoDateTime(this.selectedStart), this.generateIsoDateTime(this.selectedEnd),
        this.duration, this.user.id, this.project.id)
        .subscribe((sensorDataModel: SensorDataModel) => {

            for (const value of sensorDataModel.Values) {
              if (value.FloatValue != null) {
                xData.push({"DateTime": value.DateTime, 'value': value.FloatValue});
              } else if (value.StringValue != null) {
                var yString = value.StringValue;
                // delete Temperature unit, which is added in Openhab
                yString = yString.replace(' °C', '');
                xData.push({"DateTime": value.DateTime, 'value': Number(yString)});
              }
            }
            xData.shift();
            // now get yElem Data
            this.visualmanager.getTimeData(this.yElem.deviceEntity.deviceId, this.yElem.deviceEntity.entityId,
                      this.generateIsoDateTime(this.selectedStart), this.generateIsoDateTime(this.selectedEnd),
                      this.duration, this.user.id, this.project.id)
                      .subscribe((sensorDataModel: SensorDataModel) => {
                        let checkedXValues = 1;
                        console.log("xdata length: ", xData.length);
                        for (const yValue of sensorDataModel.Values) {
                          for (const xValue of xData){
                            if (yValue.DateTime === xValue.DateTime){
                              // we found a match! -> save it in the chart Data ctx!
                              console.log("i have found a match!");
                              if (yValue.FloatValue != null) {
                                ctxData.data.push({x: xValue.value, y: yValue.FloatValue});
                              } else if (yValue.StringValue != null) {
                                var yString = yValue.StringValue;
                                // delete Temperature unit, which is added in Openhab
                                yString = yString.replace(' °C', '');
                                ctxData.data.push({x: xValue.value, y: Number(yString)});
                              }
                              //chart.data.labels.push(yValue.DateTime);
                              // delete all values in xData before the used one (not working)
                              //xData.splice(0, checkedXValues);
                              // reset checkedXValues
                              checkedXValues = 0;
                            }
                            checkedXValues++;
                          }
                        }
                        // add sensor data to the chartData.
                        console.log("data: ", ctxData);
                        chart.data.datasets.push(ctxData);
                        // set chart type
                        chart.type = (this.isTimeBased)? "line" : "scatter";
                        console.log("data CHART: ", chart.data.datasets);
                        console.log("chart type: ", chart.type);
                        chart.update();
                      });
          },
          err => {
            console.log('Error requesting historic data from backend ', err);
          });
    } else {
      // time-based Data
        for (const selected of this.dropdownList) {
          // when it is not the first sensor, add them:
          const ctxData = {label: selected.deviceEntity.label + ' in ' + selected.deviceEntity.unit,
            data: [], borderColor: selected.deviceEntity.color, backgroundColor: selected.deviceEntity.color, fill: selected.deviceEntity.fillArea, showLine: selected.deviceEntity.showLine,
            borderDash: (selected.deviceEntity.lineType === 'solid')? []:[5,5]};
          this.visualmanager.getTimeData(selected.deviceEntity.deviceId, selected.deviceEntity.entityId,
            this.generateIsoDateTime(this.selectedStart), this.generateIsoDateTime(this.selectedEnd),
            this.duration, this.user.id, this.project.id)
            .subscribe((sensorDataModel: SensorDataModel) => {
              let i = 0;
                console.log("sensor values: ", sensorDataModel.Values);
                for (const value of sensorDataModel.Values) {
                  if (value.FloatValue != null) {
                    ctxData.data.push({x: new Date(value.DateTime), y: value.FloatValue});
                  } else if (value.StringValue != null) {
                    var yString = value.StringValue;
                    // delete Temperature unit, which is added in Openhab
                    yString = yString.replace(' °C', '');
                    ctxData.data.push({x: new Date(value.DateTime), y: Number(yString)});
                  }
                }
                // add sensor data to the chartData.
                chart.data.datasets.push(ctxData);
                if (chart.data.datasets[0]['label'] === '') {
                  chart.data.dataset.shift();
                }
                // set chart type
                this.myChart.type = (this.isTimeBased)? "line" : "scatter";
                chart.update();
              },
              err => {
                console.log('Error requesting historic data from backend ', err);
              });

        }
    }

  }

  // events
  public chartClicked(e: any): void {
    // console.log(e);
  }

  public chartHovered(e: any): void {
    // console.log(e);
  }

  // add one Data value to each dataset of the chart as well as the label
  addData(chart, entityLabel, label, data): void {
    if (!this.isTimeBased){
      chart.data.labels.push(new Date(label));
    }
    chart.data.datasets.forEach((dataset) => {
      if (entityLabel === dataset.label) {
        console.log("It is the entity label!");
        dataset.data.push({x: new Date(label), y: data});
      } else {
        // fill the other datasets with the latest data value
        const elem = dataset.data.pop();
        dataset.data.push(elem);
        dataset.data.push({x: new Date(label), y: elem.y});
      }

    });
    chart.update();
  }

  // add a new line / dataset to the chart
  addDataset(chart, dataset): void {
    chart.data.datasets.push(dataset);
    chart.update();
  }

  // removes the oldest data value of all datasets in the chart
  removeData(chart): void {
    console.log("delete data because maximum is reached.");
    chart.data.labels.shift();

    chart.data.datasets.forEach((dataset) => {
      dataset.data.shift();
    });
    chart.update();
  }

  // removes all datasets which have mor then one data point
  removeDatasets(chart): void {
    chart.data.datasets.forEach((dataset) => {
      if (dataset.data.lenght > 1) {
        let removalIndex = chart.data.datasets.indexOf(dataset); //Locate index of dataset
        if(removalIndex >= 0) { //make sure this element exists in the array
          chart.data.datasets.splice(removalIndex, 1);
        }
      }
    });
    if (!this.isTimeBased){
      // when it was the only data set, remove the labels as well.
      if (chart.data.datasets.length === 0){
        // for each label, remove one label.
        chart.data.labels.forEach((label) => {
          chart.data.labels.pop();
        });
      }
    }


    chart.update();
  }

  // updates an attribute of a chart (sub)object.
  updateChartOption(chart, chartField, value): void {
    chartField = value;
    chart.update();
  }


  applySettings(): void {
    this.displaySettings = false;
    this.currentWidget.deviceEntities = [];
    this.currentWidget.isMonoVis = this.isMonoVis;
    this.currentWidget.isRealtime = this.isRealtime;
    this.currentWidget.isTimeBased = this.isTimeBased;
    this.chartType = (this.isTimeBased)? "line" : "scatter";
    console.log("axes: ",this.axesOptions );
    // updating data from dropdowns in current Widget
    if (!this.isMonoVis && !this.isTimeBased){
      this.currentWidget.deviceEntities.push(this.xElem.deviceEntity);
      this.currentWidget.deviceEntities.push(this.yElem.deviceEntity);
    } else {
      if (this.isMonoVis){
        this.currentWidget.deviceEntities.push(this.dropdownList[0].deviceEntity);
      } else {
        for (const entity of this.dropdownList) {
          this.currentWidget.deviceEntities.push(entity.deviceEntity);
        }
      }
    }
    this.currentWidget.axesOptions = this.axesOptions;
    // remove empty placeholder if neccessary
    if (this.currentWidget.deviceEntities[0].deviceId === '') {
      this.currentWidget.deviceEntities.shift();
    }
    this.saveInDatabase(this.currentWidget.deviceEntities, 'deviceEntities');
    this.saveInDatabase(this.currentWidget.chartType, 'chartType');
    this.saveInDatabase(this.currentWidget.isMonoVis, 'isMonoVis');
    this.saveInDatabase(this.currentWidget.isRealtime, 'isRealtime');
    this.saveInDatabase(this.currentWidget.isTimeBased, 'isTimeBased');
    this.saveInDatabase(this.currentWidget.axesOptions, 'axesOptions');
    console.log('deviceEntities after APPLY: ', this.currentWidget.deviceEntities);
    console.log("realtime: ", this.isRealtime);

    if (this.isRealtime){
      this.currentWidget.numberOfValues = this.selectedNumberOfValues;
      this.currentWidget.startDate = undefined;
      this.currentWidget.endDate = undefined;
      this.currentWidget.interval = undefined;
      this.saveInDatabase(this.currentWidget.numberOfValues, 'numberOfValues');
      this.saveInDatabase(this.currentWidget.interval, 'interval');
      this.saveInDatabase(this.currentWidget.startDate, 'startDate');
      this.saveInDatabase(this.currentWidget.endDate, 'endDate');
      // get realtime data with new settings
      if (this.currentWidget.chartType !== this.chartType){
        this.setChartOptions();
       // this.initRealtimeData(this.myChart);
      }

      this.initRealtimeData(this.myChart)
      this.currentWidget.chartType = this.chartType;
      //this.updateRealtimeData(this.myChart);
    } else {
      this.currentWidget.numberOfValues = undefined;
      this.currentWidget.endDate = this.selectedEnd;
      this.currentWidget.startDate = this.selectedStart;
      console.log("apply: Date", this.selectedStart);
      this.currentWidget.interval = 'P3W';
      this.saveInDatabase(this.currentWidget.numberOfValues, 'numberOfValues');
      this.saveInDatabase(this.currentWidget.interval, 'interval');
      this.saveInDatabase(this.generateIsoDateTime(this.currentWidget.startDate), 'startDate');
      this.saveInDatabase(this.generateIsoDateTime(this.currentWidget.endDate), 'endDate');
      // get historical data with new settings
      this.showChart(this.myChart);
    }
  }

  abortChanges(): void {
    // reset changes
    this.displaySettings = false;
    this.chartType = this.currentWidget.chartType;
    this.initRepresentationVariables();
    this.chartType = (this.currentWidget.isTimeBased)? "line" : "scatter";
    this.xElem = {deviceEntity: {deviceId: '', entityId: '', lineType: '', fillArea:true, showLine:true, color: '#1976D2', label: '', unit: '', axis: 'x'}, sensorList: []};
    this.yElem = {deviceEntity: {deviceId: '', entityId: '', lineType: '', fillArea: true, showLine: true, color: '#1976D2', label: '', unit: '', axis: 'y'}, sensorList: []};
    this.axesOptions = this.currentWidget.axesOptions;
    this.dropdownList = [{deviceEntity: {deviceId: '', entityId: '', lineType: '', fillArea: true, showLine: true, color: '', label: '', unit: '', axis: ''}, sensorList: []}];
    for (const entity of this.currentWidget.deviceEntities) {
      this.dropdownList.push({deviceEntity: entity, sensorList: []});
      this.setSensorDropdown(entity.deviceId);
    }
    if (this.dropdownList.length > 1){
      this.dropdownList.shift();
    }
    if (this.isTimeBased && this.dropdownList.length > 0){
      this.xElem = this.dropdownList[0];
      this.xElem.deviceEntity.axis = "x";
      if (!this.isMonoVis && this.dropdownList.length > 1){
        this.yElem = this.dropdownList[1];
        this.yElem.deviceEntity.axis = "y";
      }
    }
    if (this.isRealtime){
      this.selectedNumberOfValues = this.currentWidget.numberOfValues;
    } else {
      this.selectedEnd = this.currentWidget.endDate;
      this.selectedStart = this.currentWidget.startDate;
      //this.selectedInterval = this.currentWidget.interval;
    }
  }

  /**
   * This method saves the selected options into the database.
   * @param value the value
   * @param field the field where to store
   */
  protected saveInDatabase(value, field: string): void {
    this.databaseService.updateDocument(this.databaseService.WIDGETSCOLLECTION, this.currentWidget.id, new Fieldvalue(field, value))
      .subscribe(result => {
      }, error => {
        console.log('Error updating database entry ', error);
      });
  }

  protected addNewDropdowns() {
    this.dropdownList.push({deviceEntity: {deviceId: '', entityId: '', lineType: '', fillArea: true, showLine: true, color: '', label: '', unit: '', axis: ''}, sensorList: []});
    //this.chartData.push({label: '', data: [], borderColor: '', fill: false});
  }

  protected deleteDropdowns(group: ChartDeviceEntity) {
    let i = 0;
    this.chartData = [{label: '', data: [], borderColor: '#1976D2', fill: false, showLine: true}];
    // console.log("Dropdownlist: ", this.dropdownList);
    let dropdownListCopy = this.dropdownList;
    for (let elem of this.dropdownList) {
      if (elem.deviceEntity.deviceId === group.deviceId && elem.deviceEntity.entityId === group.entityId) {
        dropdownListCopy.splice(i, 1);
        // if the arrays have the same length, the chartData of the entity has to be deleted as well
        if (this.dropdownList.length === (this.chartData.length) - 1) {
         // this.chartData.splice(i, 1);
        }
        console.log('Dropdownlist after DELETE: ', this.dropdownList);
      }
      i++;
    }
    this.dropdownList = dropdownListCopy;

  }

  protected setSensorDropdown(deviceId: string): void {
    // get list of all entities of the device
    const sensorList = [];
    console.log("chart: ", this.myChart.data.datasets);
    this.devicemanager.getDeviceById(deviceId, this.user.id, this.project.id)
      .subscribe((device: Device) => {
          if (device.sensors !== null) {
            for (const sensor of device.sensors) {
              sensorList.push({label: sensor.name, value: sensor.id});
            }
          }
          if (device.actions !== null) {
            for (const action of device.actions) {
              sensorList.push({label: action.name, value: action.id});
            }
          }

          if (this.isTimeBased){
            // go trhough dropdownlist and set sensorList to device
            for (const dropdowngroup of this.dropdownList) {
              if (dropdowngroup.deviceEntity.deviceId === deviceId) {
                dropdowngroup.sensorList = sensorList;
              }
            }
          } else {
            if (this.xElem.deviceEntity.deviceId === deviceId) {
              this.xElem.sensorList = sensorList;
            } else if (this.yElem.deviceEntity.deviceId === deviceId) {
              this.yElem.sensorList = sensorList;
            }
          }

        },
        error => {
          console.log('Error requesting devices from backend ', error);
        });
  }

  // Because Primeng is stupid and can only use string variables in radiobuttons, we have to set the boolean variables ourselves.
  setIsMonoVis(value: string){
    this.isMonoVis = (value === "true")? true : false;
    if (value === "true") {
      this.isTimeBased = true;
      this.dataDependency = value;
      this.axesOptions.xLabel = "time";
      // if there is more then one element in the dropdownList, delete the unnecessary ones.
      if (this.dropdownList.length > 1){
        this.dropdownList = [this.dropdownList[0]];
      }
    } else {
      if (!this.isTimeBased && this.xElem.deviceEntity.deviceId !== "" && this.dropdownList.length >0) {
          this.xElem = this.dropdownList[0];
        if (this.dropdownList.length > 1){
          this.yElem = this.dropdownList[1];
        }
      }
    }
  }

  initRepresentationVariables():void {
    if (this.currentWidget.isTimeBased !== undefined){
      this.isTimeBased = this.currentWidget.isTimeBased;
      this.dataDependency = (this.isTimeBased === true)? 'true':'false';
    } else {
      this.isTimeBased = true;
      this.dataDependency = 'true';
    }
    this.setChartOptions();
    if (this.currentWidget.isRealtime !== undefined){
      this.isRealtime = this.currentWidget.isRealtime;
      this.dataType = (this.isRealtime === true)? 'true':'false';
    } else {
      this.isRealtime = true;
      this.dataType = 'true';
    }
    if (this.currentWidget.isMonoVis !== undefined){
      this.isMonoVis = this.currentWidget.isMonoVis;
      this.sensorNumber = (this.isMonoVis === true)? 'true':'false';
    } else {
      this.isMonoVis = true;
      this.sensorNumber = 'true';
    }
  }

  setIsRealtime(value: string){
    this.isRealtime = (value === "true")? true : false;
  }
  setIsTimeBased(value: string){
    this.isTimeBased = (value === "true")? true : false;
    if (value === "true") {
      this.axesOptions.xLabel = "time";
    } else {
      if (!this.isTimeBased && this.xElem.deviceEntity.deviceId === "" && this.dropdownList.length >0) {
        this.xElem = this.dropdownList[0];
        console.log("here");
        this.xElem.deviceEntity.axis = "x";
        if (this.dropdownList.length > 1){
          this.yElem = this.dropdownList[1];
          this.yElem.deviceEntity.axis = "y";
        } else {
          this.yElem = {deviceEntity: {deviceId: '', entityId: '', lineType: '', fillArea: true, showLine: true, color: '#1976D2', label: '', unit: '', axis: 'y'}, sensorList: []};
        }
      } else {
        this.xElem = {deviceEntity: {deviceId: '', entityId: '', lineType: '', fillArea: true, showLine: true, color: '#1976D2', label: '', unit: '', axis: 'x'}, sensorList: []};
        this.yElem = {deviceEntity: {deviceId: '', entityId: '', lineType: '', fillArea: true, showLine: true, color: '#1976D2', label: '', unit: '', axis: 'y'}, sensorList: []};

      }
    }
  }

  setChartOptions(){console.log("setOptions");
    if (this.isTimeBased){
      this.chartOptions = {
        maintainAspectRatio: false,
        responsive: true,
        legend: {
          display: true,
          position: 'top'
        },
        scales: {
          xAxes: [{
            type: "time",
            time: {
              parser: this.timeFormat,
              tooltipFormat: 'll',
              displayFormats: {
                'millisecond': 'HH:mm:ss',
                'second': 'HH:mm:ss',
                'minute': 'HH:mm:ss',
                'hour': 'MMM DD YY',
                'day': 'MMM DD YY',
                'week': 'MMM DD YY',
                'month': 'MMM DD YY',
                'quarter': 'MMM DD YY',
                'year': 'MMM DD YY',
              }
            },
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Date'
            },
          }],
          yAxes: [{
            ticks: {
              beginAtZero: true,

            },
            scaleLabel: {
              display: true,
              labelString: ''
            }
          }]
        }
      };
    } else {
      this.chartOptions = {
        maintainAspectRatio: false,
        responsive: true,
        legend: {
          display: true,
          position: 'top'
        },
        scales: {
          xAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: ''
            },
            type: 'linear',
            position: 'bottom'
          }],
          yAxes: [{
            ticks: {
              beginAtZero: true,
            },
            scaleLabel: {
              display: true,
              labelString: ''
            }
          }]
        },
        onResize: function (chart, size) {
          //chart.options.legend.display = size.width > 400;
          //chart.options.legend.position = (size.width > size.height) ? 'right' : 'bottom';
          //console.log();
          //chart.update();
        }
      };
    }
    this.myChart.options = this.chartOptions;
  }
}
