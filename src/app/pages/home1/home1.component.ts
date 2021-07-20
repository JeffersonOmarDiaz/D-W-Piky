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
  suscribreUserClient: Subscription;
  cliente : Cliente;
  constructor(public firestoreService: FirestoreService,
              public firebaseauthService: FirebaseauthService,
              private router: Router) {
              /* this.firebaseauthService.stateAuth().subscribe(res => {
                console.log(res);
                if (res !== null) {
                  this.uid = res.uid;
                  console.log(res.email);
                  //Colecciones del cliente rol
                  const path = "Cliente-dw";
                  this.suscribreUserInfo = this.firestoreService.getDoc<Cliente>(path, this.uid).subscribe(res => {
                    this.cliente = res;
                    console.log('El rol actual es: ',res.role); */
                    /* if(res.rol === 'paseador'){
                      //this.router.navigate(['/home-paseador']);
                      window.location.assign('/home-paseador');
                    }else if(res.rol === null || res.rol === undefined){
                      //this.router.navigate(['/home']);d
                      window.location.assign('/login');
                    } */
                /*   });
                  
                }else{
                  this.router.navigate(['/login']);
                }

              }); */
  }

  ngOnInit() {
    this.tipoRol();
  }

  ngOnDestroy(){
    if (this.suscribreUserInfo) {
      this.suscribreUserInfo.unsubscribe();
    }
    if (this.suscribreUserClient) {
      this.suscribreUserClient.unsubscribe();
    }
  }

  enviarLink(path: string){
    this.firestoreService.setLink(path);
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
            this.suscribreUserClient = this.firestoreService.getDoc<Cliente>(path, this.uid).subscribe(res => {
              this.cliente = res;
              console.log('El rol actual es: ',res.role);
              if(res.role === 'paseador'){
                //this.router.navigate(['/home-paseador']);
                window.location.assign('/home-paseador');
                return true;
              }else{
                //window.location.assign('/home');
                this.router.navigate(['/home']);
                return;
              }
            });
        return;
      }
    });
  }
  
}
