import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Cliente, Mascota, Solicitud } from 'src/app/modelBD';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-pet-paseo',
  templateUrl: './pet-paseo.component.html',
  styleUrls: ['./pet-paseo.component.scss'],
})
export class PetPaseoComponent implements OnInit {
 
  verMC = true;

  uid = '';
  suscribreUserInfo: Subscription;
  numMascotaPaseo = 0;
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
  
  clienteMascota : Mascota []=[];
  //INICIO Para capturar los datos de notificación de mascota
  clientNotifiTemp: Cliente = {
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
  mascotaNotifi: Mascota []=[];
  mostrarDialogo: boolean;

  suscribreUserInfoRol: Subscription;
  suscribreUser: Subscription;
  rolDuenio:boolean;
  llenarSolicitudPaseo: boolean;
  mascotasNotificacionTemp : Mascota []=[];
  tarifaMinima = 2;
  tiempoPaseo : number;
  observacionesPaseo: '';
  valorPagoRef= 0;
  valorIngresadoDuenio: number;
  //FIN Para capturar los datos de notificación de mascota
  direccionSolicitud = '';
  loading: any;
  solicitud: Solicitud; 
  //Para mostar mensaje si no hay mascotas
  listaMascotas = false;
  constructor(public firebaseauthS: FirebaseauthService,
              public firestoreService: FirestoreService,
              private router: Router,
              public toastController: ToastController,
              public loadingController: LoadingController,) { }

  ngOnInit() {
    this.tipoRol();
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
              // if(res.role === 'paseador'){
              //   this.rolDuenio = false;
              //   this.router.navigate([`/home-paseador`], { replaceUrl: true });
              //   return true;
              // }else{
                this.rolDuenio = true;
                this.getUserInfo(this.uid);
              //   return false;
              // }
            });
        return;
      }
    });
    return false;
  }

  getUserInfo(uid :string){
    if(uid !== undefined){
      console.log('el id de que llega al getUSerInfo es: ',uid);
    }
    console.log('Suscrito a  la info');
    const path = "Cliente-dw";
    this.suscribreUser = this.firestoreService.getDoc<Cliente>(path,uid).subscribe( res => {
      this.cliente = res;
      this.clienteMascota = res.mascotas;
      console.log('La informacion del cliente es: ', this.cliente);
      if(this.cliente.ubicacion != null){
        this.direccionSolicitud = this.cliente.ubicacion.direccion;
      }
      if(this.clienteMascota.length > 0){
        console.log('No esta recistrada ninguna mascota');
        this.listaMascotas = true;
      }
      console.log('La informacion de las mascotas cliente es: ', this.clienteMascota.sort(((unaMascota, otraMascota) => unaMascota.nombre.localeCompare( otraMascota.nombre))) );
    });
    return;
  }
  
  estado(checked: any, informacion: any){
    console.log('Esta desmarcado: ',checked.currentTarget.checked);
    if(!checked.currentTarget.checked){
      //console.log('Los datos de que se cargaran es: ',informacion);
      this.mascotaNotifi = informacion;
      this.clientNotifiTemp.mascotas.push(informacion);
    }else if(checked.currentTarget.checked){
      let idMascota = '';
      let posicionArray = null;
      const recorreArray = (arr) => {
        for(let i=0; i<=arr.length-1; i++){
          idMascota = arr[i].id;
          if(arr[i].id === informacion.id){
            posicionArray = i;
          return;
        }
        }
      }
      recorreArray(this.clientNotifiTemp.mascotas);
      this.clientNotifiTemp.mascotas.splice(posicionArray, 1);
      //console.log(this.clientNotifi.mascotas);
    }
    this.cliente.mascotas = this.clientNotifiTemp.mascotas;
    console.log('Información del cliente solicitud ==> ', this.cliente);
    console.log('La información que esta cargando es: ', this.cliente.ubicacion.direccion);
    //console.log('La información para la notificación es: ',this.clientNotifi);
    if(this.clientNotifiTemp.mascotas.length === 0){
      this.mostrarDialogo = false;
    }else{
      this.mostrarDialogo = true;
      this.numMascotaPaseo = this.clientNotifiTemp.mascotas.length;
    }
  }

  btnSolicitarPaseo(){
    if(this.numMascotaPaseo > 4){
      this.presentToast('Solo puede pasear un maximo de 4 mascotas', 4000);
      this.llenarSolicitudPaseo = false;
    }else{
      console.log('Generando solicitud de paseo...');
      this.llenarSolicitudPaseo = true;
      this.initSolicitud();
    }
   // this.llenarSolicitudPaseo = false;
  }

  async presentToast(mensaje: string, tiempo: number) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: tiempo 
    });
    toast.present();
  }

  async calcularPagoRef(){
    //let tiempoPaseo = 1;
    await console.log('Tiempo paseo ',  await this.tiempoPaseo);
    this.valorPagoRef= (this.tiempoPaseo * this.numMascotaPaseo * this.tarifaMinima);
    console.log('calcularPagoRef()  ==>', this.valorPagoRef);
  }

  async generarSolicitudBD(){
    if(this.tiempoPaseo != 0 && this.tiempoPaseo != undefined){
      console.log('PAgo del cliente ==> ', this.valorIngresadoDuenio);
      console.log('Observa  =>> ', this.solicitud.observacion);
      console.log('Tiempo de paseo', this.tiempoPaseo);
      if(this.valorIngresadoDuenio < this.valorPagoRef || this.valorIngresadoDuenio === undefined){
        console.log("El valor debe ser superior o igual al referencial");
        console.log('PAgo del cliente ==> ', this.valorIngresadoDuenio);
        this.presentToast('¡El valor a cancelar debe ser igual o superior al referencial!', 2500);
      }else{
       await this.presentLoading();
        console.log('SE va ha generar una nueva solicitud');
        this.solicitud.numMascotas = this.numMascotaPaseo;
        console.log('número de mascotas a pasear: ', this.solicitud.numMascotas);
        //this.solicitud.duenio = this.cliente; //ok individual
        this.solicitud.duenio = Object.assign({}, this.cliente);
        // this.solicitud.mascotasPaseo = this.clientNotifiTemp.mascotas;
        this.solicitud.mascotasPaseo = Object.assign({}, this.clientNotifiTemp.mascotas); //funciona en esta forma
        this.solicitud.tiempo = Number(this.tiempoPaseo);
        //this.solicitud.tiempo = Object.assign({},Number(this.tiempoPaseo));
        this.solicitud.valor = this.valorIngresadoDuenio;
        //this.solicitud.valor = Object.assign({}, this.valorIngresadoDuenio);
        
        //this.solicitud.observacion = Object.assign({}, this.observacionesPaseo);
        this.solicitud.direccion = this.cliente.ubicacion.direccion;
        //this.solicitud.direccion = Object.assign({}, this.cliente.ubicacion.direccion);
        this.solicitud.id = this.firestoreService.getId();
        //this.solicitud.id = Object.assign({}, this.firestoreService.getId());
        const idSolicitud = this.solicitud.id;
        
        const path = 'Cliente-dw/' + this.uid + '/solicitudes/';
        console.log(' solicitar() ->', this.solicitud, path, idSolicitud);
        await this.firestoreService.createDoc(this.solicitud, path, idSolicitud).then ( ()=>{
          console.log('!Solicitud generada de forma exitosa!');
          this.presentToast('!Solicitud generada de forma exitosa!', 2500);
          // url pendiente de revisar
          this.router.navigate([`/solicitudes`], { replaceUrl: true });
          this.dismissLoading();
          });
        }
      }else{
        console.log('Escoja un tiempo de paseo', this.tiempoPaseo);
        this.presentToast('¡Escoja un tiempo de paseo!', 2500);
      }
  }

  async dismissLoading() {
    await this.loading.dismiss();
  }

  async presentLoading() {
    this.loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Generando Solicitud...',
    });
    await this.loading.present();
  }

  cancelarSolicitud(){
    console.log('cancelarSolicitud()');
    this.numMascotaPaseo =0; 
    this.valorPagoRef =0;
    this.tiempoPaseo = 0;
    this.observacionesPaseo = "";
    this.clientNotifiTemp.mascotas= [];
    this.mostrarDialogo = false;
    this.llenarSolicitudPaseo = false;
    this.valorIngresadoDuenio =0;
  }

  async initSolicitud(){
    console.log('initSolicitud()');
    this.solicitud = {
      id: '',
      fecha: new Date,
      duenio: this.cliente,
      mascotasPaseo: this.clientNotifiTemp.mascotas,
      numMascotas: null,
      tiempo: null,
      valor: null,
      observacion: '',
      direccion: '',
      // ubicacion: null,
      estado : 'nueva',
    }

  }
  
}
