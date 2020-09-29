import {Component, EventEmitter, Input, OnInit, ViewChild, Output} from '@angular/core';
import {DatabaseService} from '../../../../../../services/database.service';
import {DataService} from '../../../../../../services/data.service';
import {DeviceManagerService} from '../../../../../../services/devicemanager.service';
import {User} from '../../../../../../models/frontend/user';
import {Project} from '../../../../../../models/frontend/project';
import {Device} from '../../../../../../models/backend/device';
import {Fieldvalue} from '../../../../../../models/frontend/fieldvalue';
import {SelectItem} from 'primeng/api';
import {AnomalySensorDataModel} from '../../../../../../models/backend/anomalysensordatamodel';
import { Chart } from 'chart.js';
import 'rxjs/add/observable/interval';
import {AnomalyManagerService} from "../../../../../../services/anomalymanager.service";
import {AxesOptions} from "../../../../../../models/frontend/linechartwidget";
import {ChartDeviceEntity } from '../../../../../../models/frontend/chartDeviceEntity';
import {HistoryAnomalyWidget} from "../../../../../../models/frontend/historyanomalywidget";
import {AnomalyEntity} from "../../../../../../models/frontend/realtimeanomalywidget";


/**
 * This component processes a {@link WidgetType#historyAnomaly} Widget. This type of widget is to display
 * historic values of an entity with anomaly detection. That means it requests data e.g. get data of device x from 02.08.2018 - 03.08.2018
   * from the backend. It uses the {@link HistoryAnomalyWidget} model to represent a widget.
 */
@Component({
  selector: 'history-anomaly',
  templateUrl: './history-anomaly.component.html',
  styleUrls: ['./history-anomaly.component.css']
})
export class HistoryAnomalyComponent implements OnInit {
  @ViewChild('chart') private ctx;
  @Input() currentWidget: HistoryAnomalyWidget;
  @Output() resizeFont = new EventEmitter<HTMLElement>();

  protected user: User;
  protected project: Project;
  protected loginStatus: number;

  myChart: any;
  protected devicesList: SelectItem[] = [];
  protected sensorList: SelectItem[] = [];
  chartType: string = 'line';
  displaySettings: boolean = false;
  public chartLabels: Array<string>;
  public chartData: [{ label: string, data: Array<number>, borderColor: string, fill: boolean }];
  public anomalyScores: Array<number>;
  public chartOptions: any;
  axesOptions: AxesOptions = {xLabel: 'time', yLabel: '', xLabelVisible: true, yLabelVisible: true};

  // Training HTM Network From startTraining to selectedStart
  startTraining: Date
  selectedStart: Date;
  selectedEnd: Date;
  duration: string = 'P5D';

  //spinner
  loading = false;

  // protected representations: Array<SelectItem> = [];
  public dropdownList = [{deviceEntity: new AnomalyEntity("", "", "","",""), sensorList:[]}];

