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

    const emailLimpio = this.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailLimpio)) {
      this.errorMessage = 'Por favor, ingresa un correo electrónico válido.';
      return;
    }

    this.cargando = true;
    this.errorMessage = '';

    // Nos suscribimos a la petición HTTP
    this.authService.login({ Email: this.email, Contrasena: this.password }).subscribe({
      next: (res) => {
        this.cargando = false;
        //Guardar token 
        localStorage.setItem('token', res.token);

        //Evaluar si es administrador
        const isAdmin = res.user?.Admin === true;

        //Redirigir según el rol
        if (isAdmin) {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.cargando = false;
        console.error('Error al iniciar sesión:', err);
        this.errorMessage = err.error?.error || err.error?.message || 'Error al conectar con el servidor.';
      }
    });
  }
}