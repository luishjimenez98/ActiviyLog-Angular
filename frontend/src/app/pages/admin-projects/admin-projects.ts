import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // <-- 1. Importar DatePipe
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminProjectsService } from '../../services/admin-projects';

@Component({
  selector: 'app-admin-projects',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    DatePipe // <-- 2. Agregar DatePipe aquí
  ],
  templateUrl: './admin-projects.html',
})
export class AdminProjectsComponent implements OnInit {
  private router = inject(Router);
  private adminProjectsService = inject(AdminProjectsService);

  cargando = true;
  errorMsg = '';
  proyecto: any = null;
  integrantes: any[] = [];

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    const idProyecto = navigation?.extras.state?.['id_proyecto'] || history.state?.['id_proyecto'];

    if (idProyecto) {
      this.cargarInformacionProyecto(idProyecto);
    } else {
      this.errorMsg = 'No se seleccionó ningún proyecto.';
      this.cargando = false;
    }
  }

  cargarInformacionProyecto(id: number) {
    this.cargando = true;
    
    this.adminProjectsService.getDetalleCompletoProyecto(id).subscribe({
      next: ({ proyectoData, personalData }) => {
        this.proyecto = proyectoData.proyecto;
        this.integrantes = personalData.integrantes || [];
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar detalles:', err);
        this.errorMsg = 'No se pudieron obtener los datos del proyecto.';
        this.cargando = false;
      }
    });
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }
}