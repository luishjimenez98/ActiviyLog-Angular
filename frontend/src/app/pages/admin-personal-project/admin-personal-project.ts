import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminPersonalProjectService } from '../../services/admin-personal-project'; // Ajusta la ruta a tu archivo de servicio

@Component({
  selector: 'app-admin-personal-project',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe
  ],
  templateUrl: './admin-personal-project.html'
})
export class AdminPersonalProjectComponent implements OnInit {
  private router = inject(Router);
  private adminPersonalProjectService = inject(AdminPersonalProjectService);

  idPersonal: number | null = null;
  idProyecto: number | null = null;
  idParticipacion: number | null = null;

  cargando = true;
  errorMsg = '';
  submittingPermisos = false;

  trabajador: any = null;
  proyecto: any = null;

  listaPermisos: any[] = [];
  permisosSeleccionados: number[] = []; 
  historialHoras: any[] = [];

  ngOnInit(): void {
    // Leemos los IDs pasados desde la pantalla anterior a través del history.state
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state || history.state;

    this.idPersonal = state?.['id_personal'] || null;
    this.idProyecto = state?.['id_proyecto'] || null;

    if (this.idPersonal && this.idProyecto) {
      this.cargarDatosIniciales();
    } else {
      this.errorMsg = 'No se proporcionaron los datos del trabajador o del proyecto.';
      this.cargando = false;
    }
  }

  cargarDatosIniciales() {
    this.cargando = true;

    // 1. Catálogo de permisos
    this.adminPersonalProjectService.getCatPermisos().subscribe({
      next: (res: any) => {
        this.listaPermisos = res.permisos || [];
      },
      error: (err) => console.error('Error al obtener catálogo de permisos:', err)
    });

    // 2. Detalle del trabajador, proyecto y sus permisos activos
    this.adminPersonalProjectService.getPersonalProyectoPermisos(this.idPersonal!, this.idProyecto!).subscribe({
      next: (res: any) => {
        this.trabajador = res.trabajador;
        this.proyecto = res.proyecto;
        this.idParticipacion = res.trabajador?.Id_participacion || null;
        this.permisosSeleccionados = res.permisosAsignados || [];
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al obtener detalle:', err);
        this.errorMsg = 'No se pudo cargar la información del colaborador.';
        this.cargando = false;
      }
    });

    // 3. Historial de horas del trabajador en este proyecto
    this.adminPersonalProjectService.getHorasPersonalProyecto(this.idPersonal!, this.idProyecto!).subscribe({
      next: (res: any) => {
        this.historialHoras = res.historial || [];
      },
      error: (err) => console.error('Error al obtener historial de horas:', err)
    });
  }

  hasPermiso(idPermiso: number): boolean {
    return this.permisosSeleccionados.includes(idPermiso);
  }

  readonly ID_REGISTRAR_HORAS = 1;
  readonly ID_ADMINISTRAR = 2;

  togglePermiso(idPermiso: number, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      // Si activa "Administrar", aseguramos que "Registrar horas" también se active
      if (idPermiso === this.ID_ADMINISTRAR) {
        if (!this.permisosSeleccionados.includes(this.ID_ADMINISTRAR)) {
          this.permisosSeleccionados.push(this.ID_ADMINISTRAR);
        }
        if (!this.permisosSeleccionados.includes(this.ID_REGISTRAR_HORAS)) {
          this.permisosSeleccionados.push(this.ID_REGISTRAR_HORAS);
        }
      } else {
        if (!this.permisosSeleccionados.includes(idPermiso)) {
          this.permisosSeleccionados.push(idPermiso);
        }
      }
    } else {
      // Si intenta desmarcar "Registrar horas" estando "Administrar" activo, se previene
      if (idPermiso === this.ID_REGISTRAR_HORAS && this.hasPermiso(this.ID_ADMINISTRAR)) {
        return; 
      }

      // Si desmarca cualquier otro permiso (o desmarca Administrar)
      this.permisosSeleccionados = this.permisosSeleccionados.filter(id => id !== idPermiso);
    }
  }

  // Controla qué checkboxes deben estar deshabilitados
  isPermisoDisabled(idPermiso: number): boolean {
    // Deshabilita el checkbox de "Registrar horas" si "Administrar" está seleccionado
    if (idPermiso === this.ID_REGISTRAR_HORAS && this.hasPermiso(this.ID_ADMINISTRAR)) {
      return true;
    }
    return false;
  }
  // Variables para notificaciones en pantalla
  saveSuccessMsg: string = '';
  saveErrorMsg: string = '';
  guardarPermisos() {
    if (!this.idParticipacion) {
      this.saveErrorMsg = 'No se encontró la participación del trabajador en este proyecto.';
      return;
    }

    this.submittingPermisos = true;
    this.saveSuccessMsg = '';
    this.saveErrorMsg = '';

    this.adminPersonalProjectService.updatePermisosPersonal(this.idParticipacion, this.permisosSeleccionados).subscribe({
      next: () => {
        this.submittingPermisos = false;
        this.saveSuccessMsg = '¡Permisos actualizados correctamente!';
        
        // Oculta el mensaje automáticamente tras 3 segundos
        setTimeout(() => {
          this.saveSuccessMsg = '';
        }, 2000);
      },
      error: (err) => {
        this.submittingPermisos = false;
        console.error('Error al actualizar permisos:', err);
        this.saveErrorMsg = typeof err.error?.error === 'string' 
          ? err.error.error 
          : 'Ocurrió un error al intentar guardar los permisos.';
      }
    });
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }

  volver() {
    this.router.navigate(['/admin/personal']);
  }

  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}