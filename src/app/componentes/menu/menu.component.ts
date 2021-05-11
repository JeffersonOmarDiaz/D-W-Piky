import { Component, Input, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {

  @Input () menuCliente : boolean;
  @Input () paginaTitulo : string;
  @Input () menuDW : boolean;

  constructor(public menuController:MenuController) { }

  ngOnInit() {}

  openMenu(){
    this.menuController.toggle('principal');
    console.log('Cargó el menú');
  }
}
