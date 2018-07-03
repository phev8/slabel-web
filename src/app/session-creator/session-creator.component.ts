import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { Session } from '../models/session.model';
import { DataService } from '../services/data.service';

import * as moment from 'moment';

@Component({
  selector: 'app-session-creator',
  templateUrl: './session-creator.component.html',
  styleUrls: ['./session-creator.component.scss']
})
export class SessionCreatorComponent implements OnInit {
  sessionForm = new FormGroup ({
    session_name: new FormControl(),
    start_date: new FormControl(),
  });

  constructor(
    private dataService: DataService
  ) {}

  ngOnInit() {
    this.sessionForm.patchValue({
      start_date: new Date(),
      session_name: this.getTimeString()
    });
  }

  getTimeString(): string {
    return moment().format('YYYY-MM-DD HH:mm:ss');
  }

  createSession() {
    const session = new Session(
      this.sessionForm.value
    );
    this.dataService.createSession(session).subscribe();
  }

}
