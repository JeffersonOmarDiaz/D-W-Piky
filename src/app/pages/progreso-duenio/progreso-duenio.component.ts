import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Cliente, Ofrecer } from 'src/app/modelBD';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-progreso-duenio',
  templateUrl: './progreso-duenio.component.html',
  styleUrls: ['./progreso-duenio.component.scss'],
})
export class ProgresoDuenioComponent implements OnInit, OnDestroy {

  verMC = true;
  rolDuenio: boolean;
  suscribreUserInfo: Subscription;
  suscribreUserInfoRol: Subscription;
  uid = '';
  cliente: Cliente = {
    uid: this.uid,
    email: '',
    celular: '',
    foto: '',
    referncia: '',
    ubicacion: {
      lat: null,
      lng: null,
      direccion: '',
    },
    edad: null,
    nombre: '',
    apellido: '',
    cedula: '',
    mascotas: [],
    role: 'duenio'
  };

  ofertas: Ofrecer []=[];
  idOferta = '';
  suscribreUserProceso: Subscription;
  suscribreUserDocProceso: Subscription;
  procesos: Ofrecer={
    id: '',
    fecha: new Date,
    paseador: this.cliente,
    valor: null,
    estado: 'proceso',
    //Estado necesario para aceptar respuesta de confirmación
    ubicacion: {
      lat: null,
      lng: null,
      direccion: '',
    },
  };

  avance1 = false;
  avance2 = false;
  avance3 = false;
  avance4 = false;
  btnPaseadorNoLlego = true;
  btnEmpieza = false;
  constructor(public firebaseauthS: FirebaseauthService,
              public firestoreService: FirestoreService,
              private router: Router,
              public toastController:ToastController,
    ) { }

  ngOnInit() {
    this.tipoRol();
  }

  async ngOnDestroy(){
    console.log('ngOnDestroy() ==>> Progreso Dueño');
    if(this.suscribreUserInfo){
      this.suscribreUserInfo.unsubscribe();
    }
    if(this.suscribreUserInfoRol){
      this.suscribreUserInfoRol.unsubscribe();
    }
    if(this.suscribreUserDocProceso){
      this.suscribreUserDocProceso.unsubscribe();
    }
    if(this.suscribreUserProceso){
      this.suscribreUserProceso.unsubscribe();
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
                this.getDatosOferta();
                return false;
              }
            });
        return;
      }
    });
    return false;
  }

  getDatosOferta(){
    console.log('getDatosOferta()');
    const path = 'Cliente-dw/' + this.uid + '/proceso-duenio';
    let startAt = null;
    this.suscribreUserProceso = this.firestoreService.getCollectionProcesoDuenio<Ofrecer>(path, 'estado', '!=', 'culminada', startAt, 1).subscribe(res =>{
      //DEbo poner una condicionar para que esta sección no se llegue a vaciar si se requiere cargar más
      this.ofertas = [];
      //DEbo poner una condicionar para que esta sección no se llegue a vaciar si se requiere cargar más
      console.log("Ingresa a las Ofertas de paseadores", res);
      if(res.length){
        res.forEach( ofrecer =>{ 
          this.ofertas.push(ofrecer);
          this.idOferta =  this.ofertas[0].id;
          // this.solicitudCancelar = this.ofertas[0];
          this.suscribreUserProceso.unsubscribe();
        });
      }
      // console.log(this.ofertas); //líneas para test
      if(this.ofertas.length != 0){
        this.obtenerDocumento();
      }else{
        this.router.navigate([`/home`], { replaceUrl: true });
        this.presentToast('Aún no ha generado solicitudes!!', 2000);
      }
    });
  }

  async presentToast(mensaje: string, tiempo:number) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: tiempo 
    });
    toast.present();
  }

  obtenerDocumento(){
    const path = 'Cliente-dw/' + this.uid + '/proceso-duenio';
    console.log(path);
    this.suscribreUserDocProceso = this.firestoreService.getDoc<Ofrecer>(path, this.idOferta).subscribe(res => {
      console.log(res);
      this.procesos = res;
      console.log(this.procesos.estado);
      this.VisibilidadProgreso();
    });
  }

  VisibilidadProgreso(){
    console.log('VisibilidadProgreso()');
    if(this.procesos.estado === 'Llego en 10 minutos' || this.procesos.estado === 'Llego en 5 minutos'){
      //Activar img voyCaminando 1er avance
      this.avance1 = true;
      console.log();
    }else if(this.procesos.estado === 'Estoy fuera'){
      //Activar img estoyFuera 2do avance
      this.avance2 = true;
      this.avance1 = true;
      this.btnEmpieza = true;
    }else if(this.procesos.estado === 'Paseando'){
      //Activar img caminandoDWIzquierda 3er avance
      this.avance3 = true;
      this.avance2 = true;
      this.avance1 = true;
      this.btnEmpieza = false;
    }else if(this.procesos.estado === 'Paseo Finalizado'){
      //Activar img retiroDW 4to avance
      this.avance4 = true;
      this.avance3 = true;
      this.avance2 = true;
      this.avance1 = true;
    }
    if(this.procesos.estado === 'Paseando'){
      this.btnPaseadorNoLlego = false;
    }
  }

  empiezaPaseo(){
    this.procesos.estado = 'Paseando';
    const path = 'Cliente-dw/' + this.uid + '/proceso-duenio';
    const idDoc = this.procesos.id;
    this.firestoreService.createDoc(this.procesos, path, idDoc).then( ()=>{
      console.log('En paseo!');
    });
  }

  paseadorNollego(){
    console.log('paseadorNollego()');
  }
}
