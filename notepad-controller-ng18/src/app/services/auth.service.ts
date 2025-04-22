import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:5018/api/Account';

  constructor(private http: HttpClient, private router: Router, private notifier: NotificationService) { }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response: any) => {
        localStorage.setItem('token', response.token);
      }),
      catchError((error) => {
        console.error('❌ Error en login:', error);
        return throwError(() => new Error('Usuario o contraseña inválidos'));
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.notifier.success('Cerraste sesión correctamente.', 'Logout');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}
