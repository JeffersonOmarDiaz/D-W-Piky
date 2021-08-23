import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Cliente } from 'src/app/modelBD';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-procesos-dw',
  templateUrl: './procesos-dw.component.html',
  styleUrls: ['./procesos-dw.component.scss'],
})
export class ProcesosDwComponent implements OnInit, OnDestroy {

  menuDW = true;
  rolPaseador: boolean;
  suscribreUserInfo: Subscription;
  suscribreUserInfoRol: Subscription;
  uid = '';
  cliente : Cliente;
  infoPaseadorInput: any;

  constructor(public firebaseauthService: FirebaseauthService,
              public firestoreService: FirestoreService,
              private router: Router,) { }

  ngOnInit() {
    this.tipoRol();
  }

  ngOnDestroy(){
    console.log('OnDEstroy => Procesos Dog Walker');
    if (this.suscribreUserInfo) {
      this.suscribreUserInfo.unsubscribe();
    }
    if (this.suscribreUserInfoRol) {
      this.suscribreUserInfoRol.unsubscribe();
    }
  }

  tipoRol() {
    this.suscribreUserInfo = this.firebaseauthService.stateAuth().subscribe(res => {
      console.log(res);
      if (res !== null) {
        this.uid = res.uid;
        //comprobar TIPO de ROL
        const path = "Cliente-dw";
        this.suscribreUserInfoRol = this.firestoreService.getDoc<Cliente>(path, this.uid).subscribe(res => {
          this.cliente = res;
          console.log('El rol actual es: ', res.role);
          this.infoPaseadorInput = res;
          console.log('Información del paseador: ', this.infoPaseadorInput);
          if (res.role === 'duenio') {
            this.rolPaseador = false;
            this.router.navigate(['/home'], { replaceUrl: true });
            return false;
          } else {
            this.rolPaseador = true;
            // this.getSolicitudNuevaPaseo();
            return false;
          }
        });
        return;
      }
    });
    return false;
  }
}
