import { HttpHeaders, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  apiUrl: string = 'https://strategy-finance.joinpuzzle.com/public/api/';
  headers = new HttpHeaders()
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json');
  constructor(private http: HttpClient) { }

  getInfoUser(data: any): Observable<any> {
    let API_URL = `${this.apiUrl}users?telephone=${data}`;
    return this.http.get(API_URL, { headers: this.headers }).pipe(catchError(this.error));
  }

  createNewUser(data: any): Observable<any> {
    let API_URL = `${this.apiUrl}users`;
    return this.http.post(API_URL, data, { headers: this.headers }).pipe(catchError(this.error));
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
