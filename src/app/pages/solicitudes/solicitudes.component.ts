import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, MenuController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Cliente, Ofrecer, Solicitud } from 'src/app/modelBD';
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
  ofertas: Ofrecer []=[];
  idOferta = '';
  btnCancelarVisible = false;

  idSolicitud = ''; 
  solicitudCancelar: Solicitud;
  constructor(public firebaseauthS: FirebaseauthService,
              public firestoreService: FirestoreService,
              private router: Router,
              public menuController:MenuController, 
              public alertController:AlertController,
              public toastController: ToastController) {
               }

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
                this.uid = res.uid;
                this.getSolicitudNuevaPaseo();
                return false;
              }
            });
        return;
      }
    });
    return false;
  }

  // Comentado para la idea de segmentación el historial 
  /* changeSegment(ev: any){
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
  } */

  async getSolicitudNuevaPaseo(){
    console.log(' getPedidosNuevos()');
    const path = 'Cliente-dw/' + this.uid + '/solicitudes';
    console.log(' path() =>> ', path);
    let startAt = null;
    if(this.solicitudes.length){
      //Para que tome la última fecha 
      startAt = this.solicitudes[this.solicitudes.length -1].fecha;
    }
    this.suscriberSolicitud = this.firestoreService.getCollectionAll<Solicitud>(path, 'estado', '==', 'nueva', startAt, 1).subscribe(res =>{
      //DEbo poner una condicionar para que esta sección no se llegue a vaciar si se requiere vargar más
      this.solicitudes = [];
      //DEbo poner una condicionar para que esta sección no se llegue a vaciar si se requiere vargar más
      console.log("Ingresa a las solicitudes", res);
      if(res.length){
        this.btnCancelarVisible = true;
        res.forEach( solicitud =>{ 
          this.solicitudes.push(solicitud);
          this.idSolicitud =  this.solicitudes[0].id;
          this.solicitudCancelar = this.solicitudes[0];
        });
        this.getOfertasPaseo();
      }else{
        this.btnCancelarVisible = false;
      }
      //console.log(this.solicitudes); líneas para test
    });
    startAt = null;
  }

  async cancelarSolicitud(){
    console.log('cancelarSolicitud()');
    const alert = await this.alertController.create({
      cssClass: 'normal',
      header: 'Advertencia!',
      message: 'Seguro que desea <strong>Cancelar la solicitud</strong>!!!',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'normal',
          handler: (blah) => {
            console.log('Canceló la solicitud: blah');
          }
        }, 
        {
          text: 'Ok',
          role: 'okay',
          handler: () => {
            console.log('Canceló la solicitud ==> ', this.idSolicitud);
            console.log('idSolicitud', this.idSolicitud);
            console.log('idDueño', this.cliente.uid);
            const path = 'Cliente-dw/' + this.cliente.uid + '/solicitudes';
            this.solicitudCancelar.estado = 'cancelada';
            console.log('Datos de la solicitud modificar ==> ', this.solicitudCancelar);
             this.modificaEstadoSolicitud(this.solicitudCancelar, path, this.idSolicitud);
          }
        }
      ]
    });
    await alert.present();
  }

  async modificaEstadoSolicitud(data: any, path: string, idSolicitud: string){
    await this.firestoreService.createDoc(data, path, idSolicitud).then(res => {
      console.log('Solicitud cancelada con éxito');
      this.presentToast('Solicitud cancelada con éxito', 2000);
    }).catch(error => {
      //console.log('No se pudo Actulizar el cliente un error ->', error);
      console.log('No se pudo cancelar la solicitud');
      this.presentToast('No se pudo cancelar la solicitud', 2000);
    });
    return;
  }

  async presentToast(mensaje: string, tiempo: number) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: tiempo 
    });
    toast.present();
  }

  /* async getSolicitudesCulminadaPaseo(){
    console.log(' getPedidosNuevos()');
    const path = 'Cliente-dw/' + this.uid + '/solicitudes';
    console.log(' path() =>> ', path);
    let startAt = null;
    if(this.solicitudesCulmida.length){
      //Para que tome la última fecha 
      startAt = this.solicitudesCulmida[this.solicitudesCulmida.length -1].fecha;
    }
    this.suscriberSolicitudCulminada = this.firestoreService.getCollectionAll<Solicitud>(path, 'estado', '==', 'culminada', startAt, 10).subscribe(res =>{
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
  } */

  async getOfertasPaseo(){
    console.log('getOfertasPaseo() id de la solicitud ', this.idSolicitud);
    // console.log(' getPedidosNuevos()');
    const path = 'Cliente-dw/' + this.uid + '/solicitudes/' + this.idSolicitud + '/ofertas';
    console.log(' path() =>> ', path);
    let startAt = null;
    if(this.ofertas.length){
      //Para que tome la última fecha 
      startAt = this.ofertas[this.ofertas.length -1].fecha;
    }
    this.suscriberSolicitud = this.firestoreService.getCollectionAll<Ofrecer>(path, 'estado', '==', 'proceso', startAt, 10).subscribe(res =>{
      //DEbo poner una condicionar para que esta sección no se llegue a vaciar si se requiere vargar más
      this.ofertas = [];
      //DEbo poner una condicionar para que esta sección no se llegue a vaciar si se requiere vargar más
      console.log("Ingresa a las Ofertas de paseadores", res);
      if(res.length){
        res.forEach( ofrecer =>{ 
          this.ofertas.push(ofrecer);
          this.idOferta =  this.ofertas[0].id;
          // this.solicitudCancelar = this.ofertas[0];
        });
      }
      //console.log(this.solicitudes); líneas para test
    });
    startAt = null;
  }
}
