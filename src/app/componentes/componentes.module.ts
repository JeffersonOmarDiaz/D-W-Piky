import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './menu/menu.component';
import { FormularioComponent } from './formulario/formulario.component';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from '../app-routing.module';
import { FormsModule } from '@angular/forms';
import { NuevaOfertaComponent } from './nueva-oferta/nueva-oferta.component';



@NgModule({
  declarations: [
    MenuComponent,
    FormularioComponent,
    NuevaOfertaComponent
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
    NuevaOfertaComponent
  ],
})
export class ComponentesModule { }
