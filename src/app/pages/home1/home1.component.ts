import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Cliente } from 'src/app/modelBD';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';
import { FirestoreService } from 'src/app/services/firestore.service';


@Component({
  selector: 'app-home1',
  templateUrl: './home1.component.html',
  styleUrls: ['./home1.component.scss'],
})
export class Home1Component implements OnInit, OnDestroy {

  verMC = true;
  
  uid = '';
  suscribreUserInfo: Subscription;
  suscribreUserInfoRol: Subscription;
  cliente : Cliente;
  rolDuenio: boolean;
  constructor(public firestoreService: FirestoreService,
              public firebaseauthService: FirebaseauthService,
              private router: Router) {
  }

  ngOnInit() {
    this.tipoRol();
  }

  ngOnDestroy(){
    if (this.suscribreUserInfo) {
      this.suscribreUserInfo.unsubscribe();
    }
    if (this.suscribreUserInfoRol) {
      this.suscribreUserInfoRol.unsubscribe();
    }
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
                this.rolDuenio = false;
                this.router.navigate([`/home-paseador`], { replaceUrl: true });
                return true;
              }else{
                this.rolDuenio = true;
                return false;
              }
            });
        return;
      }
    });
    return false;
  }
  
}
