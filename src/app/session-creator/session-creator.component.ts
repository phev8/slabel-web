import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import * as moment from 'moment';

@Component({
  selector: 'app-session-creator',
  templateUrl: './session-creator.component.html',
  styleUrls: ['./session-creator.component.scss']
})
export class SessionCreatorComponent implements OnInit {
  sessionForm = new FormGroup ({
    name: new FormControl(),
    start_date: new FormControl(),
  });

  ngOnInit() {
    this.sessionForm.patchValue({
      start_date: new Date(),
      name: this.getTimeString()
    });
  }

  getTimeString(): string {
    return moment().format('YYYY-MM-DD HH:mm:ss');
  }

  createSession() {
    console.log(this.sessionForm.value);
  }

}
