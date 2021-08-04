
export interface Mascota {
    foto: string;
    nombre: string;
    edad: number;
    sexo: string;
    tamanio: string;
    agresivo: string;
    observaciones: string;
    id: string;
    fechaCreacionMas: Date; 
    idDuenio: string;
}

export interface Cliente{
    uid: string;
    email: string;
    celular: string;
    foto: string;
    referncia: string;
    ubicacion: {
        lat: number;
        lng: number;
        direccion: string;
       }
    edad: number;
    nombre: string;
    apellido: string;
    cedula: string;
    mascotas: Mascota[];
    role: RolesExistentes;
} 

export type RolesExistentes = 'duenio' | 'paseador';

//Solicitud que genera el el dueño 
export interface Solicitud {
    id: string;
    fecha: any;
    duenio: Cliente;
    mascotasPaseo: Mascota[];
    tiempo: number;
    valor: number;
    observación: string;
    estado : EstadosSolicitud;
    // valoracion: number;
    // comentario: string;
}

export type EstadosSolicitud = 'nueva' | 'cancelada' | 'culminada'

//calificación 
export interface Calificacion {
    id: string;
    fecha: any;
    usuarioComenta: Cliente;
    comentario: string;
    valoracion: number;
}