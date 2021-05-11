import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-perfil-pets',
  templateUrl: './perfil-pets.component.html',
  styleUrls: ['./perfil-pets.component.scss'],
})
export class PerfilPetsComponent implements OnInit {

  verMC = true;
  registroPet = true;
  constructor(public menuController:MenuController) { }

  ngOnInit() {}

  openMenu(){
    console.log('menu cargado');
    this.menuController.toggle('principal');
  }
}
