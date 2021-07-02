import { Component, OnInit } from '@angular/core';
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
export class Home2Component implements OnInit {

  menuDW = true;
  private pathRetorno = '/home-paseador'

  uid = '';
  suscribreUserInfo: Subscription;
  cliente : Cliente;
  constructor(public firestoreService: FirestoreService,
              public firebaseauthService: FirebaseauthService,
              private router: Router) {
    this.firestoreService.setLink(this.pathRetorno);
    //comprobar estado de autenticación 
    this.firebaseauthService.stateAuth().subscribe(res => { 
      console.log(res);
      if (res !== null) {
        this.uid = res.uid;
        console.log(res.email);
        //Colecciones del cliente rol
        const path = "Cliente-dw";
        this.suscribreUserInfo = this.firestoreService.getDoc<Cliente>(path, this.uid).subscribe(res => {
          this.cliente = res;
          console.log('El rol actual es: ',res.rol);
          /* if(res.rol === 'paseador'){
            //this.router.navigate(['/home-paseador']);
            window.location.assign('/home-paseador');
          }else if(res.rol === null || res.rol === undefined){
            //this.router.navigate(['/home']);d
            window.location.assign('/login');
          }else{
            window.location.assign('/home');
          } */
        });
        
      }else{
        this.router.navigate(['/login']);
      }
    });
   }

  ngOnInit() {}

}
