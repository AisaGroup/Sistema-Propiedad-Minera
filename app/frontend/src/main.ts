import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import moment from 'moment';

moment.locale('es');

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