  constructor(private dataService: DataService,
              private databaseService: DatabaseService,
              private devicemanager: DeviceManagerService,
              private anomalymanager: AnomalyManagerService) {
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
          // extra text for items
          afterLabel:  (tooltipItem, data) => 'Anomalyscore: '+ (this.anomalyScores[tooltipItem['index']] * 100).toFixed(2) + '%',
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
      type: this.chartType,
      data: {
        labels: [],
        datasets: []
      },
      options: this.chartOptions
    });

    if (this.currentWidget.axesOptions !== undefined) {
      this.axesOptions = this.currentWidget.axesOptions;
    }

    this.startTraining = new Date(2019, 0, 1, 10, 55, 22, 0);
    this.selectedStart = new Date(2019, 0, 15, 10, 55, 22, 0);
    this.selectedEnd =new Date (this.generateIsoDateTime(this.selectedStart));

    if(this.currentWidget.startDate !== undefined && this.currentWidget.endDate !== undefined) {
      this.selectedStart = new Date(this.currentWidget.startDate);
      this.selectedEnd = new Date (this.currentWidget.endDate);
      //this.currentWidget.startDate = new Date(2019, 0, 15, 10, 55, 22, 0);
      //this.currentWidget.endDate = new Date(2019, 0, 23, 17, 55, 22, 0);
    }

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
    this.devicemanager.getAllDevices(this.user.id, this.project.id).subscribe(data => {
        for (const device of data) {
          this.devicesList.push({label: device.name, value: device.deviceId});
        }
      },
      err => {
        console.log(err);
      });
  }

  protected initSetDevice():void {
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
    let cIndex=0;
    for (const selected of this.dropdownList) {
      const ctxData = {label: selected.deviceEntity.label + ' in ' + selected.deviceEntity.unit,
        data: [],
        borderColor: "grey",
        borderDash: [],
        fill: false,
        // extra backgroundcolor for anomalie
        pointBackgroundColor: [],
      };
      this.anomalyScores = [];

      //update date for training start for HTM Network
      this.updateTrainingData(this.selectedStart);

      this.loading = true;
      this.anomalymanager.getSensorWithAnomalyScoreDataOverTime(selected.deviceEntity.deviceId, selected.deviceEntity.entityId,
        this.generateIsoDateTime(this.startTraining), this.generateIsoDateTime(this.selectedStart), this.generateIsoDateTime(this.selectedEnd),
        this.duration, this.user.id, this.project.id)
        .subscribe((anomalySensorDataModel: AnomalySensorDataModel) => {
            this.loading = false;
            for (const value of anomalySensorDataModel.Values) {
              if(value.FloatValue != null) {
                ctxData.data.push(value.FloatValue);
                //2 Digits after ,
                this.anomalyScores.push(Number((Math.round(value.AnomalyScore * 100) / 100).toFixed(2)));

                //set color, depending on score
                if(value.AnomalyScore > 0.89){
                  ctxData.pointBackgroundColor.push('red');
                }
                else if(value.AnomalyScore > 0.80){
                  ctxData.pointBackgroundColor.push('orange');
                }
                else{
                  ctxData.pointBackgroundColor.push('green');
                }

              } else if(value.StringValue != null) {
                ctxData.data.push(Number(value.StringValue));
              }
              // one time the label of the data points has to be set.
              if (cIndex === 0) {
                // chart.data.labels.push(value.AnomalyScore);
                chart.data.labels.push(value.DateTime);
              }
            }
            cIndex++;
            // add sensor data to the chartData.
            chart.data.datasets.push(ctxData);
            if (chart.data.datasets[0]['label'] === '') {
              chart.data.dataset.shift();
            }
            chart.update();
          },
          err => {
            this.loading = false;
            console.log('Error requesting historic data from backend ', err);
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
    console.log("my Chart Labels: ", chart.data.labels);
    chart.update();
  }

  // updates an attribute of a chart (sub)object.
  updateChartOption(chart, chartField, value): void {
    chartField = value;
    chart.update();
  }


  applySettings(): void {
    this.displaySettings = false;
    //updating data from dropdowns in current Widget
    this.currentWidget.deviceEntities = [];
    console.log("axes: ",this.axesOptions );
    // updating data from dropdowns in current Widget
    for (const entity of this.dropdownList) {
      this.currentWidget.deviceEntities.push(entity.deviceEntity);
    }
    // this.currentWidget.chartType = this.chartType;
    this.currentWidget.axesOptions = this.axesOptions;
    // remove empty placeholder if neccessary
    if (this.currentWidget.deviceEntities[0].deviceId === '') {
      this.currentWidget.deviceEntities.shift();
    }
    this.currentWidget.endDate = this.selectedEnd;
    this.currentWidget.startDate = this.selectedStart;
    this.saveInDatabase(this.currentWidget.deviceEntities, 'deviceEntities');
    this.saveInDatabase(this.currentWidget.chartType, 'chartType');
    this.saveInDatabase(this.currentWidget.axesOptions, 'axesOptions');
    this.saveInDatabase(this.currentWidget.startDate, 'startDate');
    this.saveInDatabase(this.currentWidget.endDate, 'endDate');
    // get data with new settings
    this.showChart(this.myChart);

  }

  abortChanges():void{
    this.displaySettings=false;
    this.chartType = this.currentWidget.chartType;
    this.selectedEnd = this.currentWidget.endDate;
    this.selectedStart = this.currentWidget.startDate;
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
    console.log("dropdown: ", this.dropdownList);
    console.log("chart: ", this.myChart.data.datasets);
    this.devicemanager.getDeviceById(deviceId, this.user.id, this.project.id)
      .subscribe((device: Device) => {
          if (device.sensors !== null) {
            for (const sensor of device.sensors) {
              sensorList.push({label: sensor.name, value: sensor.id});
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

  // update Date for training, for backend
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
