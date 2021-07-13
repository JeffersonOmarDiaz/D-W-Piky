import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-solicitudes',
  templateUrl: './solicitudes.component.html',
  styleUrls: ['./solicitudes.component.scss'],
})
export class SolicitudesComponent implements OnInit {

  verMC = true;
  constructor() { }

  ngOnInit() {}

  changeSegment(ev: any){
    console.log(' changeSegment()', ev.detail.value);
    const opc = ev.detail.value;
    if(opc === 'nuevos'){
      console.log('nueva');
    }
    if(opc === 'culminados'){
      //this.getPedidosCulminados();
      console.log('culminados');
    }
  }
}
