//Sin modificaciones
import { Component } from '@angular/core';
import { FirebaseauthService } from './services/firebaseauth.service';
import { NotificationsService } from './services/notifications.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private firebaseauthService : FirebaseauthService,
              private notificationsService: NotificationsService ) 
  {}
}
 