import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { GooglemapsService } from 'src/app/googlemaps/googlemaps.service';
import { Cliente, Ofrecer } from 'src/app/modelBD';

declare var google: any;
@Component({
  selector: 'app-ver-propuesta',
  templateUrl: './ver-propuesta.component.html',
  styleUrls: ['./ver-propuesta.component.scss'],
})
export class VerPropuestaComponent implements OnInit {

  //coordenadas quito para abrir con una posición pre cargada si no hay posicion referencial 
  //
  @Input() position = {
    lat: -0.220081,
    lng: -78.5142586,
    direccion : "Sebastián de Benalcázar N3-45"
  };

  label ={
    //para información sobre el marcador
    titulo: 'Hogar',
    subtitulo: 'Paseador'
    /* subtitulo: 'Ubicación del domicilio del paseador' */
  };

  map: any; //para el mapa
  marker: any; //posicion del marker
  infowindow: any; //seccion donde aparece ubicacion, ubicacion de envio
  positionSet:any; //posicion en donde se queda guardado la posicion
  
  //para decir donde estará el mapa en el html se debe importar hace refencia al div map
  @ViewChild('map') divMap: ElementRef;

  @Input () infoPaseador: Ofrecer;
  // datosPaseador :Cliente = {
  //   uid: '',
  //   email: '',
  //   celular: '',
  //   foto: '',
  //   referncia: '',
  //   ubicacion: null,
  //   edad: null,
  //   nombre: '',
  //   apellido: '',
  //   cedula: '',
  //   mascotas: [],
  //   role: 'duenio',
  // }
  
  constructor(public modalController: ModalController,
              private renderer: Renderer2,
              @Inject(DOCUMENT) private document, 
              private googlemapsService: GooglemapsService,) { }

  ngOnInit(): void {

    console.log('infoPaseador ==> ', this.infoPaseador);
    this.init();
  }

  async init(){
    
    this.googlemapsService.init(this.renderer, this.document).then( ()=>{
      this.initMap();
    }).catch( (err) =>{
      console.log(err);
    });
  }

  initMap() {

    // this.position = this.infoPaseador.paseador.ubicacion;
    const position = this.position;

    let latLng = new google.maps.LatLng(position.lat, position.lng);
    //Add by omar
    // this.geocoder = new google.maps.Geocoder();
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

    this.infowindow = new google.maps.InfoWindow();
    this.addMarker(position);
    this.setInfoWindow(this.marker, this.label.titulo, this.label.subtitulo);
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
                          '<p style="font-weight: bold; margin-bottom: 2px; color: black;">' + titulo + '</p>' +
                          '<div id="bodyContent">' +
                          '<p class"normal m-0" style="color: black;">'
                          + subtitulo + '</p>' +
                          '</div>' +
                          '</div>';
    this.infowindow.setContent(contentString);
    this.infowindow.open(this.map, marker);
  }

  aceptar(){
    console.log('aceptar()');
  }

  rechazar(){
    console.log('rechazar()()');
  }
}
