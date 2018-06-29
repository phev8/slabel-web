import { Component, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';

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

    this.dataService.fetchLabelSets().subscribe();

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


}
