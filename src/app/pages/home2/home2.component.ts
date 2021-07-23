import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Cliente } from 'src/app/modelBD';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-home2',
  templateUrl: './home2.component.html',
  styleUrls: ['./home2.component.scss'],
})
export class Home2Component implements OnInit, OnDestroy {

  menuDW = true;
  private pathRetorno = '/home-paseador'

  uid = '';
  suscribreUserInfo: Subscription;
  suscribreUserInfoRol: Subscription;
  cliente : Cliente;
  constructor(public firestoreService: FirestoreService,
              public firebaseauthService: FirebaseauthService,
              private router: Router) {
    this.firestoreService.setLink(this.pathRetorno);
    
   }
 
  ngOnInit() {
    //comprobar estado de autenticación 
    /* this.suscribreUserInfo=this.firebaseauthService.stateAuth().subscribe(res => { 
      console.log(res);
      if (res !== null) {
        this.uid = res.uid;
        console.log(res.email);
        this.tipoRol(this.uid); 
      }
    }); */
    //this.router.navigate(['/home-paseador']);
  }
 
  ngOnDestroy(){
    console.log('OnDEstroy => from home2');
    if (this.suscribreUserInfo) {
      this.suscribreUserInfo.unsubscribe();
    }
    if (this.suscribreUserInfoRol) {
      this.suscribreUserInfoRol.unsubscribe();
    }
  }
  refrescarPagina(){
    window.location.assign('/home-paseador');
  }
  tipoRol(uid: string){
    //comprobar TIPO de ROL
    /* this.firebaseauthService.stateAuth().subscribe(res => {  */
      console.log('tipoRol =>');
      /* if (res !== null) {
        this.uid = res.uid;
        console.log(res.email); */
        //Colecciones del cliente rol
        const path = "Cliente-dw";
        this.suscribreUserInfoRol = this.firestoreService.getDoc<Cliente>(path, uid).subscribe(res => {
          this.cliente = res;
          console.log('El rol actual es: ',res.role);
          if(res.role === 'paseador'){
            this.router.navigate(['/home-paseador']);
            //window.location.assign('/home-paseador');
            return true;
          }else{
            //window.location.assign('/home');
            this.router.navigate(['/home']);
            return;
          }
        });
    return;
  }

}
