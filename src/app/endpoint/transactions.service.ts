import { HttpHeaders, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  apiUrlYawi: string = 'https://strategy-finance.joinpuzzle.com/public/api/';
  headersYawi = new HttpHeaders()
    .set('Content-Type', 'application/json');

  headersPatch = new HttpHeaders()
    .set('Content-Type', 'application/merge-patch+json');

  apiUrlPaydunya: string = 'https://app.paydunya.com/api/v1/';
  headersPaydunya = new HttpHeaders()
    .set('Content-Type', 'application/json')
    .set('PAYDUNYA-MASTER-KEY', '481VGrP5-WdCx-rVbY-4A5a-4kMwt1WEduZ3')
    .set('PAYDUNYA-PRIVATE-KEY', 'live_private_pW3kdztAqyjjKWCE5cxUlKR8XWF')
    .set('PAYDUNYA-TOKEN', 'ImdPh7spSD6vla3hF0x3');
  constructor(private http: HttpClient) { }

  checkOutInvoice(data: any): Observable<any> {
    let API_URL = `${this.apiUrlPaydunya}checkout-invoice/create`;
    return this.http.post(API_URL, data, { headers: this.headersPaydunya }).pipe(catchError(this.error));
  }

  getStatusCheckout(token: any): Observable<any> {
    let API_URL = `${this.apiUrlPaydunya}checkout-invoice/confirm/${token}`;
    return this.http.get(API_URL, { headers: this.headersPaydunya }).pipe(catchError(this.error));
  }

  softPayOrangeMoney(data: any): Observable<any> {
    let API_URL = `${this.apiUrlPaydunya}softpay/orange-money-senegal`;
    return this.http.post(API_URL, data, { headers: this.headersPaydunya }).pipe(catchError(this.error));
  }

  softPayWaveMoney(data: any): Observable<any> {
    let API_URL = `${this.apiUrlPaydunya}softpay/wave-senegal`;
    return this.http.post(API_URL, data, { headers: this.headersPaydunya }).pipe(catchError(this.error));
  }

  softPayFreeMoney(data: any): Observable<any> {
    let API_URL = `${this.apiUrlPaydunya}softpay/free-money-senegal`;
    return this.http.post(API_URL, data, { headers: this.headersPaydunya }).pipe(catchError(this.error));
  }

  getInvoice(data: any): Observable<any> {
    let API_URL = `${this.apiUrlPaydunya}disburse/get-invoice`;
    return this.http.post(API_URL, data, { headers: this.headersPaydunya }).pipe(catchError(this.error));
  }

  submitInvoice(data: any): Observable<any> {
    let API_URL = `${this.apiUrlPaydunya}disburse/submit-invoice`;
    return this.http.post(API_URL, data, { headers: this.headersPaydunya }).pipe(catchError(this.error));
  }

  createTransaction(data: any): Observable<any> {
    let API_URL = `${this.apiUrlYawi}transactions`;
    return this.http.post(API_URL, data, { headers: this.headersYawi }).pipe(catchError(this.error));
  }

  updateStatusOfTransaction(id: any): Observable<any> {
    let API_URL = `${this.apiUrlYawi}transactions/${id}`;
    return this.http.patch(API_URL, { "statut": 'Réussi' }, { headers: this.headersPatch }).pipe(catchError(this.error));
  }

  getLastOfTransaction(data: any): Observable<any> {
    let API_URL = `${this.apiUrlYawi}transactions?order[id]=desc&&user.telephone=${data}`;
    return this.http.get(API_URL, { headers: this.headersYawi }).pipe(catchError(this.error));
  }

  // Handle Errors
  error(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.log(errorMessage);
    return throwError(() => {
      return errorMessage;
    });
  }
}
