import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';

/* Importaciones para google movil */
import '@codetrix-studio/capacitor-google-auth';
import { Plugins } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class FirebaseauthService {
 
  /* Variables mobil */
  userM: any;
  userInfo = null;
  constructor(public auth: AngularFireAuth
          ) { 
            this.getUid();
          }

    // Sign in with Google
    GoogleAuth() {
      return this.auth.signInWithPopup( new firebase.auth.GoogleAuthProvider());
      
    }
  
    // Auth logic to run auth providers
    /* AuthLogin(provider) {
      return this.auth.signInWithPopup(provider)
      .then((result) => {
         this.ngZone.run(() => {
            this.router.navigate(['dashboard']);
          })
      }).catch((error) => {
        window.alert(error)
      })
    } */

    async autenticacionGoogle(){
      const googleUser =  await Plugins.GoogleAuth.signIn() as any;
      this.userInfo = googleUser;
      const credential = firebase.auth.GoogleAuthProvider.credential(googleUser.authentication.idToken);
      await this.auth.signInAndRetrieveDataWithCredential(credential);
      console.log("Enviando user info",this.userInfo);
      return this.userInfo = googleUser;
      
    }

    logout() {
      return this.auth.signOut();
    }
    
    async getUid(){
      //currentUser retorna todas la credenciales que tiene el usuario
      const user = await this.auth.currentUser;
      /* const user = await Plugins.GoogleAuth.signIn(); */
      if(user === null){
        console.log('El usuario con id es nulo');
        return null;
      }else{
        console.log('Obtiene el id porque ya esta registrado ', user.uid);
        return user.uid;
      }
      //Movil 
      /* if(this.userInfo === null){
        console.log('No se le puede asignar un id para registro');
        return null;
      }else{
        console.log('Obtiene el id porque ya esta registrado ', user.uid);
        return user.uid;
      } */
    }
    
    stateAuth(){
      return this.auth.authState;
    }
}
