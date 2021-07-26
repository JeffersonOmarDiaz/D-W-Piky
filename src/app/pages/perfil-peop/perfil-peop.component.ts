import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Cliente } from 'src/app/modelBD';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
/* Importación para retroceso en dispositivo físico */
import { LoadingController, Platform, ToastController } from '@ionic/angular';
import { FirestorageService } from 'src/app/services/firestorage.service';
import { Router } from '@angular/router';

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
    mascotas: [],
    role: 'duenio'
  };

  uid = '';
  emailGm = '';
  newFile = '';
  suscribreUserInfo: Subscription;
  cambiarImg: boolean;
  loading: any;

  private pathCliente = "/Cliente-dw";
  pathRetorno = '';
  rolUser = '';
  constructor(public firestoreService: FirestoreService,
    public firebaseauthS: FirebaseauthService,
    private platform: Platform,
    public firestorageService: FirestorageService,
    public loadingController: LoadingController,
    public toastController: ToastController,
    private router: Router,) {
    this.firebaseauthS.stateAuth().subscribe(res => {
      console.log('estado de autenticacion es: ', res);
      if (res !== null) {
        this.uid = res.uid;
        this.emailGm = res.email;
        this.getUserInfo(this.uid);
      }
    });
    /* REvisar función para retroceso */
    /* this.platform.backButton.subscribeWithPriority(5, () => {
      console.log('Another handler was called!');
    }); */
  
    /* this.platform.backButton.subscribeWithPriority(10, (processNextHandler) => {
      console.log('evento de retroceso');
  
      processNextHandler();
    }); */
    /* REvisar función para retroceso */
    //Retroceso con link
    this.pathRetorno = this.firestoreService.getLink();
    console.log('retorna a: ', this.pathRetorno);
    //Retroceso con link
  }

  ngOnInit() { }

  //Retroceso con link revisar
  retrocederLink() {
    console.log('retorna a: ', this.pathRetorno);
    if (this.pathRetorno === '') {
      if (this.cliente.role === 'paseador') {
        console.log('El rol es paseador');
        this.router.navigate(['/home-paseador']);
        this.firestoreService.setLink('');
      } else if(this.cliente.role === 'duenio'){
        console.log('El rol es dueño');
        this.router.navigate(['/home']);
        this.firestoreService.setLink('');
      }else{
        this.router.navigate(['/login']);

      }
      
    } else {
      this.router.navigate([this.pathRetorno]);
      this.firestoreService.setLink('');
      console.log('Queda en cache: ', this.firestoreService.getLink());
    }
  }
  //Retroceso con link

  getUserInfo(uid: string) {
    if (uid !== undefined) {
      console.log('el id de que llega al getUSerInfo es: ', uid);
      const path = "Cliente-dw";
      this.suscribreUserInfo = this.firestoreService.getDoc<Cliente>(path, uid).subscribe(res => {
        this.cliente = res;
        console.log('La informacion del cliente es: ', this.cliente);
        if(this.cliente.role === null || this.cliente.role=== undefined){
          this.router.navigate(['/login']);
        }
      });
    } 
  }

  async guardarCliente() {
    this.presentLoading();
    //Valida si desea o no cambiar de imagen 
    if (this.cambiarImg === true) {

      const name = this.cliente.nombre + this.cliente.uid;
      const res = await this.firestorageService.uploadImagen(this.newFile, this.pathCliente, name);
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
    console.log('el evento es: ', event);
    if (event.target.files && event.target.files[0] && event.isTrusted === true) {
      if (this.cliente.foto !== '') {
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
    if (event.isTrusted === true) {
      this.cambiarImg = event.isTrusted;
      console.log('Usted ha decidido cambiar IMG');
    }
    console.log('Fin de la función nuevaImagenUpload');
    
    this.loading.dismiss();
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

  async galeria() {
    this.loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Abriendo Galería...',
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

  validarGuardar() {
    const nombre = this.cliente.nombre;
    const apellido = this.cliente.apellido;
    const celular = this.cliente.celular;
    const edad = this.cliente.edad;
    const referencia = this.cliente.referncia;
    const cedula = this.cliente.cedula;

    if (nombre != '' && apellido != "" && celular != "" && edad != null && referencia != "" && cedula != "") {
      console.log('Todos los campos estan llenos');

      if (cedula.length === 10) {

        // Obtenemos el digito de la region que sonlos dos primeros digitos
        const digitoRegion = cedula.substring(0, 2);

        // Pregunto si la region existe ecuador se divide en 24 regiones
        console.log('digito región: ', digitoRegion);
        if (Number(digitoRegion) >= 1 && digitoRegion <= String(24)) {

          // Extraigo el ultimo digito
          const ultimoDigito = Number(cedula.substring(9, 10));

          // Agrupo todos los pares y los sumo
          const pares = Number(cedula.substring(1, 2)) + Number(cedula.substring(3, 4)) + Number(cedula.substring(5, 6)) + Number(cedula.substring(7, 8));

          // Agrupo los impares, los multiplico por un factor de 2, si la resultante es > que 9 le restamos el 9 a la resultante
          let numeroUno: any = cedula.substring(0, 1);
          numeroUno = (numeroUno * 2);
          if (numeroUno > 9) {
            numeroUno = (numeroUno - 9);
          };

          let numeroTres: any = cedula.substring(2, 3);
          numeroTres = (numeroTres * 2);
          if (numeroTres > 9) {
            numeroTres = (numeroTres - 9);
          };

          let numeroCinco: any = cedula.substring(4, 5);
          numeroCinco = (numeroCinco * 2);
          if (numeroCinco > 9) {
            numeroCinco = (numeroCinco - 9);
          };

          let numeroSiete: any = cedula.substring(6, 7);
          numeroSiete = (numeroSiete * 2);
          if (numeroSiete > 9) {
            numeroSiete = (numeroSiete - 9);
          };

          let numeroNueve: any = cedula.substring(8, 9);
          numeroNueve = (numeroNueve * 2);
          if (numeroNueve > 9) {
            numeroNueve = (numeroNueve - 9);
          };

          const impares = numeroUno + numeroTres + numeroCinco + numeroSiete + numeroNueve;

          // Suma total
          const sumaTotal = (pares + impares);

          // extraemos el primero digito
          const primerDigitoSuma = String(sumaTotal).substring(0, 1);

          // Obtenemos la decena inmediata
          const decena = (Number(primerDigitoSuma) + 1) * 10;

          // Obtenemos la resta de la decena inmediata - la suma_total esto nos da el digito validador
          let digitoValidador = decena - sumaTotal;

          // Si el digito validador es = a 10 toma el valor de 0
          if (digitoValidador === 10) {
            digitoValidador = 0;
          };

          // Validamos que el digito validador sea igual al de la cedula
          if (digitoValidador === ultimoDigito) {
            console.log('La cédula es valida: ', cedula);
            //Aumentado para validación de número de celular
            if (celular.length != 10) {
              const sms = 'Celular no Valido!! debe contener 10 digitos';
              console.log(sms);
              this.presentToast(sms, 3000);
              return false;
            };
            //Aumentado para validación de número de celular
            //Aumentado para validación de la edad
            if (edad <= 14 || edad >= 71) {
              const sms = 'El rango de edad para usar la aplicación es de 15 - 70 años';
              console.log(sms);
              this.presentToast(sms, 3000);
              return false;
            };
            //Aumentado para validación de la edad
            const cadena = this.cliente.celular;
            const separador = "";
            const arregloDeSubCadenas = cadena.split(separador);
            //const numeroValido = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
            let cont = 0;
            console.log('El numero de telefono separado es:' , arregloDeSubCadenas);
            const recorreArray = (arr) => {
              for(let i=0; i<=arr.length-1; i++){
              console.log(arr[i]);
              if(arr[i] === "0" || arr[i] === "1" || arr[i] === "2" || arr[i] === "3" || arr[i] === "4" || arr[i] === "5"
              || arr[i] === "6" || arr[i] === "7" || arr[i] === "8" || arr[i] === "9"){
                cont = cont + 1;
              }
              }
            }
            recorreArray(arregloDeSubCadenas);
            console.log('El contador quedo con: ', cont);
            if(cont === 10){
              this.guardarCliente();
            return true;
            }else{
              const sms = 'Caracteres invalidos en número celular!!';
            console.log(sms, cedula);
            this.presentToast(sms, 2000);
            return false;
            }

            
          } else {
            const sms = 'Cédula no Valida!! ';
            console.log(sms, cedula);
            this.presentToast(sms, 2000);
            return false;
          }
        } else {
          // imprimimos en consola si la region no pertenece
          console.log('La cedula NO valida region no pertenece: ', cedula);
          const sms = 'Cédula no Valida!! ';
          console.log(sms, cedula);
          this.presentToast(sms, 2000);
          return false;
        }
      } else {
        // Imprimimos en consola si la cedula tiene mas o menos de 10 digitos
        const sms = 'Cédula no Valida!! debe contener 10 digitos';
        console.log(sms, cedula);
        this.presentToast(sms, 3000);
        return false;
      };

    } else {
      const sms = 'Llenar todos los campos requeridos (*)';
      console.log(sms);
      this.presentToast(sms, 2000);
      return;
    };

  }
}
