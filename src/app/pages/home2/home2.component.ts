import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Cliente, Solicitud } from 'src/app/modelBD';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
 
@Component({
  selector: 'app-home2',
  templateUrl: './home2.component.html',
  styleUrls: ['./home2.component.scss'],
})
export class Home2Component implements OnInit, OnDestroy {

  menuDW = true;
  private pathRetorno = '/home-paseador'

  uid = '';
  suscribreUserInfo: Subscription;
  suscribreUserInfoRol: Subscription;
  cliente : Cliente;
  rolPaseador: boolean;

  // variables de solicitudes
  solicitudes: Solicitud []=[];
  suscriberSolicitud: Subscription;
  mascotas: 0;
  // variables de solicitudes
  constructor(public firestoreService: FirestoreService,
              public firebaseauthService: FirebaseauthService,
              private router: Router) {
              //this.firestoreService.setLink(this.pathRetorno);
              this.getSolicitudNuevaPaseo();
   }
 
  ngOnInit() {
    this.tipoRol();
  }
 
  ngOnDestroy(){
    console.log('OnDEstroy => from home2');
    if (this.suscribreUserInfo) {
      this.suscribreUserInfo.unsubscribe();
    }
    if (this.suscribreUserInfoRol) {
      this.suscribreUserInfoRol.unsubscribe();
    }
    if (this.suscriberSolicitud) {
      this.suscriberSolicitud.unsubscribe();
    }
  }
  refrescarPagina(){
    window.location.assign('/home-paseador');
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
            // this.getSolicitudNuevaPaseo();
            return false;
          }
        });
        return;
      }
    });
    return false;
  }

  async getSolicitudNuevaPaseo(){
    console.log(' getSolicitudesNuevas()');
    const path = 'solicitudes'
    console.log(' path() =>> ', path);
    let startAt = null;
    if(this.solicitudes.length){
      //Para que tome la última fecha 
      startAt = this.solicitudes[this.solicitudes.length -1].fecha;
    }
    this.suscriberSolicitud = this.firestoreService.getCollectionAllPlace<Solicitud>(path, 'estado', '==', 'nueva', startAt).subscribe(res =>{
      //DEbo poner una condicionar para que esta sección no se llegue a vaciar si se requiere cargar más
      this.solicitudes = [];
      //DEbo poner una condicionar para que esta sección no se llegue a vaciar si se requiere cargar más
      console.log("Ingresa a las solicitudes", res);
      if(res.length){
        res.forEach( solicitud =>{ 
          this.solicitudes.push(solicitud);
          console.log('Solicitud #: ', solicitud.numMascotas);
        });
      }
      console.log(this.solicitudes);
    });
    //startAt = null;
  }

}
