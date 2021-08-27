import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Calificacion, Cliente } from 'src/app/modelBD';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-valoracion-dw',
  templateUrl: './valoracion-dw.component.html',
  styleUrls: ['./valoracion-dw.component.scss'],
})
export class ValoracionDwComponent implements OnInit {

  menuDW = true;
  suscribreUserInfo: Subscription;
  uid = '';
  suscribreUserInfoRol:Subscription;
  cliente : Cliente;
  rolPaseador: boolean;

  suscribeCalificaciones: Subscription;
  calificaciones: Calificacion[];
  calificacionesAcumuladas = 0;
  calificacionSumada=0;
  calificacionTotal = 0;
  mostrarCalificacion = '';
  imagenRuta = '../../../assets/images/gifs/cargando.gif';
  constructor(public firebaseauthService: FirebaseauthService,
              public firestoreService: FirestoreService,
              private router: Router,) { }

  ngOnInit() {
    this.tipoRol();
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
          if (res.role === 'duenio') {
            this.rolPaseador = false;
            this.router.navigate(['/home'], { replaceUrl: true });
            return false;
          } else {
            this.rolPaseador = true;
            this.obtenerCalificacion();
          }
        });
        return;
      }
    });
    return false;
  }

  obtenerCalificacion(){
    
    console.log('obtenerCalificacion()');
    const path = 'Cliente-dw/'+ this.uid + '/calificaciones';
    console.log(path);
    this.firestoreService.getCollection<Calificacion>(path).subscribe( res=> {
      // console.log(res);
      this.calificaciones = res;
      console.log(this.calificaciones);
      console.log(this.calificaciones.length);
      this.calificacionesAcumuladas = this.calificaciones.length;
      for (let index = 0; index < this.calificaciones.length; index++) {
        const element = this.calificaciones[index].valoracion;
        console.log(element);
        this.calificacionSumada = this.calificacionSumada + element;
      }
      if(this.calificacionesAcumuladas>0){
        console.log(this.calificacionSumada);
        this.calificacionTotal = (this.calificacionSumada / this.calificacionesAcumuladas);
        console.log(this.calificacionTotal.toFixed(2));
        this.mostrarCalificacion=this.calificacionTotal.toFixed(2);
        this.ranking(this.calificacionTotal.toFixed(2));
      }else{
        this.rankingDefault();
      }
    });
  }

  ranking(calificacion: string){
    let calificacionFuncion= Number(calificacion);
    if(calificacionFuncion > 0 && calificacionFuncion <= 2 ){
      this.imagenRuta ='../../../assets/images/gifs/tercerLugar.gif';
      console.log('Paseador bronce');
    }else if(calificacionFuncion > 2 && calificacionFuncion <= 4 ){
      this.imagenRuta ='../../../assets/images/gifs/segundoLugar.gif';
      console.log('Paseador pleteado');
    }
    else if(calificacionFuncion > 4){
      console.log('Paseador dorado');
      this.imagenRuta ='../../../assets/images/gifs/primerLugar.gif';
    }
  }

  rankingDefault(){
    console.log('Al ser un paseador nuevo se te ha considerado como Paseador Dorado. Para mantenerte como paseador dorado asegurate de brindar un servicio de calidad');
    this.imagenRuta ='../../../assets/images/gifs/primerLugar.gif';
    this.mostrarCalificacion = '0';
  }

}
