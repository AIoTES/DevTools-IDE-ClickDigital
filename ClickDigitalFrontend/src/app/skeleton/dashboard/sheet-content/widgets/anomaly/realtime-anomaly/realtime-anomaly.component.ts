import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DataService } from '../../../../../../services/data.service';
import { DeviceManagerService } from '../../../../../../services/devicemanager.service';
import { VisualManagerService } from '../../../../../../services/visualmanager.service';
import { DatabaseService } from '../../../../../../services/database.service';
import 'rxjs/add/observable/interval';
import { SelectItem } from 'primeng/api';
import { Chart} from 'chart.js';
import { Project } from '../../../../../../models/frontend/project';
import { Device } from '../../../../../../models/backend/device';
import { Fieldvalue } from '../../../../../../models/frontend/fieldvalue';
import { User } from '../../../../../../models/frontend/user';
import { ChartDeviceEntity } from '../../../../../../models/frontend/chartDeviceEntity';
import { AxesOptions } from '../../../../../../models/frontend/linechartwidget';
import { AnomalyEntity, RealtimeAnomalyWidget } from '../../../../../../models/frontend/realtimeanomalywidget';
import {AnomalySensorDataModel} from '../../../../../../models/backend/anomalysensordatamodel';
import {AnomalyManagerService} from '../../../../../../services/anomalymanager.service';


/**
 * This component processes a {@link WidgetType#realtimeAnomaly} Widget. This type of widget is to display
 * realtime values of an entity in a chart with anomaly score. That means it requests data e.g. get live data of device x
 * from the backend. It uses the {@link RealTimeAnomalyWidget} model to represent a widget.
 */
@Component({
  selector: 'realtime-anomaly',
  templateUrl: './realtime-anomaly.component.html',
  styleUrls: ['./realtime-anomaly.component.css']
})
export class RealtimeAnomalyComponent implements OnInit {
  @Input() currentWidget: RealtimeAnomalyWidget;
  @ViewChild('chart') private ctx;
  @Output() readonly resizeFont = new EventEmitter<HTMLElement>();

  protected user: User;
  protected project: Project;
  protected loginStatus: number;

  myChart: any;
  protected devicesList: Array<SelectItem> = [];
  protected sensorList: Array<SelectItem> = [];
  chartType: string;
  selectedNumberOfValues: number;
  anomalyScore: number;

  // for Training HTM Network From startTraining to nowDate
  startTraining: Date
  nowDate: Date;
  duration: string = 'P5D';

  // spinner
  loading = false;
  index = 1;
  // need both maps, because in realtime just a selectedNumberofValues just shown
  public anomalyScores: Map<number, number>;
  public newAnomalyScores: Map<number, number>;


  axesOptions: AxesOptions = {xLabel: 'time', yLabel: 'y', xLabelVisible: true, yLabelVisible: true};

  displaySettings = false;

  public chartLabels: Array<string>;
  public chartData: [{ label: string, data: Array<number>, borderColor: string, fill: boolean }];
  public chartOptions: any;

  public dropdownList = [{deviceEntity: {deviceId: '', entityId: '', label: '', unit: '', axis: ''}, sensorList: []}];

