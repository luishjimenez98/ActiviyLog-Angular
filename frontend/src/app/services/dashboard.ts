import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // 1. Obtener la lista de proyectos desde el backend
  getProyectos(): Observable<any> {
    return this.http.post(`${this.apiUrl}/proyectos/personal`, {});
  }

  // 2. Registrar horas en un proyecto
  registrarHoras(proyectoId: number, horas: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/horas`, {
      id_proyecto: proyectoId,
      horas: horas
    });
  }
}
