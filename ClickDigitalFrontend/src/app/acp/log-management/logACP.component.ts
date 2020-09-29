import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { LazyLoadEvent, Message } from 'primeng/api';
import { Log } from '../../models/backend/log';
import { ACPService} from '../../services/acp.service';


@Component({
  selector: 'app-logACP',
  templateUrl: './logACP.component.html',
  styleUrls: ['./logACP.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [ACPService]
})

export class LogACPComponent implements OnInit {
  logs: Array<Log>;
  cols: any;
  loading: boolean;
  from: Date = undefined;
  till: Date = undefined;
  text: string = '';
  rangeDates: Date[];
  protected msgs: Array<Message> = [];
  rows: number = 10;

  constructor(private acpservice: ACPService) {
   
  }

  ngOnInit(): void {

    this.cols = [
      {field: 'date', header: 'Date and Time'},
      {field: 'priority', header: 'Priority'},
      {field: 'source', header: 'Source'},
      {field: 'username', header: 'Associated User'},
      {field: 'action', header: 'Action'},
      {field: 'object', header: 'Affected Object'},
      {field: 'status', header: 'Status'}
    ];

    this.loading = true;
  }

  /**
   * This method loads logs depending on the event
   *
   * @param ev
   */
  loadLogs(ev: LazyLoadEvent) {
    this.loading = true;
    if (ev.first === undefined)
      ev.first = 0;
    if (ev.rows === undefined)
      ev.rows = this.rows;

    if (this.rangeDates !== undefined && this.rangeDates[1] !== undefined && this.text.length === 0) {
      this.loadLogsDaterangeFilter(ev);
    }else if (this.rangeDates !== undefined && this.rangeDates[1] !== undefined && this.text.length > 0) {
      this.loadLogsUsernameDaterangeFilter(ev);
    }else
      this.loadLogsNoFilter(ev);
  }

  /**
   * This method loads logs from the current log file
   *
   * @param ev
   */
  loadLogsNoFilter(ev: LazyLoadEvent) {
    this.acpservice.getLogs(ev.first, ev.rows).subscribe(result => {
      this.logs = result;
      this.msgs.push({
        severity: 'success',
        summary: 'logs loaded successfully'
      });
      this.loading = false;
    }, err => {
      this.msgs.push({
        severity: 'error',
        summary: 'Error!'
      });
    });
  }

  /**
   * This method loads logs with a date range filter
   *
   * @param ev
   */
  loadLogsDaterangeFilter(ev: LazyLoadEvent) {
    this.acpservice.getLogsDaterangeFilter(this.rangeDates[0], this.rangeDates[1], ev.first, ev.rows).subscribe(result => {
      this.logs = result;
      this.msgs.push({
        severity: 'success',
        summary: 'logs loaded successfully'
      });
      this.loading = false;
    }, err => {
      this.msgs.push({
        severity: 'error',
        summary: 'Error!'
      });
    });
  }

  /**
   * This method loads logs with a username and date range filter
   *
   * @param ev
   */
  loadLogsUsernameDaterangeFilter(ev: LazyLoadEvent) {
    this.acpservice.getLogsUsernameDaterangeFilter(this.rangeDates[0], this.rangeDates[1], this.text, ev.first, ev.rows).subscribe(result => {
      this.logs = result;
      this.msgs.push({
        severity: 'success',
        summary: 'logs loaded successfully'
      });
      this.loading = false;
    }, err => {
      this.msgs.push({
        severity: 'error',
        summary: 'Error!',
        detail: 'Error while loading logs'
      });
    });
  }
  
}
