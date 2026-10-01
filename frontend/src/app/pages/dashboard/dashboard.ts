import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DashboardService } from '../../services/dashboard';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private router = inject(Router);

  proyectos: any[] = [];
  cargando: boolean = true;
  errorMsg: string = '';

  // Modal
  isModalOpen: boolean = false;
  selectedProyectoId: number | null = null;
  horasInput: number | string = '';
  modalError: string = '';
  modalSuccess: string = '';
  submitting: boolean = false;

  ngOnInit() {
    this.cargarProyectos();
  }

  cargarProyectos() {
    this.cargando = true;
    this.dashboardService.getProyectos().subscribe({
      next: (data) => {
        this.proyectos = data.proyectos || [];
        this.cargando = false;
      },
      error: (err) => {
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

  // Métodos del Modal
  handleOpenModal(proyectoId: number) {
    this.selectedProyectoId = proyectoId;
    this.modalError = '';
    this.modalSuccess = '';
    this.horasInput = '';
    this.isModalOpen = true;
  }

  handleCloseModal() {
    this.isModalOpen = false;
    this.selectedProyectoId = null;
  }

  handleAddHours() {
    if (!this.horasInput || Number(this.horasInput) <= 0) {
      this.modalError = 'Ingresa una cantidad de horas válida.';
      return;
    }

    if (!this.selectedProyectoId) return;

    this.submitting = true;
    this.modalError = '';
    this.modalSuccess = '';

    this.dashboardService.registrarHoras(this.selectedProyectoId, Number(this.horasInput)).subscribe({
      next: () => {
        this.submitting = false;
        this.modalSuccess = '¡Horas registradas exitosamente!';
        
        setTimeout(() => {
          this.handleCloseModal();
          this.cargarProyectos();
        }, 1200);
      },
      error: (err) => {
        this.submitting = false;
        this.modalError = err.error?.message || 'Error al guardar las horas.';
      }
    });
  }
}