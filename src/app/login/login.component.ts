import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../services/data.service';

import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username = new FormControl('', [Validators.required]);

  constructor(
    private dataService: DataService,
    private router: Router
  ) {

  }

  login() {
    if (this.username.invalid) {
      return;
    }
    this.dataService.username = this.username.value;
    this.router.navigate(['/sessions']);
  }
}