  constructor(private dataService: DataService,
              private databaseService: DatabaseService,
              private devicemanager: DeviceManagerService,
              private anomalymanager: AnomalyManagerService,
              private changeDetector: ChangeDetectorRef) {
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
    this.chartOptions = {
      maintainAspectRatio: false,
      responsive: true,
      legend: {
        display: true,
        position: 'top'
      },
      tooltips: {
        callbacks: {


          //extra text for items
          afterLabel:  (tooltipItem, data) => 'Anomalscore: '+ (this.anomalyScores.get(tooltipItem['index']) * 100).toFixed(2) + '%'
        }
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
      type: 'line',
      data: {
        labels: [],
        datasets: []
      },
      options: this.chartOptions
    });

    // check if number of values was set before
    if (this.currentWidget.numberOfValues !== undefined) {
      this.selectedNumberOfValues = this.currentWidget.numberOfValues;
    }

    if (this.currentWidget.axesOptions !== undefined) {
      this.axesOptions = this.currentWidget.axesOptions;
    }

    // if new data is available, the chart gets updated
    this.dataService.refreshAnomalyNow
      .subscribe(result => {
        let backgroundcolor = 'green';
        if (this.dropdownList[0].deviceEntity.deviceId !== '' && this.myChart !== undefined && this.myChart.data !== undefined && this.myChart.data.datasets !== undefined
          && this.myChart.data.datasets[0] !== undefined) {
          // go through all selected (visualized) Devices
          for (const selected of this.dropdownList) {
            if (selected.deviceEntity.deviceId === result.deviceId &&
              selected.deviceEntity.entityId === result.entityId) {

              // this.anomalymanager.getSensorWithAnomalyScoreDataSocket(selected.deviceEntity.deviceId, selected.deviceEntity.entityId, this.user.id, this.project.id, result.value, result.label)
              //   .subscribe((anomalyScoreSocket: number) => {


              // set new values in data


              if(this.index == this.selectedNumberOfValues){
                this.anomalyScores.delete(0);
                this.newAnomalyScores = new Map<number, number>();
                for(let i = 1; i < this.selectedNumberOfValues ; i++) {
                  this.newAnomalyScores.set(this.index- i - 1, this.anomalyScores.get(this.index - i));
                }
                // this.anomalyScores = new Map<number, number>();
                this.anomalyScores = this.newAnomalyScores;

                this.index = this.index - 1;
                this.anomalyScores.set(this.index, result.anomalyscore);
                this.index = this.index + 1;
              }
              else {
                this.anomalyScores.set(this.index,  result.anomalyscore);
                this.index++;
              }

                  if(result.anomalyscore > 0.84){
                    if(result.anomalyscore > 0.89){
                      backgroundcolor = 'red';
                    }
                    else{
                      backgroundcolor = 'orange';
                    }
                  }
                  this.addData(this.myChart, selected.deviceEntity.label + " in " + selected.deviceEntity.unit, result.label, result.value, backgroundcolor);

              while (this.myChart.data.datasets[0].data.length > this.selectedNumberOfValues) {
                // delete the oldest ones and the labels as well
                this.removeData(this.myChart);
              }

            }
          }
        }
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
                // if (device.actions !== null) {
                //   for (const action of device.actions) {
                //     sensorList.push({label: action.name, value: action.id});
                //   }
                // }
                // looking for the right entitiy id
                for (const sensorElem of sensorList) {
                  for (const elem of this.currentWidget.deviceEntities) {
                    if (sensorElem.value === elem.entityId) {
                      // here we have the right entity id
                      // set selected device, list and sensor in dropdownlist
                      this.dropdownList.push({
                        deviceEntity: {deviceId: deviceElem.value, entityId: sensorElem.value, label: elem.label, unit: elem.unit, axis: 'y'},
                        sensorList: sensorList});
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
                this.initRealtimeData(this.myChart);
                //}

              },
              error => {
                console.log('Error requesting devices from backend ', error);
              });
        }
      }
    }
    // set chart data for devices

    // setTimeout(this.initRealtimeData 3000);
  }


