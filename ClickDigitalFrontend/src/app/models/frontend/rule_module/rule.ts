import { RuleAction } from './ruleaction';

// Rule module for matching with JSON Object  from frontend received by backend
export class Rule {

  ID = 0;
  name: string;
  description: string;
  notify: boolean;
  active: boolean;
  rootTGID: number;
  ruleActions: Array<RuleAction>;
  userId = '';
  platformID = ''; // for save value is needed
  projectID = ''; // for save value is needed

  setRuleData(rule: any): void {
    this.ID = rule.ID;
    this.name = rule.name;
    this.description = rule.description;
    this.notify = rule.notify;
    this.active = rule.active;
    this.rootTGID = rule.rootTGID;
    this.ruleActions = rule.ruleActions;
    this.platformID = rule.platformID;
    this.projectID = rule.projectID;
    this.userId = rule.userId;
  }
}
