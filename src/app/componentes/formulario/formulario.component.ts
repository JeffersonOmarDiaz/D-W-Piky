import { Component, Input, OnInit } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Cliente, Mascota } from 'src/app/modelBD';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';
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

  //Inicio de variables para registrar nuevas mascotas
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
    mascotas: [],
  };
  
  uid = '';
  suscribreUserInfo: Subscription;
  pathCliente: "/Cliente-dw";
  //Fin avirables nueva mascota
  elimarArray = null;
  constructor(public firestoreService: FirestoreService,
              public loadingController: LoadingController,
              public toastController: ToastController,
              public alertController: AlertController,
              public firestorageService: FirestorageService,
              public firebaseauthS: FirebaseauthService
              ) {
                this.firebaseauthS.stateAuth().subscribe( res => {
                  console.log('estado de autenticacion es: ',res);
                  if (res !== null){
                    this.uid = res.uid;
                    console.log('El atributo mascotas de cliente es: ', this.cliente.mascotas);
                    this.getUserInfo(this.uid);
                  }
                });
               }
            

  ngOnInit() {
    const mascota = this.firestoreService.getItem();
    if(mascota !== undefined){
      console.log('La informacion a editar es: ', mascota);
      this.newMascota=mascota;
    }
    const valorEliminar = this.firestoreService.getValor();
    console.log('El valor que llega para eliminar es: ',valorEliminar);
    this.elimarArray = valorEliminar;
  }

  //Inicio Funciones de registro mascota Cliente 
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
    this.firestoreService.createDoc(this.cliente, 'Cliente-dw', this.cliente.uid).then(res => {
      this.loading.dismiss();
      this.presentToast('Guardado con exito', 2000);
      //this.limpiarCampos();
    }).catch(error => {
      console.log('No se pudo Actulizar el cliente un error ->', error);
      this.presentToast('Error al guardar!!', 2000);
    });
  }

  //Fin Funciones de registro mascota Cliente 
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
      console.log('Llega a actualizar cliente con los datos: Path ',this.pathCliente, ' documento: ', this.cliente, 'ID CLiente: ',this.cliente.uid)
      /* this.cliente.mascotas[0]= this.newMascota; */
      this.cliente.mascotas.push(this.newMascota);
      if(this.elimarArray != undefined){
        this.cliente.mascotas.splice(this.elimarArray,1);
      }
      this.guardarCliente();
      this.limpiarCampos();
      return true;
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
      if(this.newMascota.foto !== ''){
        console.log('Foto anterior:  ', this.newMascota.foto);
        this.firestorageService.eliminarFoto(this.newMascota.foto);
        console.log('Inrgresa a la funciona de eliminar su foto anterior: ');
      }
      this.newFile = event.target.files[0];
      const reader = new FileReader();
      reader.onload = ((image) => {
        this.newMascota.foto = image.target.result as string;
      });
      reader.readAsDataURL(event.target.files[0]);
    }
    if(event.isTrusted === true ){
      this.cambiarImg =event.isTrusted; 
      console.log('Usted ha decidido cambiar IMG');
    }
    console.log('Fin de la función nuevaImagenUpload');
  
  }

}
