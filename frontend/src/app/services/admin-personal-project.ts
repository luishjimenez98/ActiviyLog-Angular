import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminPersonalProjectService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Obtener el catálogo global de permisos (para renderizar los checkboxes)
  getCatPermisos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/personal/permisos`);
  }

  // Obtener detalle del colaborador, proyecto y permisos activos
  getPersonalProyectoPermisos(id_personal: number, id_proyecto: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/personal/proyecto/permisos`, {
      id_personal,
      id_proyecto
    });
  }

  // Obtener el historial de registro de horas
  getHorasPersonalProyecto(id_personal: number, id_proyecto: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/horas/personal/proyecto`, {
      id_personal,
      id_proyecto
    });
  }

  // Guardar/actualizar permisos del colaborador
  updatePermisosPersonal(id_participacion: number, permisosSeleccionados: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/personal/proyecto/permisos/actualizar`, {
      id_participacion,
      permisosSeleccionados
    });
  }
}
