import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminPersonalService {
  private http = inject(HttpClient);
  private API_URL = 'http://localhost:3001'; 

  // Helper para enviar el token guardado en el login
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getPersonal(): Observable<any> {
    return this.http.get(`${this.API_URL}/personal`,
      { headers: this.getHeaders() });
  }

  getProyectosPersonal(idPersonal:number): Observable<any> {
    return this.http.post(`${this.API_URL}/proyectos/personal`,{id_personal:idPersonal},
      { headers: this.getHeaders() });
  }

  crearPersonal(Nombre:string, Apellido_paterno:string, Apellido_materno:string,Telefono:string,Admin:boolean | number,Email:string, Contrasena:string): Observable<any> {
    return this.http.post(`${this.API_URL}/personal`,{Nombre, Apellido_paterno, Apellido_materno,Telefono,Admin,Email, Contrasena},
      { headers: this.getHeaders() });
  }
}
