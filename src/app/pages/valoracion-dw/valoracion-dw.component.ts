import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Cliente } from 'src/app/modelBD';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-valoracion-dw',
  templateUrl: './valoracion-dw.component.html',
  styleUrls: ['./valoracion-dw.component.scss'],
})
export class ValoracionDwComponent implements OnInit {

  menuDW = true;
  suscribreUserInfo: Subscription;
  uid = '';
  suscribreUserInfoRol:Subscription;
  cliente : Cliente;
  rolPaseador: boolean;

  constructor(public firebaseauthService: FirebaseauthService,
              public firestoreService: FirestoreService,
              private router: Router,) { }

  ngOnInit() {
    this.tipoRol();
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
          if (res.role === 'duenio') {
            this.rolPaseador = false;
            this.router.navigate(['/home'], { replaceUrl: true });
            return false;
          } else {
            this.rolPaseador = true;
            return false;
          }
        });
        return;
      }
    });
    return false;
  }
}
