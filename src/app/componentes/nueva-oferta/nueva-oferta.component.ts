import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, Input, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { Plugins } from '@capacitor/core';

import { GooglemapsService } from './../../googlemaps/googlemaps.service';
import { Cliente, Mascota, Ofrecer, Solicitud } from 'src/app/modelBD';
import { FirestoreService } from 'src/app/services/firestore.service';
import { Subscription } from 'rxjs';
const {Geolocation} = Plugins;
declare var google: any;


interface Marker {
  position: {
    lat: number,
    lng: number,
  };
  title: string;
}
@Component({
  selector: 'app-nueva-oferta',
  templateUrl: './nueva-oferta.component.html',
  styleUrls: ['./nueva-oferta.component.scss'],
})
export class NuevaOfertaComponent implements OnInit, OnDestroy {

  //coordenadas quito para abrir con una posición pre cargada
  @Input() position = {
    lat: -0.220081,
    lng: -78.5142586,
    direccion : "Sebastián de Benalcázar N3-45"
  };

  label = {
    //para información sobre el marcador
    titulo: 'Ubicación',
    subtitulo: 'Casa de mascotas'
  };

  map= null; //para el mapa
  // marker: any; //posicion del marker
  // infowindow: any; //seccion donde aparece ubicacion, ubicacion de envio
  // positionSet: any; //posicion en donde se queda guardado la posicion

  // @ViewChild('map') divMap: ElementRef; //para decir donde estará el mapa en el html se debe importar hace refencia al div map
  //dirección visual
  // geocoder: any;
  //validad detro de Quito - Ecuador
  // dentroQuito = false;
  // nuevaDir = '';

  @Input() infoDuenio: Solicitud;
  mascotas: Mascota [];
  ofertaFinal = null;
  adcional1 = 0;
  adcional2 = 0;
  adcional3 = 0;
  adcional4 = 0;
  @Input () infoPaseador: Cliente;
  
  paseadorOfertar:Cliente ={
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
  };
  ofertar: Ofrecer ={
    id: '',
    fecha: new Date,
    paseador: this.paseadorOfertar,
    valor: null,
    estado: 'proceso'
  }
  
