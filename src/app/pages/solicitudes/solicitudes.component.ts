import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Cliente, Solicitud } from 'src/app/modelBD';
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
  
  suscriberSolicitud: Subscription;
  suscriberSolicitudCulminada: Subscription;
  solicitudes: Solicitud []=[];
  solicitudesCulmida: Solicitud []=[];
  nuevos = true;

  constructor(public firebaseauthS: FirebaseauthService,
              public firestoreService: FirestoreService,
              private router: Router ) { }

  ngOnInit() {
    this.tipoRol();
  }

  async ngOnDestroy(){
    console.log('ngOnDestroy() ==>> Solicitudes');
    if(this.suscribreUserInfo){
      this.suscribreUserInfo.unsubscribe();
    }
    if(this.suscribreUserInfoRol){
      this.suscribreUserInfoRol.unsubscribe();
    }
    if(this.suscriberSolicitud){
      this.suscriberSolicitud.unsubscribe();
    }
    if(this.suscriberSolicitudCulminada){
      this.suscriberSolicitudCulminada.unsubscribe();
    }
    
  }

 tipoRol(){
    this.suscribreUserInfo= this.firebaseauthS.stateAuth().subscribe(res => { 
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
                this.getSolicitudNuevaPaseo();
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
      //this.getSolicitudNuevaPaseo();
      //this.navCtrl.setRoot(this.navCtrl.getActive().component);
      if(this.suscriberSolicitudCulminada){
        console.log('Estaba suscrito a Culminados');
        this.suscriberSolicitudCulminada.unsubscribe();
        this.getSolicitudesCulminadaPaseo();
      }
      this.nuevos=true;
      console.log('nueva');
    }
    if(opc === 'culminados'){
      this.getSolicitudesCulminadaPaseo();
      if(this.suscriberSolicitud){
        console.log('Estaba suscrito a Nuevos');
        this.suscriberSolicitud.unsubscribe();
      }
      this.nuevos=false;
      console.log('culminados');
    }
  }

  async getSolicitudNuevaPaseo(){
    console.log(' getPedidosNuevos()');
    const path = 'Cliente-dw/' + this.uid + '/solicitudes';
    console.log(' path() =>> ', path);
    let startAt = null;
    if(this.solicitudes.length){
      //Para que tome la última fecha 
      startAt = this.solicitudes[this.solicitudes.length -1].fecha;
    }
    this.suscriberSolicitud = this.firestoreService.getCollectionAll<Solicitud>(path, 'estado', '==', 'nueva', startAt).subscribe(res =>{
      //DEbo poner una condicionar para que esta sección no se llegue a vaciar si se requiere vargar más
      this.solicitudes = [];
      //DEbo poner una condicionar para que esta sección no se llegue a vaciar si se requiere vargar más
      console.log("Ingresa a las solicitudes", res);
      if(res.length){
        res.forEach( solicitud =>{ 
          this.solicitudes.push(solicitud);
        });
      }
      console.log(this.solicitudes);
    });
    startAt = null;
  }

  async getSolicitudesCulminadaPaseo(){
    console.log(' getPedidosNuevos()');
    const path = 'Cliente-dw/' + this.uid + '/solicitudes';
    console.log(' path() =>> ', path);
    let startAt = null;
    if(this.solicitudesCulmida.length){
      //Para que tome la última fecha 
      startAt = this.solicitudesCulmida[this.solicitudesCulmida.length -1].fecha;
    }
    this.suscriberSolicitudCulminada = this.firestoreService.getCollectionAll<Solicitud>(path, 'estado', '==', 'culminada', startAt).subscribe(res =>{
      //DEbo poner una condicionar para que esta sección no se llegue a vaciar si se requiere vargar más
      //this.solicitudesCulmida = [];
      //DEbo poner una condicionar para que esta sección no se llegue a vaciar si se requiere vargar más
      console.log("Solicitudes Culminadas", res);
      if(res.length){
        res.forEach( solicitud =>{ 
          this.solicitudesCulmida.push(solicitud);
        });
        //this.solicitudes = res;
      }
      console.log(this.solicitudesCulmida);
    });
  }
}
