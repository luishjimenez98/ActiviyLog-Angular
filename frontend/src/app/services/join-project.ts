import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // Hace que el servicio esté disponible en toda la app
})
export class JoinProject {
  // Inyectamos el cliente HTTP de Angular
  private http = inject(HttpClient);

  private API_URL = 'http://localhost:3001'; 
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
  getProyectos(): Observable<any> {
    return this.http.post(`${this.API_URL}/proyectos`,{},
      { headers: this.getHeaders() });
  }

  joinProyecto(proyectoId:number, codigo:string): Observable<any> {
    return this.http.post(`${this.API_URL}/proyectos/unirse`,{id_proyecto: proyectoId, codigo:codigo},
      {headers: this.getHeaders()});
  }
}