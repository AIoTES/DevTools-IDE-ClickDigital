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
import {Fieldvalue} from '../../../../../../../models/frontend/fieldvalue';
import {User} from '../../../../../../../models/frontend/user';
import {Device} from '../../../../../../../models/backend/device';
import {SensorDataModel} from '../../../../../../../models/backend/sensordatamodel';
import {BubbleChartWidget, IBubbleProperty} from "../../../../../../../models/frontend/bubblechartwidget";
import {BubbleChartDeviceEntity,  Calculation} from "../../../../../../../models/frontend/bubbleChartDeviceEntity";
import {IPolarChartDeviceEntity} from "../../../../../../../models/frontend/polarareachartwidget";
import {forkJoin} from "rxjs/index";
import { Router } from '@angular/router';

/**
 * This component processes a {@link WidgetType#barChartVisualization} Widget. This type of widget is to display
 * values of an entity in a bubble chart. That means it requests data e.g. get data of device x from 02.08.2018 - 03.08.2018
 * from the backend. It uses the {@link BubbleChartWidget} model to represent a widget.
 */
@Component({
  selector: 'bubble-chart-visualization',
  templateUrl: './bubble-chart-visualization.component.html',
  styleUrls: ['./bubble-chart-visualization.component.css']
})
export class BubbleChartVisualizationComponent implements OnInit {
  @ViewChild('chart') private ctx;
  @ViewChild('menuItems') menu: MenuItem[];
  @Input() currentWidget: BubbleChartWidget;
  @Output() resizeFont = new EventEmitter<HTMLElement>();

  protected user: User;
  protected project: Project;
  protected loginStatus: number;

  // non numerical data's type of calculation
  protected calculationType: Calculation = Calculation.Avg;
  protected isEmpty: boolean;

  myChart: any;
  protected devicesList: SelectItem[] = [];
  protected sensorList: SelectItem[] = [];

  protected calculationList: Array<SelectItem> = [{label: Calculation.Avg, value: Calculation.Avg},
    {label: Calculation.Min, value: Calculation.Min}, {label: Calculation.Max, value: Calculation.Max}];
  protected locationsList: Array<any>;
  selectedLocation: string;
  protected deviceTypeList : Array<any> = [];
  selectedDeviceType: string;
  public selectedX: IBubbleProperty;
  public selectedY: IBubbleProperty;
  public selectedR: IBubbleProperty;
  public xLabel: string;
  public yLabel: string;
  public rLabel: string;

  chartType: string;
  displaySettings: boolean = false;
  public chartLabels: Array<string>;
  public chartData: [{ label: string, data: Array<number>, borderColor: string, backgroundColor: string, fill: boolean }];
  public chartOptions: any;
  public bubbleProperties: MenuItem[];
  public activeProperty: MenuItem;

  selectedStart: Date;
  selectedEnd: Date;
  currentPalette: String;

  protected representations: Array<SelectItem> = [];
  public dropdownList: Array<BubbleChartDeviceEntity> = [];

  constructor(private dataService: DataService,
              private databaseService: DatabaseService,
              private devicemanager: DeviceManagerService,
              private visualmanager: VisualManagerService, private router: Router) {
  }

