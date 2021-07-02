import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-registro-mascota',
  templateUrl: './registro-mascota.component.html',
  styleUrls: ['./registro-mascota.component.scss'],
})
export class RegistroMascotaComponent implements OnInit {

  verMC = true;
  registroPet = true;
  uid = '';
  suscribreUserInfo: Subscription;

  constructor(public firestoreService:FirestoreService,
              public firebaseauthS: FirebaseauthService,
              private router: Router,
              ) {
    this.firebaseauthS.stateAuth().subscribe( res => {
      //console.log('estado de autenticacion es: ',res);
      if (res !== null){
        this.uid = res.uid;
      }else{
        console.log('No esta autenticado');
        this.router.navigate(['/login']);
      }
    });
   }

  ngOnInit() {
    
  }

}
