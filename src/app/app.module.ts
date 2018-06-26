import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { MatIconRegistry } from '@angular/material';

import { SelectedMaterialModules } from './material.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { DashboardComponent } from './dashboard/dashboard.component';
import { LabelsetCreatorComponent } from './labelset-creator/labelset-creator.component';
import { LoginComponent } from './login/login.component';
import { MenuComponent } from './menu/menu.component';
import { SessionCreatorComponent } from './session-creator/session-creator.component';
import { SessionLabelingComponent } from './session-labeling/session-labeling.component';


@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    LabelsetCreatorComponent,
    LoginComponent,
    MenuComponent,
    SessionCreatorComponent,
    SessionLabelingComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SelectedMaterialModules,
    AppRoutingModule,
    NgbModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(public matIconRegistry: MatIconRegistry) {
    matIconRegistry.registerFontClassAlias('fontawesome', 'fa');
  }
}
