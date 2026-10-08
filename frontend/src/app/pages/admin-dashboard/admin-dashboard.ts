import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminDashboardService } from '../../services/admin-dashboard';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
})
export class AdminDashboardComponent implements OnInit {
  private dashboardService = inject(AdminDashboardService);
  private router = inject(Router);

  // Datos de la vista
  projects: any[] = [];
  cargando: boolean = true;
  errorMsg: string = '';
  selectedSearchProjectId: number | null = null;

  // Modal para Crear Proyecto
  isModalOpen: boolean = false;
  nombreNuevoProyecto: string = '';
  horasAsignadasInput: number | string = '';
  modalError: string = '';
  modalSuccess: string = '';
  submitting: boolean = false;

  ngOnInit() {
    this.cargarProyectos();
  }

  cargarProyectos() {
    this.cargando = true;
    this.dashboardService.getProyectos().subscribe({
      next: (data: any) => {
        this.projects = data.proyectos || data || [];
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al obtener proyectos:', err);
        this.errorMsg = 'Error al cargar los proyectos desde la API.';
        this.cargando = false;
      }
    });
  }

  // Navegación del Header
  navigate(route: string) {
    this.router.navigate([route]);
  }

  handleLogout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  // Métodos del Modal (Crear Proyecto)
  handleOpenModal() {
    this.modalError = '';
    this.modalSuccess = '';
    this.nombreNuevoProyecto = '';
    this.horasAsignadasInput = '';
    this.isModalOpen = true;
  }

  handleCloseModal() {
    this.isModalOpen = false;
  }

  handleCreateProject() {
    if (!this.nombreNuevoProyecto.trim()) {
      this.modalError = 'Ingresa el nombre del proyecto.';
      return;
    }

    if (!this.horasAsignadasInput || Number(this.horasAsignadasInput) <= 0) {
      this.modalError = 'Ingresa una cantidad de horas asignadas válida.';
      return;
    }

    this.submitting = true;
    this.modalError = '';
    this.modalSuccess = '';


    this.dashboardService.crearProyectos(this.nombreNuevoProyecto, Number(this.horasAsignadasInput)).subscribe({
      next: () => {
        this.submitting = false;
        this.modalSuccess = '¡Proyecto creado exitosamente!';
        
        setTimeout(() => {
          this.handleCloseModal();
          this.cargarProyectos();
        }, 1200);
      },
      error: (err: any) => {
        this.submitting = false;
        this.modalError = err.error?.message || 'Error al crear el proyecto.';
      }
    });
  }
}