  /**
   * This method pulls the realtime data from the backend once to get the first values for the chart
   * when widget is starting or input parameter are changing
   */
  initRealtimeData(chart): void {
    // set chart options
    chart.options.scales.xAxes[0].scaleLabel.labelString = this.axesOptions.xLabel;
    chart.options.scales.yAxes[0].scaleLabel.labelString = this.axesOptions.yLabel;
    chart.options.scales.xAxes[0].scaleLabel.display = this.axesOptions.xLabelVisible;
    chart.options.scales.yAxes[0].scaleLabel.display = this.axesOptions.yLabelVisible;
    let cIndex = 0;
    this.nowDate = new Date();
    this.startTraining = new Date();
    this.updateTrainingData(this.nowDate);

    // go through all selected sensors
    for (const selected of this.dropdownList) {
      // set saved sensor settings
      const ctxData = {label: selected.deviceEntity.label + ' in ' + selected.deviceEntity.unit,
        data: [],
        borderColor: 'grey',
        borderDash:[],
        fill: false,
        pointBackgroundColor: []};
        this.loading = true;
        this.changeDetector.detectChanges();
      // this.anomalymanager.startAnomalyNetworkRealtime(selected.deviceEntity.deviceId, selected.deviceEntity.entityId, this.user.id, this.project.id)
      //   .subscribe(() => {
      // get newest data value from the sensor
      this.anomalymanager.startAnomalyNetworkRealtime(selected.deviceEntity.deviceId, selected.deviceEntity.entityId, this.user.id, this.project.id, this.generateIsoDateTime(this.startTraining), this.generateIsoDateTime(this.nowDate), this.duration)
        .subscribe(() => {
          this.loading = false;
          this.changeDetector.detectChanges();
          this.anomalymanager.getSensorWithAnomalyScoreDataNow(selected.deviceEntity.deviceId, selected.deviceEntity.entityId, this.user.id, this.project.id)
            .subscribe((anomalySensorDataModel: AnomalySensorDataModel) => {
                const value = anomalySensorDataModel.Values[0];
                // fill sensor data field with one value
                if (value.FloatValue != null) {
                  ctxData.data.push(value.FloatValue);

                  if(value.AnomalyScore > 0.84){
                    if(value.AnomalyScore > 0.89){
                      ctxData.pointBackgroundColor.push('red');
                    }
                    else{
                      ctxData.pointBackgroundColor.push('orange');
                    }
                  }
                  else{
                    ctxData.pointBackgroundColor.push('green');
                  }

                  // if(value.FloatValue > 5){
                  //   ctxData.pointBackgroundColor.push('red');
                  // }
                  // else{
                  //   ctxData.pointBackgroundColor.push('green');
                  // }
                } else if (value.StringValue != null) {
                  ctxData.data.push(Number(value.StringValue));


                }
                // one time the label of the data points has to be set.
                if (cIndex === 0) {
                  chart.data.labels.push(value.DateTime);
                  cIndex++;
                }
                // add sensor data to the chartData.
                // this.anomalyScore = value.AnomalyScore;
                this.anomalyScores = new Map<number, number>();
                this.anomalyScores.set(0, value.AnomalyScore);
                chart.data.datasets.push(ctxData);
                if (chart.data.datasets[0]['label'] === '') {
                  chart.data.dataset.shift();
                }
                chart.update();
              },
              err => {
                this.loading = false;
                console.log('Error requesting data from backend: ', err);
              });
        });

  }}

