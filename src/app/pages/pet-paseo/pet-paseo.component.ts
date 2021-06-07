import { Component, OnInit } from '@angular/core';
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
  };
  
  clienteMascota : Mascota []=[];
  constructor(public firebaseauthS: FirebaseauthService,
              public firestoreService: FirestoreService,) { 
    this.firebaseauthS.stateAuth().subscribe( res => {
      console.log('estado de autenticacion es: ',res);
      if (res !== null){
        this.uid = res.uid;
        this.getUserInfo(this.uid);
      }
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
      this.clienteMascota = res.mascotas;
      console.log('La informacion del cliente es: ', this.cliente);
      console.log('La informacion de las mascotas cliente es: ', this.clienteMascota);
    });
    return;
  }
}
