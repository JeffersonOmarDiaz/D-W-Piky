import { Component, OnInit } from '@angular/core';
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
export class Login1Component implements OnInit {

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
  rol: 'duenio',
}

  uid ='';
  emailGm = "";

  suscribreUserInfo: Subscription;

  clienter : Cliente []=[];
  loading: any;
  constructor(public  firebaseauthS: FirebaseauthService,
              public firestoreService:FirestoreService,
              private router: Router,
              public loadingController: LoadingController,) {

    this.firebaseauthS.stateAuth().subscribe( res => {
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
      rol:'duenio', 
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

  getUserInfo(uid :string){
    if(uid !== undefined){
      console.log('el id de que llega al getUSerInfo es: ',uid);
      const path = "Cliente-dw";
      this.suscribreUserInfo = this.firestoreService.getDoc<Cliente>(path,uid).subscribe( res => {
        this.cliente = res;
        console.log('La informacion del cliente es: ', this.cliente);
        //Para ingresar directo al rol asignado "home / home-paseador"
        if(this.cliente.rol === 'duenio'){
          window.location.assign('/home');
        }else if(this.cliente.rol === 'paseador'){
          window.location.assign('/home-paseador');
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
      /* this.router.navigate(['/home']); */
      window.location.assign('/home');
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
      await this.firestoreService.getCollection<Cliente>('Cliente-dw').subscribe(res => {
        this.clienter = res;
        console.log('Estos son los Clientes ', res);
        const recorreArray = (arr) => {
          for(let i=0; i<=arr.length-1; i++){
          console.log(arr[i].nombre);
          if(arr[i].uid === this.cliente.uid){
            console.log('hay una similitud'); 
            userExit = true;
            return;
          }
          }
        }
        recorreArray(res);
        if(userExit === true){
          console.log('Devolvió un true '); 
          //this.router.navigate(['/home']);
          window.location.assign('/home');
          return;
        }else{
          console.log('No existe el usuario se lo regsitrará '); 
          this.cliente.uid = uid;
          this.guardarUser();
        }
      });
      //console.log('El uid a usar capacitor es: ',this.cliente.uid);
      //this.guardarUser();
      //console.log(uid);
    }
    
  }
  
  
}
