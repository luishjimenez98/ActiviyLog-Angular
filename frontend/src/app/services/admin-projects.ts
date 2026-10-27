import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminProjectsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // 1. Obtener los datos de un proyecto
  getProyecto(id_proyecto: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/proyectos`, {
      id_proyecto: id_proyecto
    });
  }

  // 2. Obtener el personal de un proyecto
  getPersonalProyecto(id_proyecto: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/personal/proyecto`, {
      id_proyecto: id_proyecto
    });
  }

  getEstados(): Observable<any> {
    return this.http.get(`${this.apiUrl}/proyectos/estados`);
  }

  // 3. Método unificado: Ejecuta AMBAS peticiones en paralelo desde el servicio
  getDetalleCompletoProyecto(id_proyecto: number): Observable<{ proyectoData: any; personalData: any }> {
    return forkJoin({
      proyectoData: this.getProyecto(id_proyecto),
      personalData: this.getPersonalProyecto(id_proyecto)
    });
  }

  // Actualizar datos de un proyecto
  updateProject(
    id_proyecto: number,
    clave: string,
    nombre: string,
    fecha: string | Date | any,
    estado: number,
    horas_asignadas: number,
    horas_aumentadas: number
  ): Observable<any> {
    return this.http.put(`${this.apiUrl}/proyectos/actualizar`, {
      id_proyecto: id_proyecto,
      nombre,
      estado,
      fecha,
      horas_asignadas,
      codigo: clave,
      horas_aumentadas
    });
  }

  // Registrar horas
  registrarHoras(proyectoId: number, horas: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/horas`, {
      id_proyecto: proyectoId,
      horas: horas
    });
  }

  joinProyecto(proyectoId: number, codigo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/proyectos/unirse`, {
      id_proyecto: proyectoId,
      codigo: codigo
    });
  }
}
