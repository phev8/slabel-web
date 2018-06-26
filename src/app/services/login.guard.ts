import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

// import { AuthenticationService } from './authentication.service';

@Injectable()
export class LoginGuard implements CanActivate {
  constructor(
    // private authService: AuthenticationService,
    private router: Router
  ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      const url: string = state.url;
      return this.checkLoginStatus(url);
  }

  checkLoginStatus(url: string): boolean {
    // if (this.authService.isLoggedIn()) { return true; }
    // TODO: check username if empty

    // Store the attempted URL for redirecting
    // this.authService.redirectUrl = url;
    this.router.navigate(['/login']);
    return false;
  }
}
