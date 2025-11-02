import { Routes } from '@angular/router';
import { SignupComponent } from '../pages/auth/signup/signup.component';
import { LoginComponent } from '../pages/auth/login/login.component';
import { ChatComponent } from '../pages/user/chat/chat.component';

export const routes: Routes = [
  {
    path: '',
    component: SignupComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'dashboard',
    component: ChatComponent
  }
];
