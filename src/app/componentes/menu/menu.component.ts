import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, MenuController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Cliente } from 'src/app/modelBD';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit, OnDestroy {

  @Input () menuCliente : boolean;
  @Input () paginaTitulo : string;
  @Input () menuDW : boolean;

  suscribreUserInfo: Subscription;
  suscribreUserState: Subscription;
  uid = '';
  cliente: Cliente= {
    uid: this.uid,
    email: '',
    celular: '',
    foto: '',
    referncia: '',
    ubicacion: null,
    edad: null,
    nombre: '',
    apellido: '',
    cedula: '',
    mascotas: [],
    role: 'duenio'
  };

  loading: any;
  constructor(public menuController:MenuController,
              public  firebaseAuthS: FirebaseauthService,
              public  firestoreService: FirestoreService,
              public loadingController: LoadingController,
              public alertController:AlertController,
              private router: Router,) { 
                this.firebaseAuthS.stateAuth().subscribe( res => {
                  console.log('estado de autenticacion es: ',res);
                  if (res !== null){
                    this.uid = res.uid;
                    //this.cambiarDuenio(this.uid);
                  }
                });
              }

  ngOnInit() {}

  ngOnDestroy(){
    console.log('menú =>> ngOnDestroy');
    if (this.suscribreUserState) {
      this.suscribreUserState.unsubscribe();
    }
  }

  async cambiarRol(rol: string){
    const path = "Cliente-dw";
    this.suscribreUserState = this.firestoreService.getDoc<Cliente>(path,this.uid).subscribe( res => {
      this.cliente = res;
      if (rol === 'duenio'){
        this.cliente.role = 'duenio';
      }else if (rol === 'paseador'){
        this.cliente.role = 'paseador';
      }
      console.log('La informacion del cliente es: ', this.cliente);
      //this.guardarCliente(this.cliente, path, this.cliente.uid);
    });
    const alert = await this.alertController.create({
      cssClass: 'normal',
      header: 'Advertencia!',
      message: 'Seguro que desea <strong>cambiar de rol</strong>!!!',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'normal',
          handler: (blah) => {
            console.log('Canceló cambio de rol: blah');
          }
        }, 
        {
          text: 'Ok',
          role: 'okay',
          handler: () => {
            console.log('GuardarCliente ==> ', this.cliente);
             this.firestoreService.createDoc(this.cliente, path, this.cliente.uid).then(res => {
              if(this.cliente.role === 'duenio'){
                this.menuController.close('principal');
                this.router.navigate([`/home`], { replaceUrl: true });
              }else if(this.cliente.role === 'paseador'){
                this.menuController.close('principal');
                this.router.navigate([`/home-paseador`], { replaceUrl: true });
              }
            }).catch(error => {
              console.log('No se pudo Actulizar el cliente un error ->', error);
            });
            return;
          }
        }
      ]
    });
    await alert.present();
  }


  async presentLoading() {
    this.loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Guardando...',
    });
    await this.loading.present();
    //this.router.navigate(['/perfil-mascota']);
    /* const { role, data } = await loading.onDidDismiss();
    console.log('Loading dismissed!'); */
  }

  async openMenu(){
    await this.menuController.toggle('principal');
    console.log('Cargó el menú');
  }

  salir(){
    this.firebaseAuthS.logout();
    //this.suscribreUserInfo.unsubscribe();
    
  }
}
