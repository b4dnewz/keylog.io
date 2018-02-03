import { NgModule } from '@angular/core';

import {
  MatButtonModule,
  MatInputModule,
  MatFormFieldModule,
  MatToolbarModule,
  MatListModule,
  MatSidenavModule,
  MatTableModule,
  MatSortModule,
  MatIconModule,
  MatProgressSpinnerModule
} from '@angular/material';

@NgModule({
  imports: [
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatToolbarModule,
    MatListModule,
    MatSidenavModule,
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  exports: [
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatToolbarModule,
    MatListModule,
    MatSidenavModule,
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatProgressSpinnerModule
  ]
})

export class MaterialModule {}
