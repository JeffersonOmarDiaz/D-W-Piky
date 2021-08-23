import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Cliente, Mascota } from 'src/app/modelBD';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';
import { FirestorageService } from 'src/app/services/firestorage.service';
import { FirestoreService } from 'src/app/services/firestore.service';


@Component({
  selector: 'app-perfil-pets',
  templateUrl: './perfil-pets.component.html',
  styleUrls: ['./perfil-pets.component.scss'],
})
export class PerfilPetsComponent implements OnInit, OnDestroy {

  verMC = true;
  mascotas : Mascota []=[];
  private path = '/Mascotas';

  loading: any;

  btnRegistro = false;

  //Para Limpiar los campos en un nuevo registro Inicio
  newMascota: Mascota ={
    foto: '',
    nombre: '',
    edad: null, 
    sexo: '',
    tamanio: '',
    agresivo: '',
    // observaciones: '',
    id: this.firestoreService.getId(), 
    fechaCreacionMas: new Date,
    idDuenio: '',
  }
  //Para Limpiar los campos en un nuevo registro Fin
  uid = '';
  clienteMascota : Mascota []=[];
  cliente: Cliente = {
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
  suscribreUserInfo: Subscription;
  suscribreUserPet: Subscription;
  suscribreUserInfoRol: Subscription;
  suscribeMascotas: Subscription;
  valorEliminar = null;
  rolDuenio: boolean;
  constructor(public firestoreService: FirestoreService,
              public alertController:AlertController,
              public toastController:ToastController,
              public firestorageService: FirestorageService,
              public firebaseauthS: FirebaseauthService,
              private router: Router ) { 
                this.suscribreUserInfo = this.firebaseauthS.stateAuth().subscribe( res => {
                  console.log('estado de autenticacion es: ',res);
                  if (res !== null){
                    this.uid = res.uid;
                    this.getUserInfo(this.uid);
                  }
                });
              }

  ngOnInit() {
    this.tipoRol();
    this.getMascotas();
  }

  ngOnDestroy(){
    console.log('ngOnDestroy() =>> perfil - pets');
    if (this.suscribreUserInfo) {
      this.suscribreUserInfo.unsubscribe();
    }
    if (this.suscribreUserPet) {
      this.suscribreUserPet.unsubscribe();
    }
    if (this.suscribreUserInfoRol) {
      this.suscribreUserInfoRol.unsubscribe();
    }
    if (this.suscribeMascotas) {
      this.suscribeMascotas.unsubscribe();
    }
    
  }

  tipoRol(){
    this.suscribreUserInfo=this.firebaseauthS.stateAuth().subscribe(res => { 
      console.log(res);
      if (res !== null) {
        this.uid = res.uid;
        //comprobar TIPO de ROL
          console.log('tipoRol =>');
            const path = "Cliente-dw";
            this.suscribreUserInfoRol = this.firestoreService.getDoc<Cliente>(path, this.uid).subscribe(res => {
              this.cliente = res;
              console.log('El rol actual es: ',res.role);
              if(res.role === 'paseador'){
                this.rolDuenio = false;
                this.router.navigate([`/home-paseador`], { replaceUrl: true });
                return true;
              }else{
                this.rolDuenio = true;
                return false;
              }
            });
        return;
      }
    });
    return false;
  }

  getUserInfo(uid :string){
    if(uid !== undefined){
      console.log('el id de que llega al getUSerInfo es: ',uid);
    }
    const path = "Cliente-dw";
    this.suscribreUserPet = this.firestoreService.getDoc<Cliente>(path,uid).subscribe( res => {
      this.cliente = res;
      this.clienteMascota = res.mascotas;
      console.log('La informacion del cliente es: ', this.cliente); 
      if(this.cliente.cedula != ''){
        console.log('Si tiene cédula');
        this.btnRegistro = true;
      }else{
        this.btnRegistro = false;
      }
      console.log('La informacion de las mascotas cliente es: ', this.clienteMascota);
      //Linea de ordenamiento problematica en la eliminación
      //console.log('La informacion de las mascotas cliente es: ', this.clienteMascota.sort(((unaMascota, otraMascota) => unaMascota.nombre.localeCompare( otraMascota.nombre))) );
    });
    return;
  }

  getMascotas() {
    //debemos mandar un tipo '<>' que en este caso es producto q se define
    this.suscribeMascotas = this.firestoreService.getCollection<Mascota>(this.path).subscribe(res => {
      this.mascotas = res;
      console.log('Estos son las MAscotas En LA BD', res);
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
  async deleteUserPet(pos: string, array : any){
    let posicionArray = null;
    let nombreMascota = '';
    let idMascota = '';
    let fotoMascota = '';
    console.log('el array es: ',array);
    const recorreArray = (arr) => {
      for(let i=0; i<=arr.length-1; i++){
        console.log(arr[i].nombre);
        console.log(arr[i].id);
        console.log(arr[i].foto);
        nombreMascota = arr[i].nombre;
        idMascota = arr[i].id;
        fotoMascota = arr[i].foto;
        if(arr[i].id === pos){
          console.log('Eliminará la pocición: ', i); 
          posicionArray = i;
        return;
      }
      }
      return;
    }
    recorreArray(array);
    console.log('La posición es: ',pos);

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
            //console.log(nombreMascota);
            console.log(this.path);
            console.log('Mascota a eliminar  :', nombreMascota);
            this.cliente.mascotas = this.clienteMascota.splice(posicionArray,1);
            console.log(this.clienteMascota);
            this.btnDelet(idMascota, fotoMascota, posicionArray, this.clienteMascota);
          }
        }
      ]
    });
    await alert.present();
  }

  async btnDelet(idMascota: string, fotoMascota: string, posicionArray: number, mascotas: any){
    this.cliente.mascotas = mascotas;
    
    console.log("btnDetet => ", this.cliente.mascotas);
    await this.guardarCliente(this.cliente, 'Cliente-dw', this.cliente.uid);
    await this.firestoreService.deleteDoc(this.path, idMascota).then(res => {
      this.firestorageService.eliminarFoto(fotoMascota).then( res => {
          console.log('LA foto Tambien se ha eliminado: ---->', res);
      }
      );
      this.presentToast('Eliminado con exito', 2000);
      return;
    }).catch(error => {
      console.log('No se pudo eliminar a ocurrido un error ->', error);
      this.presentToast('No se pudo eliminar!!', 2000);
    });
    return;
  }

  async guardarCliente(data: any, path: string, uid: string) {
    console.log('guardarCliente()', data);
    await this.firestoreService.createDoc(data, path, uid).then(res => {
      
    }).catch(error => {
      console.log('No se pudo Actulizar el cliente un error ->', error);
    });
  }

  enviarID(pos: string, array : any){
    let posicionArray = null;
    const recorreArray = (arr) => {
      for(let i=0; i<=arr.length-1; i++){
        console.log(arr[i].nombre);
        if(arr[i].id === pos){
          console.log('Eliminará la pocición: ', i); 
          posicionArray = i;
          this.firestoreService.setParametrosArrayMascota(posicionArray);
        return;
      }
      }
      posicionArray = null;
    }
    recorreArray(array);
  }


  async deletItem(mascota: Mascota){
    console.log('Mascota a eliminar  :',mascota);
    await this.firestoreService.deleteDoc(this.path, mascota.id);
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
              this.firestorageService.eliminarFoto(mascota.foto).then( res => {
                  console.log('LA foto Tambien se ha eliminado: ---->', res);
              }
              );
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
    this.firestoreService.setParametrosArrayMascota(null);
    console.log('limpia los campos antes de cargarlos');
    this.newMascota = {
      foto: '',
      nombre: '',
      edad: null, 
      sexo: '',
      tamanio: '',
      agresivo: '',
      // observaciones: '',
      id: this.firestoreService.getId(), 
      fechaCreacionMas: new Date,
      idDuenio: '',
    }
    this.firestoreService.setItem(this.newMascota);
  }

}
