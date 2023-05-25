import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgxOtpInputModule } from 'ngx-otp-input';
import { registerLocaleData } from '@angular/common';
import * as fr from '@angular/common/locales/fr';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgxOtpInputModule
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'fr-FR'}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { 
  constructor() {
    registerLocaleData(fr.default);
  }
}
