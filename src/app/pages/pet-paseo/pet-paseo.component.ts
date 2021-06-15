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
  //INICIO Para capturar los datos de notificación de mascota
  clientNotifi: Cliente = {
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
  mascotaNotifi: Mascota []=[];
  mostrarDialogo: boolean;
  //FIN Para capturar los datos de notificación de mascota
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
  
  estado(checked: any, informacion: any){
    console.log('Esta desmarcado: ',checked.currentTarget.checked);
    if(!checked.currentTarget.checked){
      //console.log('Los datos de que se cargaran es: ',informacion);
      this.mascotaNotifi = informacion;
      this.clientNotifi.mascotas.push(informacion);
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
      recorreArray(this.clientNotifi.mascotas);
      this.clientNotifi.mascotas.splice(posicionArray, 1);
      //console.log(this.clientNotifi.mascotas);
    }
    console.log('La información para la notificación es: ',this.clientNotifi);
    if(this.clientNotifi.mascotas.length === 0){
      this.mostrarDialogo = false;
    }else{
      this.mostrarDialogo = true;
    }
  }
}
