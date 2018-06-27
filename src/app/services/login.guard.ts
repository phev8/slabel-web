import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { DataService } from './data.service';

@Injectable()
export class LoginGuard implements CanActivate {
  constructor(
    private dataService: DataService,
    private router: Router
  ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      const url: string = state.url;
      return this.checkLoginStatus(url);
  }

  checkLoginStatus(url: string): boolean {
    if (this.dataService.isLoggedIn()) { return true; }

    // Store the attempted URL for redirecting
    // this.authService.redirectUrl = url;
    this.router.navigate(['/login']);
    return false;
  }
}
