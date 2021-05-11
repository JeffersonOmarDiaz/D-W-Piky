import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Mascota } from '../modelBD';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  editMascota: Mascota;
  constructor(public database:AngularFirestore) { }

  createDoc(data: any, path: string, id: string){
    const collection  = this.database.collection(path);
    return collection.doc(id).set(data);
  }

  getDoc<tipo>(path: string, id: string){
    const collection = this.database.collection<tipo>(path);
    return collection.doc(id).valueChanges();// el value changes es para ver los datos en tiempo real si existen cambios
  }

  deleteDoc(path: string, id: string){
    const collection = this.database.collection(path);
    return collection.doc(id).delete();
  } 
 
  updateDoc(data: any, path: string, id: string){
    const collection = this.database.collection(path);
    return collection.doc(id).update(data);
  }

  getId(){
    return this.database.createId();
  }

  //get collection ayuda a traer toda la colecion y no solo documentos 
  getCollection<tipo>(path: string){
    const collection = this.database.collection<tipo>(path); // se define un tipo para set-mascota
    return collection.valueChanges(); //value changues nos ayuda a estar penientes de los cambios realizados en
    //la bd en tiempo real
  }

  /* Funciones creadas para editar y eliminar inicio */
  setItem(mascota: Mascota){
    this.editMascota = mascota;
  }

  getItem(){
    return this.editMascota;
  }
  //Esta funcion está más arriba verificar solo falta el tipo 
  deletDocument<tipo>(enlace: string, id: string){
    const ref= this.database.collection<tipo>(enlace);
    return ref.doc(id).delete();
  }
  /* Funciones creadas para editar y eliminar Fin */

}
