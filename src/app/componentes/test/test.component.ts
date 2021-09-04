///Ejemplo uno
import { Component, OnInit } from '@angular/core';
import { Cliente, Mascota } from 'src/app/modelBD';
import { FirestoreService } from 'src/app/services/firestore.service';
@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
})
export class TestComponent implements OnInit {
  clienteSinvariable: Cliente;
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
  };
  arrelgoClientes: Cliente[]=[
    // {
    //   uid: '1',
    // email: 'omar@gmail.com',
    // celular: '0987654321',
    // foto: '',
    // referncia: 'Casa de dos pisos',
    // ubicacion: {
    //     lat: null,
    //     lng: null,
    //     direccion: 'calle princiál' 
    //    },
    // edad: 24,
    // nombre: 'Omar',
    // apellido: 'Dúaz',
    // cedula: '1723718600',
    // mascotas: [],
    // role: 'paseador',
    // estadoPaseador: 'activo',
    // },
    // {
    //   uid: '2',
    // email: 'estaf@gmail.com',
    // celular: '0987654321',
    // foto: '',
    // referncia: 'Casa color azul',
    // ubicacion: {
    //     lat: null,
    //     lng: null,
    //     direccion: 'calle la j' 
    //    },
    // edad: 24,
    // nombre: 'Estafanía',
    // apellido: 'Aguilar',
    // cedula: '1723718600',
    // mascotas: [],
    // role: 'duenio',
    // estadoPaseador: 'inActivo',
    // }
  ];
  // constructor(public firestoreService: FirestoreService) { }

  mascotas: Mascota [] = [{
    foto: 'mimascota.png',
    nombre: 'Toby',
    edad: 3,
    sexo: 'Macho',
    tamanio: 'Grande',
    agresivo: 'no',
    id: '1234',
    fechaCreacionMas: new Date,
    idDuenio: '122345',
  },
  {
    foto: 'mimascota2.png',
    nombre: 'Pupo',
    edad: 5,
    sexo: 'Macho',
    tamanio: 'Grande',
    agresivo: 'si',
    id: '12343',
    fechaCreacionMas: new Date,
    idDuenio: '122345',
  }
];

duenio: Cliente = {
    uid: '1',
    email: 'omar@gmail.com',
    celular: '0987654321',
    foto: '',
    referncia: 'Casa de dos pisos',
    ubicacion: {
        lat: null,
        lng: null,
        direccion: 'CAlle Principal' 
       },
    edad: 24,
    nombre: 'Omar',
    apellido: 'Díaz',
    cedula: '1723718605',
    mascotas: [],
    role: 'duenio',
    estadoPaseador: 'inActivo',
  };

  ngOnInit() {
  }
  // enviarID(pos: string, array : any){
  //   let posicionArray = null;
  //   const recorreArray = (arr) => {
  //     for(let i=0; i<=arr.length-1; i++){
  //       console.log(arr[i].nombre);
  //       if(arr[i].id === pos){
  //         console.log('Eliminará la pocición: ', i); 
  //         posicionArray = i;
  //         this.firestoreService.setParametrosArrayMascota(posicionArray);
  //       return;
  //     }
  //     }
  //     posicionArray = null;
  //   }
  //   recorreArray(array);
  // }

  ///Ejemlo 2 
inicioClientes(){
  
  this.arrelgoClientes[0] ={
    uid: '1',
    email: 'omar@gmail.com',
    celular: '0987654321',
    foto: '',
    referncia: 'Casa de dos pisos',
    ubicacion: {
        lat: null,
        lng: null,
        direccion: 'CAlle Principal' 
       },
    edad: 24,
    nombre: 'Omar',
    apellido: 'Díaz',
    cedula: '1723718605',
    mascotas: [],
    role: 'duenio',
    estadoPaseador: 'inActivo',
  };

  this.arrelgoClientes[1] = {
    uid: '2',
    email: 'estaf@gmail.com',
    celular: '0987654321',
    foto: '',
    referncia: 'Casa color azul',
    ubicacion: {
        lat: null,
        lng: null,
        direccion: 'calle la j' 
       },
    edad: 24,
    nombre: 'Estafanía',
    apellido: 'Aguilar',
    cedula: '1723718600',
    mascotas: [],
    role: 'duenio',
    estadoPaseador: 'inActivo',
  };
  return this.dataCliente(this.arrelgoClientes);
}

dataCliente(clientes: Cliente[]){
  return clientes;
}

///Logueo de clientnes
isAuthenticated(): boolean {
  return !!localStorage.getItem('token');
}

needsLogin() {
  return !this.isAuthenticated();
}

registroMascotas(){
  this.duenio.mascotas = this.mascotas;
  return this.mascotas;
}
}



