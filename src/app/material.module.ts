import { NgModule } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MatMomentDateModule } from '@angular/material-moment-adapter';

const usedModules = [
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatExpansionModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatMomentDateModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatTooltipModule,
];

@NgModule({
    imports: [
        ...usedModules
    ],
    exports: [
        ...usedModules
    ]
}) export class SelectedMaterialModules { }
