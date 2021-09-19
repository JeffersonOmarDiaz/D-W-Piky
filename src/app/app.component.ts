//Sin modificaciones
import { Component } from '@angular/core';
import { FirebaseauthService } from './services/firebaseauth.service';
import { NotificationsService } from './services/notifications.service';

//Plginas adicionales
import { Platform } from '@ionic/angular';
import { Plugins, StatusBarStyle } from '@capacitor/core';

const { SplashScreen, StatusBar } = Plugins;
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private firebaseauthService : FirebaseauthService,
              private notificationsService: NotificationsService,
              private platform: Platform,) 
  {}

  initializeApp() {
    
    this.platform.ready().then(() => {

      // SplashScreen.hide();
      SplashScreen.show({
        showDuration: 7000,
        autoHide: true
      });
      StatusBar.setBackgroundColor({color: '#ffffff'});
      StatusBar.setStyle({
        style: StatusBarStyle.Light
      });
    });
}
}
 