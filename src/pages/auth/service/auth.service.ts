import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.api}/auth/register`, userData);
  }

  login(userData: any): Observable<any> {
    console.log('userData', userData);
    return this.http.post<any>(`${this.api}/auth/login`, userData, {
      withCredentials: true,
    });
  }
}
