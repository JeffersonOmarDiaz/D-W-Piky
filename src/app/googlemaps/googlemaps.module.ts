import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { GooglemapsComponent } from './googlemaps.component';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from '../app-routing.module';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    GooglemapsComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    AppRoutingModule, 
    FormsModule,
  ], exports: [
    GooglemapsComponent
  ]
})
export class GooglemapsModule { }
