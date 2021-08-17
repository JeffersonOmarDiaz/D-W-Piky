import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Cliente, Ofrecer } from 'src/app/modelBD';

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

  map= null; //para el mapa
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

  constructor(public modalController: ModalController,) { }

  ngOnInit(): void {

    console.log('infoPaseador ==> ', this.infoPaseador);
    // this.cargaPaseador();
  }

  // cargaPaseador(){
  //   this.datosPaseador.nombre = this.infoPaseador.paseador.nombre;
  //   console.log('Nombre paseador  ==> ', this.datosPaseador.nombre);
  // }

}
