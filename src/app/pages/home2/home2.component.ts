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
  rolPaseador: boolean;
  constructor(public firestoreService: FirestoreService,
              public firebaseauthService: FirebaseauthService,
              private router: Router) {
    this.firestoreService.setLink(this.pathRetorno);
    
   }
 
  ngOnInit() {
    this.tipoRol();
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
  tipoRol(){
    this.suscribreUserInfo=this.firebaseauthService.stateAuth().subscribe(res => { 
      console.log(res);
      if (res !== null) {
        this.uid = res.uid;
        console.log(res.email);
        //this.tipoRol(this.uid); 
        //comprobar TIPO de ROL
          console.log('tipoRol =>');
            const path = "Cliente-dw";
            this.suscribreUserInfoRol = this.firestoreService.getDoc<Cliente>(path, this.uid).subscribe(res => {
              this.cliente = res;
              console.log('El rol actual es: ',res.role);
              if(res.role === 'paseador'){
                this.rolPaseador = true;
                this.router.navigate(['/home-paseador']);
                //window.location.assign('/home-paseador');
                //this.router.navigate([`/home-paseador`], { replaceUrl: true });
                return true;
              }else if(res.role === 'duenio'){
                this.rolPaseador = true;
                //window.location.assign('/home');
                //this.router.navigate(['/home']);
                this.router.navigate([`/home`], { replaceUrl: true });
                return false;
              }
            });
        return;
      }
    });
    return false;
  }

}
