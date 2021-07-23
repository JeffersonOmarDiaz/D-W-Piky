import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Cliente } from 'src/app/modelBD';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-solicitudes',
  templateUrl: './solicitudes.component.html',
  styleUrls: ['./solicitudes.component.scss'],
})
export class SolicitudesComponent implements OnInit, OnDestroy {

  verMC = true;

  suscribreUserInfo: Subscription;
  suscribreUserInfoRol: Subscription;
  uid = '';
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
    role: 'duenio'
  };
  rolDuenio: boolean;
  constructor(public firebaseauthS: FirebaseauthService,
              public firestoreService: FirestoreService,
              private router: Router ) { }

  ngOnInit() {
    this.tipoRol();
  }

  ngOnDestroy(){
    console.log('ngOnDestroy() ==>> Solicitudes');
    if(this.suscribreUserInfo){
      this.suscribreUserInfo.unsubscribe();
    }
    if(this.suscribreUserInfo){
      this.suscribreUserInfo.unsubscribe();
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
  changeSegment(ev: any){
    console.log(' changeSegment()', ev.detail.value);
    const opc = ev.detail.value;
    if(opc === 'nuevos'){
      console.log('nueva');
    }
    if(opc === 'culminados'){
      //this.getPedidosCulminados();
      console.log('culminados');
    }
  }
}
