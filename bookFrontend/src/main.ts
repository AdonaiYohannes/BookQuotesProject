import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/Services/app'; // Fix the import path
import { appConfig } from './app/Services/app.config';       // Use your app.config

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));