import { Component, Input, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {

  @Input () menuCliente : boolean;
  @Input () paginaTitulo : string;
  @Input () menuDW : boolean;

  //suscribreUserInfo: Subscription;
  constructor(public menuController:MenuController,
              public  firebaseauthS: FirebaseauthService,) { }

  ngOnInit() {}

  openMenu(){
    this.menuController.toggle('principal');
    console.log('Cargó el menú');
  }

  salir(){
    this.firebaseauthS.logout();
    //this.suscribreUserInfo.unsubscribe();
    
  }
}
