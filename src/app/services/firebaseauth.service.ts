import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class FirebaseauthService {

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

    
    logout() {
      return this.auth.signOut();
    }
    
    async getUid(){
      //currentUser retorna todas la credenciales que tiene el usuario
      const user = await this.auth.currentUser;
      if(user === null){
        return null;
      }else{
        console.log('Obtiene el id porque ya esta registrado ', user.uid);
        return user.uid;
      }
    }
    
    stateAuth(){
      return this.auth.authState;
    }
}
