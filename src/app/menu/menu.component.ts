import { Component } from '@angular/core';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
  constructor(
    private dataService: DataService
  ) {}

  getUsername(): string {
    return this.dataService.username;
  }

  isLoggedIn(): boolean {
    return this.dataService.isLoggedIn();
  }
}
