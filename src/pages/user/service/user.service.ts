import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listAllUser(): Observable<User[]> {
    return this.http.get<User[]>(`${this.api}/users/all`, {
      withCredentials: true,
    });
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.api}/users/userDetails`, {
      withCredentials: true,
    });
  }
}
