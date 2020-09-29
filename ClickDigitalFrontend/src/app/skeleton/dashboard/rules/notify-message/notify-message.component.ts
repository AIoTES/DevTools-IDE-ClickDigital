import { Component, OnInit } from '@angular/core';
import { RuleManagerService } from '../../../../services/rulemanager.service';
import { DataService } from '../../../../services/data.service';
import { RuleCreationService } from '../service/rule-creation.service';
import { DataNotification } from '../../../../models/frontend/rule_module/datanotification';
import { ProjectService } from '../../../../services/project.service';
import { WidgetType } from '../../../../models/frontend/widget';
import { RuleNotificationService } from '../service/rule-notification.service';

@Component({
  selector: 'app-notify-message',
  templateUrl: './notify-message.component.html',
  styleUrls: ['./notify-message.component.css']
})
export class NotifyMessageComponent implements OnInit {

  showNotifications = false;
  notifications: Array<DataNotification> = [];
  showNotificationBoxMessages: Array<DataNotification> = [];
  userId: string;
  isMessages = false;

  constructor(private dataService: DataService,
              private ruleManagerService: RuleManagerService,
              private ruleCreationService: RuleCreationService,
              private projectService: ProjectService,
              private ruleNotificationService: RuleNotificationService) {
    this.notifications = this.ruleNotificationService.notifications;
    this.showNotificationBoxMessages = this.ruleNotificationService.showNotifications;
    this.isMessages = this.ruleNotificationService.isMessages;

  }

  /**
   * Loads all notification
   */
  ngOnInit(): void {
    this.loadNotifications();
    this.ruleNotificationService.displayNotificationUpdate
      .subscribe(response => {
        this.loadNotifications();
      });
  }

  /**
   * Displays the notification widget
   */
  notificationSettings(): void {
    this.projectService.generateWidget(WidgetType.ruleNotificationView.toString());
  }

  /**
   * Load all notifications
   */
  loadNotifications(): void {
    if (!this.userId) {
      this.dataService.userData.subscribe(resultUserData => {
        this.userId = resultUserData.id;
        this.ruleCreationService.loggedUserId = this.userId;
        this.ruleNotificationService.getAllNotification(this.userId)
          .subscribe(resultNotifications => {
            this.ruleNotificationService.notifications = resultNotifications.notifications;
            this.notifications = this.ruleNotificationService.notifications;
            this.showNotificationBoxMessages = this.ruleNotificationService.showNotifications;
            this.isMessages = resultNotifications.isMessages;
            this.updateMessageBox();

          });
      });
    } else {
      this.ruleNotificationService.getAllNotification(this.userId)
        .subscribe(resultNotifications => {
          this.ruleNotificationService.notifications = resultNotifications.notifications;
          this.notifications = this.ruleNotificationService.notifications;
          this.showNotificationBoxMessages = this.ruleNotificationService.showNotifications;
          this.isMessages = resultNotifications.isMessages;
          this.updateMessageBox();

        });
    }
  }

  /**
   * User clicks notification icon and
   * all notifications will be updated with attribute notify true value.
   */
  notifyMessages(): void {
    this.showNotifications = !this.showNotifications;
    if (this.notifications.filter(notification => !notification.notified).length > 0) {
      const notNotifiedNotifications = this.notifications.filter(notification => !notification.notified);
      notNotifiedNotifications.forEach(notification => notification.notified = true);
      this.ruleManagerService.updateNotifications(this.userId, notNotifiedNotifications)
        .subscribe(notifications => {
            this.ruleNotificationService.getAllNotification(this.userId)
              .subscribe(resultNotifications => {
                this.notifications = resultNotifications.notifications;
                this.showNotificationBoxMessages = this.ruleNotificationService.showNotifications;
                this.isMessages = resultNotifications.isMessages;
                this.updateMessageBox();

              });
          },
          error => {
            console.log('updateNotifications error', error);
          });
    }
  }

  /**
   * Shows the number of not notified message umber
   */
  updateMessageBox(): void {
    const notifymessages = this.notifications.filter(notification => !notification.notified).length;
    document.querySelector('#notification-message')
      .setAttribute('data-badge', `${notifymessages}`);
    this.isMessages = notifymessages > 0;
  }
}
