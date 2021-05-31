import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Cliente } from 'src/app/modelBD';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
/* Importación para retroceso en dispositivo físico */
import { LoadingController, Platform, ToastController } from '@ionic/angular';
import { FirestorageService } from 'src/app/services/firestorage.service';
 
@Component({
  selector: 'app-perfil-peop',
  templateUrl: './perfil-peop.component.html',
  styleUrls: ['./perfil-peop.component.scss'],
})
export class PerfilPeopComponent implements OnInit {

  cliente: Cliente = {
    uid: '',
    email: '',
    celular: '',
    foto: '',
    referncia: '',
    ubicacion: null,
    edad: null,
    nombre: '',
    apellido: '',
    cedula: '',
  };

  uid = '';
  emailGm = '';
  newFile = '';
  suscribreUserInfo: Subscription;
  cambiarImg : boolean;
  loading: any;

  private pathCliente = "/Cliente-dw";
  constructor(public firestoreService:FirestoreService,
              public  firebaseauthS: FirebaseauthService,
              private platform: Platform,
              public firestorageService: FirestorageService,
              public  loadingController: LoadingController,
              public toastController: ToastController,) {
    this.firebaseauthS.stateAuth().subscribe( res => {
      console.log('estado de autenticacion es: ',res);
      if (res !== null){
        this.uid = res.uid;
        this.emailGm = res.email;
        this.getUserInfo(this.uid);
      }
    });
    /* REvisar función para retroceso */
    this.platform.backButton.subscribeWithPriority(10, () => {
      console.log('Handler was called!');
    });
   }

  ngOnInit() {}


  getUserInfo(uid :string){
    if(uid !== undefined){
      console.log('el id de que llega al getUSerInfo es: ',uid);
    }
    const path = "Cliente-dw";
    this.suscribreUserInfo = this.firestoreService.getDoc<Cliente>(path,uid).subscribe( res => {
      this.cliente = res;
      console.log('La informacion del cliente es: ', this.cliente);
    });
  }

  async guardarCliente() {
    this.presentLoading();
    //Valida si desea o no cambiar de imagen 
    if(this.cambiarImg === true){
      
      const name = this.cliente.nombre+this.cliente.uid;
      const res = await this.firestorageService.uploadImagen(this.newFile,  this.pathCliente, name);
      this.cliente.foto = res;
    }
    
    this.firestoreService.createDoc(this.cliente, this.pathCliente, this.cliente.uid).then(res => {
      this.loading.dismiss();
      this.presentToast('Guardado con exito', 2000);
      //this.limpiarCampos();
    }).catch(error => {
      console.log('No se pudo guardar el a ocurrido un error ->', error);
      this.presentToast('Error al guardar!!', 2000);
    });
  }

  async newImageUpload(event: any) {
    console.log('el evento es: ',event);
    if (event.target.files && event.target.files[0] && event.isTrusted === true) {
      if(this.cliente.foto !== ''){
        console.log('Foto anterior:  ', this.cliente.foto);
        this.firestorageService.eliminarFoto(this.cliente.foto);
        console.log('Inrgresa a la funciona de eliminar su foto anterior: ');
      }
      this.newFile = event.target.files[0];
      const reader = new FileReader();
      reader.onload = ((image) => {
        this.cliente.foto = image.target.result as string;
      });
      reader.readAsDataURL(event.target.files[0]);
    }
    if(event.isTrusted === true ){
      this.cambiarImg =event.isTrusted; 
      console.log('Usted ha decidido cambiar IMG');
    }
    console.log('Fin de la función nuevaImagenUpload');
  
  }

  async presentLoading() {
    this.loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Guardando...',
    });
    await this.loading.present();
    /* const { role, data } = await loading.onDidDismiss();
    console.log('Loading dismissed!'); */
  }

  async presentToast(mensaje: string, tiempo: number) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: tiempo 
    });
    toast.present();
  }
}
