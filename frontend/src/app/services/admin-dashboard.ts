import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // 1. Obtener la lista de proyectos desde el backend
  getProyectos(): Observable<any> {
    return this.http.post(`${this.apiUrl}/proyectos`, {});
  }

  // 2. Crear proyecto
  crearProyectos(nombre: string, horas_asignadas: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/proyectos/crear`, {
      nombre: nombre,
      horas_asignadas: horas_asignadas
    });
  }
}
