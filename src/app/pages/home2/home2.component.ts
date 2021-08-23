import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { NuevaOfertaComponent } from 'src/app/componentes/nueva-oferta/nueva-oferta.component';
import { Cliente, Solicitud } from 'src/app/modelBD';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
//para capturar geoloccaclización apenas comience la aplicación
import { Plugins } from '@capacitor/core';
const {Geolocation} = Plugins;
@Component({
  selector: 'app-home2',
  templateUrl: './home2.component.html',
  styleUrls: ['./home2.component.scss'],
})
export class Home2Component implements OnInit, OnDestroy {

  menuDW = true;
  // private pathRetorno = '/home-paseador'

  uid = '';
  suscribreUserInfo: Subscription;
  suscribreUserInfoRol: Subscription;
  cliente : Cliente;
  rolPaseador: boolean;

  // variables de solicitudes
  solicitudes: Solicitud []=[];
  suscriberSolicitud: Subscription;
  mascotas: 0;
  infoPaseadorInput: any;
  // variables de solicitudes

  //obtiene la dirección de la ubicación actual
  positionInputPaseador = {
    lat: null,
    lng: null,
  };
  btnVerSolicitudes = false;
  constructor(public firestoreService: FirestoreService,
              public firebaseauthService: FirebaseauthService,
              private router: Router,
              private modalController: ModalController) {
              //this.firestoreService.setLink(this.pathRetorno);
              
   }
 
  ngOnInit() {
    this.tipoRol();
    this.getSolicitudNuevaPaseo();
    this.mylocation();
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
    // window.location.assign('/home-paseador');
    this.router.navigate(['/home'], { replaceUrl: true });
  }

  async mylocation() {

    console.log('mylocation() click')
    // Se debe ocupar el plugin de capacitor hacer la importacion de plugins
    Geolocation.getCurrentPosition().then((res) => {
  
      console.log('mylocation() -> get ', res);
  
      this.positionInputPaseador = {
        lat: res.coords.latitude,
        lng: res.coords.longitude
      }
      // this.addMarker(position);
      // this.geocodePosition(this.marker.getPosition());
    });
  
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
            if(this.cliente.cedula != ''){
              console.log('Si tiene cédula');
              this.btnVerSolicitudes = true;
            }
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
    let startAt = new Date;
    // if(this.solicitudes.length){
    //   //Para que tome la última fecha 
    //   console.log('Obtiene la nueva fecha');
    //   startAt = this.solicitudes[this.solicitudes.length -1].fecha;
    // }
    startAt.setMinutes(startAt.getMinutes() + 10); //sección para obtener los datos en tiempo real
    this.suscriberSolicitud = await this.firestoreService.getCollectionAllPlace<Solicitud>(path, 'estado', '==', 'nueva', startAt).subscribe(res =>{
      console.log('=========> FEcha aparente',startAt);
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

  async verMascotasPaseo(infoSolicitudInput: any){
    console.log('verMascotasPaseo() ==> ', infoSolicitudInput);

    const ubicacion = this.cliente.ubicacion;
    let positionInput = {  //Ubicación del dueño
      lat: infoSolicitudInput[0].duenio.ubicacion.lat,
      lng: infoSolicitudInput[0].duenio.ubicacion.lng
    };
    console.log(positionInput);
    // if (ubicacion !== null) {
    //     positionInput = ubicacion; 
    // }

    const modalAdd  = await this.modalController.create({
      component: NuevaOfertaComponent,
      mode: 'ios',
      swipeToClose: true,
      componentProps: {position: positionInput, infoDuenio: infoSolicitudInput[0], infoPaseador: this.infoPaseadorInput, positionPaseador: this.positionInputPaseador} //pasa la ubicación a nuevaoferta
    });
    await modalAdd.present();

    // const {data} = await modalAdd.onWillDismiss();
    // if (data) {
    //   console.log('data -> ', data);
    //   this.cliente.ubicacion = data.pos;
    //   console.log('this.cliente -> ', this.cliente);
    // }

  }

  eventoToggle(estado: any){
    console.log('eventoToggle() ==> ',estado);
    console.log('eventoToggle() ==> ',estado.path[0].ariaChecked);
    //si es falso mostramos las solicitudes  
  }
}
