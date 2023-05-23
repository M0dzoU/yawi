import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactComponent } from './contact/contact.component';
import { ServicesComponent } from './services/services.component';
import { FooterComponent } from './footer/footer.component';

import { FeatherModule } from 'angular-feather';
import {
  Mail, Link, PhoneCall, Clock, MapPin, Facebook, Twitter, Instagram, Linkedin, Send, Calendar, User, Server, Rss, Layout, LifeBuoy,
  ArrowRightCircle, PieChart, Triangle
} from 'angular-feather/icons';
import { ScrollspyDirective } from './scrollspy.directive';
import { FormsModule } from '@angular/forms';
import { LoaderComponent } from './loader/loader.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { NgxPaginationModule } from 'ngx-pagination';

const icons = {
  Mail, Link, PhoneCall, Clock, MapPin, Facebook, Twitter, Instagram, Linkedin, Send, Calendar, User, Server, Rss, Layout, LifeBuoy,
  ArrowRightCircle, PieChart, Triangle
};

@NgModule({
  // tslint:disable-next-line: max-line-length
  declarations: [ContactComponent, ServicesComponent, FooterComponent, ScrollspyDirective, LoaderComponent, TransactionsComponent],
  imports: [
    CommonModule,
    FeatherModule.pick(icons),
    NgxPaginationModule,
    FormsModule
  ],
  // tslint:disable-next-line: max-line-length
  exports: [ContactComponent, ServicesComponent, FooterComponent, FeatherModule, ScrollspyDirective, LoaderComponent, TransactionsComponent]
})
export class SharedModule { }
