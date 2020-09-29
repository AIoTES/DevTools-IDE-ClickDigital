import { Component, Input, OnInit } from '@angular/core';
import { RuleNotificationWidget } from '../../../../models/frontend/rulenotificationwidget';
import { DataService } from '../../../../services/data.service';
import { ConfirmationService, Message, SelectItem } from 'primeng/api';
import { RuleManagerService } from '../../../../services/rulemanager.service';
import { DataNotification } from '../../../../models/frontend/rule_module/datanotification';
import { RuleManagementService } from '../service/rule-management.service';
import { RuleNotificationService } from '../service/rule-notification.service';
import { RuleCreationService } from '../service/rule-creation.service';
import { Project } from '../../../../models/frontend/project';

@Component({
  selector: 'app-rule-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {
  @Input() currentWidget: RuleNotificationWidget;
  notifications: Array<any>;
  sortOptions: Array<SelectItem>;
  sortField: string;
  userId: string;
  sortOrder: number;
  messeges: Array<Message> = [];
  project: Project;

  constructor(private dataService: DataService,
              private ruleManagerService: RuleManagerService,
              private ruleManagementService: RuleManagementService,
              private confirmationService: ConfirmationService,
              private ruleNotificationService: RuleNotificationService,
              private ruleCreationService: RuleCreationService) {
    this.sortOptions = [
      {label: 'Name', value: 'name'},
      {label: 'Date', value: 'date'},
      {label: 'Event', value: 'event'}
    ];
    this.notifications = this.ruleNotificationService.notifications;
  }

  /**
   * Loads all notifications.
   * Saves logged user id.
   */
  ngOnInit(): void {
    if (!this.ruleCreationService.loggedUserId) {
      this.dataService.userData.subscribe(resultUserData => {
        this.userId = resultUserData.id;
        this.ruleCreationService.loggedUserId = this.userId;
        this.project = this.ruleManagementService.selectedProjectData;
        this.ruleManagerService.getAllNotifications(this.userId)
          .subscribe(resultNotifications => {
            this.notifications = resultNotifications;
            this.ruleNotificationService.notifications = this.notifications;
          });
      });
    } else {
      this.userId = this.ruleCreationService.loggedUserId;
      this.ruleManagerService.getAllNotifications(this.userId)
        .subscribe(resultNotifications => {
          this.notifications = resultNotifications;
          this.ruleNotificationService.notifications = this.notifications;
        });
    }
  }

  /**
   * Deletes notification locally.
   *
   * @param DataNotification searchNotification that has to be removed.
   */
  deleteLocalNotification(searchNotification: DataNotification): void {
    this.notifications.forEach((notification: any, notificationIndex: number) => {
      if (searchNotification.ID === notification.notification.ID) {
        this.notifications.splice(notificationIndex, 1);
        this.ruleNotificationService.notifications = this.notifications;
        this.ruleNotificationService.displayNotificationUpdate.emit(true);
      }
    });
  }

  /**
   * Confirmation message will be shown after delete button is clicked.
   *
   * @param DataNotification notification that has to be removed.
   */
  confirmNotificationDelete(notification: DataNotification): void {
    this.confirmationService.confirm({
      message: 'Do you want to delete this notification?',
      header: 'Delete Confirmation',
      key: `datanotification_${this.currentWidget.id}`,
      icon: 'pi pi-info-circle',
      accept: () => {
        this.ruleManagerService.deleteNotification(this.userId, notification)
          .subscribe(response => {
            this.ruleManagementService.updateNotificationStatus.emit(response);
            this.deleteLocalNotification(notification);
            this.messeges = [{severity: 'success', summary: 'Confirmed', detail: 'Notification deleted'}];

          }, error => {
            this.messeges = [{severity: 'warn', summary: 'Warning', detail: `Something went wrong  ${error.error}`}];
          });
      },
      reject: () => {
        this.messeges = [{severity: 'info', summary: 'Rejected', detail: 'You have rejected'}];
      }
    });
  }

  /**
   * Order notification by name,event and date.
   *
   * @param event is notification list data element
   */
  onSortChange(event): void {
    const value = event.value;

    if (value.indexOf('!') === 0) {
      this.sortOrder = -1;
      this.sortField = value.substring(1, value.length);
    } else {
      this.sortOrder = 1;
      this.sortField = value;
    }
  }

}
