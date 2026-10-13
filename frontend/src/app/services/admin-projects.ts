import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable,forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminProjectsService {
  private http = inject(HttpClient);
  private API_URL = 'http://localhost:3001'; 

  // Helper para enviar el token guardado en el login
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // 1. Obtener los datos de un proyecto
  getProyecto(id_proyecto:number): Observable<any> {
    return this.http.post(`${this.API_URL}/proyectos`,
       {id_proyecto:id_proyecto},
      { headers: this.getHeaders() });
  }

  // 2. Obtener el perosnal de un proyecto
  getPersonalProyecto(id_proyecto:number): Observable<any> {
    return this.http.post(`${this.API_URL}/personal/proyecto`,
       {id_proyecto:id_proyecto},
      { headers: this.getHeaders() });
  }

  // 3. Método unificado: Ejecuta AMBAS peticiones en paralelo desde el servicio
  getDetalleCompletoProyecto(id_proyecto: number): Observable<{ proyectoData: any; personalData: any }> {
    return forkJoin({
      proyectoData: this.getProyecto(id_proyecto),
      personalData: this.getPersonalProyecto(id_proyecto)
    });
  }
}
