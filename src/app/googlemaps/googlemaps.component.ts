import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Plugins } from '@capacitor/core';
import { GooglemapsService } from './googlemaps.service';

//variables necesariosa para la geolocalización
const {Geolocation} = Plugins;
declare var google: any;


@Component({
  selector: 'app-googlemaps',
  templateUrl: './googlemaps.component.html',
  styleUrls: ['./googlemaps.component.scss'],
})
export class GooglemapsComponent implements OnInit {

  //coordenadas cuenca para abrir con una posición pre cargada
  @Input() position = {  
    lat: -0.220081,
    lng: -78.5142586
  };

  label ={
    //para información sobre el marcador
    titulo: 'Mi Hogar',
    subtitulo: ' '
    /* subtitulo: 'Mi ubicación de envio' */
  };

  map: any; //para el mapa
  marker: any; //posicion del marker
  infowindow: any; //seccion donde aparece ubicacion, ubicacion de envio
  positionSet:any; //posicion en donde se queda guardado la posicion

   //para decir donde estará el mapa en el html se debe importar hace refencia al div map
  @ViewChild('map') divMap: ElementRef;
  //dirección visual
  geocoder: any;
  constructor(private renderer: Renderer2,
              @Inject(DOCUMENT) private document, 
              private googlemapsService: GooglemapsService, 
              public modalController: ModalController) { }

  ngOnInit(): void {
    this.init();
    console.log('position ->', this.position);
  }
  
  async init(){
    
    this.googlemapsService.init(this.renderer, this.document).then( ()=>{
      this.initMap();
    }).catch( (err) =>{
      console.log(err);
    });
  }

  initMap() {

    const position = this.position;

    let latLng = new google.maps.LatLng(position.lat, position.lng);
    //Add by omar
    this.geocoder = new google.maps.Geocoder();
    let mapOptions = {
          center: latLng,
          zoom: 15,
          disableDefaultUI: true,
          clickableIcons: false,
    };

    this.map = new google.maps.Map(this.divMap.nativeElement, mapOptions);
    this.marker = new google.maps.Marker({
          map: this.map,
          animation: google.maps.Animation.DROP,
          draggable: false,
    });
    this.clickHandleEvent();
    this.infowindow = new google.maps.InfoWindow();
    this.addMarker(position);
    this.setInfoWindow(this.marker, this.label.titulo, this.label.subtitulo);
    this.geocodePosition(this.marker.getPosition());
}

geocodePosition(pos){
  //Para las direcciones 
  let direccion = '';
  this.geocoder.geocode({
    latLng: pos
  }, (responses)=>{
    if(responses && responses.length > 0){
      direccion=responses[0].formatted_address;
      console.log('La dirección es: ', direccion);
    }else{

    }
  });
}

  clickHandleEvent(){
    this.map.addListener( 'click', (event: any) =>{
      const position = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      this.addMarker(position);//par los cursores
      this.geocodePosition(this.marker.getPosition());
    });
  }

  addMarker(position: any): void {
    //podemos añadir más marcadores
    let latLng = new google.maps.LatLng(position.lat, position.lng);

    this.marker.setPosition(latLng);
    this.map.panTo(position);
    this.positionSet = position;
  }

  setInfoWindow(marker: any, titulo: string, subtitulo: string) {
    console.log('El titulo es: ', titulo);
    const contentString = '<div id="contentInsideMap">' +
                          '<div>' +
                          '</div>' +
                          '<p style="font-weight: bold; margin-bottom: 5px; color: black;">' + titulo + '</p>' +
                          '<div id="bodyContent">' +
                          '<p class"normal m-0" style="color: black;">'
                          + subtitulo + '</p>' +
                          '</div>' +
                          '</div>';
    this.infowindow.setContent(contentString);
    this.infowindow.open(this.map, marker);
  }

  async mylocation() {

    console.log('mylocation() click')
    // Se debe ocupar el plugin de capacitor hacer la importacion de plugins
    Geolocation.getCurrentPosition().then((res) => {

      console.log('mylocation() -> get ', res);

      const position = {
        lat: res.coords.latitude,
        lng: res.coords.longitude,
      }
      this.addMarker(position);
      this.geocodePosition(this.marker.getPosition());
    });

  }

  aceptar() {
    console.log('click aceptar -> ', this.positionSet);
    this.modalController.dismiss({ pos: this.positionSet })
  }
    

}