  ngOnInit(): void {
    this.isEmpty = false;
    this.devicesList = [];
    this.sensorList = [];
    this.deviceTypeList = [];

    this.bubbleProperties = [
      {label: 'X axis'},
      {label: 'Y axis'},
      {label: 'Bubble radius'}
    ];
   this.activeProperty = this.bubbleProperties[0];
    this.chartType = 'bubble';
    this.selectedX = {label:'x axis', type: '', calculation: Calculation.Avg};
    this.selectedY = {label:'y axis',type: '', calculation: Calculation.Avg};
    this.selectedR = {label:'bubble radius',type: '', calculation: Calculation.Avg};
    this.dataService.projectData
      .subscribe(value => {
        this.project = value;
      });
    this.dataService.userData
      .subscribe(value => {
        this.user = value;
      });
    this.dataService.currentLoginStatus.subscribe(value => this.loginStatus = value);
    if (this.currentWidget.startDate !== undefined && this.currentWidget.endDate !== undefined) {
      this.selectedStart = new Date(this.currentWidget.startDate);
      this.selectedEnd = new Date(this.currentWidget.endDate);
    } else {
      this.selectedStart = new Date(2019, 1, 5, 10, 55, 22, 0);
      this.selectedEnd = new Date(2019, 1, 15, 10, 55, 22, 0);
    }

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



    //init locationlist
    this.devicemanager.getAllLocations(this.user.id, this.project.id)
      .subscribe(locations => {
          // go through all of the location-based list
          for (const loc of locations) {
            this.locationsList.push({label: loc.name, value: loc.name});
          }
          console.log("all locations: ", this.locationsList);
        },
        err => {
          console.log(err);
        });
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
          ticks: {
            beginAtZero: true,
            max: undefined
          },
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'x'
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
            labelString: 'y'
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

  showChart(chart): void {
    // set chart options
    chart.data.datasets = [];
    chart.data.labels = [];
    let statedata = {'deviceId': '', 'actionId': '', 'states': [{number: 0, description: '', value: 0}]};
    //let color = [];
    let cIndex = 0;
    let observables: Observable<any>[] = [];
    for (const elem of this.locationsList) {
      observables.push(this.devicemanager.getDevicesByLocation(elem.value, this.user.id, this.project.id));
    }
    const observeable = forkJoin(observables);
    observeable.subscribe(devices => {
      // All observables in `observables` array have resolved and `dataArray` is an array of result of each observable
      console.log("all devices from locations: ", devices);
      for (const elem of devices) {
        // sortiere alle devices nach locations ( ist gemacht in "devices"
        // sortiere alle
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
        //  chart.data.labels.push(this.deviceEntities[devices.indexOf(elem)].deviceId);
          chart.data.datasets[0].data.push(value);
          console.log('chartData: ', chart.data);
        }
      }
      chart.update();
      this.setChartColors(this.currentPalette);
    },err => {
      console.log(err);
    });

  }

  activateBubbleProperty(): void{
    this.activeProperty =this.menu['activeItem'];
  }

  // events
  public chartClicked(e: any): void {
    console.log(e);
  }

  public chartHovered(e: any): void {
    console.log(e);
  }


  applySettings(): void {
    this.isEmpty = false;
    this.displaySettings = false;
    //updating data from dropdowns in current Widget
    this.currentWidget.deviceEntities = [];
    // updating data from dropdowns in current Widget
    this.currentWidget.chartType = this.chartType;
    this.currentWidget.endDate = this.selectedEnd;
    this.currentWidget.startDate = this.selectedStart;
    this.currentWidget.x = this.selectedX;
    this.currentWidget.y = this.selectedY;
    this.currentWidget.r = this.selectedR;
    this.saveInDatabase(this.currentWidget.deviceEntities, 'deviceEntities');
    this.saveInDatabase(this.currentWidget.chartType, 'chartType');
    this.saveInDatabase(this.currentWidget.startDate, 'startDate');
    this.saveInDatabase(this.currentWidget.endDate, 'endDate');
    this.saveInDatabase(this.currentWidget.x, 'x');
    this.saveInDatabase(this.currentWidget.y, 'y');
    this.saveInDatabase(this.currentWidget.r, 'r');
    // get data with new settings
    this.showChart(this.myChart);
  }

