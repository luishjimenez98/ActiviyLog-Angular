import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AdminDashboardService {
  private http = inject(HttpClient);
  private API_URL = 'http://localhost:3001'; 

  // Helper para enviar el token guardado en el login
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // 1. Obtener la lista de proyectos desde el backend
  getProyectos(): Observable<any> {
    return this.http.get(`${this.API_URL}/proyectos`);
  }

  // 2. Registrar horas en un proyecto
  crearProyectos(nombre:string, horas_asignadas:number): Observable<any> {
    return this.http.post(`${this.API_URL}/proyectos`,
       {nombre:nombre,
        horas_asignadas:horas_asignadas
       },
      { headers: this.getHeaders() });
  }
}
