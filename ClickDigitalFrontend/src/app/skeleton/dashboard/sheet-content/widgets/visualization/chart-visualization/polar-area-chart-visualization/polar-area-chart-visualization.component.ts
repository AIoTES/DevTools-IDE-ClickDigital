/*
* Copyright 2017-2020 Fraunhofer Institute for Computer Graphics Research IGD
*
* Licensed under the GNU AFFERO GENERAL PUBLIC LICENSE, Version 3, 19 November 2007
* You may not use this work except in compliance with the Version 3 Licence.
* You may obtain a copy of the Licence at:
* https://www.gnu.org/licenses/agpl-3.0.html
*
* See the Licence for the specific permissions and limitations under the Licence.
*/

import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {forkJoin} from "rxjs/index";
import {Chart} from 'chart.js';
import {SensorDataModel} from "../../../../../../../models/backend/sensordatamodel";
import {DeviceManagerService} from "../../../../../../../services/devicemanager.service";
import {Device} from "../../../../../../../models/backend/device";
import {Project} from "../../../../../../../models/frontend/project";
import {DoughnutChartDeviceEntity, Doughnutchartwidget} from "../../../../../../../models/frontend/doughnutchartwidget";
import {SelectItem} from "primeng/api";
import {DataService} from "../../../../../../../services/data.service";
import {Fieldvalue} from "../../../../../../../models/frontend/fieldvalue";
import {DatabaseService} from "../../../../../../../services/database.service";
import {VisualManagerService} from "../../../../../../../services/visualmanager.service";
import {User} from "../../../../../../../models/frontend/user";
import { Router } from '@angular/router';
import {PolarAreaChartWidget, ActuatorType, SensorType, ISensorListElem, Calculation, Distribution, IPolarChartDeviceEntity} from "../../../../../../../models/frontend/polarareachartwidget";

@Component({
  selector: 'polar-area-chart-visualization',
  templateUrl: './polar-area-chart-visualization.component.html',
  styleUrls: ['./polar-area-chart-visualization.component.css']
})
export class PolarAreaChartVisualizationComponent implements OnInit {
  @ViewChild('chart') private ctx;
  @Input() currentWidget: PolarAreaChartWidget;
  @Output() resizeFont = new EventEmitter<HTMLElement>();

  protected user: User;
  protected project: Project;
  protected loginStatus: number;
  protected currentPalette: string;
  protected calculationType: Calculation = Calculation.Avg;
  myChart: any;
  protected devicesList: SelectItem[] = [];
  protected colorPaletteList: SelectItem[] = [{label: "warm", value: "warm"}, {label: "cool", value: "cool"},
    {label: "neon", value: "neon"}];
  protected calculationList: Array<SelectItem> = [{label: Calculation.Avg, value: Calculation.Avg},
    {label: Calculation.Min, value: Calculation.Min}, {label: Calculation.Max, value: Calculation.Max}];
  protected deviceTypeList : Array<any> = [];
  selectedDeviceType: string;
  protected locationsList: SelectItem[] = [];
  selectedLocation: string;
  protected numberOfLocations: number;

  public deviceEntities: Array<IPolarChartDeviceEntity> = [];

  chartType: string;
  displaySettings: boolean = false;
  //public chartLabels: Array<string>;
  public chartData: [{ label: string, data: Array<number>, backgroundColor: Array<string>}];
  public chartOptions: any;

  selectedStart: Date;
  selectedEnd: Date;

  constructor(private dataService: DataService,
              private databaseService: DatabaseService,
              private devicemanager: DeviceManagerService,
              private visualmanager: VisualManagerService, private router: Router) {
  }

