
export interface Mascota {
    foto: string;
    nombre: string;
    edad: number;
    sexo: string;
    tamanio: string;
    agresivo: string;
    // observaciones: string;
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
    estadoPaseador: EstadosPaseador;
} 

export type RolesExistentes = 'duenio' | 'paseador';
export type EstadosPaseador = 'activo' | 'inActivo';

//Solicitud que genera el el dueño 
export interface Solicitud {
    id: string;
    fecha: any;
    duenio: Cliente;
    mascotasPaseo: Mascota[];
    numMascotas: number;
    tiempo: number;
    valor: number;
    observacion: string;
    direccion: string;
    estado : EstadosSolicitud;
}

export type EstadosSolicitud = 'nueva' | 'cancelada' | 'culminada' | 'proceso' | 'aceptada' | 'Llego en 5 minutos' | 'Llego en 10 minutos'
                             | 'Estoy fuera' | 'Ya no estoy activo' | 'Paseando' | 'Paseo Finalizado' | 'No llegó el pasedor';

//calificación 
export interface Calificacion {
    id: string;
    fecha: any;
    // usuarioComenta: Cliente;
    comentario: string;
    valoracion: number;
}

export type Puntejes = 1 | 2 | 3 | 4 | 5;

//ofertando
export interface Ofrecer {
    id: string;
    fecha: any;
    paseador: Cliente;
    valor: number;
    estado: EstadosSolicitud;
    //Estado necesario para aceptar respuesta de confirmación
    ubicacion: {
        lat: number;
        lng: number;
        direccion: string;
    };
    
}