import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-personal-project',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    DatePipe],
  templateUrl: './admin-personal-project.html',
})
export class AdminPersonalProjectComponent implements OnInit{
  private router = inject(Router);

    // Estados de carga e información general
    cargando = true;
    errorMsg = '';
    submittingPermisos = false;

    // Datos pasados por navegación o parámetros
    idPersonal: number | null = null;
    idProyecto: number | null = null;
    
    // Datos del Empleado y Proyecto
    empleado: any = null;
    proyecto: any = null;

    // Columna Izquierda: Catálogo de Permisos y selección actual
    listaPermisos: any[] = [];
    permisosSeleccionados: number[] = []; // Guarda los Id_permiso activos

    // Columna Derecha: Historial de registro de horas del empleado en este proyecto
    historialHoras: any[] = [];

    ngOnInit(): void {
      // Recuperamos los IDs enviados desde la pantalla anterior mediante el estado de navegación
      const navigation = this.router.getCurrentNavigation();
      const state = navigation?.extras.state || history.state;

      this.idPersonal = state?.['id_personal'] || null;
      this.idProyecto = state?.['id_proyecto'] || null;

      if (this.idPersonal && this.idProyecto) {
        this.cargarDatosIniciales();
      } else {
        this.errorMsg = 'No se proporcionó la información del empleado o del proyecto.';
        this.cargando = false;
      }
    }

    cargarDatosIniciales() {
      this.cargando = true;
      
      // Aquí llamaremos más adelante a nuestros servicios para:
      // 1. Obtener catálogo de permisos (getPermisos)
      // 2. Obtener permisos actuales del usuario en el proyecto
      // 3. Obtener el historial de horas (fecha y cantidad)
      
      // Simulación de carga por el momento:
      setTimeout(() => {
        this.cargando = false;
      }, 500);
    }

    // Comprobar si un permiso está marcado
    hasPermiso(idPermiso: number): boolean {
      return this.permisosSeleccionados.includes(idPermiso);
    }

    // Toggle para marcar / desmarcar permisos
    togglePermiso(idPermiso: number, event: Event) {
      const checked = (event.target as HTMLInputElement).checked;
      if (checked) {
        if (!this.permisosSeleccionados.includes(idPermiso)) {
          this.permisosSeleccionados.push(idPermiso);
        }
      } else {
        this.permisosSeleccionados = this.permisosSeleccionados.filter(id => id !== idPermiso);
      }
    }

    // Guardar cambios de permisos
    guardarPermisos() {
      this.submittingPermisos = true;
      // Lógica para enviar los nuevos permisos al backend
    }

    navigate(route: string) {
      this.router.navigate([route]);
    }

    volver() {
      // Regresa a la pantalla de detalles del proyecto
      this.router.navigate(['/admin/projects'], {
        state: { id_proyecto: this.idProyecto }
      });
    }



}
