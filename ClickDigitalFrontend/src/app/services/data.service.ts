import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {CompactType} from 'angular-gridster2';
import {User} from '../models/frontend/user';
import {Project} from '../models/frontend/project';


@Injectable()
/* Makes it possible to communicate between not related components */
export class DataService {
  private userDataBS = new BehaviorSubject<User>(undefined);
  private projectDataBS = new BehaviorSubject<Project>(undefined);
  private dashboardIdBS = new BehaviorSubject<string>(undefined);
  private sheetIdBS = new BehaviorSubject<string>(undefined);
  private refreshMenuBS = new BehaviorSubject<string>(undefined);
  private refreshChart = new BehaviorSubject<{label: string, value: number, widgetId: string, deviceId: string, entityId: string}>(undefined);
  private refreshAnomaly = new BehaviorSubject<{label: string, value: number, anomalyscore: number, widgetId: string, deviceId: string, entityId: string}>(undefined);
  private dashboardID = new BehaviorSubject<number>(1);
  private deletedWidgetID = new BehaviorSubject<number>(-1);
  private theme = new BehaviorSubject<string>(undefined);
  private loginObject = new BehaviorSubject<object>(undefined);
  private loginStatus = new BehaviorSubject<number>(0);
  private loginUUID = new BehaviorSubject<string>(undefined);
  private projectID = new BehaviorSubject<number>(1);
  private currentPage = new BehaviorSubject<number>(1);
  private compactTyp = new BehaviorSubject<CompactType>(CompactType.None);
  private visualizationData = new BehaviorSubject<Array<string>>(undefined);

  currentCompactTyp = this.compactTyp.asObservable();
  currentDashboardID = this.dashboardID.asObservable();
  currentDeletedWidgetID = this.deletedWidgetID.asObservable();
  currentProjectID = this.projectID.asObservable();
  currentSheet = this.currentPage.asObservable();
  currentLoginObject = this.loginObject.asObservable();

  currentLoginUUID = this.loginUUID.asObservable();
  currentTheme = this.theme.asObservable();

  refreshChartNow = this.refreshChart.asObservable();
  refreshAnomalyNow = this.refreshAnomaly.asObservable();

  /**
   * current project
   */
  projectData = this.projectDataBS.asObservable();
  /**
   * current user
   */
  userData = this.userDataBS.asObservable();
  currentDashboardId = this.dashboardIdBS.asObservable();
  currentSheetId = this.sheetIdBS.asObservable();
  refreshMenu = this.refreshMenuBS.asObservable();
  currentLoginStatus = this.loginStatus.asObservable();

  constructor() {
  }

  refreshRealtimeChart(label: string, value: number, widgetId: string, deviceId: string, entityId: string): void {
    this.refreshChart.next({label: label, value: value, widgetId: widgetId, deviceId: deviceId, entityId: entityId});
  }

  refreshAnomalyRealtimeChart(label: string, value: number, anomalyscore: number, widgetId: string, deviceId: string, entityId: string): void {
    this.refreshAnomaly.next({label: label, value: value, anomalyscore: anomalyscore,  widgetId: widgetId, deviceId: deviceId, entityId: entityId});
  }

  changeRefreshMenu(message: string): void {
    this.refreshMenuBS.next(message);
  }

  changeCurrentSheetId(message: string): void {
    this.sheetIdBS.next(message);
  }

  changeProjectData(message: Project): void {
    this.projectDataBS.next(message);
  }

  changeUserData(message: User): void {
    this.userDataBS.next(message);
  }

  changeCurrentDashboardId(message: string): void {
    this.dashboardIdBS.next(message);
  }

  changeCompactTyp(message: CompactType): void {
    this.compactTyp.next(message);
  }

  changeDeletedWidgetID(message: number): void {
    this.deletedWidgetID.next(message);
  }


  changeLoginStatus(message: number): void {
    this.loginStatus.next(message);
  }

  changeLoginObject(message: object): void {
    this.loginObject.next(message);
  }

  changeLoginUUID(message: string): void {
    this.loginUUID.next(message);
  }

  changeTheme(message: string): void {
    this.theme.next(message);
  }

  changeVisualizationData(message: Array<string>): void {
    this.visualizationData.next(message);
  }

  refreshRealtimeAnomaly(label: string, value: number, anomalyscore: number, widgetId: string, deviceId: string, entityId: string): void {
    this.refreshAnomaly.next({label: label, value: value, anomalyscore: anomalyscore, widgetId: widgetId, deviceId: deviceId, entityId: entityId});
  }
}
