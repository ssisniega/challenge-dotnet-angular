import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, 
              private router: Router,
              private notifier: NotificationService
  ) {}

  login(): void {
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.notifier.success('Bienvenido!', 'Login exitoso');
        localStorage.setItem('fromLogin', 'true');
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('❌ Error al iniciar sesión:', error);
        this.notifier.error('Credenciales inválidas', 'Error de login');
      }
    });
  }
}
