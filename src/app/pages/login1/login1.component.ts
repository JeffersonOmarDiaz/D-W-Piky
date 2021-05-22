import { Component, OnInit } from '@angular/core';
import { Cliente } from 'src/app/modelBD';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';
import { Subscription } from 'rxjs';
import { FirestoreService } from 'src/app/services/firestore.service';
import { Router } from '@angular/router';

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
}

  uid ='';
  emailGm = "";

  suscribreUserInfo: Subscription;
  constructor(public  firebaseauthS: FirebaseauthService,
              public firestoreService:FirestoreService,
              private router: Router) {

    this.firebaseauthS.stateAuth().subscribe( res => {
      console.log('estado de autenticacion es: ',res);
      if (res !== null){
        this.uid = res.uid;
        this.emailGm = res.email;
        this.getUserInfo(this.uid);
      }
      //else{
        //this.initCliente();
      //}
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
    }
  }

  async logueoAuth (){
    await this.firebaseauthS.GoogleAuth().then( res => {
      console.log('Todo a ido de maravilla ', res);
      console.log('trata de obtener el correo: ',res.user.email);
      this.emailGm = res.user.email;
      /* this.guardarUser(); */
    }).catch( err => {
      console.log('error de autenticación ', err);
    });
    const uid = await this.firebaseauthS.getUid();
      this.cliente.uid = uid //aqui se le asigna id al registro 
    this.guardarUser();
      console.log(uid);
  }

  getUserInfo(uid :string){
    if(uid !== undefined){
      console.log('el id de que llega al getUSerInfo es: ',uid);
    }
    const path = "Cliente-dw";
    this.suscribreUserInfo = this.firestoreService.getDoc<Cliente>(path,uid).subscribe( res => {
      this.cliente = res;
      console.log('La informacion del cliente es: ', this.cliente);
    });
  }

  async guardarUser() {
    const path = 'Cliente-dw';
    this.cliente.email = this.emailGm;
    console.log('La información del cliente a guardar es: ',this.cliente.uid);
    await this.firestoreService.createDoc(this.cliente, path, this.cliente.uid).then(res => {
      this.router.navigate(['/home']);
      
      console.log('CLIENTE Guardado con exitos!!!');
    }).catch(error => {
      console.log('No se pudo guardar el a ocurrido un error ->', error);
    });
  }

  salir(){
    this.firebaseauthS.logout();
    this.suscribreUserInfo.unsubscribe();
  }
}
