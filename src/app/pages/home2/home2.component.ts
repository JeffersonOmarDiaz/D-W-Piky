import { Component, OnInit } from '@angular/core';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-home2',
  templateUrl: './home2.component.html',
  styleUrls: ['./home2.component.scss'],
})
export class Home2Component implements OnInit {

  menuDW = true;
  private pathRetorno = '/home-paseador'
  constructor(public firestoreService: FirestoreService) {
    this.firestoreService.setLink(this.pathRetorno);
   }

  ngOnInit() {}

}
