//Sin modificaciones
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor() {}
}
//Con modificaciones

/* import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Cliente } from './modelBD';
import { FirebaseauthService } from './services/firebaseauth.service';
import { FirestoreService } from './services/firestore.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent   {

  suscribreUserInfo: Subscription;
  suscribreUserClient: Subscription;
  uid = '';
  cliente : Cliente;
  constructor(public firestoreService: FirestoreService,
              public firebaseauthService: FirebaseauthService,
              private router: Router) {
              console.log('Ingresa al Constructor del metodo principal');
    this.suscribreUserInfo=this.firebaseauthService.stateAuth().subscribe(res => { 
      console.log(res);
      if (res !== null) {
        this.uid = res.uid;
        console.log(res.email);
        //comprobar TIPO de ROL
          console.log('tipoRol =>');
            const path = "Cliente-dw";
            this.suscribreUserClient = this.firestoreService.getDoc<Cliente>(path, this.uid).subscribe(res => {
              this.cliente = res;
              console.log('El rol actual es: ',res.role);
              if(res.role === 'duenio'){
                this.router.navigate(['/home']);
                //window.location.assign('/home-paseador');
                return true;
              }else if(res.role === 'paseador'){
                //window.location.assign('/home');
                this.router.navigate(['/home-paseador']);
                return;
              }
            });
        return;
      }
    });
  }

  
} */
 