import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, Input, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { GooglemapsService } from 'src/app/googlemaps/googlemaps.service';
import { Cliente, Ofrecer, Solicitud } from 'src/app/modelBD';
import { FirestoreService } from 'src/app/services/firestore.service';

declare var google: any;
@Component({
  selector: 'app-ver-propuesta',
  templateUrl: './ver-propuesta.component.html',
  styleUrls: ['./ver-propuesta.component.scss'],
})
export class VerPropuestaComponent implements OnInit, OnDestroy {

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
  @Input () pathEditar = '';
  @Input () idSolicitud = '';
  @Input () pathDuenioColec = '';
  cliente: Cliente;
  suscribeSolicitud: Subscription;
  datosPaseador :Cliente = {
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
  }
  solicitudModificar: Solicitud = {
    id: '',
    fecha: new Date,
    duenio: this.datosPaseador,
    mascotasPaseo: [],
    numMascotas: null,
    tiempo: null,
    valor: null,
    observacion: '',
    direccion: '',
    estado : 'nueva'
  };
  
  constructor(public modalController: ModalController,
              private renderer: Renderer2,
              @Inject(DOCUMENT) private document, 
              private googlemapsService: GooglemapsService,
              public firestoreService: FirestoreService,
              public toastController: ToastController,
              private router: Router,) { }

  ngOnInit(): void {

    console.log('infoPaseador ==> ', this.infoPaseador);
    console.log('infoPaseador ==> ', this.infoPaseador.id);
    console.log('uid Dueño ==> ', this.pathEditar);
    // console.log('id solicitud ==> ', this.idSolicitud);
    console.log('pathDuenioColec ==> ', this.pathDuenioColec);
    this.init();
  }

  ngOnDestroy(){
    if(this.suscribeSolicitud){
      this.suscribeSolicitud.unsubscribe();
    }
  }

  async init(){
    
    this.googlemapsService.init(this.renderer, this.document).then( ()=>{
      this.initMap();
    }).catch( (err) =>{
      console.log(err);
    });
  }

  initMap() {

    this.position = this.infoPaseador.paseador.ubicacion;
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

  async aceptar(){
    console.log('aceptar()');
    console.log('infoPaseador ==> ', this.infoPaseador);
    console.log('infoPaseador ==> ', this.infoPaseador.paseador.uid);
    const uid = this.infoPaseador.paseador.uid;
    const id = this.infoPaseador.id;
    const pathDuenio = this.pathDuenioColec +'/proceso-duenio'; 
    console.log(pathDuenio);
    const pathDW = 'Cliente-dw/' + uid + '/procesos-dw';
    await this.modificaEstadoSolicitud(this.pathEditar, this.idSolicitud);
    // await this.firestoreService.createDoc(this.infoPaseador, path, id).then(res => {
    // await this.firestoreService.createDoc(this.infoPaseador, pathDuenio, id).then(res => {
    //   console.log('Paseador aceptado');
    //   this.presentToast('Paseador aceptado', 2500);
    // }).catch(error => {
    //   console.log('Ocurrión un error');
    //   this.presentToast('No se pudo realizar el proceso', 2000);
    // });
    await this.crearProcesos(this.infoPaseador, pathDuenio, id).finally( ()=>{
      this.crearProcesos(this.solicitudModificar, pathDW, id);
      this.router.navigate([`/progreso-duenio`], { replaceUrl: true });
      this.modalController.dismiss();
    }
      
    );
  }

  async crearProcesos(data: any, path: string, id: string){
    await this.firestoreService.createDoc(data, path, id).then(res => {
      console.log('Paseador aceptado');
      this.presentToast('Paseador aceptado', 2500);
    }).catch(error => {
      console.log('Ocurrión un error');
      this.presentToast('No se pudo realizar el proceso', 2000);
    });
  }

  async modificaEstadoSolicitud(path: string, id: string){
    this.suscribeSolicitud = this.firestoreService.getDoc<Solicitud>(path, id).subscribe( res => {
      this.solicitudModificar = res;
      console.log(this.solicitudModificar);
      this.solicitudModificar.estado = 'proceso';
      this.solicitudModificar.valor = this.infoPaseador.valor;
      this.solicitudModificar.fecha = new Date;
      this.solicitudModificar.id = this.infoPaseador.id;
      this.enviaData(res);
      this.suscribeSolicitud.unsubscribe();
    });
    console.log('modificaEstadoSolicitud', this.solicitudModificar);
    return;
  }

  async enviaData(data: any){
    // const data = this.solicitudModificar;
    await this.firestoreService.createDoc(data, this.pathEditar, this.idSolicitud).then(res => {
      console.log('Proceso realizado con éxito');
      this.presentToast('Proceso realizado con éxito', 2000);
    }).catch(error => {
      //console.log('No se pudo Actulizar el cliente un error ->', error);
      console.log('No se pudo cancelar la solicitud');
      this.presentToast('No se pudo realizar el proceso', 2000);
    });
  }

  async presentToast(mensaje: string, tiempo: number) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: tiempo 
    });
    toast.present();
  }

  // rechazar(){
  //   console.log('rechazar()()');
  // }
}
