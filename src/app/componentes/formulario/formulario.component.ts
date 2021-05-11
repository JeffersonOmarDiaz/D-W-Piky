import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
})
export class FormularioComponent implements OnInit {

  @Input ()registroPet :boolean;
  @Input ()registroUser :boolean;
  constructor() { }

  ngOnInit() {}

}
