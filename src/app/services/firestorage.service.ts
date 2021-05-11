import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
//importacion para la carga de imagenes
import { finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirestorageService {

  constructor(public storage:AngularFireStorage) { }

  //para subir la imagen es necesario crear  promesas 
  uploadImagen(file: any, path: string, nombre: string): Promise<string> {
    return new Promise(resolve => {

      const filePath = path + '/' + nombre;
      const ref = this.storage.ref(filePath);
      const task = ref.put(file);
      task.snapshotChanges().pipe(
        finalize(() => {
          ref.getDownloadURL().subscribe(res => {
            const donwloadURL = res;
            resolve(donwloadURL);
            return;
          });

        })
      )
        .subscribe()
    });
  }

  eliminarFoto(downloadUrl){
    
    return this.storage.storage.refFromURL(downloadUrl).delete();
  }
}
