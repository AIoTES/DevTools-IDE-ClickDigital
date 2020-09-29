import {Component, EventEmitter, Input, OnInit, ViewChild, Output} from '@angular/core';
import {BaseChartDirective} from 'ng2-charts/ng2-charts';
import {DataService} from '../../../../../../../services/data.service';
import {Chart} from 'chart.js';
import {DeviceManagerService} from '../../../../../../../services/devicemanager.service';
import {VisualManagerService} from '../../../../../../../services/visualmanager.service';
import {Widget} from '../../../../../../../models/frontend/widget';
import {DatabaseService} from '../../../../../../../services/database.service';
import {Observable} from 'rxjs/Observable';
import { forkJoin } from 'rxjs'
import 'rxjs/add/observable/interval';
import {MenuItem} from 'primeng/api';
import {SelectItem} from 'primeng/api';
import {Project} from '../../../../../../../models/frontend/project';
import {DoughnutChartDeviceEntity, Doughnutchartwidget} from '../../../../../../../models/frontend/doughnutchartwidget';
import {Fieldvalue} from '../../../../../../../models/frontend/fieldvalue';
import {User} from '../../../../../../../models/frontend/user';
import {Device} from '../../../../../../../models/backend/device';
import {SensorDataModel} from '../../../../../../../models/backend/sensordatamodel';
import {Calculation, Frequency} from '../../../../../../../models/frontend/barchartwidget';
import {ChartDeviceEntity} from "../../../../../../../models/frontend/chartDeviceEntity";

@Component({
  selector: 'doughnut-chart-visualization',
  templateUrl: './doughnut-chart.component.html',
  styleUrls: ['./doughnut-chart.component.css']
})
export class DoughnutChartComponent implements OnInit {
  @ViewChild('chart') private ctx;
  @Input() currentWidget: Doughnutchartwidget;
  @Output() resizeFont = new EventEmitter<HTMLElement>();

  protected user: User;
  protected project: Project;
  protected loginStatus: number;
  protected currentPalette: string;
  // isMonoVis in string:
  myChart: any;
  protected devicesList: SelectItem[] = [];
  protected allDevicesList: SelectItem[] = [];
  protected sensorList: SelectItem[] = [];
  protected colorPaletteList: SelectItem[] = [{label: "warm", value: "warm"}, {label: "cool", value: "cool"},
    {label: "neon", value: "neon"}];
  protected distributionList: SelectItem[] = [{label: "the states of all devices", value: "all"},
    {label: "the states of a single actuator (%)", value: "actuator"},{label: "device types", value: "device"}];
  protected isCircleFull: string;
  selectedDistribution: string;
  public deviceEntities = [{
    deviceId: '',
    entityId: '',
    label: '',
    unit: '',
  }];

  chartType: string;
  displaySettings: boolean = false;
  public chartLabels: Array<string>;
  public chartData: [{ label: string, data: Array<number>, backgroundColor: Array<string>}];
  public chartOptions: any;

  selectedStart: Date;
  selectedEnd: Date;

  constructor(private dataService: DataService,
              private databaseService: DatabaseService,
              private devicemanager: DeviceManagerService,
              private visualmanager: VisualManagerService) {
  }