  updateRealtimeData(chart): void {
    console.log("options: ", chart.options);
    chart.options.scales.xAxes[0].scaleLabel.labelString = this.axesOptions.xLabel;
    chart.options.scales.yAxes[0].scaleLabel.labelString = this.axesOptions.yLabel;
    chart.options.scales.xAxes[0].scaleLabel.display = this.axesOptions.xLabelVisible;
    chart.options.scales.yAxes[0].scaleLabel.display = this.axesOptions.yLabelVisible;
    let cIndex = 0;
    this.nowDate = new Date();
    this.startTraining = new Date();
    this.updateTrainingData(this.nowDate);
    // go through all selected sensors
    for (const selected of this.dropdownList) {
      // set saved sensor settings
      let isAvailable = false;
      const ctxData = {label: selected.deviceEntity.label + ' in ' + selected.deviceEntity.unit,
        data: [],
        borderColor: '',
        borderDash: [],
        fill: false,
        pointBackgroundColor: []};
      for (let dataset of chart.data.datasets) {
        // check if dataset is in datasets
        if (dataset.label === ctxData.label){
          isAvailable = true;
          // empty dataset until only one value is left.
          while (dataset.data.length > 1) {
            dataset.data.shift();
          }
          // empty labels as well.
          while (chart.data.labels.length > 1) {
            chart.data.labels.shift();
          }
          // updating other attributes
          // dataset.borderColor = selected.deviceEntity.lineColor;
          dataset.borderDash = [];
          break;
        }
      }
      if (!isAvailable) {
        // get newest data value from the sensor.
        this.loading = true;
        this.anomalymanager.startAnomalyNetworkRealtime(selected.deviceEntity.deviceId, selected.deviceEntity.entityId, this.user.id, this.project.id, this.generateIsoDateTime(this.startTraining), this.generateIsoDateTime(this.nowDate), this.duration)
          .subscribe(() => {
            this.loading = false;
        this.anomalymanager.getSensorWithAnomalyScoreDataNow(selected.deviceEntity.deviceId, selected.deviceEntity.entityId, this.user.id, this.project.id)
          .subscribe((anomalySensorDataModel: AnomalySensorDataModel) => {
              const value = anomalySensorDataModel.Values[0];
              // fill sensor data field with one value
              if (value.FloatValue != null) {
                ctxData.data.push(value.FloatValue);
                if (value.AnomalyScore > 0.84){
                  if (value.AnomalyScore > 0.89){
                    ctxData.pointBackgroundColor.push('red');
                  }
                  else {
                    ctxData.pointBackgroundColor.push('orange');
                  }
                }
                else {
                  ctxData.pointBackgroundColor.push('green');
                }
              } else if (value.StringValue != null) {
                ctxData.data.push(Number(value.StringValue));
              }
              // one time the label of the data points has to be set if there is no label available
              if (cIndex === 0 && chart.data.labels.length === 0) {
                chart.data.labels.push(value.DateTime);
                cIndex++;
              }
              this.anomalyScores = new Map<number, number>();
              this.anomalyScores.set(0, value.AnomalyScore);
              chart.data.datasets.push(ctxData);
              if (chart.data.datasets[0]['label'] === '') {
                chart.data.dataset.shift();
              }
              chart.update();
              // this.addDataset(chart, ctxData);
            },
            err => {
              console.log('Error requesting data from backend: ', err);
            });
          });
      }
      // remove remaining datasets.
      this.removeDatasets(chart);
    }

    // remove all datasets which where deleted

  }
  // events
  public chartClicked(e: any): void {
    // console.log(e);
  }

  public chartHovered(e: any): void {
    // console.log(e);
  }

