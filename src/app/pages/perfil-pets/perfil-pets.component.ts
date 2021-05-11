import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { Mascota } from 'src/app/modelBD';
import { FirestoreService } from 'src/app/services/firestore.service';


@Component({
  selector: 'app-perfil-pets',
  templateUrl: './perfil-pets.component.html',
  styleUrls: ['./perfil-pets.component.scss'],
})
export class PerfilPetsComponent implements OnInit {

  verMC = true;
  mascotas : Mascota []=[];
  private path = '/Mascotas';

  loading: any;

  //Para Limpiar los campos en un nuevo registro Inicio
  newMascota: Mascota ={
    foto: '',
    nombre: '',
    edad: null, 
    sexo: '',
    tamanio: '',
    agresivo: '',
    observaciones: '',
    id: this.firestoreService.getId(), 
    fechaCreacionMas: new Date,
    idDuenio: '',
  }
  //Para Limpiar los campos en un nuevo registro Fin

  constructor(public firestoreService: FirestoreService,
              public alertController:AlertController,
              public toastController:ToastController ) { }

  ngOnInit() {
    this.getMascotas();
  }

  getMascotas() {
    //debemos mandar un tipo '<>' que en este caso es producto q se define
    this.firestoreService.getCollection<Mascota>(this.path).subscribe(res => {
      this.mascotas = res;
      console.log('Estos son las MAscotas ', res);
    });
  }

  editMascota(mascota: Mascota){
    console.log('La mascota seleccionada  es: ', mascota);
    this.firestoreService.setItem(mascota); 
  }

  /* async deletItem(mascota: Mascota){
    await this.firestoreService.deletDocument<Mascota>('Items', mascota.id).catch( res =>{
      console.log('error de eliminación -->', res);
    }); 
    console.log('borrado con exito');
  } */
  deletItem(mascota: Mascota){
    console.log('Producto a eliminar  :',mascota);
    this.firestoreService.deleteDoc(this.path, mascota.id);
  }

  async presentToast(mensaje: string, tiempo:number) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: tiempo 
    });
    toast.present();
  }

  async deleteMascota(mascota: Mascota) {

    const alert = await this.alertController.create({
      cssClass: 'normal',
      header: 'Advertencia!',
      message: 'Seguro que desea <strong>eliminar</strong>!!!',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'normal',
          handler: (blah) => {
            console.log('Canceló la eliminación: blah');
          }
        }, 
        {
          text: 'Ok',
          role: 'okay',
          handler: () => {
            console.log('Confirmó la eliminacion');
            console.log('Mascota a eliminar  :', mascota);
            this.firestoreService.deleteDoc(this.path, mascota.id).then(res => {
              this.presentToast('Eliminado con exito', 2000);
              this.alertController.dismiss();
              this.loading.dismiss();
            }).catch(error => {
              console.log('No se pudo eliminar el a ocurrido un error ->', error);
              this.presentToast('Eliminado con exito!!', 2000);
            });
          }
        }
      ]
    });

    await alert.present();

  }

  limpiarCampos(){
    
    console.log('limpia los campos antes de cargarlos');
    this.newMascota = {
      foto: '',
      nombre: '',
      edad: null, 
      sexo: '',
      tamanio: '',
      agresivo: '',
      observaciones: '',
      id: this.firestoreService.getId(), 
      fechaCreacionMas: new Date,
      idDuenio: '',
    }
    this.firestoreService.setItem(this.newMascota);
  }

}
