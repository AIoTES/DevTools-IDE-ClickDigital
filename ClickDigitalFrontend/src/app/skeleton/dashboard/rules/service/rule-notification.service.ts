import { EventEmitter, Injectable } from '@angular/core';
import { DataNotification } from '../../../../models/frontend/rule_module/datanotification';
import { RuleManagerService } from '../../../../services/rulemanager.service';
import { map } from 'rxjs/operators';
import { Project } from '../../../../models/frontend/project';
import { Rule } from '../../../../models/frontend/rule_module/rule';

@Injectable()
export class RuleNotificationService {

  notifications: Array<DataNotification> = [];
  displayNotificationUpdate = new EventEmitter<boolean>();

  showNotifications: Array<DataNotification> = [];

  userId: string;
  isMessages = false;
  maxNotifyMessageNumber = 5;
  project: Project;

  constructor(private ruleManagerService: RuleManagerService) {}

  /**
   * Adds notification to the list.
   *
   * @param DataNotification notification.
   */
  add(notification: DataNotification): void {
    this.notifications.push(notification);
    this.displayNotificationUpdate.emit(true);
  }

  clear(): void {
    this.notifications = [];
  }

  /**
   * Gets all notifications
   *
   * @param string userId logged user id
   * @returns any notification list
   */
  getAllNotification(userId: string): any {
    return this.ruleManagerService.getAllNotifications(userId)
      .pipe(map((resultNotifications: Array<any>) => {
        this.notifications = [];
        resultNotifications.forEach(resultNotification => {
            const relation = resultNotification.data;

            if (relation && relation.notify) {
              resultNotification.notification.date = new Date(resultNotification.notification.date);
              this.notifications.push(resultNotification.notification);
            }
          });
        this.showNotifications = this.notifications.length > this.maxNotifyMessageNumber ?
            this.notifications.splice(0, this.maxNotifyMessageNumber) : this.notifications;

        return {
            isMessage: this.isMessages,
            notifications: this.notifications,
            showNotifications: this.showNotifications
          };
        },
        error => {

          return error;
        }));
  }

  /**
   * Save rule notification
   *
   * @param string userId logged user id
   * @param Rule rule notification relation rule
   * @param string event name
   */
  saveRuleNotification(userId: string, rule: Rule, event: string): void {
    const notification: DataNotification = new DataNotification();
    notification.userId = userId;
    notification.name = rule.name;
    notification.event = event;
    notification.date = new Date();
    notification.relation = 'Rule';
    notification.relationID = rule.ID;
    this.ruleManagerService.saveNotification(userId, notification)
      .subscribe(notificationResponse => {
          this.add(notificationResponse);
          this.displayNotificationUpdate.emit(true);
        }
      );
  }
}
