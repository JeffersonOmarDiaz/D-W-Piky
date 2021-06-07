import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { Home1Component } from './pages/home1/home1.component';
import { Home2Component } from './pages/home2/home2.component';
import { Login1Component } from './pages/login1/login1.component';
import { PerfilPeopComponent } from './pages/perfil-peop/perfil-peop.component';
import { PerfilPetsComponent } from './pages/perfil-pets/perfil-pets.component';
import { PetPaseoComponent } from './pages/pet-paseo/pet-paseo.component';
import { RegistroMascotaComponent } from './pages/registro-mascota/registro-mascota.component';
import { RegistroPepComponent } from './pages/registro-pep/registro-pep.component';

const routes: Routes = [
  {
    path: 'quiero-paseo',
    component: PetPaseoComponent
  },
  {
    path: 'perfil-mascota',
    component: PerfilPetsComponent
  },
  {
    path: 'perfil-persona',
    component: PerfilPeopComponent
  },
  {
    path: 'registro-mascota',
    component: RegistroMascotaComponent
  },
  {
    path: 'registro',
    component: RegistroPepComponent
  },
  {
    path: 'login',
    component: Login1Component
  },
  {
    path: 'home-paseador',
    component: Home2Component
  },
  {
    path: 'home',
    component: Home1Component
  }, {
    //si no se escribe nada en la ruta 
    path: '', component: Login1Component
  },
  {
    //ruta por defecto "si escriben cualquier cosa"
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
