import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Calificacion, Cliente, Ofrecer, Solicitud } from 'src/app/modelBD';
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
    role: 'duenio',
    estadoPaseador: 'inActivo',
  };

  ofertas: Ofrecer[] = [];
  idOferta = '';
  suscribreUserProceso: Subscription;
  suscribreUserDocProceso: Subscription;
  procesos: Ofrecer = {
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
  btnFinalizarPaseo = false;
  activarCalificacion = false;
  solicitud: Solicitud;
  suscribeInfoPaseador: Subscription;
  calificacion: Calificacion = {
    id: '',
    fecha: new Date,
    comentario: '',
    valoracion: 5
  }
  btncalificacion1 = 1;
  btncalificacion2 = 2;
  btncalificacion3 = 3;
  btncalificacion4 = 4;
  btncalificacion5 = 5;
  colorBaseCalificacion1 = "none"
  colorBaseCalificacion2 = "none"
  colorBaseCalificacion3 = "none"
  colorBaseCalificacion4 = "none"
  colorBaseCalificacion5 = "none"
  btnCalificaPata = false;
  calificacionFinal = null;

  btnLat = 0;
  btnLng = 0;
  url = '';
  numWhastapp = 0;
  urlWhastapp = '';
  constructor(public firebaseauthS: FirebaseauthService,
    public firestoreService: FirestoreService,
    private router: Router,
    public toastController: ToastController,
  ) { }

  ngOnInit() {
    this.tipoRol();
  }

  async ngOnDestroy() {
    console.log('ngOnDestroy() ==>> Progreso Dueño');
    if (this.suscribreUserInfo) {
      this.suscribreUserInfo.unsubscribe();
    }
    if (this.suscribreUserInfoRol) {
      this.suscribreUserInfoRol.unsubscribe();
    }
    if (this.suscribreUserDocProceso) {
      this.suscribreUserDocProceso.unsubscribe();
    }
    if (this.suscribreUserProceso) {
      this.suscribreUserProceso.unsubscribe();
    }
    if (this.suscribeInfoPaseador) {
      this.suscribeInfoPaseador.unsubscribe();
    }

  }

  tipoRol() {
    this.suscribreUserInfo = this.firebaseauthS.stateAuth().subscribe(res => {
      console.log(res);
      if (res !== null) {
        this.uid = res.uid;
        //comprobar TIPO de ROL
        console.log('tipoRol =>');
        const path = "Cliente-dw";
        this.suscribreUserInfoRol = this.firestoreService.getDoc<Cliente>(path, this.uid).subscribe(res => {
          this.cliente = res;
          console.log('El rol actual es: ', res.role);
          if (res.role === 'paseador') {
            this.rolDuenio = false;
            this.router.navigate([`/home-paseador`], { replaceUrl: true });
            return true;
          } else {
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

  getDatosOferta() {
    console.log('getDatosOferta()');
    const path = 'Cliente-dw/' + this.uid + '/proceso-duenio';
    let startAt = null;
    this.suscribreUserProceso = this.firestoreService.getCollectionProcesoDuenio<Ofrecer>(path, 'estado', '!=', 'culminada', startAt, 1).subscribe(res => {
      //DEbo poner una condicionar para que esta sección no se llegue a vaciar si se requiere cargar más
      this.ofertas = [];
      //DEbo poner una condicionar para que esta sección no se llegue a vaciar si se requiere cargar más
      console.log("Ingresa a las Ofertas de paseadores", res);
      if (res.length) {
        res.forEach(ofrecer => {
          this.ofertas.push(ofrecer);
          this.idOferta = this.ofertas[0].id;
          // this.solicitudCancelar = this.ofertas[0];
          this.suscribreUserProceso.unsubscribe();
        });
      }
      // console.log(this.ofertas); //líneas para test
      if (this.ofertas.length != 0) {
        this.obtenerDocumento();
      } else {
        this.router.navigate([`/home`], { replaceUrl: true });
        this.presentToast('Aún no ha generado solicitudes!!', 2000);
      }
    });
  }

  async presentToast(mensaje: string, tiempo: number) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: tiempo
    });
    toast.present();
  }

  obtenerDocumento() {
    const path = 'Cliente-dw/' + this.uid + '/proceso-duenio';
    console.log(path);
    this.suscribreUserDocProceso = this.firestoreService.getDoc<Ofrecer>(path, this.idOferta).subscribe(res => {
      console.log(res);
      this.procesos = res;
      console.log(this.procesos.estado);
      this.numWhastapp = Number(this.procesos.paseador.celular);
      this.urlWhastapp = 'https://wa.me/593' + this.numWhastapp + '?text=Hola%20'+ this.procesos.paseador.nombre + ' ' + this.procesos.paseador.apellido;
      this.btnLat = this.procesos.paseador.ubicacion.lat;
      this.btnLng = this.procesos.paseador.ubicacion.lng;
      this.url="https://maps.google.com/?q="+ this.btnLat +","+ this.btnLng +"&z=14";
      this.VisibilidadProgreso();
    });
  }

  VisibilidadProgreso() {
    console.log('VisibilidadProgreso()');
    if (this.procesos.estado === 'Llego en 10 minutos' || this.procesos.estado === 'Llego en 5 minutos') {
      //Activar img voyCaminando 1er avance
      this.avance1 = true;
      this.avance4 = false;
      this.avance3 = false;
      this.avance2 = false;
      this.activarCalificacion = false;
      this.btnPaseadorNoLlego = true;
      console.log();
    } else if (this.procesos.estado === 'Estoy fuera') {
      //Activar img estoyFuera 2do avance
      this.avance2 = true;
      this.avance1 = true;
      this.btnEmpieza = true;
      this.avance4 = false;
      this.avance3 = false;
      this.activarCalificacion = false;
      this.btnPaseadorNoLlego = true;
    } else if (this.procesos.estado === 'Paseando') {
      //Activar img caminandoDWIzquierda 3er avance
      this.avance3 = true;
      this.avance2 = true;
      this.avance1 = true;
      this.btnEmpieza = false;
      this.btnPaseadorNoLlego = false;
      this.btnFinalizarPaseo = true;
    } else if (this.procesos.estado === 'Paseo Finalizado') {
      //Activar img retiroDW 4to avance
      this.avance4 = true;
      this.avance3 = true;
      this.avance2 = true;
      this.avance1 = true;
      this.btnEmpieza = false;
      this.btnFinalizarPaseo = false;
      this.activarCalificacion = true;
      this.btnPaseadorNoLlego = false;
    } else if (this.procesos.estado === 'culminada') {
      this.btnPaseadorNoLlego = false;
      this.activarCalificacion = true;
      this.btnFinalizarPaseo = false;
      this.avance4 = true;
      this.avance3 = true;
      this.avance2 = true;
      this.avance1 = true;
    } else if (this.procesos.estado === 'No llegó el pasedor'){
      this.avance4 = false;
      this.avance3 = false;
      this.avance2 = false;
      this.avance1 = false;
      this.activarCalificacion = true;
      this.btnFinalizarPaseo = false;
      this.btnPaseadorNoLlego = false;
      if(this.procesos.estado === 'No llegó el pasedor'){
        this.procesos.estado = 'Paseo Finalizado';
        this.obtenerDocPaseador();
        if (this.suscribeInfoPaseador) {
          this.suscribeInfoPaseador.unsubscribe();
        }
      }
    }else if(this.procesos.estado === 'Ya no estoy activo'){
      this.avance4 = false;
      this.avance3 = false;
      this.avance2 = false;
      this.avance1 = false;
      this.activarCalificacion = true;
      this.btnFinalizarPaseo = false;
      this.btnPaseadorNoLlego = false;
    }
  }

  async empiezaPaseo() {
    this.procesos.estado = 'Paseando';
    const path = 'Cliente-dw/' + this.uid + '/proceso-duenio';
    const idDoc = this.procesos.id;
    this.registrarAccion(this.procesos, path, idDoc);
    await this.obtenerDocPaseador();
  }

  async registrarAccion(data: any, path: string, idDoc: string) {
    console.log(data);
    this.firestoreService.createDoc(data, path, idDoc).then(() => {
      console.log('Accion Exitosa!');
    });
  }

  async obtenerDocPaseador() {
    const uidPaseador = this.ofertas[0].paseador.uid;
    const idDocPaseador = this.procesos.id;
    const path = 'Cliente-dw/' + uidPaseador + '/procesos-dw';
    console.log(path);
    this.suscribeInfoPaseador = await this.firestoreService.getDoc<Solicitud>(path, idDocPaseador).subscribe(res => {
      this.solicitud = res;
      console.log(this.solicitud);
      this.solicitud.estado = this.procesos.estado;
      this.registrarAccion(this.solicitud, path, idDocPaseador);
      this.suscribeInfoPaseador.unsubscribe();
      return;
    });
  }
  async paseadorNollego() {
    console.log('paseadorNollego()');
    this.btnFinalizarPaseo = false;
    console.log('finPaseo()');
    this.procesos.estado = 'No llegó el pasedor';
    const path = 'Cliente-dw/' + this.uid + '/proceso-duenio';
    const idDoc = this.procesos.id;
    console.log(path);
    console.log(idDoc);
    await this.registrarAccion(this.procesos, path, idDoc);
    await this.calificarNollego().catch( err =>{
      console.log(err);
    });
  }
  async calificarNollego() {
    
    const uidPaseador = this.ofertas[0].paseador.uid;
    const idDocPaseador = this.procesos.id;
    const pathDw = 'Cliente-dw/' + uidPaseador + '/procesos-dw';
    console.log(pathDw);
    await this.registrarAccion(this.solicitud, pathDw, idDocPaseador);
    this.suscribeInfoPaseador.unsubscribe();
    return;
  }

  async finPaseo() {
    this.btnFinalizarPaseo = false;
    console.log('finPaseo()');
    this.procesos.estado = 'Paseo Finalizado';
    const path = 'Cliente-dw/' + this.uid + '/proceso-duenio';
    const idDoc = this.procesos.id;
    console.log(path);
    console.log(idDoc);
    await this.registrarAccion(this.procesos, path, idDoc);
    // if (this.procesos.estado = 'culminada') {
    //   this.solicitud.estado = 'Paseo Finalizado';
    //   const uidPaseador = this.ofertas[0].paseador.uid;
    //   const idDocPaseador = this.procesos.id;
    //   const path = 'Cliente-dw/' + uidPaseador + '/procesos-dw';
    //   console.log(path);
    //   this.firestoreService.createDoc(this.solicitud, path, idDocPaseador).then( ()=>{
    //     console.log('Accion Exitosa!');
    //   });
    // }
    this.obtenerDocPaseador();
  }

  async calificarDw() {
    console.log('calificarDw()');

    const uidDw = this.ofertas[0].paseador.uid;
    const idCalifPaseador = this.procesos.id;
    const path = 'Cliente-dw/' + uidDw + '/calificaciones';
    this.calificacion.id = idCalifPaseador;
    console.log(path);
    console.log(this.calificacion.id);
    // this.calificacion.valoracion;
    this.calificacion.fecha = new Date;
    const data = this.calificacion;
    await this.firestoreService.createDoc(data, path, idCalifPaseador).then(() => {
      this.router.navigate([`/home`], { replaceUrl: true });
      const smsExito = "!Proceso concluido¡";
      console.log(smsExito);
      this.presentToast(smsExito, 2500);

    });

  }
  btnCalificar(calificacion: number) {
    console.log('btnCalificar ==>', calificacion);
    //Rojo malo, naranja, amarillo, verdeclaro, verde obscuro
    if (calificacion === 1) {
      this.colorBaseCalificacion1 = "danger";
      this.colorBaseCalificacion2 = "none"
      this.colorBaseCalificacion3 = "none"
      this.colorBaseCalificacion4 = "none"
      this.colorBaseCalificacion5 = "none"
      this.btnCalificaPata = true;
    } else if (calificacion === 2) {
      this.colorBaseCalificacion1 = "danger";
      this.colorBaseCalificacion2 = "danger"
      this.colorBaseCalificacion3 = "none"
      this.colorBaseCalificacion4 = "none"
      this.colorBaseCalificacion5 = "none"
      this.btnCalificaPata = true;
    } else if (calificacion === 3) {
      this.colorBaseCalificacion1 = "warning";
      this.colorBaseCalificacion2 = "warning"
      this.colorBaseCalificacion3 = "warning"
      this.colorBaseCalificacion4 = "none"
      this.colorBaseCalificacion5 = "none"
      this.btnCalificaPata = true;
    } else if (calificacion === 4) {
      this.colorBaseCalificacion1 = "warning";
      this.colorBaseCalificacion2 = "warning"
      this.colorBaseCalificacion3 = "warning"
      this.colorBaseCalificacion4 = "warning"
      this.colorBaseCalificacion5 = "none"
      this.btnCalificaPata = true;
    } else if (calificacion === 5) {
      this.colorBaseCalificacion1 = "success";
      this.colorBaseCalificacion2 = "success"
      this.colorBaseCalificacion3 = "success"
      this.colorBaseCalificacion4 = "success"
      this.colorBaseCalificacion5 = "success"
      this.btnCalificaPata = true;
    }
    this.calificacionFinal = calificacion;
  }

  async escribirCalificacion() {
    console.log('escribirCalificacion ==> ', this.calificacionFinal);
    this.calificacion.valoracion = this.calificacionFinal;
    this.calificarDw();
    this.procesos.estado = 'culminada';
    const path = 'Cliente-dw/' + this.uid + '/proceso-duenio';
    const idDoc = this.procesos.id;
    console.log(path);
    console.log(idDoc);
    await this.registrarAccion(this.procesos, path, idDoc);
  }

  async calificacionDefault() {
    console.log('calificacionDefault ==> ', this.btncalificacion5);
    this.calificacion.valoracion = this.btncalificacion5;
    this.calificarDw();
    this.procesos.estado = 'culminada';
    const path = 'Cliente-dw/' + this.uid + '/proceso-duenio';
    const idDoc = this.procesos.id;
    console.log(path);
    console.log(idDoc);
    await this.registrarAccion(this.procesos, path, idDoc);
  }
}
