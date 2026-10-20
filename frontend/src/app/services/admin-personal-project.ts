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

  // Obtener el catálogo global de permisos (para renderizar los checkboxes)
getCatPermisos(): Observable<any> {
  return this.http.get(`${this.API_URL}/personal/permisos`, { headers: this.getHeaders() });
}

// Obtener detalle del colaborador, proyecto y permisos activos (enviando IDs por body)
getPersonalProyectoPermisos(id_personal: number, id_proyecto: number): Observable<any> {
  return this.http.post(
    `${this.API_URL}/personal/proyecto/permisos`,
    { id_personal, id_proyecto },
    { headers: this.getHeaders() }
  );
}

// Obtener el historial de registro de horas (enviando IDs por body)
getHorasPersonalProyecto(id_personal: number, id_proyecto: number): Observable<any> {
  return this.http.post(
    `${this.API_URL}/horas/personal/proyecto`,
    { id_personal, id_proyecto },
    { headers: this.getHeaders() }
  );
}

// Guardar/actualizar permisos del colaborador
updatePermisosPersonal(id_participacion: number, permisosSeleccionados: number[]): Observable<any> {
  return this.http.post(
    `${this.API_URL}/personal/proyecto/permisos/actualizar`,
    { id_participacion, permisosSeleccionados },
    { headers: this.getHeaders() }
  );
}

  
}
