import { Component, OnInit } from '@angular/core';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-registro-mascota',
  templateUrl: './registro-mascota.component.html',
  styleUrls: ['./registro-mascota.component.scss'],
})
export class RegistroMascotaComponent implements OnInit {

  verMC = true;
  registroPet = true;
  constructor(public firestoreService:FirestoreService) { }

  ngOnInit() {
    
  }

}
