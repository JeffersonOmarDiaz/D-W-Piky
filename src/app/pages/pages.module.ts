import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from '../app-routing.module';
import { FormsModule } from '@angular/forms';
import { Home1Component } from './home1/home1.component';
import { Home2Component } from './home2/home2.component';
import { Login1Component } from './login1/login1.component';
import { RegistroMascotaComponent } from './registro-mascota/registro-mascota.component';
import { RegistroPepComponent } from './registro-pep/registro-pep.component';
import { PerfilPeopComponent } from './perfil-peop/perfil-peop.component';
import { PerfilPetsComponent } from './perfil-pets/perfil-pets.component';
import { ComponentesModule } from '../componentes/componentes.module';
import { PetPaseoComponent } from './pet-paseo/pet-paseo.component';
import { SolicitudesComponent } from './solicitudes/solicitudes.component';



@NgModule({
  declarations: [
    Home1Component,
    Home2Component,
    Login1Component,
    RegistroMascotaComponent,
    RegistroPepComponent,
    PerfilPeopComponent,
    PerfilPetsComponent,
    PetPaseoComponent,
    SolicitudesComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    AppRoutingModule, 
    FormsModule,
    ComponentesModule,
  ]
})
export class PagesModule { }
