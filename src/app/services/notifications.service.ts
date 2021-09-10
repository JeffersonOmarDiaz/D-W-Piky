import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import {
  Plugins,
  PushNotification,
  PushNotificationToken,
  PushNotificationActionPerformed,
  LocalNotificationActionPerformed, 
  Device
} from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { FirebaseauthService } from './firebaseauth.service';
import { FirestoreService } from './firestore.service';


const { PushNotifications } = Plugins;
const { LocalNotifications } = Plugins;//para notificaciones locales
@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  constructor(public platform: Platform,
    public firebaseauthService: FirebaseauthService,
    public firestoreService: FirestoreService,
    private router: Router,
    private http: HttpClient) {
    this.stateUser();
  }


  stateUser() { //para estar atento al estado de autenticación del usurio
    this.firebaseauthService.stateAuth().subscribe(res => {
      console.log(res);
      if (res !== null) {
        console.log('inicializará las solicitudes');
        this.inicializar(); //ESTA SECCION PODRÍA MODIFICAR PARA RECIBIR LAS NOTIFICACIONES 
        // POR PARTE DEL PASEADOR 
      }
    });

  }

  inicializar(){
    //para inicializar el servicio, por lo que debemos terner claro 
    //que el servicio será implemtado en un movil
    if(this.platform.is('capacitor')){
      //si estamos en un dispositivo andrid o ios
      PushNotifications.requestPermission().then( result =>{
        console.log('PushNotifications.requestPermission()');
        if(result.granted){
          //Permiso otrogado
          console.log('Permisos consedidos');
          // PushNotifications.register();
          this.addListeners();
        }else{
          //Mostrar el error
          //Si no acepta las notificacines etas no le llegará y el usuairo 
          //Puede habilitarlas despues
          console.log('Los permisos no han sido consedidos');
        }
      });
    }else{
      //Mostrar un mensaje que no estamos en un dispositivo móvil
      console.log('PushNotifications.requestPermission()  ==> No es móvil');
    }
  }

  addListeners(){
  PushNotifications.register();
    // LocalNotifications.schedule({
    //   notifications: [
    //     {
    //       title: 'notificacion local',
    //       body: 'Cuerpo de la notificación',
    //       id: 1,
    //       extra: {
    //         data: 'Datos adicionales'
    //       },
    //       iconColor: '#EB9234'
    //     }
    //   ]
    // });
    //eventos //cuando el usuario acepta las notificaciones
    PushNotifications.addListener('registration',
    (token: PushNotificationToken) =>{
      console.log('El token es: '), token;
      this.guardarToken(token.value);
      //si el usuario ya tenia un token establecido será el mismo
      //sinó genera uno nuevo
    }) ;

    PushNotifications.addListener('registrationError',
    //si da un error de registro
    (error: any) =>{
      console.log('Error de registro token', error);
    });

    //Esta nofificación sirve para cuando estemos en primer plano
    //cuando estamos dentro de la app 
    PushNotifications.addListener('pushNotificationReceived',
    (notification: PushNotification) =>{
      console.log('Push notifica 1er plano: ', notification);
      LocalNotifications.schedule({
        notifications: [
          //cuando la app este abierta mostrará la notificación local
          //y mostrará un sms "puede ser personalizado" pasa de push a local
          {
            title: notification.title,
          body: notification.body,
          id: 1,
          extra:{
            data: notification.data
          }
          }
        ]
      });
    });

    //cuando damos click en una notificaión PUSH
    PushNotifications.addListener('pushNotificationActionPerformed',
    (notification: PushNotificationActionPerformed) => {
      console.log('Push acction performed en segundo plano: ', notification);
      //this.router.navigate(['/perfil-persona']);
      this.router.navigate([notification.notification.data.enlace]);
    });

    //cuando damos clic en una aplicación local
    LocalNotifications.addListener('localNotificationActionPerformed',
    (notification: LocalNotificationActionPerformed) =>{
      console.log();
      // this.router.navigate(['/perfil-persona']); //Creamos una ruta más dinámica
      this.router.navigate([notification.notification.extra.data.enlace]);
    });
  }

  async guardarToken(token: any) {

    const Uid = await this.firebaseauthService.getUid();

    if (Uid) {
      console.log('guardar Token Firebase ->', Uid);
      const path = 'Cliente-dw/';
      const userUpdate = {
        token: token, //AUMENTA ESTA CAMPO A CLIENTES PORQUE NECESITAMOS EL TOQUEN 
      };
      this.firestoreService.updateDoc(userUpdate, path, Uid); //SE ACTUALIZA EL DOCUMENTO del usuario
      console.log('guardar TokenFirebase()->', userUpdate, path, Uid);
    }
  }

  newNotication() {

    //uid del usuario a quien deseo enviar una notificación, puede ser cualquiera
    const receptor = 'KS9PWuyaMHNk6k3gUqOaWDI4lH62'
    const path = 'Cliente/';
    this.firestoreService.getDoc<any>(path, receptor).subscribe(res => {
      //valida que la información exista, caso contrario no hará nada 
      if (res) {
        const token = res.token; //se puede validar que si no se tiene un token no envie notificación
        const dataNotification = {
          enlace: '/mis-pedidos', //esto es a donde queremos que se vaya
        }
        const notification = {
          //en la notificación tamien se puede añador una imgen 
          title: 'Mensaje enviado manuelmente',
          body: 'Cómo estas?'
        };
        //esto esta coordinado con newNotification por lo que si no escribo data o cambio el nombre de las variables no funcionará
        const data: INotification = {
          data: dataNotification,
          tokens: [token], //Puede ser con diversos token [token1, token2, .....]
          notification, //Cuerpo de la notificación "título y body"
        }
        //se hace una solicitud http atraves de una url 
        const url = 'https://us-central1-banca-2e58b.cloudfunctions.net/newNotificationPersonalizada';
        return this.http.post<Res>(url, { data }).subscribe(res => {
          console.log('respuesta newNotication() -> ', res);

        });
      }

    });
  }

}

//Si no es nuestro el api, deben decirnos que parámetros debe tener
//Por ejemplo la data que tiene título y body
interface INotification {
  data: any;
  tokens: string[];
  notification: any
}

//El tipo de respuesta que deseamos recibir y debe ser incluido en index.ts tambien puede obtener números 
interface Res {
  respuesta: string;
}