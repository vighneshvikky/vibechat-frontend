import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { API_ROUTES } from '../../../app/app.routes.constant';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userApi = environment.apiUrl + API_ROUTES.USER.BASE;

  constructor(private http: HttpClient) {}

  listAllUser(): Observable<User[]> {
    return this.http.get<User[]>(`${this.userApi}${API_ROUTES.USER.ALL}`, {
      withCredentials: true,
    });
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.userApi}${API_ROUTES.USER.CURRENT}`, {
      withCredentials: true,
    });
  }
}
