import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Necesario para *ngFor si es Standalone
import { JoinProject } from '../../services/join-project';

@Component({
  selector: 'app-join-project',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './join-project.html',
})
export class JoinProjectComponent implements OnInit {
  private joinProjectService = inject(JoinProject);
  private router = inject(Router);

  // Modelos para el formulario
  projects: any[] = [];
  selectedProjectId: number | null = null;
  accessKey: string = '';
  loading: boolean = false;

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects() {
    this.joinProjectService.getProyectos().subscribe({
      next: (data: any) => {
        this.projects = data.proyectos || [];
      },
      error: (err) => {
        console.error('Error al cargar proyectos:', err);
      }
    });
  }

  onSubmit() {
    if (!this.selectedProjectId || !this.accessKey) {
      alert('Por favor selecciona un proyecto e ingresa la clave.');
      return;
    }

    this.loading = true;

    this.joinProjectService.joinProyecto(this.selectedProjectId, this.accessKey).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        this.loading = false;
        alert(err.error?.error || err.error?.message || 'Error al unirse al proyecto.');
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
}