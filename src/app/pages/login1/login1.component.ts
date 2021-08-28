import { Component, OnDestroy, OnInit } from '@angular/core';
import { Cliente } from 'src/app/modelBD';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';
import { Subscription } from 'rxjs';
import { FirestoreService } from 'src/app/services/firestore.service';
import { Router } from '@angular/router';

/* Importaciones para google movil */
import '@codetrix-studio/capacitor-google-auth';
import { Plugins } from '@capacitor/core';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-login1',
  templateUrl: './login1.component.html',
  styleUrls: ['./login1.component.scss'],
})
export class Login1Component implements OnInit, OnDestroy {

  cliente: Cliente = {
  uid: '',
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
}

  uid ='';
  emailGm = "";

  suscribreUserInfo: Subscription;
  suscribreUserInfoLogin: Subscription;
  suscribeAuthUser: Subscription;

  clienter : Cliente []=[];
  loading: any;
  constructor(public  firebaseauthS: FirebaseauthService,
              public firestoreService:FirestoreService,
              private router: Router,
              public loadingController: LoadingController,) {

    this.suscribeAuthUser = this.firebaseauthS.stateAuth().subscribe( res => {
      console.log('estado de autenticacion es: ',res);
      if (res !== null){
        this.uid = res.uid;
        this.emailGm = res.email;
        console.log('El email es: ', this.emailGm);
        this.getUserInfo(this.uid);
      }
      else{
        this.initCliente();
      }
    });
   }

  async ngOnInit() {
    const uid = await this.firebaseauthS.getUid();
    console.log('Un id enviado es: ',uid);
    this.initCliente();
  }

  ngOnDestroy(){
    console.log('ngOnDestroy() ==> Login');
    if(this.suscribreUserInfo){
      this.suscribreUserInfo.unsubscribe();
    }
    if(this.suscribreUserInfoLogin){
      this.suscribreUserInfoLogin.unsubscribe();
    }
    if(this.suscribeAuthUser){
      this.suscribeAuthUser.unsubscribe();
    }
  }

  initCliente() {
    this.uid = '';
    this.cliente = {
      uid: '',
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
      role:'duenio', 
      estadoPaseador: 'inActivo',
    }
  }

  async logueoAuth (){
    let SMSerror = '';
    await this.firebaseauthS.GoogleAuth().then( res => {
      console.log('Todo a ido de maravilla ', res);
      console.log('trata de obtener el correo: ',res.user.email);
      this.emailGm = res.user.email;
    }).catch( err => {
      SMSerror = err;
      console.log('error de autenticación ', err);
    });
    if (SMSerror === '') {
      const uid = await this.firebaseauthS.getUid();
      this.cliente.uid = uid //aqui se le asigna id al registro 
      this.guardarUser();
      console.log(uid);
    }else{
      console.log('Ocurrio un error: -> sms lleno');
    }
    
  }

  async getUserInfo(uid :string){
    if(uid !== undefined){
      console.log('el id de que llega al getUSerInfo es: ',uid);
      const path = "Cliente-dw";
      this.suscribreUserInfo = this.firestoreService.getDoc<Cliente>(path,uid).subscribe( res => {
        this.cliente = res;
        console.log('La informacion del cliente es: ', this.cliente);
        //Para ingresar directo al rol asignado "home / home-paseador"
        if(this.cliente != undefined){
          if(this.cliente.role === 'duenio'){
            this.router.navigate(['/home'], { replaceUrl: true });
            console.log('el rol es dueño');
          }else if(this.cliente.role === 'paseador'){
            this.router.navigate(['/home-paseador'], { replaceUrl: true });
            console.log('el rol es paseador');
          }
        }
        //Para ingresar directo al rol asignado "home / home-paseador"
      });
    }
  }

  async guardarUser() {
    const path = 'Cliente-dw';
    this.cliente.email = this.emailGm; 
    console.log('El correo que llega para guardar es: ', this.cliente.email);
    console.log('La información del cliente a guardar es: ',this.cliente.uid);
    await this.firestoreService.createDoc(this.cliente, path, this.cliente.uid).then(res => {
      this.router.navigate([`/home`], { replaceUrl: true });
      /* window.location.assign('/home'); */
      console.log('CLIENTE Guardado con exitos!!!');
    }).catch(error => {
      console.log('No se pudo guardar el a ocurrido un error ->', error);
    });
  }

  async presentLoading(sms:string) {
    this.loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: sms,
      duration: 3000
    });
    await this.loading.present();
    /* const { role, data } = await loading.onDidDismiss();
    console.log('Loading dismissed!'); */
  }

  salir(){
    this.firebaseauthS.logout();
    this.suscribreUserInfo.unsubscribe();
    this.initCliente();
  }

  /* Funcion para logue google */
  async googleSignup() {
    let errorSms = '';
    await this.firebaseauthS.autenticacionGoogle().then(res => {
      this.presentLoading('Iniciando...');
      console.log('my user: ', res);
      console.log('Las caracteristicas del usuario son : -->', res.email);
      this.emailGm = res.email;
    }).catch( err =>{
      errorSms = err;
      console.log('El error de ATH es: --->: ',err);
    });
    if(errorSms === ''){
      const uid = await this.firebaseauthS.getUid();
      let userExit = false;
      this.cliente.uid = uid;
      this.suscribreUserInfoLogin = this.firestoreService.getCollection<Cliente>('Cliente-dw').subscribe(res => {
        this.clienter = res;
        console.log('Estos son los Clientes ', res);
        const recorreArray = (arr) => {
          for(let i=0; i<=arr.length-1; i++){
          console.log(arr[i].nombre);
          console.log('this.cliente.uid ==>',this.cliente.uid);
          if(arr[i].uid === this.cliente.uid){
            console.log('hay una similitud'); 
            userExit = true;
            return;
          }
          }
        }
        if(this.cliente != undefined){
          recorreArray(res);
        }
        if(userExit === true){
          console.log('Devolvió un true ');
          this.router.navigate([`/home`], { replaceUrl: true });
          return;
        }else{
          console.log('No existe el usuario se lo registrará '); 
          if(this.cliente != undefined){
            this.cliente.uid = uid;
            this.guardarUser();
          }
        }
      });
    }
    
  }
  
  
}
