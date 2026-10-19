import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class AdminPersonalProjectService {
  private http = inject(HttpClient);
  private API_URL = 'http://localhost:3001'; 

  // Helper para enviar el token guardado en el login
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getPermisos(): Observable<any> {
    return this.http.get(`${this.API_URL}/personal/permisos`,
      { headers: this.getHeaders() });
  }

  getProyectosPersonal(idPersonal:number): Observable<any> {
    return this.http.post(`${this.API_URL}/proyectos/personal`,{id_personal:idPersonal},
      { headers: this.getHeaders() });
  }

  
}