  ngOnInit(): void {
    this.devicesList = [];
    this.allDevicesList = [];
    this.sensorList = [];
    this.chartType = 'doughnut';
    this.chartOptions = {
      maintainAspectRatio: false,
      responsive: true,
      legend: {
        display: true,
        position: 'top'
      },
      rotation : -Math.PI / 2,
      circumference : 2*Math.PI,
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

    //if (this.currentWidget.interval !== undefined) {this.timeType = this.currentWidget.interval;}

    // fill deviceList for dropdown
    this.fillDevicesList();
    let dte = new Date();
    dte.setDate(dte.getDate() - 2);
    this.selectedStart = (this.currentWidget.startDate !== undefined)? new Date(this.currentWidget.startDate) : dte;
    this.selectedEnd = (this.currentWidget.endDate !== undefined)? new Date(this.currentWidget.endDate) : new Date();

    if (this.currentWidget.deviceEntities[0] !== undefined && this.currentWidget.deviceEntities[0].deviceId !== '') {
      this.deviceEntities = this.currentWidget.deviceEntities;
      if (this.currentWidget.deviceEntities[0].deviceId !== undefined) {
        this.setSensorDropdown(this.currentWidget.deviceEntities[0].deviceId);
      }
    };

    this.currentPalette = (this.currentWidget.colorPalette !== undefined)? this.currentWidget.colorPalette : this.colorPaletteList[0].value;
    this.selectedDistribution = (this.currentWidget.distribution !== undefined)? this.currentWidget.distribution : this.distributionList[0].value;
    this.isCircleFull = (this.currentWidget.isCircleFull !== undefined)? this.currentWidget.isCircleFull : "true";
    // init chart attributes and chart object
    this.myChart = new Chart(this.ctx.nativeElement, {
      type: this.chartType,
      data: {
        labels: [],
        datasets: []
      },
      options: this.chartOptions
    });
    this.setDoughnutCircle();
    this.showChart(this.myChart);
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
    chart.data.labels = [];
    let statedata = {'deviceId': '', 'actionId': '', 'states': [{number: 0, description: '', value: 0}]};
    //let color = [];
    let cIndex = 0;
    // go through all selected devices
    switch(this.selectedDistribution){
      case "actuator":
        this.setSingleChart();
        break;
      case "device":
        this.setDeviceDistributionChart();
        break;
      case "all":
      default:
        this.setAllChart();
        break;
    }
  }

  setSingleChart(): void {
    this.devicemanager.getDeviceById(this.deviceEntities[0].deviceId, this.user.id, this.project.id).subscribe((result) => {
      // for stateful data values, the states have to be prepared
        let states = [];
        for (const action of result.actions) {
          // get the selected action's states
          if (!action.valueable && action.id === this.deviceEntities[0].entityId) {
            for (const state of action.states) {
              states.push({number: state.state, description: state.description, value: 0});
            }
            break;
          }
      }
      console.log("single states: ", states);
      // get Data from Backend
      this.visualmanager.getTimeData(this.deviceEntities[0].deviceId, this.deviceEntities[0].entityId,
        this.generateIsoDateTime(this.selectedStart), this.generateIsoDateTime(this.selectedEnd),
        'P5D', this.user.id, this.project.id)
        .subscribe((sensorDataModel: SensorDataModel) => {
            console.log("result: ", sensorDataModel);
            if (sensorDataModel.Values.length > 0){
              let valueCount = 0;
              let dateStart: Date = new Date(sensorDataModel.Values[0].DateTime);
              let dateEnd: Date = new Date(sensorDataModel.Values[sensorDataModel.Values.length - 1].DateTime);
              // we have to divide the total time by 3600000 to get hours instead of milliseconds
              let timeTotal = (dateEnd.getTime() - dateStart.getTime()) / 3600000;

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
                  for (const state of states) {
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
                }
                let total = 0;
                for (const state of states) {
                  total = total + state.value;
                }
                // add sensor data to the chartData.
                // create ctxData
                let stateValues = [];
                for (const state of states) {
                  // change values of states to percentage
                  stateValues.push(Math.round(state.value*100/total));
                  if (state.decription !== undefined) {
                    this.myChart.data.labels.push("state " + state.number + " (" + state.decription +")");
                  } else {
                    this.myChart.data.labels.push("state " + state.number);
                  }

                }
                const ctxData = {
                  data: stateValues,
                };
                console.log('ctxData: ', ctxData);
                this.myChart.data.datasets =[ctxData];
                console.log("single data: ", this.myChart.data.datasets);
                this.setChartColors(this.currentPalette);
                this.myChart.update();
              }
          },
          err => {
            console.log('Error requesting historic data from backend ', err);
          });
    }, error => {
      console.log('Error requesting device data from backend ');
    });
  }

  setDeviceDistributionChart(): void {
    let chartdata = [0,0];
    let labels = ["actuators", "sensors"];
    let observables: Observable<any>[] = [];
    for (const elem of this.deviceEntities) {
      observables.push(this.devicemanager.getDeviceById(elem.deviceId, this.user.id, this.project.id))
    }
    const observeable = forkJoin(observables);
    observeable.subscribe(dataArray => {
        // All observables in `observables` array have resolved and `dataArray` is an array of result of each observable
        console.log("array subscriptions: ", dataArray);
        for (const elem of dataArray) {
          chartdata[0] = chartdata[0] + elem.actions.length;
          chartdata[1] = chartdata[1] + elem.sensors.length;
        }
        this.myChart.data.datasets = [{data: chartdata}];
        this.myChart.data.labels = labels;
        this.myChart.update();
        this.setChartColors(this.currentPalette);
      },err => {
        console.log(err);
      });

  }

  setAllChart(): void {
    let chartdata = [0,0,0,0];
    let labels = ["offline", "online", "maintenance", "error"];
    this.devicemanager.getAllDevices(this.user.id, this.project.id)
      .subscribe(devices => {
          console.log("number of devices: ", devices.length);
          for (const device of devices) {
            chartdata[Number(device.status)] = chartdata[Number(device.status)] + 1;
          }
          console.log("all chartData: ", chartdata);
          this.myChart.data.datasets = [{data: chartdata}];
          this.myChart.data.labels = labels;
          this.myChart.update();
          this.setChartColors(this.currentPalette);
        },
        err => {
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
    console.log("dropdown: ", this.selectedDistribution);
    this.displaySettings = false;
    this.currentWidget.deviceEntities = this.deviceEntities;
    this.currentWidget.chartType = this.chartType;
    this.currentWidget.isCircleFull = this.isCircleFull;
    this.currentWidget.colorPalette = this.currentPalette;
    this.setDoughnutCircle();
    //this.currentWidget.interval = this.timeType;
    this.currentWidget.endDate = this.selectedEnd;
    this.currentWidget.startDate = this.selectedStart;
    this.currentWidget.distribution = this.selectedDistribution;
    this.saveInDatabase(this.currentWidget.deviceEntities, 'deviceEntities');
    this.saveInDatabase(this.currentWidget.chartType, 'chartType');
    this.saveInDatabase(this.currentWidget.isCircleFull, 'isCircleFull');
    this.saveInDatabase(this.currentWidget.colorPalette, 'colorPalette');
    this.saveInDatabase(this.currentWidget.distribution, 'distribution');
    //this.saveInDatabase(this.currentWidget.interval, 'interval');
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
    this.isCircleFull = this.currentWidget.isCircleFull;
    this.currentPalette = this.currentWidget.colorPalette;
    this.selectedDistribution = this.currentWidget.distribution;
    //this.timeType = this.currentWidget.interval;
    this.deviceEntities = this.currentWidget.deviceEntities;
    this.setSensorDropdown(this.currentWidget.deviceEntities[0].deviceId);
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

  protected setSensorDropdown(deviceId: string): void {
    // get list of all entities of the device
    this.sensorList = [];
    this.devicemanager.getDeviceById(deviceId, this.user.id, this.project.id)
      .subscribe((device: Device) => {
          if (device.actions !== null) {
            for (const action of device.actions){
              // push actions only when they have states
              if (action.states !== null && action.states.length > 0){
                this.sensorList.push({label: action.name, value: action.id});
              }
            }
          }
          // if there is only one element in sensorlist, preselect it for the dropdown
          if (this.sensorList.length === 1){
            this.deviceEntities[0].entityId = this.sensorList[0].value;
          }
        },
        error => {
          console.log('Error requesting devices from backend ', error);
        });
  }

  // to fill the multi device dropdowns with compatible devices
  protected fillDevicesList(){
    // reset lists:
    this.devicesList = [];
    this.allDevicesList = [];
    // get all devices
    this.devicemanager.getAllDevices(this.user.id, this.project.id)
      .subscribe(devices => {
          for (const device of devices) {
            let isCompatible: boolean = false;
            if (device.actions !== null) {
              for (const action of device.actions) {
                // only add devices with stateful actuators to the list
                if (action.states.length > 0) {
                  isCompatible = true;
                  break;
                }
              }
              if ( isCompatible ) { this.devicesList.push({label: device.name, value: device.deviceId}); }
            }
            this.allDevicesList.push({label: device.name, value: device.deviceId});
          }
        },
        err => {
          console.log(err);
        });
  }

  setDoughnutCircle(): void {
    if (this.isCircleFull === "true") {
      this.myChart.options.rotation = -Math.PI / 2;
      this.myChart.options.circumference = 2*Math.PI;
    } else {
      this.myChart.options.rotation = -Math.PI;
      this.myChart.options.circumference = Math.PI;
    }
  }

  calculateStateDistribution(list: SensorDataModel['Values'], states, totalTime): void {
  }

  // function to set color-blinded-friendly colors to the doughnut
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
        case "polar":
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

  setDistributionParameters(): void {
    // if we have device type, we need to empty the entity parameter
    if (this.selectedDistribution === "device"){
      this.deviceEntities[0].entityId === undefined;
    } else if (this.selectedDistribution === "actuator") {
      // delete all deviceentities but the first
      while(this.deviceEntities.length > 1) {
        this.deviceEntities.pop();
      }
    } else if (this.selectedDistribution === "all") {
      //this.deviceEntities = [];
    }
  }

  protected addNewDropdowns() {
    this.deviceEntities.push({deviceId: '', entityId: '', label: '', unit: ''});
    //this.chartData.push({label: '', data: [], borderColor: '', fill: false});
  }

  protected deleteDropdowns(group: DoughnutChartDeviceEntity) {
    let i = 0;
    // console.log("Dropdownlist: ", this.dropdownList);
    let dropdownListCopy = this.deviceEntities;
    for (let elem of this.deviceEntities) {
      if (elem.deviceId === group.deviceId) {
        dropdownListCopy.splice(i, 1);
        // if the arrays have the same length, the chartData of the entity has to be deleted as well
        console.log('Dropdownlist after DELETE: ', dropdownListCopy);
      }
      i++;
    }
    this.deviceEntities = dropdownListCopy;
    console.log('Dropdownlist final: ', this.deviceEntities);
  }


}