  ngOnInit(): void {
    this.devicesList = [];
    this.chartType = 'polarArea';
    this.chartOptions = {
      maintainAspectRatio: false,
      responsive: true,
      legend: {
        display: true,
        position: 'top'
      },
      //rotation : -Math.PI / 2,
      onResize: function (chart, size) {
        //chart.options.legend.display = size.width > 400;
        //chart.options.legend.position = (size.width > size.height) ? 'right' : 'bottom';
        //console.log();
        //chart.update();
      }
    };
    this.dataService.projectData
      .subscribe(value => {
        this.project = value;
      });
    this.dataService.userData
      .subscribe(value => {
        this.user = value;
      });

    this.dataService.currentLoginStatus.subscribe(value => this.loginStatus = value);
    let dte = new Date();
    dte.setDate(dte.getDate() - 2);
    this.selectedStart = (this.currentWidget.startDate !== undefined)? new Date(this.currentWidget.startDate) : dte;
    this.selectedEnd = (this.currentWidget.endDate !== undefined)? new Date(this.currentWidget.endDate) : new Date();

    this.currentPalette = (this.currentWidget.colorPalette !== undefined)? this.currentWidget.colorPalette : this.colorPaletteList[0].value;
    // init chart attributes and chart object
    this.myChart = new Chart(this.ctx.nativeElement, {
      type: this.chartType,
      data: {
        labels: [],
        datasets: []
      },
      options: this.chartOptions
    });

   //init devicetypelist
    this.devicemanager.getAllSensorTypes(this.user.id, this.project.id).subscribe(result => {
      let sensorItems = result.types.map(elem => {
          return {label: elem.type, value: elem.type};
        });
      this.deviceTypeList = [{label: 'Types of sensors', value: 'sensorType', items: sensorItems}];
        this.devicemanager.getAllActuatorTypes(this.user.id, this.project.id).subscribe(result2 => {
            let actuatorItems = result2.map(elem => {
              return {label: elem, value: elem};
            });
            let deviceTypelist2 = this.deviceTypeList.concat({label: 'Types of actuators', value: 'actuatorType', items: actuatorItems})
            this.deviceTypeList = deviceTypelist2;
          },
          err => {
            if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
              this.router.navigate(['unauthorized']); }
            console.log(err);
          });
      },
      err => {
        if (err['error'] === 'Session invalid' || err['error'] === 'No session found') {
          this.router.navigate(['unauthorized']); }
        console.log(err);
      });

