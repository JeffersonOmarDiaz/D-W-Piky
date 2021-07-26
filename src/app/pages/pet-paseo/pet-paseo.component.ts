import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Cliente, Mascota } from 'src/app/modelBD';
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
    role: 'duenio'
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
    role: 'duenio'
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
  observacionesPaseo: string;
  valorPagoRef: number;
  //FIN Para capturar los datos de notificación de mascota
  constructor(public firebaseauthS: FirebaseauthService,
              public firestoreService: FirestoreService,
              private router: Router,
              public toastController: ToastController,) { }

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
              if(res.role === 'paseador'){
                this.rolDuenio = false;
                this.router.navigate([`/home-paseador`], { replaceUrl: true });
                return true;
              }else{
                this.rolDuenio = true;
                this.getUserInfo(this.uid);
                return false;
              }
            });
        return;
      }
    });
    return false;
  }

  getUserInfo(uid :string){
    if(uid !== undefined){
      console.log('el id de que llega al getUSerInfo es: ',uid);
      //return;
    }
    console.log('Suscrito a  la info');
    const path = "Cliente-dw";
    this.suscribreUser = this.firestoreService.getDoc<Cliente>(path,uid).subscribe( res => {
      this.cliente = res;
      this.clienteMascota = res.mascotas;
      console.log('La informacion del cliente es: ', this.cliente);
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
    console.log('Información del cliente ==> ', this.cliente);
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
      console.log('Generando solicitud de paseo');
      this.llenarSolicitudPaseo = true;
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

  generarSolicitudBD(){
    //console.log('generarSolicitudBD() ', this.tiempoPaseo);
    console.log('');
  }
  cancelarSolicitud(){
    this.numMascotaPaseo =0; 
    this.valorPagoRef =0;
    this.tiempoPaseo = 0;
    this.observacionesPaseo = "";
    this.clientNotifiTemp.mascotas= [];
    this.mostrarDialogo = false;
    this.llenarSolicitudPaseo = false;
  }
  
}