  @Input() positionPaseador ={
    lat: null,
    lng: null,
  }

  
  directionsService: any;
  directionsDisplay: any;
  verGuia = false;
  datosGuia : any;
  suscribtionOfertas: Subscription;
  idOferta: string;
  constructor(private renderer: Renderer2,
              @Inject(DOCUMENT) private document, 
              private googlemapsService: GooglemapsService, 
              public modalController: ModalController,
              public toastController: ToastController,
              public firestoreService: FirestoreService,
) { }

ngOnInit(): void{
  this.init();

  console.log('position ->', this.position);
  console.log('datosDuenio ->', this.infoDuenio);
  console.log('Ubicación Actual del paseador ->', this.positionPaseador);
  this.cargaMascotas();
  // this.mylocation();
  // this.loadMap();
  
}

ngOnDestroy(){
  if(this.suscribtionOfertas){
    this.suscribtionOfertas.unsubscribe();
  }
}

loadMap() {
  // create a new map by passing HTMLElement
  const mapEle: HTMLElement = document.getElementById('map');
  const indicatorsEle: HTMLElement = document.getElementById('indicators');
  // create LatLng object
  // const myLatLng = {lat: 4.658383846282959, lng: -74.09394073486328};
  // create map
  this.map = new google.maps.Map(mapEle, {
    center: this.positionPaseador,
    zoom: 12,
    disableDefaultUI: true,
    clickableIcons: true,
  });

  this.directionsDisplay.setMap(this.map);
  this.directionsDisplay.setPanel(indicatorsEle);
  google.maps.event.addListenerOnce(this.map, 'idle', () => {
    mapEle.classList.add('show-map');
    this.calculateRoute();
    // this.renderMarkers();
    // const marker = {
    //   position: {
    //     lat: 4.658383846282959, 
    //     lng: -74.09394073486328
    //   },
    //   title: 'punto uno'
    //   };
    // this.addMarker(marker);
  });
}


async verInidicaciones(entrada: boolean){
  this.verGuia = entrada;
  await this.init();
  this.directionsDisplay.setDirections(this.datosGuia);
  console.log('verInidicaciones, datos Guia: ==> ', this.datosGuia);
}

private calculateRoute() {
  this.directionsService.route({
    origin: this.positionPaseador,
    destination: this.position,
    travelMode: google.maps.TravelMode.WALKING,
  }, (response, status)  => {
    if (status === google.maps.DirectionsStatus.OK) {
      this.directionsDisplay.setDirections(response);
      this.datosGuia = response;
      console.log('CAlculando Ruta ==> ', response);
    } else {
      alert('No se pudo calcular la ruta: ' + status);
    }
  });
}

// renderMarkers() {
//   this.markers.forEach(marker => {
//     this.addMarker(marker);
//   });
// }

// addMarker(marker: Marker) {
//   return new google.maps.Marker({
//     position: marker.position,
//     map: this.map,
//     title: marker.title
//   });
// }

cargaMascotas(){
  console.log('Las mascotas son: ==>', this.infoDuenio.mascotasPaseo);
  this.mascotas = this.infoDuenio.mascotasPaseo;

  this.adcional1 = this.infoDuenio.valor+1;
  this.adcional2 = this.infoDuenio.valor+1.5;
  this.adcional3 = this.infoDuenio.valor+2;
  
}

async init(){
  this.googlemapsService.init(this.renderer, this.document).then( ()=>{
    this.directionsService = new google.maps.DirectionsService();
    this.directionsDisplay = new google.maps.DirectionsRenderer();  
    this.loadMap();
  }).catch( (err) =>{
    console.log(err);
  });
}

// initMap() {

//   const position = this.position;

//   let latLng = new google.maps.LatLng(position.lat, position.lng);
//   //Add by omar
//   this.geocoder = new google.maps.Geocoder();
//   let mapOptions = {
//         center: latLng,
//         zoom: 15,
//         disableDefaultUI: true,
//         clickableIcons: false,
//   };

//   this.map = new google.maps.Map(this.divMap.nativeElement, mapOptions);
//   this.marker = new google.maps.Marker({
//         map: this.map,
//         animation: google.maps.Animation.DROP,
//         // draggable: false,
//   });
//   this.clickHandleEvent();
//   this.infowindow = new google.maps.InfoWindow();
//   this.addMarker(position);
//   this.setInfoWindow(this.marker, this.label.titulo, this.label.subtitulo);
//   this.geocodePosition(this.marker.getPosition());
// }

// async geocodePosition(pos){
// //Para las direcciones de las calles
// console.log('geocodePosition ');
// this.geocoder.geocode({
//   latLng: pos
// }, (responses)=>{
//   if(responses && responses.length > 0){
//     this.position.direccion=responses[0].formatted_address;
//     console.log('La dirección es: ', this.position.direccion);
//     this.nuevaDir = this.position.direccion;
//     this.validaCuidadQuito(this.position.direccion);
    
//     return this.nuevaDir;
//   }else{

//   }
// });

// }

//para saber si esta dentro de quito
// async validaCuidadQuito(direccion: string) {
//   let arrPais = direccion.split(',');
//   //dividir la cadena de texto por una coma
//   console.log(arrPais);
//   let paisObtenido =arrPais[arrPais.length-1].toUpperCase();
//   let arrCiudad = arrPais[arrPais.length-2].toUpperCase();
//   console.log(paisObtenido);
//   if(paisObtenido ==' ECUADOR'){
//     console.log('Se encuentra dentro de ecuador');
//     //Cuidad obternida
//     let ciudadObtenida = arrCiudad.split(' ');
//     console.log(ciudadObtenida);
//     ciudadObtenida.forEach(elemento =>{
//       if(elemento === 'QUITO'){
//         console.log('Se encuentra dentro Quito - Ecuador');
//        this.dentroQuito = true;
//        this.position.direccion = arrPais[0];
//        return;
//       }else{
//       }
//     });
//   }else{
//     console.log('Falso quito');
//     this.dentroQuito = false;
//   }
  
// }



// clickHandleEvent(){
//   console.log('Evento clic');
//   this.map.addListener( 'click', (event: any) =>{
//     const position = {
//       lat: event.latLng.lat(),
//       lng: event.latLng.lng(),
//       direccion: this.nuevaDir,
//     };
//     console.log(position.lat);
//     // this.addMarker(position);//par los cursores
//     // this.geocodePosition(this.marker.getPosition());
//   });
// }

// addMarker(position: any): void {
//   //podemos añadir más marcadores
//   let latLng = new google.maps.LatLng(position.lat, position.lng);
//   this.marker.setPosition(latLng);
//   this.map.panTo(position);
//   this.positionSet = position;
// }

// setInfoWindow(marker: any, titulo: string, subtitulo: string) {
//   console.log('El titulo es: ', titulo);
//   const contentString = '<div id="contentInsideMap">' +
//                         '<div>' +
//                         '</div>' +
//                         '<p style="font-weight: bold; margin-bottom: 5px; color: black;">' + titulo + '</p>' +
//                         '<div id="bodyContent">' +
//                         '<p class"normal m-0" style="color: black;">'
//                         + subtitulo + '</p>' +
//                         '</div>' +
//                         '</div>';
//   this.infowindow.setContent(contentString);
//   this.infowindow.open(this.map, marker);
// }

// async mylocation() {

//   console.log('mylocation() click')
//   // Se debe ocupar el plugin de capacitor hacer la importacion de plugins
//   Geolocation.getCurrentPosition().then((res) => {

//     console.log('mylocation() -> get ', res);

//     const position = {
//       lat: res.coords.latitude,
//       lng: res.coords.longitude,
//       direccion: this.nuevaDir,
//     }
//     // this.addMarker(position);
//     // this.geocodePosition(this.marker.getPosition());
//   });

// }

 

async presentToast(mensaje: string, tiempo: number) {
  const toast = await this.toastController.create({
    message: mensaje,
    duration: tiempo
  });
  toast.present();
}

async aceptarOferta(valor: number){
  console.log('aceptarOferta', (valor));
  console.log('Paseador DAtos: ',this.infoPaseador.nombre, ' ',this.infoPaseador.apellido);
  console.log('Paseador: ',this.infoPaseador);
  
  this.paseadorOfertar = this.infoPaseador;
  this.ofertar.paseador = this.paseadorOfertar;
  this.ofertar.valor = valor;
  const uidDuenio = this.infoDuenio.duenio.uid;
  const uidSolicitud = this.infoDuenio.id;
  console.log(this.ofertar);
  console.log(this.infoDuenio.duenio.uid);
  
  this.validarSolicitudAnterior(uidDuenio, uidSolicitud);
  
  const path = 'Cliente-dw/' + uidDuenio + '/solicitudes/' + uidSolicitud + '/ofertas/';
  console.log(path);
  this.idOferta = this.firestoreService.getId();
  console.log(' solicitar() ->', this.ofertar, path, this.idOferta);
  this.ofertar.id = this.idOferta;
  await this.firestoreService.createDoc(this.ofertar, path, this.idOferta).then(() => {
    this.modalController.dismiss();
    
    const smsExito = "!Ha ofertado con éxito¡";
    console.log(smsExito);
    this.presentToast(smsExito, 2500);
    
  });
}
     //Verificar si la sentencia se comple del lado del dueño 
  validarSolicitudAnterior(uidDuenio: string, uidSolicitud: string) {
    let array=[];
    const path = 'Cliente-dw/' + uidDuenio + '/solicitudes/' + uidSolicitud + '/ofertas/';
    this.suscribtionOfertas = this.firestoreService.getCollection<Ofrecer>(path).subscribe(res => {
      console.log('los parámetros alojados en las ofertas del cliente son: =>> ', res.length);
      for (let index = 0; index < res.length; index++) {
        const element = res[index];
        console.log(element.paseador.uid);
        if(this.infoPaseador.uid === element.paseador.uid){
          console.log('Similitud ', index);
          array.push(res[index]);
          if(index > 0 ){
            console.log(array);
            console.log(array[array.length -1]);
            if(array[array.length -1].fecha > array[0].fecha){
              this.firestoreService.deleteDoc(path, array[0].id);
              console.log('array[array.length -1].fecha > array[0].fecha');
            }else if(array[array.length -1].fecha < array[0].fecha){
              this.firestoreService.deleteDoc(path, array[array.length -1].id);
              console.log('(array[array.length -1].fecha < array[0].fecha');
            }else if(array[ 1].fecha < array[0].fecha){
              this.firestoreService.deleteDoc(path, array[1].id);
              console.log('array[ 1].fecha < array[0].fecha');
            }
            this.suscribtionOfertas.unsubscribe();
          }
        }
      }
    });


  }
}
