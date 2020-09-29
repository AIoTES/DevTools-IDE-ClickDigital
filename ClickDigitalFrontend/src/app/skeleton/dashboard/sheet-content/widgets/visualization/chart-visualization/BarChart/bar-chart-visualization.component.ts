import {Component, EventEmitter, Input, OnInit, ViewChild, Output} from '@angular/core';
import {BaseChartDirective} from 'ng2-charts/ng2-charts';
import {DataService} from '../../../../../../../services/data.service';
import {Chart} from 'chart.js';
import {DeviceManagerService} from '../../../../../../../services/devicemanager.service';
import {VisualManagerService} from '../../../../../../../services/visualmanager.service';
import {Widget} from '../../../../../../../models/frontend/widget';
import {DatabaseService} from '../../../../../../../services/database.service';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import {MenuItem} from 'primeng/api';
import {SelectItem} from 'primeng/api';
import {Project} from '../../../../../../../models/frontend/project';
import {BarChartWidget, Calculation, Frequency} from '../../../../../../../models/frontend/barchartwidget';
import {Fieldvalue} from '../../../../../../../models/frontend/fieldvalue';
import {User} from '../../../../../../../models/frontend/user';
import {Device} from '../../../../../../../models/backend/device';
import {SensorDataModel} from '../../../../../../../models/backend/sensordatamodel';
import {AxesOptions} from '../../../../../../../models/frontend/linechartwidget';
import {ChartDeviceEntity} from '../../../../../../../models/frontend/chartDeviceEntity';
import {DeviceEntity} from "../../../../../../../models/frontend/deviceEntity";

/**

 * This component processes a {@link WidgetType#barChartVisualization} Widget. This type of widget is to display
 * values of an entity in a bar chart. That means it requests data e.g. get data of device x from 02.08.2018 - 03.08.2018
 * from the backend. It uses the {@link BarChartWidget} model to represent a widget.
 */
@Component({
  selector: 'bar-chart-visualization',
  templateUrl: './bar-chart-visualization.component.html',
  styleUrls: ['./bar-chart-visualization.component.css']
})
export class BarChartVisualizationComponent implements OnInit {
  @ViewChild('chart') private ctx;
  @Input() currentWidget: BarChartWidget;
  @Output() resizeFont = new EventEmitter<HTMLElement>();

  protected user: User;
  protected project: Project;
  protected loginStatus: number;

  protected isMonoVis: boolean = true;
  // isMonoVis in string:
  protected sensorNumber: string = 'true';
  protected isNumeric: boolean = false;
  // isNumeric in string:
  protected sensorType: string = 'false';
  // interval for generating bars
  protected timeType: string = '';
  // non numerical data's type of calculation
  protected calculationType: Calculation = Calculation.Avg;
  protected frequency: Frequency = Frequency.Count;

  protected isEmpty: boolean;

  myChart: any;
  protected devicesList: SelectItem[] = [];
  protected multidevicesList: SelectItem[] = [];

  protected sensorList: SelectItem[] = [];
  protected calculationList: Array<SelectItem> = [{label: Calculation.Avg, value: Calculation.Avg},
    {label: Calculation.Min, value: Calculation.Min}, {label: Calculation.Max, value: Calculation.Max}];
  protected timeList: Array<SelectItem> = [{label: 'day', value: 'day'}, {label: 'week', value: 'week'}, {label: 'month', value: 'month'}];
  protected calculationNonNumericalList: Array<SelectItem> = [{label: 'absolute count', value: 'absolute'}, {label: 'percentage', value: 'percentage'}];

  chartType: string;
  displaySettings: boolean = false;
  public chartLabels: Array<string>;
  public chartData: [{ label: string, data: Array<number>, borderColor: string, backgroundColor: string, fill: boolean }];
  public chartOptions: any;
  axesOptions: AxesOptions = {xLabel: '', yLabel: '', xLabelVisible: true, yLabelVisible: true};

  selectedStart: Date;
  selectedEnd: Date;

  protected representations: Array<SelectItem> = [];
  public dropdownList = [{
    deviceEntity: {
      deviceId: '',
      entityId: '',
      lineType: '',
      fillArea: true,
      showLine: true,
      color: '#1976D2',
      label: '',
      unit: '',
      axis: ''
    }, sensorList: []
  }];

