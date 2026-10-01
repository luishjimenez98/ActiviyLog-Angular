import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // Hace que el servicio esté disponible en toda la app
})
export class AuthService {
  // Inyectamos el cliente HTTP de Angular
  private http = inject(HttpClient);

  private API_URL = 'http://localhost:3001'; 

  login(credentials: { Email: string; Contrasena: string }): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, credentials);
  }
}