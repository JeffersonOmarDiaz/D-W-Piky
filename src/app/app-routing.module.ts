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
import { SolicitudesComponent } from './pages/solicitudes/solicitudes.component';

//Usuario Logueado INCIO
import { canActivate, redirectUnauthorizedTo, redirectLoggedInTo } from '@angular/fire/auth-guard';
import { ProgresoDuenioComponent } from './pages/progreso-duenio/progreso-duenio.component';
const isLogged = () => redirectLoggedInTo(['/home']);

const redirectUnauthorizedToLogin = () =>
  redirectUnauthorizedTo(['/']);
//Usuario Logueado FIN

const routes: Routes = [
  {
    path: 'progreso-duenio',
    component: ProgresoDuenioComponent, ...canActivate(redirectUnauthorizedToLogin),
  },
  {
    path: 'solicitudes',
    component: SolicitudesComponent, ...canActivate(redirectUnauthorizedToLogin),
  },
  {
    path: 'quiero-paseo',
    component: PetPaseoComponent, ...canActivate(redirectUnauthorizedToLogin),
  },
  {
    path: 'perfil-mascota',
    component: PerfilPetsComponent, ...canActivate(redirectUnauthorizedToLogin),
  },
  {
    path: 'perfil-persona',
    component: PerfilPeopComponent, ...canActivate(redirectUnauthorizedToLogin),
  },
  {
    path: 'registro-mascota',
    component: RegistroMascotaComponent, ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'registro',
    component: RegistroPepComponent, ...canActivate(redirectUnauthorizedToLogin),
  },
  {
    path: 'login',
    component: Login1Component, ...canActivate(isLogged),
  },
  {
    path: 'home-paseador',
    component: Home2Component, ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'home',
    component: Home1Component, ...canActivate(redirectUnauthorizedToLogin)
  }, {
    //si no se escribe nada en la ruta 
    path: '', component: Login1Component, ...canActivate(isLogged)
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
