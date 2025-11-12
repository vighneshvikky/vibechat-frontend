import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../user/models/user.model';
import {
  LoginRequest,
  AuthApiResponse,
} from '../signup/inteface/signup.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  register(userData: User): Observable<AuthApiResponse> {
    console.log('signup data from frontend', userData);
    const data = this.http.post<AuthApiResponse>(
      `${this.api}/auth/register`,
      userData
    );
    console.log('signup backend data', data);
    return data;
  }

  login(userData: LoginRequest): Observable<AuthApiResponse> {
    console.log('userData', userData);
    const data = this.http.post<AuthApiResponse>(
      `${this.api}/auth/login`,
      userData,
      {
        withCredentials: true,
      }
    );
    console.log('login data from backend', data);
    return data;
  }
}
