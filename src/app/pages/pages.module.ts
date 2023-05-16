import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagesRoutingModule } from './pages-routing.module';
import { HomeComponent } from './home/home.component';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TransactionsComponent } from './transactions/transactions.component';
import { NgxOtpInputModule } from 'ngx-otp-input';


@NgModule({
  declarations: [
    HomeComponent,
    TransactionsComponent
  ],
  imports: [
    CommonModule,
    PagesRoutingModule,
    SharedModule,
    FormsModule,
    NgxOtpInputModule,
    ReactiveFormsModule,
    ScrollToModule.forRoot(),
    NgbModalModule
  ]
})
export class PagesModule { }
