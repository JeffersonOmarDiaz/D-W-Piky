import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Cliente, Solicitud } from 'src/app/modelBD';

@Component({
  selector: 'app-ubicacion-mascotas-paseo',
  templateUrl: './ubicacion-mascotas-paseo.component.html',
  styleUrls: ['./ubicacion-mascotas-paseo.component.scss'],
})
export class UbicacionMascotasPaseoComponent implements OnInit {

  @Input() infoDuenio: Solicitud;

  btnTiempo = true;
  ClientePaseo: Cliente;
  estadoProceso : Solicitud;
  estadoCincoMin = 'Llego en 5 minutos';
  estadoDiezMin = 'Llego en 10 minutos';
  estadoFuera = 'Estoy fuera';
  estadoFinalizado = 'Paseo Finalizado';
  estadoNoActivo = 'Ya no estoy activo';
  verMascotasList = false;
  constructor(public modalController: ModalController,
            )
  { }

  ngOnInit() {
    console.log('datosDuenio ->', this.infoDuenio);
    this.estadoProceso = this.infoDuenio;
  }


  btnEstados(estado: string){
    // console.log('btnLlegoEn() ',estado);
    if(estado === 'Llego en 5 minutos'){
      this.estadoProceso.estado = 'Llego en 5 minutos';
    }else if(estado === 'Llego en 10 minutos'){
      this.estadoProceso.estado = 'Llego en 10 minutos';
    }else if(estado === 'Estoy fuera'){
      this.btnTiempo = false;
      this.estadoProceso.estado = 'Estoy fuera';
    }else if(estado === 'Paseo Finalizado'){
      this.estadoProceso.estado = 'culminada';
    }else if(estado === 'Ya no estoy activo'){
      this.estadoProceso.estado = 'Ya no estoy activo';
    }
    console.log('btnEstados() ',this.estadoProceso.estado);

  }

  verMascotas(ver: boolean){
    this.verMascotasList = ver;
  }
}
