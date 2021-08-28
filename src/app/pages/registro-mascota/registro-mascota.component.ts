import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Cliente } from 'src/app/modelBD';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-registro-mascota',
  templateUrl: './registro-mascota.component.html',
  styleUrls: ['./registro-mascota.component.scss'],
})
export class RegistroMascotaComponent implements OnInit, OnDestroy {

  verMC = true;
  registroPet = true;
  uid = '';
  suscribreUserInfo: Subscription;
  suscribreUserInfoRol: Subscription;
  rolDuenio: boolean;

  cliente: Cliente = {
    uid: this.uid,
    email: '',
    celular: '',
    foto: '',
    referncia: '',
    ubicacion: null,
    edad: null,
    nombre: '',
    apellido: '',
    cedula: '',
    mascotas: [],
    role: 'duenio',
    estadoPaseador: 'inActivo',
  };

  constructor(public firestoreService:FirestoreService,
              public firebaseauthS: FirebaseauthService,
              private router: Router,
              ) {}

  ngOnInit() {
    this.tipoRol();
  }

  ngOnDestroy(){
    console.log('OnDEstroy => from registroMascotas');
    if (this.suscribreUserInfo) {
      this.suscribreUserInfo.unsubscribe();
    }
    if (this.suscribreUserInfoRol) {
      this.suscribreUserInfoRol.unsubscribe();
    }
  }

  tipoRol(){
    this.suscribreUserInfo=this.firebaseauthS.stateAuth().subscribe(res => { 
      console.log(res);
      if (res !== null) {
        this.uid = res.uid;
        //comprobar TIPO de ROL
          console.log('tipoRol =>');
            const path = "Cliente-dw";
            this.suscribreUserInfoRol = this.firestoreService.getDoc<Cliente>(path, this.uid).subscribe(res => {
              this.cliente = res;
              console.log('El rol actual es: ',res.role);
              if(res.role === 'paseador'){
                this.rolDuenio = false;
                this.router.navigate([`/home-paseador`], { replaceUrl: true });
                return true;
              }else{
                this.rolDuenio = true;
                return false;
              }
            });
        return;
      }
    });
    return false;
  }

}
