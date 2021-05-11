import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './menu/menu.component';
import { FormularioComponent } from './formulario/formulario.component';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from '../app-routing.module';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    MenuComponent,
    FormularioComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    AppRoutingModule, 
    FormsModule,
    
  ],
  exports: [
    MenuComponent,
    FormularioComponent,
  ],
})
export class ComponentesModule { }
