import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginGuard } from './services/login.guard';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LabelsetCreatorComponent } from './labelset-creator/labelset-creator.component';
import { SessionLabelingComponent } from './session-labeling/session-labeling.component';

const routes: Routes = [
  { path: '', redirectTo: '/sessions', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'sessions', component: DashboardComponent, canActivate: [LoginGuard] },
  { path: 'labelset-editor/:id', component: LabelsetCreatorComponent, canActivate: [LoginGuard] },
  { path: 'labeling/:id', component: SessionLabelingComponent, canActivate: [LoginGuard] },
  { path: '**', redirectTo: 'sessions'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
