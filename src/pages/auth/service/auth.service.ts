import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../user/models/user.model';
import {
  LoginRequest,
  AuthApiResponse,
} from '../signup/inteface/signup.interface';
import { API_ROUTES } from '../../../app/app.routes.constant';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authApi = environment.apiUrl + API_ROUTES.AUTH.BASE;

  constructor(private http: HttpClient) {}

  register(userData: User): Observable<AuthApiResponse> {
    const data = this.http.post<AuthApiResponse>(
      `${this.authApi}${API_ROUTES.AUTH.REGISTER}`,
      userData
    );
  
    return data;
  }

  login(userData: LoginRequest): Observable<AuthApiResponse> {
    const data = this.http.post<AuthApiResponse>(
      `${this.authApi}${API_ROUTES.AUTH.LOGIN}`,
      userData,
      {
        withCredentials: true,
      }
    );

    return data;
  }
}
