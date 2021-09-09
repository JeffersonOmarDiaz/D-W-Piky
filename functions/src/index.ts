import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
// esta función es para administrar el modulo de firestore


admin.initializeApp();

const firestore = admin.firestore();

const uidAdmin = "CLfzqzQdrDaw6OfllbkRvr8pS7E3";

const cors = require('cors')({
    origin: true,
});

// son para el backend de firebase no para nuestra aplicación

// newSolicitud es palabra inventada
// para ue escuche cuando hay un nuevo pedido no cuando se cree un nuevo cliente 
// Escuchara de cualquier usuario 
exports.newSolicitud = functions.firestore  // Esta se crea para el admin y esta se deploya
    .document('/Cliente-dw/{userId}/solicitudes/{solicitudId}')
    .onCreate( async (event) => { // escucha cuando crea un nuevp pedido, pero puede escuchar cuando, actualiza, elimina, escribe

        const solicitud = event.data(); // para diferentes cosas, pero en este caso solo quiero saber la data o información del pedido

        console.log('newSolicitud ejecutada'); // este mensaje de consola se mira en las functions dentro de registros

        const path = '/Cliente-dw/' + uidAdmin;
        const docInfo = await firestore.doc(path).get();
        const dataUser = docInfo.data() as any;
        const token = dataUser.token;
        const registrationTokens = [token];// La notificación le llega al administrador  //Se pueden hacer arreglos re token si existiesen mas admin

        const dataFcm = {
            enlace: '/home-paseador', // para enviar informacion oculta
        }
        const notification: INotification = {
            data: dataFcm,
            tokens: registrationTokens,
            notification: {
                title: solicitud.duenio.nombre + ' ' + solicitud.duenio.apellido, // Puede ser cualquiercosa
                body: 'nueva solicitud: ' + solicitud.valor + '$',
            },
        }

        return sendNotification(notification);
    });

// es un funcion anónima y recibe un argumento de tipo INotificacion, Es interna y no se debe desplegar
const sendNotification = (notification: INotification) => {
    // resuelve una promesa 
    return new Promise((resolve) => {

        const message: admin.messaging.MulticastMessage = {

            data: notification.data, // ya se explicó arriba data de la notificación
            tokens: notification.tokens, // token del usuario
            notification: notification.notification, // Notificación con el tipo title y body 
            // Esta sección añade campos para android
            android: {
                notification: {
                    icon: 'ic_stat_name',
                    color: '#EB9234',
                }
            },
            // esta sección añade campos para ios 
            apns: {
                payload: {
                    aps: {
                        sound: {
                            critical: true,
                            name: 'default',
                            volume: 1,
                        }
                    }
                }
            }

        }
        // Mensajes de consola para ver si todo esta bien 
        console.log('List of tokens send', notification.tokens);
        // admin tiene varias funciones
        // Messaging sirve para enviar notificaciones pero tienen direntes funciones como sendMulticast. pero tambiem se puede enviar a un grupo o un tópico etc
        // message es lo que va a enviar, se configuró arriba
        admin.messaging().sendMulticast(message)
            .then((response) => {
                // Sirve para enviar como advertencia los toquen que deben ser eliminados se lo puede o no incluir
                if (response.failureCount > 0) {
                    const failedTokens: any[] = [];
                    response.responses.forEach((resp, idx) => {
                        if (!resp.success) {
                            failedTokens.push(notification.tokens[idx]);
                        }
                    });
                    console.log('List of tokens that caused failures: ' + failedTokens);
                    // elimnar tokens 
                } else {
                    console.log('Send notification exitoso -> ')
                }
                resolve(true);
                return;
            }).catch(error => { // Por si ocurre un error no es neceario, pero la documentación lo suguiere 
                console.log('Send fcm falló -> ', error)
                resolve(false);
                return;
            });

    });

}

// Esta funcion es para escuche el cliente la respuesta del admin
// En esta sección captura el id del cliente por lo cual es más fácil enviar la notificación 
exports.eventPedido = functions.firestore
    .document('/Cliente/{userId}/pedidos/{pedidoId}')//los campos deben sern ser llamados de igual forma que en la BD sino existe error
    .onUpdate(async (event, eventContext) => {

        const userUid = eventContext.params.userId; //Si deseamos el id DEl Pedido debe ser 
        const pedido = event.after.data() // el after es poque antes existía una actualización

        const dataFcm = {
            enlace: '/mis-pedidos', // esta ruta se abrira al llegar la notificación 
        }

        const path = '/Cliente/' + userUid; //obterngo el token del cliente mediante user id
        const docInfo = await firestore.doc(path).get();
        const dataUser = docInfo.data() as any;
        const token = dataUser.token;
        const registrationTokens = [token];

        const notification: INotification = {
            data: dataFcm,
            tokens: registrationTokens,
            notification: {
                title: 'Seguimiento de tu pedido',
                body: 'Pedido ' + pedido.estado,
            },
        }

        return sendNotification(notification);
    });

// Para l solicitud http
export const newNotification = functions.https.onRequest((request, response) => {

    return cors(request, response, async () => {
        // El request verifica si existe alguna información, en este caso se revisa el body 
        if (request.body.data) {
            const notification = request.body.data as INotification;
            await sendNotification(notification)
            const res: Res = {// La respuesta siemper va en formato json
                respuesta: 'success'
            };
            response.status(200).send(res);
        } else {
            const res = {// Si no tiene data es error, pero se puede cambiar el estatis de 200
                respuesta: 'error'
            };
            response.status(200).send(res);
        }
    });
});

// El tipo de respuesta que deseamos recibir y debe ser incluido en index.ts tambien puede obtener números 
interface Res {
    respuesta: string;
}

// Una notificación tienen un data, un token o arreglos de token y luego la notificación que tinee un titulo, sonido, etc
interface INotification {
    data: any;
    tokens: string[];
    notification: admin.messaging.Notification;
}