  abortChanges(): void {
    this.displaySettings = false;
    // this.chartType = this.currentWidget.chartType;
    this.selectedEnd = this.currentWidget.endDate;
    this.selectedStart = this.currentWidget.startDate;
  // this.selectedLocation = this.currentWidget.locations[0];
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

  // to fill the devices List of the location with the selected parameter sensors
  protected fillDevicesList(isInit: boolean) {
    // reset list:
    this.devicesList = [];
    // get all devices
    this.devicemanager.getAllDevices(this.user.id, this.project.id)
      .subscribe(devices => {
          for (const device of devices) {

            let isSameType: boolean = false;
            // only push device if we have stateless data

            if (device.actions !== null) {
              //check if it has stateless actuators
              for (const action of device.actions) {
                if (action.valueable) {
                  isSameType = true;
                  break;
                }
              }
            }
            if (!isSameType && device.sensors !== null && device.sensors.length > 0) {
              // if it has sensors, it has numerical values as well
              isSameType = true;
            }
          }
          // if call on init, set selected device
          /*if (isInit && this.currentWidget.deviceEntities !== undefined && this.currentWidget.deviceEntities[0].deviceId !== undefined
            && this.currentWidget.deviceEntities[0].deviceId !== '') {
            this.initSetDevice();
          }*/

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
      if (list.indexOf(value) < (list.length - 1)) {
        start = new Date(value.DateTime);
        end = new Date(list[list.indexOf(value) + 1].DateTime);
        entityValue = (value.FloatValue !== null) ? value.FloatValue : Number(value.StringValue);
        avg = avg + ((end.getTime() - start.getTime()) / (totalTime * 3600000)) * entityValue;
      }
    }
    return avg;
  }

  calculateMinimum(list: SensorDataModel['Values']): number {
    let min = (list[0].FloatValue !== null) ? list[0].FloatValue : Number(list[0].StringValue);
    for (const value of list) {
      if (value.FloatValue !== null && value.FloatValue < min) {
        min = value.FloatValue;
      } else if (value.StringValue !== null && Number(value.StringValue) < min) {
        min = Number(value.StringValue);
      }
    }
    return min;
  }

  calculateMaximum(list: SensorDataModel['Values']): number {
    let max = (list[0].FloatValue !== null) ? list[0].FloatValue : Number(list[0].StringValue);
    for (const value of list) {
      if (value.FloatValue !== null && value.FloatValue > max) {
        max = value.FloatValue;
      } else if (value.StringValue !== null && Number(value.StringValue) > max) {
        max = Number(value.StringValue);
      }
    }
    return max;
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
           /* for (const device2 of this.deviceEntities) {
              if (device.deviceId === device2.deviceId) {
                newDeviceEntities.push(device2);
                break;
              }
            }*/
          }
         // this.deviceEntities = newDeviceEntities;
          //console.log("endresult device list: ", this.deviceEntities);
        },
        err => {
          console.log(err);
        });
  }

  // when changing the device type, the devicelist and the locationlist has to be cleared and renewed
  protected setLocationList(entityType: string) {
    // reset list:
    //this.deviceEntities = [];
    this.locationsList = [];
    // get all devices
    this.devicemanager.getDevicesByEntityType(entityType, this.user.id, this.project.id)
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
            // go through all sensors and actuators and add the sensors/actuators with the selected device type to the deviceEntities List
            for (const sensor of device.sensors){
             // if (sensor.deviceType === this.selectedDeviceType){
               // this.deviceEntities.push({deviceId: device.deviceId, entityId: sensor.id});
              //}
            }
            for (const action of device.actions){
              //if (action.deviceType === this.selectedDeviceType){
               // this.deviceEntities.push({deviceId: device.deviceId, entityId: action.id});
              //}
            }
            //console.log("device List after choosing Type: ", this.deviceEntities);
          }
        },
        err => {
          console.log(err);
        });
  }
  setChartColors(palette): void {
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
        var datasets = this.myChart.config.data.datasets[0];
        var setsCount = datasets.data.length;
        break;
      case "bar":
      case "line":
        var datasets = this.myChart.config.data.datasets;
        var setsCount = datasets.length;
        break;
    }

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
        case "doughnut":
          if (!datasets.backgroundColor) datasets.backgroundColor = [];
          datasets.backgroundColor[i] = chartColors[i];
          if (!datasets.borderColor) datasets.borderColor = [];
          datasets.borderColor[i] = "rgba(255,255,255,1)";
          break;
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

}