  // add one Data value to each dataset of the chart as well as the label
  addData(chart, entityLabel, label, data, backgroundcolor): void {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
      if (entityLabel === dataset.label) {
        console.log("It is the entity label!");
        dataset.data.push(data);
        dataset.pointBackgroundColor.push(backgroundcolor);
      } else {
        // fill the other datasets with the latest data value
        const elem = dataset.data.pop();
        dataset.data.push(elem);
        dataset.data.push(elem);
      }

    });
    chart.update();
  }

  // add a new line / dataset to the chart
  addDataset(chart, dataset): void {
    chart.data.datasets.push(dataset);
    if (chart.data.datasets[0]['label'] === '') {
      chart.data.dataset.shift();
    }
    chart.update();
  }

  // removes the oldest data value of all datasets in the chart
  removeData(chart): void {
    chart.data.labels.shift();
    chart.data.datasets.forEach((dataset) => {
      dataset.pointBackgroundColor.shift();
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
    // when it was the only data set, remove the labels as well.
    if (chart.data.datasets.length === 0){
      // for each label, remove one label.
      chart.data.labels.forEach((label) => {
        chart.data.labels.pop();
      });
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
    // updating data from dropdowns in current Widget
    for (const entity of this.dropdownList) {
      this.currentWidget.deviceEntities.push(entity.deviceEntity);
    }
    // this.currentWidget.chartType = this.chartType;
    this.currentWidget.numberOfValues = this.selectedNumberOfValues;
    this.currentWidget.axesOptions = this.axesOptions;
    // remove empty placeholder if neccessary
    if (this.currentWidget.deviceEntities[0].deviceId === '') {
      this.currentWidget.deviceEntities.shift();
    }
    this.saveInDatabase(this.currentWidget.deviceEntities, 'deviceEntities');
    // this.saveInDatabase(this.currentWidget.chartType, 'chartType');
    this.saveInDatabase(this.currentWidget.numberOfValues, 'numberOfValues');
    this.saveInDatabase(this.currentWidget.axesOptions, 'axesOptions');
    console.log('deviceEntities after APPLY: ', this.currentWidget.deviceEntities);
    // get realtime data with new settings
    this.updateRealtimeData(this.myChart);
  }

  abortChanges(): void {

    this.displaySettings = false;
    this.chartType = this.currentWidget.chartType;
    this.selectedNumberOfValues = this.currentWidget.numberOfValues;
    this.axesOptions = this.currentWidget.axesOptions;
    this.dropdownList = [{deviceEntity: {deviceId: '', entityId: '', label: '', unit: '', axis: ''}, sensorList: []}];
    for (const entity of this.currentWidget.deviceEntities) {
      this.dropdownList.push({deviceEntity: entity, sensorList: []});
      this.setSensorDropdown(entity.deviceId);
    }
    this.dropdownList.shift();
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
    this.dropdownList.push({deviceEntity: {deviceId: '', entityId: '', label: '', unit: '', axis: ''}, sensorList: []});
    //this.chartData.push({label: '', data: [], borderColor: '', fill: false});
  }

  protected deleteDropdowns(group: ChartDeviceEntity) {
    let i = 0;
    this.chartData = [{label: '', data: [], borderColor: '', fill: false}];

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
    console.log("dropdown: ", this.dropdownList);
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
          // go trhough dropdownlist and set sensorList to device
          for (const dropdowngroup of this.dropdownList) {
            if (dropdowngroup.deviceEntity.deviceId === deviceId) {
              dropdowngroup.sensorList = sensorList;
            }
          }
        },
        error => {
          console.log('Error requesting devices from backend ', error);
        });
  }

  protected setLabel(deviceID: string): void{
    this.dropdownList[0].deviceEntity.label = deviceID;
  }
  // calcualte Date for training, for backend
  protected updateTrainingData(start: Date): void {

    // date problem: January, February, April, Day 31 --> specific training date
    if (start.getMonth() === 0 || start.getMonth() === 1 || start.getMonth() === 3 || start.getDate() === 31) {
      if (start.getMonth() === 0) {
        this.startTraining.setDate(start.getDate() -1);
        this.startTraining.setMonth(10);
        this.startTraining.setFullYear(start.getFullYear() - 1);
      }
      else if(start.getMonth() === 1) {
        this.startTraining.setDate(start.getDate() -1);
        this.startTraining.setMonth(11);
        this.startTraining.setFullYear(start.getFullYear() - 1);
      }
      else if(start.getMonth() === 3 && start.getDate() > 28) {
        this.startTraining.setDate(28);
        this.startTraining.setMonth(1);
        this.startTraining.setFullYear(start.getFullYear());
      }
      else{
        this.startTraining.setDate(start.getDate() - 1);
        this.startTraining.setMonth(start.getMonth() - 2);
        this.startTraining.setFullYear(start.getFullYear());
      }
    }

    // no date problem just subtrate 2 months and 1 day
    else {
      this.startTraining.setDate(start.getDate() - 1);
      this.startTraining.setMonth(start.getMonth() - 2);
      this.startTraining.setFullYear(start.getFullYear());
    }
  }
}
