import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class JoinProject {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getProyectos(): Observable<any> {
    return this.http.post(`${this.apiUrl}/proyectos`, {});
  }

  joinProyecto(proyectoId: number, codigo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/proyectos/unirse`, {
      id_proyecto: proyectoId,
      codigo: codigo
    });
  }
}
