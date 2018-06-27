import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  sessions = [];
  labelsets = [];

  ngOnInit() {

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
