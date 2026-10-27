import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminPersonalService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getPersonal(): Observable<any> {
    return this.http.get(`${this.apiUrl}/personal`);
  }

  getProyectosPersonal(idPersonal: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/proyectos/personal`, {
      id_personal: idPersonal
    });
  }

  crearPersonal(
    Nombre: string,
    Apellido_paterno: string,
    Apellido_materno: string,
    Telefono: string,
    Admin: boolean | number,
    Email: string,
    Contrasena: string
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/personal`, {
      Nombre,
      Apellido_paterno,
      Apellido_materno,
      Telefono,
      Admin,
      Email,
      Contrasena
    });
  }
}
