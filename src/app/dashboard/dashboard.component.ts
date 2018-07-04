import { Component, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';


import * as fs from 'file-saver';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  sessions = [];
  labelsets = [];

  constructor(
    private dataService: DataService
  ) {}

  ngOnInit() {
    this.dataService.labelsetsChanged.subscribe(
      (data) => {
        this.labelsets = data;
      }
    );
    this.dataService.sessionsChanged.subscribe(
      (data) => {
        this.sessions = data;
      }
    );

    this.dataService.fetchLabelSets().subscribe();
    this.dataService.fetchSessions().subscribe();
  }

  hasSessions(): boolean {
    if (!this.sessions || this.sessions.length <= 0) {
      return false;
    }
    return true;
  }

  hasLabelsets(): boolean {
    if (!this.labelsets || this.labelsets.length <= 0) {
      return false;
    }
    return true;
  }

  deleteLabelset(id: number) {
    if (confirm('Do you really want to delete this labelset? This would also delete all of the label tree stored in this set.')) {
      this.dataService.deleteLabelSet(id).subscribe(
        () => {
          this.dataService.fetchLabelSets().subscribe();
        }
      );
    }
  }

  deleteSession(id: number) {
    if (confirm('Do you really want to delete this session? This would also delete all of the labels stored in this session.')) {
      this.dataService.deleteSession(id).subscribe(
        () => {
          this.dataService.fetchSessions().subscribe();
        }
      );
    }
  }

  downloadLabels(id: number) {
    this.dataService.fetchSession(id).subscribe(
      (data) => {
        const dataStr = JSON.stringify(data.session, null, 2);
        const blob = new Blob([dataStr], {type: 'text/json;charset=utf-8'});
        fs.saveAs(blob, data.session.session_name + '.json');
      }
    );
  }


}
