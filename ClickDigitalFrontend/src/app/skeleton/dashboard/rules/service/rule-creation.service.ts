import { EventEmitter, Injectable } from '@angular/core';
import { Triggergroup } from '../../../../models/frontend/rule_module/triggergroup';
import { RuleAction } from '../../../../models/frontend/rule_module/ruleaction';
import { Rule } from '../../../../models/frontend/rule_module/rule';
import { ProjectDB } from '../../../../models/database/project';
import { DeviceManagerService } from '../../../../services/devicemanager.service';
import { DataService } from '../../../../services/data.service';
import { TriggersFilterSchema } from '../triggers-schema';
import { Subject } from 'rxjs/Rx';
import { ActionsFilterSchema } from '../actions-schema';
import { Device } from '../../../../models/backend/device';
import { Project } from '../../../../models/frontend/project';
import { RuleManagerService } from '../../../../services/rulemanager.service';

@Injectable()
export class RuleCreationService {

  alltriggerList: Array<Triggergroup> = [];
  allActionList: Array<RuleAction> = [];

  loggedUserId: string;
  loggedUserPlatforms: Array<any> = [];

  triggerList: Array<Triggergroup> = [];
  actionList: Array<RuleAction> = [];
  triggerOverlay: any;
  actionOverlay: any;
  selectedOperatorList: Array<any> = [];
  selectActionOperatorList: Array<any> = [];
  displayRuleCreationDialog = false;
  displayRuleManagement = false;
  creationRule: Rule = new Rule();
  projects: Array<ProjectDB> = [];
  indexedProjects: Array<ProjectDB> = [];

  platforms: Array<any> = [];
  indexedPlatforms: Array<any> = [];
  indexedTriggers: Array<any> = [];

  displayStatusUpdated = new EventEmitter<boolean>();
  displayManagementStatusUpdated = new EventEmitter<boolean>();
  projectsUpdate = new EventEmitter<Array<ProjectDB>>();

  possibleDevices: Array<any> = [];
  triggersFilterSchema = TriggersFilterSchema;
  actionsFilterSchema = ActionsFilterSchema;

  triggerFilterObservable = new Subject();
  actionsFilterObservable = new Subject();
  devices: any;

  allconditions: Array<any> = [];
  allactions: Array<any> = [];

  constructor(private devicemanager: DeviceManagerService,
              private dataService: DataService,
              private ruleManagerService: RuleManagerService) {
    this.displayStatusUpdated.emit(this.displayRuleCreationDialog);
    this.displayStatusUpdated.subscribe(response => {
      this.displayRuleCreationDialog = response;
    });

    this.displayManagementStatusUpdated.subscribe(response => {
      this.displayRuleManagement = response;
    });
    this.projectsUpdate.subscribe(projects => {
      this.projects = projects;
      this.projects.forEach(project => {
        this.indexedProjects[project.id] = project;
      });
      this.platforms = [];
      this.dataService.userData.subscribe(resultUserData => {
        this.loggedUserId = resultUserData.id;
      });

      if (this.loggedUserId && this.indexedPlatforms.length === 0) {
        this.devicemanager.getAllPlatformsFromAllProjects(this.loggedUserId)
          .subscribe(platforms => {
            this.indexedPlatforms = [];
            platforms.forEach(platform => {
              this.indexedPlatforms[platform.platformId] = platform;
            });
          });
      }
    });
  }

  /**
   * Loads all triggergroups and indexed them by trigger ID
   */
  loadIndexedTriggers(): void {
    this.ruleManagerService.getAllTriggergroups(this.loggedUserId)
      .subscribe(triggers => {
        for (const trigger of triggers) {
          this.indexedTriggers[trigger.ID] = trigger;
        }
      });
  }

  /**
   * Gets all devices by user,platform and project id.
   *
   * @param platformId is id of platform
   * @param userId  is logged user id
   * @param projectId is selected project id
   */
  getDevicies(platformId, userId, projectId): void {
    this.devicemanager.searchForDevices(platformId, userId, projectId)
      .subscribe((devices: Array<Device>) => {
        this.devices = devices;
      });
  }

  /**
   * Adds parameter action
   *
   * @param action to be added
   */
  addAction(action: any): void {
    this.actionList.push(action);
  }

  /**
   * Returns local action list
   *
   * @returns Array<RuleAction> list
   */
  getAllLocalActions(): Array<RuleAction> {
    return this.actionList;
  }

  /**
   * This filter function will be multiple time called for triggers and actions.
   *
   * @param query search name
   * @param Array<any> elements list of elements
   * @param string filterValue filter value
   * @returns Array<any> returns filtered list
   */
  filterAutocomplete(query, elements: Array<any>, filterValue: string): Array<any> {
    const filtered: Array<any> = [];
    elements.forEach((value: any) => {
      const oneElement = value;
      if (oneElement[filterValue].toLowerCase()
          .indexOf(query.toLowerCase()) === 0) {
        filtered.push(oneElement);
      }
    });

    return filtered;
  }
}
