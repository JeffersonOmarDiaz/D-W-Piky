import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { UbicacionMascotasPaseoComponent } from 'src/app/componentes/ubicacion-mascotas-paseo/ubicacion-mascotas-paseo.component';
import { Cliente, Solicitud } from 'src/app/modelBD';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-procesos-dw',
  templateUrl: './procesos-dw.component.html',
  styleUrls: ['./procesos-dw.component.scss'],
})
export class ProcesosDwComponent implements OnInit, OnDestroy {

  menuDW = true;
  rolPaseador: boolean;
  suscribreUserInfo: Subscription;
  suscribreUserInfoRol: Subscription;
  uid = '';
  cliente : Cliente;
  infoPaseadorInput: any;

  //Variables para ver si existen Procesos
  procesosDw: Solicitud []= [];
  suscriberProceso : Subscription;
  sinProcesos = false;
  constructor(public firebaseauthService: FirebaseauthService,
              public firestoreService: FirestoreService,
              private router: Router,
              private modalController: ModalController) { }

  ngOnInit() {
    this.tipoRol();
  }

  ngOnDestroy(){
    console.log('OnDEstroy => Procesos Dog Walker');
    if (this.suscribreUserInfo) {
      this.suscribreUserInfo.unsubscribe();
    }
    if (this.suscribreUserInfoRol) {
      this.suscribreUserInfoRol.unsubscribe();
    }
    if (this.suscriberProceso) {
      this.suscriberProceso.unsubscribe();
    }
  }

  tipoRol() {
    this.suscribreUserInfo = this.firebaseauthService.stateAuth().subscribe(res => {
      console.log(res);
      if (res !== null) {
        this.uid = res.uid;
        //comprobar TIPO de ROL
        const path = "Cliente-dw";
        this.suscribreUserInfoRol = this.firestoreService.getDoc<Cliente>(path, this.uid).subscribe(res => {
          this.cliente = res;
          console.log('El rol actual es: ', res.role);
          this.infoPaseadorInput = res;
          console.log('Información del paseador: ', this.infoPaseadorInput);
          if (res.role === 'duenio') {
            this.rolPaseador = false;
            this.router.navigate(['/home'], { replaceUrl: true });
            return false;
          } else {
            this.rolPaseador = true;
            this.paseosProceso();
            return false;
          }
        });
        return;
      }
    });
    return false;
  }

  paseosProceso(){
    console.log(' paseosProceso()');
    const path = 'Cliente-dw/' + this.uid + '/procesos-dw';
    console.log(' path() =>> ', path);
    let startAt = null;
    this.suscriberProceso = this.firestoreService.getCollectionProcesoDuenio<Solicitud>(path, 'estado', '!=', 'Paseo Finalizado', startAt, 10).subscribe(res => {
      console.log(res);
      this.procesosDw = res;
      if(this.procesosDw.length === 0){
        this.sinProcesos = true;
      }
    });
  }

  async verUbicacionDuenio(infoSolicitudInput: any){
    console.log('verUbicacionDuenio() ==> ', infoSolicitudInput);


    const ubicacion = this.cliente.ubicacion;
    let positionInput = {  //Ubicación del dueño
      lat: infoSolicitudInput.duenio.ubicacion.lat,
      lng: infoSolicitudInput.duenio.ubicacion.lng
    };
    console.log(positionInput);
    // if (ubicacion !== null) {
    //     positionInput = ubicacion; 
    // }

    const modalAdd  = await this.modalController.create({
      component: UbicacionMascotasPaseoComponent,
      mode: 'ios',
      swipeToClose: true,
      componentProps: {position: positionInput, infoDuenio: infoSolicitudInput, infoPaseador: this.infoPaseadorInput} //pasa la ubicación a nuevaoferta
      // componentProps: {position: positionInput, infoDuenio: infoSolicitudInput[0], infoPaseador: this.infoPaseadorInput, positionPaseador: this.positionInputPaseador} //pasa la ubicación a nuevaoferta
    });
    await modalAdd.present();
  }
}
