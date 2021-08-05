import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Mascota } from '../modelBD';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  editMascota: Mascota;
  valorEliminar: number;
  link = '';
  constructor(public database:AngularFirestore) { }

  createDoc(data: any, path: string, id: string){
    console.log('Llega a la creación del cliente / D-W: ',data);
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
    return collection.valueChanges(); //value changes nos ayuda a estar pendientes de los cambios realizados en
    //la bd en tiempo real
  }

  getCollectionQuery<tipo>(path: string){
    const collection = this.database.collection<tipo>(path, 
      //ref => ref.where('estado', '==', 'enviado' )); 
      ref => ref.orderBy("mascotas","asc")); 
    return collection.valueChanges();  
  }

  /* Funciones creadas para editar y eliminar inicio */
  setItem(mascota: Mascota){
    this.editMascota = mascota;
  }

  getItem(){
    return this.editMascota;
  }
  setParametrosArrayMascota(id: number ){
    this.valorEliminar= id;
  }

  getValor(){
    return this.valorEliminar;
  }

  //Esta funcion está más arriba verificar solo falta el tipo 
  deletDocument<tipo>(enlace: string, id: string){
    const ref= this.database.collection<tipo>(enlace);
    return ref.doc(id).delete();
  }
  /* Funciones creadas para editar y eliminar Fin */


  /* funcion para retroceso con link */
  setLink(path :string){
    this.link = path;
  }
  getLink(){
    return this.link;
  }
  /* funcion para retroceso con link */

// traer toda la coleccíon mediante consultas 
getCollectionAll<tipo>(path: string, parametro:string, condicion:any, busqueda:string, startAt: any){
  if(startAt == null ){
    startAt = new Date();
  }
  //si deseo traer las coleciones de solicites de en diferentes ubicaciones seria collectionGroup
  const collection = this.database.collection<tipo>(path, 
    ref => ref.where(parametro, condicion, busqueda )
              .orderBy('fecha', 'desc')
              .limit(2)
              .startAfter(startAt)
              //.startAt(startAt) 
    ); 
  return collection.valueChanges();  
}
// traer toda la coleccíon mediante consultas 

/* getCollectionQuery<tipo>(path: string, parametro:string, condicion:any, busqueda:string){
  const collection = this.database.collection<tipo>(path, 
    //ref => ref.where('estado', '==', 'enviado' )); 
    ref => ref.where(parametro, condicion, busqueda )); 
  return collection.valueChanges();  
} */
}
