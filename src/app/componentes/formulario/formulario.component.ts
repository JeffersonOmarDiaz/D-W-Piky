import { Component, Input, OnInit } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { Mascota } from 'src/app/modelBD';
import { FirestorageService } from 'src/app/services/firestorage.service';
import { FirestoreService } from 'src/app/services/firestore.service';


@Component({
  selector: 'app-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
})
export class FormularioComponent implements OnInit {

  @Input ()registroPet :boolean;
  @Input ()registroPeople :boolean;

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

  mascotas: Mascota[]=[];
  /* newMascota: Mascota; */

  private pathMascota = "/Mascotas";

  loading: any;

  newImage = '';
  newFile ='';
  constructor(public firestoreService: FirestoreService,
              public loadingController: LoadingController,
              public toastController: ToastController,
              public alertController: AlertController,
              public firestorageService: FirestorageService,
              ) { }

  ngOnInit() {
    const mascota = this.firestoreService.getItem();
    if(mascota !== undefined){
      console.log('La informacion a editar es: ', mascota);
      this.newMascota=mascota;
    }
    console.log('el id es: ',this.newMascota.id);
    console.log('La foto  es: ',this.newMascota.foto);
    //this.firestorageService.eliminarFoto('https://firebasestorage.googleapis.com/v0/b/banca-2e58b.appspot.com/o/Mascotas%2FJet0iUTiby5FLLo0Bz245KS?alt=media&token=fe8fe096-c794-410d-a976-2f9bc2f4466d');
    //Crear variable global con foto para ver si al ginal de los cambios aún ser conserva 
  }

///PAra guardar imagenes es base 64 sin URL
  /* guardarMascota(){
    this.presentLoading();
    this.firestoreService.createDoc(this.newMascota, this.pathMascota, this.newMascota.id).then( res =>{
      this.loading.dismiss();
      this.presentToast('Guardado con exito',2000);
    }).catch( error =>{
       console.log('No se pudo guardar el a ocurrido un error ->', error);
       this.presentToast('Error al guardar!!',2000);
    });
  }  */  

  limpiarCampos(){
    console.log('Limpia los campos antes de resgistrar');
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
  }
  cambiarImg : boolean;
  async guardarMascota() {
    this.presentLoading();
    //Valida si desea o no cambiar de imagen 
    if(this.cambiarImg === true){
      const name = this.newMascota.nombre+this.newMascota.id;
      const res = await this.firestorageService.uploadImagen(this.newFile,  this.pathMascota, name);
      this.newMascota.foto = res;
    }
    
    this.firestoreService.createDoc(this.newMascota, this.pathMascota, this.newMascota.id).then(res => {
      this.loading.dismiss();
      this.presentToast('Guardado con exito', 2000);
      this.limpiarCampos();
    }).catch(error => {
      console.log('No se pudo guardar el a ocurrido un error ->', error);
      this.presentToast('Error al guardar!!', 2000);
    });
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
  /* nuevaImagenUpload(event: any){
    console.log(event);
    if(event.target.files && event.target.files[0]){
      const reader = new FileReader();
      reader.onload = ((image) => {
        this.newImage = image.target.result as string;
      });
      reader.readAsDataURL(event.target.files[0]);
    }
  } */

  async newImageUpload(event: any) {
    console.log('el evento es: ',event);
    if (event.target.files && event.target.files[0] && event.isTrusted === true) {
      this.newFile = event.target.files[0];
      const reader = new FileReader();
      reader.onload = ((image) => {
        this.newMascota.foto = image.target.result as string;
      });
      reader.readAsDataURL(event.target.files[0]);
    }
    if(event.isTrusted === true ){
      this.cambiarImg =event.isTrusted; 
      console.log('Usted ah decisdico cambiar IMG 22');
    }
    console.log('Fin de la función nuevaImagenUpload');
  
  }

  

}
