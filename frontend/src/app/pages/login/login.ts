import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth'; // <-- Importamos el servicio

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html'
})
export class LoginComponent {
  // Inyectamos el servicio de auth y el enrutador
  private authService = inject(AuthService);
  private router = inject(Router);

  email: string = '';
  password: string = '';
  errorMessage: string = '';
  cargando: boolean = false;

  onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, llena todos los campos.';
      return;
    }

    this.cargando = true;
    this.errorMessage = '';

    // Nos suscribimos a la petición HTTP
    this.authService.login({ Email: this.email, Contrasena: this.password }).subscribe({
      next: (res) => {
        this.cargando = false;
        console.log('Respuesta del servidor:', res);
        
        // Si tu backend guarda un token o sesión, aquí lo procesas
        localStorage.setItem('token', res.token);
        
        // Redirigir a la pantalla principal del ActivityLog
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.cargando = false;
        console.error('Error al iniciar sesión:', err);
        this.errorMessage = err.error?.message || 'Error al conectar con el servidor.';
      }
    });
  }
}