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

  // 2. Obtener el personal de un proyecto
  getPersonalProyecto(id_proyecto:number): Observable<any> {
    return this.http.post(`${this.API_URL}/personal/proyecto`,
       {id_proyecto:id_proyecto},
      { headers: this.getHeaders() });
  }

  getEstados(): Observable<any> {
    return this.http.get(`${this.API_URL}/proyectos/estados`,
      { headers: this.getHeaders() });
  }

  // 3. Método unificado: Ejecuta AMBAS peticiones en paralelo desde el servicio
  getDetalleCompletoProyecto(id_proyecto: number): Observable<{ proyectoData: any; personalData: any }> {
    return forkJoin({
      proyectoData: this.getProyecto(id_proyecto),
      personalData: this.getPersonalProyecto(id_proyecto)
    });
  }
  //Actualizar datos de un proyecto
  updateProject(id_proyecto:number, clave:string, nombre:string,fecha:string | Date | any,estado:number, horas_asignadas:number, horas_aumentadas:number): Observable<any> {
    return this.http.put(`${this.API_URL}/proyectos/actualizar`,
       {id_proyecto:id_proyecto,
        nombre,
        estado,
        fecha,
        horas_asignadas,
        codigo:clave,
        horas_aumentadas
       },
      { headers: this.getHeaders() });
  }
  //Registrar horas
  registrarHoras(proyectoId: number, horas: number): Observable<any> {
    return this.http.post(
      `${this.API_URL}/horas`,
      { 
        id_proyecto: proyectoId,
        horas: horas
       },
      { headers: this.getHeaders() }
    );
  }

  joinProyecto(proyectoId:number, codigo:string): Observable<any> {
    return this.http.post(`${this.API_URL}/proyectos/unirse`,{id_proyecto: proyectoId, codigo:codigo},
      {headers: this.getHeaders()});
  }
}
