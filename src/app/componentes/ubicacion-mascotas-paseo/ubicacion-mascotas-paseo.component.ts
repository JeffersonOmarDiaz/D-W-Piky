import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Calificacion, Cliente, Ofrecer, Solicitud } from 'src/app/modelBD';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-ubicacion-mascotas-paseo',
  templateUrl: './ubicacion-mascotas-paseo.component.html',
  styleUrls: ['./ubicacion-mascotas-paseo.component.scss'],
})
export class UbicacionMascotasPaseoComponent implements OnInit, OnDestroy {

  @Input() infoDuenio: Solicitud;
  @Input() infoPaseador: Cliente;
  btnTiempo = true;
  btnFuera = true;
  btnPaseando = false;
  btnDisponible = true;
  btnPaseoFinalizado = false;
  ClientePaseo: Cliente;
  estadoProceso : Solicitud;
  estadoCincoMin = 'Llego en 5 minutos';
  estadoDiezMin = 'Llego en 10 minutos';
  estadoFuera = 'Estoy fuera';
  estadoFinalizado = 'Paseo Finalizado';
  estadoNoActivo = 'Ya no estoy activo';
  estadoPaseando = 'Paseando';
  verMascotasList = false;
  ofertas: Ofrecer; 
  suscribeInfoPaseador: Subscription;

  //Calificacione Modelo
  calificacion: Calificacion = {
    id: '',
    fecha: new Date,
    comentario: '',
    valoracion: 5
}
  constructor(public modalController: ModalController,
              public firestoreService: FirestoreService,
              public toastController: ToastController,
            )
  { }

  ngOnInit() {
    console.log('datosDuenio ->', this.infoDuenio);
    this.estadoProceso = this.infoDuenio;
    console.log('datos Paseador ->', this.infoPaseador);
    
    this.btnsEstados();
  }

  ngOnDestroy(){
    console.log('ngOnDestroy() ubicacion mascotas');
    if(this.suscribeInfoPaseador){
      this.suscribeInfoPaseador.unsubscribe();
    }
  }


  async btnEstados(estado: string){
    // console.log('btnLlegoEn() ',estado);
    if(estado === 'Llego en 5 minutos'){
      this.estadoProceso.estado = 'Llego en 5 minutos';
    }else if(estado === 'Llego en 10 minutos'){
      this.estadoProceso.estado = 'Llego en 10 minutos';
    }else if(estado === 'Estoy fuera'){
      this.btnTiempo = false;
      this.estadoProceso.estado = 'Estoy fuera';
    }else if(estado === 'Paseo Finalizado'){
      this.estadoProceso.estado = 'Paseo Finalizado';
    }else if(estado === 'Ya no estoy activo'){
      this.estadoProceso.estado = 'Ya no estoy activo';
    }else if(estado === 'Paseando'){
      this.estadoProceso.estado = 'Paseando';
      this.btnTiempo = false;
      this.btnFuera = true;
      this.btnPaseando = true;
      this.btnDisponible = false;
      this.btnPaseoFinalizado = true;
    }else if(estado === 'Paseo Finalizado'){
      this.estadoProceso.estado = 'Paseo Finalizado';
    }
    console.log('btnEstados() ',this.estadoProceso.estado);
    //Para modificar paseador
    const uidDw = this.infoPaseador.uid;
    const idDoc = this.infoDuenio.id;
    const pathDW = 'Cliente-dw/' + uidDw + '/procesos-dw';
    this.modificarEstadosBD(this.estadoProceso, pathDW, idDoc);
    //Para modificar Dueño
    const uidDuenio = this.infoDuenio.duenio.uid;
    const idDocDuenio = this.infoDuenio.id;
    const pathDuenio = 'Cliente-dw/' + uidDuenio + '/proceso-duenio';
    
    if(estado === 'Paseo Finalizado'){
      this.estadoProceso.estado = 'Paseo Finalizado'
      await this.obtenerDocDuenio();
      await this.crearCalificacion();
    }else{
      await this.obtenerDocDuenio();
    }
    
  }

  async crearCalificacion(){
    console.log('crearCalificacion()');
    const uidDw = this.infoPaseador.uid;
    const id = this.infoDuenio.id;
    const path = 'Cliente-dw/'+ uidDw + '/calificaciones';
    this.calificacion.id = id;
    this.calificacion.valoracion;
    const data = this.calificacion;
    await this.firestoreService.createDoc(data, path, id).then(() => {
      this.modalController.dismiss();
      
      const smsExito = "!Paseo concluido con éxito¡";
      console.log(smsExito);
      this.presentToast(smsExito, 2500);
      
    });
  }
  async obtenerDocDuenio(){
    const uidDuenio = this.infoDuenio.duenio.uid;
    const idDocDuenio = this.infoDuenio.id;
    const pathDuenio = 'Cliente-dw/' + uidDuenio + '/proceso-duenio';
    console.log(pathDuenio);
    console.log(uidDuenio);
    this.suscribeInfoPaseador = this.firestoreService.getDoc<Ofrecer>(pathDuenio, idDocDuenio).subscribe( res => {
      this.ofertas = res;
      console.log(this.ofertas);
      this.ofertas.estado = this.estadoProceso.estado;
      this.modificarEstadosBD(this.ofertas, pathDuenio, idDocDuenio);
      this.suscribeInfoPaseador.unsubscribe();
      return;
    });
  }

  async modificarEstadosBD(data: any, path: string, id: string){
    await this.firestoreService.createDoc(data, path, id).then(() => {
      this.modalController.dismiss();
      
      const smsExito = "!Respuesta enviada¡";
      console.log(smsExito);
      this.presentToast(smsExito, 2500);
      
    });
  }

  async presentToast(mensaje: string, tiempo: number) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: tiempo 
    });
    toast.present();
  }

  initOfertas() {
    this.ofertas = {
      id: '',
      fecha: new Date,
      paseador: this.ClientePaseo,
      valor: null,
      estado: 'nueva',
      ubicacion: {
        lat: null,
        lng: null,
        direccion: '',
      },
    }
  }

  verMascotas(ver: boolean){
    this.verMascotasList = ver;
  }

  async btnsEstados(){
    console.log('btnsEstados()');
    if(this.infoDuenio.estado === 'Llego en 10 minutos' || this.infoDuenio.estado === 'Llego en 5 minutos'){
      this.btnTiempo = true;
    }else if(this.infoDuenio.estado === 'Estoy fuera'){
      this.btnTiempo = false;
      this.btnPaseando = true;
    }else if(this.infoDuenio.estado === 'Paseando'){
      this.btnTiempo = false;
      this.btnFuera = false;
      this.btnPaseando = false;
      this.btnDisponible = false;
      this.btnPaseoFinalizado = true;
    }
  }
}
