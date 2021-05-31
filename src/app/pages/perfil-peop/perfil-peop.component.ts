import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Cliente } from 'src/app/modelBD';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
/* Importación para retroceso en dispositivo físico */
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-perfil-peop',
  templateUrl: './perfil-peop.component.html',
  styleUrls: ['./perfil-peop.component.scss'],
})
export class PerfilPeopComponent implements OnInit {

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

  uid = '';
  emailGm = '';
  suscribreUserInfo: Subscription;
  constructor(public firestoreService:FirestoreService,
              public  firebaseauthS: FirebaseauthService,
              private platform: Platform,) {
    this.firebaseauthS.stateAuth().subscribe( res => {
      console.log('estado de autenticacion es: ',res);
      if (res !== null){
        this.uid = res.uid;
        this.emailGm = res.email;
        this.getUserInfo(this.uid);
      }
    });
    this.platform.backButton.subscribeWithPriority(10, () => {
      console.log('Handler was called!');
    });
   }

  ngOnInit() {}


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
}