    // init Devicetype
    if (this.currentWidget.deviceType !== ''){
      this.selectedDeviceType = this.currentWidget.deviceType;
      this.calculateLocationNumber();
      this.applySettings();
      //this.setDevicesByTypeList(this.currentWidget.deviceType);
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

  showChart(chart): void {
    console.log("showchart");
    chart.data.labels = [];
    chart.data.datasets = [{data:[], backgroundColor:[]}];
    console.log("chart at beginnung: ", chart.data);
    console.log("deviceEntities at beginning: ", this.deviceEntities);
    //let color = [];
    let cIndex = 0;
    let ctxData = {labels:[],data:[]};
    let observables: Observable<any>[] = [];
    for (const elem of this.deviceEntities) {
      console.log("elem: ", elem);
      observables.push(this.visualmanager.getTimeData(elem.deviceId, elem.entityId,
        this.generateIsoDateTime(this.selectedStart), this.generateIsoDateTime(this.selectedEnd),
        'P5D', this.user.id, this.project.id));
    }
    console.log("observebales length: ", observables.length);
    const observeable = forkJoin(observables);
    observeable.subscribe(dataArray => {
      // All observables in `observables` array have resolved and `dataArray` is an array of result of each observable
      console.log("array subscriptions: ", dataArray);
      for (const elem of dataArray) {
        console.log("elem dataArray: ", elem);
        if (elem.Values.length > 0) {
          let valueCount = 0;
          let dateStart: Date = new Date(elem.Values[0].DateTime);
          let dateEnd: Date = new Date(elem.Values[elem.Values.length - 1].DateTime);
          // we have to divide the total time by 3600000 to get hours instead of milliseconds
          let timeTotal = (dateEnd.getTime() - dateStart.getTime()) / 3600000;
          let value = 0;
          switch (this.calculationType) {
            case Calculation.Avg:
              value = this.calculateAverage(elem.Values, timeTotal);
              break;
            case Calculation.Max:
              value = this.calculateMaximum(elem.Values);
              break;
            case Calculation.Min:
            default:
              value = this.calculateMinimum(elem.Values);
              break;
          }

          // add sensor data to the chartData.
          this.devicemanager.getDeviceById(this.deviceEntities[dataArray.indexOf(elem)].deviceId, this.user.id, this.project.id).subscribe(result => {
            chart.data.labels.push(result.location);
            chart.data.datasets[0].data.push(value);
            if (chart.data.datasets[0].data.length >= chart.data.datasets[0].backgroundColor.length){
              this.setChartColors(this.currentPalette);
              chart.update();
            }
          });

        }
      }

    },err => {
      console.log(err);
    });

  }

  // events
  public chartClicked(e: any): void {
  }

  public chartHovered(e: any): void {
  }

  // updates an attribute of a chart (sub)object.
  updateChartOption(chart, chartField, value): void {
    chartField = value;
    chart.update();
  }

  applySettings(): void {
    this.displaySettings = false;
    this.currentWidget.chartType = this.chartType;
    this.currentWidget.colorPalette = this.currentPalette;
    console.log("color: ", this.currentPalette);
    //this.currentWidget.interval = this.timeType;
    this.currentWidget.endDate = this.selectedEnd;
    this.currentWidget.startDate = this.selectedStart;
    this.currentWidget.calculationType = this.calculationType;
    this.currentWidget.deviceType = this.selectedDeviceType;
    this.currentWidget.location = this.selectedLocation;
    this.saveInDatabase(this.currentWidget.chartType, 'chartType');
    this.saveInDatabase(this.currentWidget.colorPalette, 'colorPalette');
    this.saveInDatabase(this.currentWidget.calculationType, 'calculationType');
    //this.saveInDatabase(this.currentWidget.interval, 'interval');
    this.saveInDatabase(this.currentWidget.startDate, 'startDate');
    this.saveInDatabase(this.currentWidget.endDate, 'endDate');
    this.saveInDatabase(this.currentWidget.location, 'location');
    this.saveInDatabase(this.currentWidget.deviceType, 'deviceType');
    // get data with new settings
    this.setDevicesByTypeList(this.selectedDeviceType);
  }

  abortChanges(): void {
    this.displaySettings = false;
    // this.chartType = this.currentWidget.chartType;
    this.selectedEnd = this.currentWidget.endDate;
    this.selectedStart = this.currentWidget.startDate;
    this.currentPalette = this.currentWidget.colorPalette;
    //this.timeType = this.currentWidget.interval;
    this.selectedDeviceType = this.currentWidget.deviceType;
    this.selectedLocation = this.currentWidget.location;
    this.calculationType = this.currentWidget.calculationType;
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

  // when changing the location, the devicelist has to be renewed
  protected setDeviceList(location: string) {
    // get all devices
    this.devicemanager.getDevicesByLocation(location, this.user.id, this.project.id)
      .subscribe(devices => {
        let newDeviceEntities: IPolarChartDeviceEntity[] = [];
        // go through all devices of the location-based list
        for (const device of devices) {
          // go through all devices of the type-based list and filter the ones with the selected location
          for (const device2 of this.deviceEntities) {
            if (device.deviceId === device2.deviceId) {
              newDeviceEntities.push(device2);
              break;
            }
          }
        }
        this.deviceEntities = newDeviceEntities;
        console.log("endresult device list: ", this.deviceEntities);
        },
        err => {
          console.log(err);
        });
  }

  protected calculateLocationNumber(): void {
    // reset list:
    this.locationsList = [];
    // get all devices
    this.devicemanager.getDevicesByEntityType(this.selectedDeviceType, this.user.id, this.project.id)
      .subscribe(devices => {
          let contains: boolean = false;
          // go through all devices
          for (const device of devices) {
            // go through locationlist
            for (const loc of this.locationsList){
              // if location of this device is already in list, set boolean variable
              if (loc['value'] === device.location) {
                contains = true;
                break;
              }
            }
            // if this location is not yet in the list, add it to the list
            if (contains === false){
              this.locationsList.push({label: device.location, value: device.location});
            }
          }
          this.numberOfLocations = this.locationsList.length;
        },
        err => {
          console.log(err);
        });
  }

  // when changing the device type, the devicelist has to be cleared and renewed
  protected setDevicesByTypeList(entityType: string) {
    // reset list:
    this.deviceEntities = [];
    this.locationsList = [];
    // get all devices
    //let sensorType =
    this.devicemanager.getDevicesByEntityType(entityType, this.user.id, this.project.id)
      .subscribe(devices => {
        console.log("devices ", devices);
          let contains: boolean = false;
          // go through all devices
          for (const device of devices) {
            // go through all sensors and actuators and add the sensors/actuators with the selected device type to the deviceEntities List
            for (const sensor of device.sensors){

              if (sensor.type === this.selectedDeviceType){
                this.deviceEntities.push({deviceId: device.deviceId, entityId: sensor.id});
              }
            }
            for (const action of device.actions){
              if (action.type === this.selectedDeviceType){
                this.deviceEntities.push({deviceId: device.deviceId, entityId: action.id});
              }
            }
          }
          // get Data from Devices
          console.log("deviceEntities: ", this.deviceEntities);
          if (this.deviceEntities.length > 0){
            this.showChart(this.myChart);
          }
        },
        err => {
          console.log(err);
        });
  }

  // function to set color-blinded-friendly colors
  protected setChartColors(palette): void {
    console.log("palette: ", palette);
    if (!palette) palette = this.currentPalette;
    this.currentPalette = palette;

    /*Gradients
      The keys are percentage and the values are the color in a rgba format.
      You can have as many "color stops" (%) as you like.
      0% and 100% is not optional.*/
    var gradient;
    switch (palette) {
      case 'cool':
        gradient = {
          0: [255, 255, 255, 1],
          20: [220, 237, 200, 1],
          45: [66, 179, 213, 1],
          65: [26, 39, 62, 1],
          100: [0, 0, 0, 1]
        };
        break;
      case 'warm':
        gradient = {
          0: [255, 255, 255, 1],
          20: [254, 235, 101, 1],
          45: [228, 82, 27, 1],
          65: [77, 52, 47, 1],
          100: [0, 0, 0, 1]
        };
        break;
      case 'neon':
      default:
        gradient = {
          0: [255, 255, 255, 1],
          20: [255, 236, 179, 1],
          45: [232, 82, 133, 1],
          65: [106, 27, 154, 1],
          100: [0, 0, 0, 1]
        };
        break;
    }

    //Get a sorted array of the gradient keys
    var gradientKeys = Object.keys(gradient);
    gradientKeys.sort(function(a, b) {
      return +a - +b;
    });

    //Find datasets and length
    var chartType = this.currentWidget.chartType;
    switch (chartType) {
      case "pie":
      case "doughnut":
      case "polarArea":
        var datasets = this.myChart.config.data.datasets[0];
        var setsCount = datasets.data.length;
        break;
      case "bubble":
      case "bar":
      case "line":
        var datasets = this.myChart.config.data.datasets;
        var setsCount = datasets.length;
        break;
    }
  console.log("setscount: ", setsCount);
    //Calculate colors
    var chartColors = [];
    for (var i = 0; i < setsCount; i++) {
      var gradientIndex = (i + 1) * (100 / (setsCount + 1)); //Find where to get a color from the gradient
      for (var j = 0; j < gradientKeys.length; j++) {
        var gradientKey = gradientKeys[j];
        if (gradientIndex === +gradientKey) { //Exact match with a gradient key - just get that color
          chartColors[i] = 'rgba(' + gradient[gradientKey].toString() + ')';
          break;
        } else if (gradientIndex < +gradientKey) { //It's somewhere between this gradient key and the previous
          var prevKey = gradientKeys[j - 1];
          var gradientPartIndex = (gradientIndex - Number(prevKey)) / (Number(gradientKey) - Number(prevKey)); //Calculate where
          var color = [];
          for (var k = 0; k < 4; k++) { //Loop through Red, Green, Blue and Alpha and calculate the correct color and opacity
            color[k] = gradient[prevKey][k] - ((gradient[prevKey][k] - gradient[gradientKey][k]) * gradientPartIndex);
            if (k < 3) color[k] = Math.round(color[k]);
          }
          chartColors[i] = 'rgba(' + color.toString() + ')';
          break;
        }
      }
    }
    //Copy colors to the chart
    for (i = 0; i < setsCount; i++) {
      switch (chartType) {
        case "pie":
        case "polarArea":
        case "doughnut":
          if (!datasets.backgroundColor) datasets.backgroundColor = [];
          datasets.backgroundColor[i] = chartColors[i];
          if (!datasets.borderColor) datasets.borderColor = [];
          datasets.borderColor[i] = "rgba(255,255,255,1)";
          break;
        case "bubble":
        case "bar":
          datasets[i].backgroundColor = chartColors[i];
          datasets[i].borderColor = "rgba(255,255,255,0)";
          break;
        case "line":
          datasets[i].borderColor = chartColors[i];
          datasets[i].backgroundColor = "rgba(255,255,255,0)";
          break;
      }
    }

    //Update the chart to show the new colors
    this.myChart.update();
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


}

