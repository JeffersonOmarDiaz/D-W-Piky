import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-home1',
  templateUrl: './home1.component.html',
  styleUrls: ['./home1.component.scss'],
})
export class Home1Component implements OnInit {

  verMC = true;
  
  constructor(public menuController:MenuController) { }

  ngOnInit() {
    
  }

  
}