  constructor(private dataService: DataService,
              private databaseService: DatabaseService,
              private devicemanager: DeviceManagerService,
              private visualmanager: VisualManagerService) {
  }

  ngOnInit(): void {
    this.isEmpty = false;
    this.devicesList = [];
    this.multidevicesList = [];
    this.sensorList = [];
    this.chartType = 'bar';
    this.dataService.projectData
      .subscribe(value => {
        this.project = value;
      });
    this.dataService.userData
      .subscribe(value => {
        this.user = value;
      });

    this.dataService.currentLoginStatus.subscribe(value => this.loginStatus = value);
    if (this.currentWidget.axesOptions !== undefined) {this.axesOptions = this.currentWidget.axesOptions;}
    if (this.currentWidget.isMonoVis !== undefined) {
      this.isMonoVis = this.currentWidget.isMonoVis;
      this.sensorNumber = this.isMonoVis.toString();
    }

    if (this.currentWidget.isNumerical !== undefined) {
      this.isNumeric = this.currentWidget.isNumerical;
      this.sensorType = this.isNumeric.toString()
    }

    if (this.currentWidget.calculationType !== undefined) {this.calculationType = this.currentWidget.calculationType;}

    if (this.currentWidget.frequencyType !== undefined) {this.frequency = this.currentWidget.frequencyType;}

    if (this.currentWidget.interval !== undefined) {this.timeType = this.currentWidget.interval;}

    if (this.currentWidget.startDate !== undefined && this.currentWidget.endDate !== undefined) {
      this.selectedStart = new Date(this.currentWidget.startDate);
      this.selectedEnd = new Date(this.currentWidget.endDate);
    } else {
      this.selectedStart = new Date(2019, 1, 5, 10, 55, 22, 0);
      this.selectedEnd = new Date(2019, 1, 15, 10, 55, 22, 0);
    }

    this.fillDevicesList(true);

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
          type: 'category',
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'time'
          },
          //time: {
            //tooltipFormat: 'MM-DD-YYYY ha',
            //unit: 'month'
          //}
        }],
        yAxes: [{
          ticks: {
            beginAtZero: true,
            max: undefined
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
      type: this.chartType,
      data: {
        labels: [],
        datasets: []
      },
      options: this.chartOptions
    });

  }

  // generates a timestamp in ISO standard as defined for the backend
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
                // only push sensors if we have stateless data
                if (device.sensors !== null && this.isNumeric) {
                  for (const sensor of device.sensors) {
                    sensorList.push({label: sensor.name, value: sensor.id});
                  }
                }
                if (device.actions !== null) {
                  for (const action of device.actions) {
                    // only push actions with states in sensorList if is not numeric (= stateful data)
                    if (!this.isNumeric && !action.valueable) {
                      sensorList.push({label: action.name, value: action.id});
                    } else if (this.isNumeric && action.valueable) {
                      // if we have stateless data, push actions without states
                      sensorList.push({label: action.name, value: action.id});
                    }
                  }
                }


                // looking for the right entitiy id
                for (const sensorElem of sensorList) {
                  for (const elem of this.currentWidget.deviceEntities) {
                    if (sensorElem.value === elem.entityId) {
                      // here we have the right entity id
                      // set selected device, list and sensor in dropdownlist
                      this.dropdownList.push({
                        deviceEntity: {
                          deviceId: deviceElem.value,
                          entityId: sensorElem.value,
                          lineType: elem.lineType,
                          fillArea: elem.fillArea,
                          showLine: elem.showLine,
                          color: elem.color,
                          label: elem.label,
                          unit: elem.unit,
                          axis: 'y'
                        },
                        sensorList: sensorList
                      });
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
                //if (this.dropdownList.length === numberOfSavedEntities) {
                // this.initRealtimeData(this.myChart);
                this.showChart(this.myChart);
                //}

              },
              error => {
                console.log('Error requesting devices from backend ', error);
              });
        }
      }
    }
  }

  showChart(chart): void {
    // set chart options
    chart.options.scales.xAxes[0].scaleLabel.labelString = this.axesOptions.xLabel;
    chart.options.scales.yAxes[0].scaleLabel.labelString = this.axesOptions.yLabel;
    chart.options.scales.xAxes[0].scaleLabel.display = this.axesOptions.xLabelVisible;
    chart.options.scales.yAxes[0].scaleLabel.display = this.axesOptions.yLabelVisible;
    chart.data.datasets = [];
    chart.data.labels = [];
    let statedata = {'deviceId': '', 'actionId': '', 'states': [{number: 0, description: '', value: 0}]};
    //let color = [];
    let cIndex = 0;
    // go through all selected devices
    for (const selected of this.dropdownList) {
      this.devicemanager.getDeviceById(selected.deviceEntity.deviceId, this.user.id, this.project.id).subscribe((result) => {
        // for stateful data values, the states have to be prepared
        if (!this.isNumeric) {
          let states;
          for (const action of result.actions) {
            // get the selected action's states
            states = [];
            if (!action.valueable && action.id === selected.deviceEntity.entityId) {
              for (const state of action.states) {
                states.push({number: state.state, description: state.description, value: 0});
              }
              statedata = {'deviceId': selected.deviceEntity.deviceId, 'actionId': action.id, 'states': states};
              break;
            }
          }
        }
        // get Data from Backend
        this.visualmanager.getTimeData(selected.deviceEntity.deviceId, selected.deviceEntity.entityId,
          this.generateIsoDateTime(this.selectedStart), this.generateIsoDateTime(this.selectedEnd),
          'P5D', this.user.id, this.project.id)
          .subscribe((sensorDataModel: SensorDataModel) => {
            if (sensorDataModel.Values.length > 0){
              let valueCount = 0;
              let dateStart: Date = new Date(sensorDataModel.Values[0].DateTime);
              let dateEnd: Date = new Date(sensorDataModel.Values[sensorDataModel.Values.length - 1].DateTime);
              // we have to divide the total time by 3600000 to get hours instead of milliseconds
              let timeTotal = (dateEnd.getTime() - dateStart.getTime()) / 3600000;
              // stateless data
              if (this.isNumeric) {
                let value = 0;
                switch (this.calculationType) {
                  case Calculation.Avg:
                    value = this.calculateAverage(sensorDataModel.Values, timeTotal);
                    break;
                  case Calculation.Max:
                    value = this.calculateMaximum(sensorDataModel.Values);
                    break;
                  case Calculation.Min:
                  default:
                    value = this.calculateMinimum(sensorDataModel.Values);
                    break;
                }

                // add sensor data to the chartData.
                // create ctxData
                if (chart.data.labels.length === 0) {
                  chart.data.labels.push(this.calculationType);
                }
                const ctxData = {
                  label: selected.deviceEntity.label,
                  data: [value],
                  backgroundColor: selected.deviceEntity.color,
                  borderColor: selected.deviceEntity.color
                };
                console.log('ctxData: ', ctxData);
                chart.data.datasets.push(ctxData);
                console.log('after push: ctxData: ', chart.data.datasets);
                if (chart.data.datasets[0]['label'] === '') {
                  console.log("delete datalabel");
                  //chart.data.datasets.shift();
                }
                chart.update();
                console.log('chartData: ', chart.data);

                // stateful data
              } else {
                for (const value of sensorDataModel.Values) {
                  let entityValue: number;
                    if (value.FloatValue !== null){
                      entityValue = value.FloatValue;
                    } else {
                      var vString = value.StringValue;
                      // delete Temperature unit, which is added in Openhab
                      vString = vString.replace(' °C', '');
                      entityValue = Number(vString);
                    }
                  let len = sensorDataModel.Values.length;
                  for (const state of statedata.states) {
                    if (sensorDataModel.Values.indexOf(value) < len - 1) {
                      if (entityValue === state.number) {
                        // count how often the state is represented in the data.
                        let start: Date = new Date(value.DateTime);
                        let end: Date = new Date(sensorDataModel.Values[sensorDataModel.Values.indexOf(value) + 1].DateTime);

                        state.value = state.value + ((end.getTime() - start.getTime()) / 3600000);
                      }
                    }
                  }
                  //console.log("stateData: ", statedata);
                  // one time the label of the data points has to be set.
                }

                // count or calculate percentage
                if (this.frequency === Frequency.Percentage) {
                  for (const state of statedata.states) {
                    state.value = state.value / timeTotal;
                  }
                }
                // add sensor data to the chartData.
                // create ctxData
                let stateValues = [];
                console.log("statedata states: ", statedata.states);
                for (const state of statedata.states) {
                  stateValues.push(state.value);
                  var checkList = [];
                  checkList = chart.data.labels.filter(elem => elem === state.number);
                  if (checkList.length <= 0 ){
                    chart.data.labels.push(state.number);
                  }
                }
                const ctxData = {
                  label: selected.deviceEntity.label,
                  data: stateValues,
                  backgroundColor: selected.deviceEntity.color,
                  borderColor: selected.deviceEntity.color
                };
                console.log('ctxData: ', ctxData);
                chart.data.datasets.push(ctxData);

                if (chart.data.datasets[0]['label'] === '') {
                 // chart.data.datasets.shift();
                }
                chart.update();
                console.log('chartData: ', chart.data);
              }
            } else {
              // if there is no history data, generate Empty data Array
              this.isEmpty = true;
              const ctxData = {
                label: selected.deviceEntity.label,
                data: [],
                backgroundColor: selected.deviceEntity.color,
                borderColor: selected.deviceEntity.color
              };
              console.log('ctxData: ', ctxData);
              chart.data.datasets.push(ctxData);

              if (chart.data.datasets[0]['label'] === '') {
                chart.data.datasets.shift();
              }
              chart.update();
              console.log('chartData: ', chart.data);
            }

            },
            err => {
              console.log('Error requesting historic data from backend ', err);
            });
      }, error => {
        console.log('Error requesting device data from backend ');
      });
    }

  }

  // events
  public chartClicked(e: any): void {
    console.log(e);
  }

  public chartHovered(e: any): void {
    console.log(e);
  }

  // add a new line / dataset to the chart
  addDataset(chart, dataset): void {
    chart.data.datasets.push(dataset);
    if (chart.data.datasets[0]['label'] === '') {
      chart.data.dataset.shift();
    }
    chart.update();
  }

  // removes all datasets which have mor then one data point
  removeDatasets(chart): void {
    chart.data.datasets.forEach((dataset) => {
      if (dataset.data.lenght > 1) {
        let removalIndex = chart.data.datasets.indexOf(dataset); //Locate index of dataset
        if (removalIndex >= 0) { //make sure this element exists in the array
          chart.data.datasets.splice(removalIndex, 1);
        }
      }
    });
    // when it was the only data set, remove the labels as well.
    if (chart.data.datasets.length === 0) {
      // for each label, remove one label.
      chart.data.labels.forEach((label) => {
        chart.data.labels.pop();
      });
    }
    console.log('my LineChart Labels: ', chart.data.labels);
    chart.update();
  }

  // updates an attribute of a chart (sub)object.
  updateChartOption(chart, chartField, value): void {
    chartField = value;
    chart.update();
  }


  applySettings(): void {
    this.isEmpty = false;
    this.displaySettings = false;
    //updating data from dropdowns in current Widget
    this.currentWidget.deviceEntities = [];
    // updating data from dropdowns in current Widget
    for (const entity of this.dropdownList) {
      this.currentWidget.deviceEntities.push(entity.deviceEntity);
    }
    this.currentWidget.chartType = this.chartType;
    this.currentWidget.axesOptions = this.axesOptions;
    this.currentWidget.interval = this.timeType;
    this.currentWidget.isNumerical = this.isNumeric;
    this.currentWidget.isMonoVis = this.isMonoVis;
    this.currentWidget.calculationType = this.calculationType;
    this.currentWidget.frequencyType = this.frequency;
    this.currentWidget.endDate = this.selectedEnd;
    this.currentWidget.startDate = this.selectedStart;
    // remove empty placeholder if neccessary
    if (this.currentWidget.deviceEntities[0].deviceId === '') {
      this.currentWidget.deviceEntities.shift();
    }
    this.saveInDatabase(this.currentWidget.deviceEntities, 'deviceEntities');
    this.saveInDatabase(this.currentWidget.chartType, 'chartType');
    this.saveInDatabase(this.currentWidget.axesOptions, 'axesOptions');
    this.saveInDatabase(this.currentWidget.interval, 'interval');
    this.saveInDatabase(this.currentWidget.isMonoVis, 'isMonoVis');
    this.saveInDatabase(this.currentWidget.isNumerical, 'isNumerical');
    this.saveInDatabase(this.currentWidget.calculationType, 'calculationType');
    this.saveInDatabase(this.currentWidget.frequencyType, 'frequencyType');
    this.saveInDatabase(this.currentWidget.startDate, 'startDate');
    this.saveInDatabase(this.currentWidget.endDate, 'endDate');
    // get data with new settings
    this.showChart(this.myChart);

  }

  abortChanges(): void {
    this.displaySettings = false;
    // this.chartType = this.currentWidget.chartType;
    this.selectedEnd = this.currentWidget.endDate;
    this.selectedStart = this.currentWidget.startDate;
    this.axesOptions = this.currentWidget.axesOptions;
    this.timeType = this.currentWidget.interval;
    this.isNumeric = this.currentWidget.isNumerical;
    this.sensorType = (this.isNumeric)? "true":"false";
    this.isMonoVis = this.currentWidget.isMonoVis;
    this.sensorNumber = (this.isMonoVis)? "true":"false";
    this.calculationType = this.currentWidget.calculationType;
    this.frequency = this.currentWidget.frequencyType;
    this.dropdownList = [{
      deviceEntity: {
        deviceId: '',
        entityId: '',
        lineType: '',
        fillArea: true,
        showLine: true,
        color: '#1976D2',
        label: '',
        unit: '',
        axis: ''
      }, sensorList: []
    }];
    for (const entity of this.currentWidget.deviceEntities) {
      this.dropdownList.push({deviceEntity: entity, sensorList: []});
      this.setSensorDropdown(entity.deviceId);
    }
    this.dropdownList.shift();
    this.devicesList = [];
    this.multidevicesList = [];
    this.fillDevicesList(false);
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
    this.dropdownList.push({
      deviceEntity: {
        deviceId: '',
        entityId: '',
        lineType: '',
        fillArea: true,
        showLine: true,
        color: '#1976D2',
        label: '',
        unit: '',
        axis: ''
      }, sensorList: []
    });
    //this.chartData.push({label: '', data: [], borderColor: '', fill: false});
  }

  protected deleteDropdowns(group: ChartDeviceEntity) {
    let i = 0;
    this.chartData = [{label: '', data: [], borderColor: '#1976D2', backgroundColor: '#1976D2', fill: false}];
    // console.log("Dropdownlist: ", this.dropdownList);
    for (let elem of this.dropdownList) {
      if (elem.deviceEntity.deviceId === group.deviceId && elem.deviceEntity.entityId === group.entityId) {
        this.dropdownList.splice(i, 1);
        // if the arrays have the same length, the chartData of the entity has to be deleted as well
        if (this.dropdownList.length === (this.chartData.length) - 1) {
          // this.chartData.splice(i, 1);
        }
        console.log('Dropdownlist after DELETE: ', this.dropdownList);
      }
      i++;
    }

  }

  protected setSensorDropdown(deviceId: string): void {
    // get list of all entities of the device
    const sensorList = [];
    this.devicemanager.getDeviceById(deviceId, this.user.id, this.project.id)
      .subscribe((device: Device) => {
        // only push sensors if we have stateless and therefore numeric data
          if (this.isNumeric && device.sensors !== null){
            for (const sensor of device.sensors) {
              // if it has sensors, it has numerical values as well
              sensorList.push({label: sensor.name, value: sensor.id});
            }
          }

          if (device.actions !== null) {
            for (const action of device.actions){
              // push actions either when it is stateless (numeric) and has values OR when it has states and is not numeric
              if ((this.isNumeric && action.valueable) || (!this.isNumeric && !action.valueable)){
                sensorList.push({label: action.name, value: action.id});
              }
            }
          }

          // go through dropdownlist and set sensorList to device
          for (const dropdowngroup of this.dropdownList) {
            if (dropdowngroup.deviceEntity.deviceId === deviceId) {
              dropdowngroup.sensorList = sensorList;
              // if there is only one element in sensorlist, preselect it for the dropdown
              if (dropdowngroup.sensorList.length === 1){
                dropdowngroup.deviceEntity.entityId = dropdowngroup.sensorList[0].value;
              }
            }
          }
        },
        error => {
          console.log('Error requesting devices from backend ', error);
        });
  }

  // after changing Sensor Dropdown, set format of Sensor data values to provide uniformity
  setValueFormat() {

  }

  // to fill the multi device dropdowns with compatible devices
  protected fillDevicesList(isInit: boolean){
    // reset list:
    this.devicesList = [];
    this.dropdownList = [{
      deviceEntity: {
        deviceId: '',
        entityId: '',
        lineType: '',
        fillArea: true,
        showLine: true,
        color: '#1976D2',
        label: '',
        unit: '',
        axis: ''
      }, sensorList: []
    }];
    // get all devices
    this.devicemanager.getAllDevices(this.user.id, this.project.id)
      .subscribe(devices => {
          for (const device of devices) {

            let isSameType: boolean = false;
            // only push device if we have stateless data
            if (this.isNumeric) {
              if (device.actions !== null) {
                //check if it has stateless actuators
                for (const action of device.actions){
                  if (action.valueable){
                    isSameType = true;
                    break;
                  }
                }
              }
              if (!isSameType && device.sensors !== null && device.sensors.length > 0){
                // if it has sensors, it has numerical values as well
                isSameType = true;
              }
            } else if (!this.isNumeric && device.actions !== null) {
              // check for statefull actuators
              for (const action of device.actions){
                if (!action.valueable){
                  isSameType = true;
                  break;
                }
              }
            }
            if (isSameType) {
              this.devicesList.push({label: device.name, value: device.deviceId});
            }
          }

          // if call on init, set selected device
          if (isInit && this.currentWidget.deviceEntities !== undefined && this.currentWidget.deviceEntities[0].deviceId !== undefined
            && this.currentWidget.deviceEntities[0].deviceId !== '') {
            this.initSetDevice();
          }

        },
        err => {
          console.log(err);
        });
  }

  calculateAverage(list: SensorDataModel['Values'], totalTime): number {
    let avg = 0;
    let start: Date;
    let end: Date;
    let entityValue: number;
    for (const value of list) {
      if (list.indexOf(value) < (list.length - 1)){
        start = new Date(value.DateTime);
        end = new Date(list[list.indexOf(value) + 1].DateTime);
        if (value.FloatValue !== null){
          entityValue = value.FloatValue;
        } else {
          var vString = value.StringValue;
          // delete Temperature unit, which is added in Openhab
          vString = vString.replace(' °C', '');
          entityValue = Number(vString);
        }
        avg = avg + ((end.getTime() - start.getTime()) / (totalTime * 3600000)) * entityValue;
      }
    }
    return avg;
  }

  calculateMinimum(list: SensorDataModel['Values']): number {
    let min: number;
    if (list[0].FloatValue !== null){
      min = list[0].FloatValue
    } else {
      var vString = list[0].StringValue;
      // delete Temperature unit, which is added in Openhab
      vString = vString.replace(' °C', '');
      min = Number(vString);
    }
    for (const value of list) {
      if (value.FloatValue !== null && value.FloatValue < min) {
        min = value.FloatValue;
      } else
        var v2String = list[0].StringValue;
        // delete Temperature unit, which is added in Openhab
        v2String = v2String.replace(' °C', '');
        if (value.StringValue !== null && Number(v2String) < min) {
        min = Number(v2String);
      }
    }
    return min;
  }

  calculateMaximum(list: SensorDataModel['Values']): number {
    let max: number;
    if (list[0].FloatValue !== null){
      max = list[0].FloatValue
    } else {
      var vString = list[0].StringValue;
      // delete Temperature unit, which is added in Openhab
      vString = vString.replace(' °C', '');
      max = Number(vString);
    }
    for (const value of list) {
      if (value.FloatValue !== null && value.FloatValue > max) {
        max = value.FloatValue;
      } else
        var v2String = list[0].StringValue;
      // delete Temperature unit, which is added in Openhab
      v2String = v2String.replace(' °C', '');
      if (value.StringValue !== null && Number(v2String) > max) {
        max = Number(v2String);
      }
    }
    return max;
  }

  calculateStateDistribution(list: SensorDataModel['Values'], states, totalTime): void {
  }

  // Because Primeng is stupid and can only use string variables in radiobuttons, we have to set the boolean variables ourselves.
  setIsMonoVis(value: string) {
    this.isMonoVis = (value === 'true') ? true : false;
    if (this.dropdownList.length > 1){
      this.dropdownList = [this.dropdownList[0]];
    }
  }

  setIsNumeric(value: string) {
    if (value === 'true') {
      this.isNumeric = true;
    } else {
      this.isNumeric = false;
    }
    // change dropdowns
    this.devicesList = [];
    this.multidevicesList = [];
    this.fillDevicesList(false);
  }
}
