import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminProjectsService } from '../../services/admin-projects';

@Component({
  selector: 'app-admin-projects',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    DatePipe
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
  loading: boolean = false;
  
  // Modal
  isModalOpen: boolean = false;
  selectedProyectoId: number | null = null;
  horasInput: number | string = '';
  modalError: string = '';
  modalSuccess: string = '';
  submitting: boolean = false;

  listaEstados: any[] = [];

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    const idProyecto = navigation?.extras.state?.['id_proyecto'] || history.state?.['id_proyecto'];

    if (idProyecto) {
      this.cargarInformacionProyecto(idProyecto);
    } else {
      this.errorMsg = 'No se seleccionó ningún proyecto.';
      this.cargando = false;
    }
    this.cargarEstados();
  }

  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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

  decode(){
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payloadBase64 = token.split('.')[1];
    const decodedJson = atob(payloadBase64);
    return JSON.parse(decodedJson);
  }

  admin(){
    const decoded = this.decode()
    const admin=decoded.Admin
    if (admin==true  || admin==1){
      return true
    }
    return false
  }
  /// Helper para obtener el ID del usuario/admin actual grabado en el login
private getCurrentUserId(): number | null {
  try {
    // Decodificamos el payload (segunda parte del JWT)
    const decoded = this.decode()
    return Number(
      decoded.id
    ) || null;
  } catch {
    return null;
  }
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

  const currentUserId = this.getCurrentUserId();

  // Verificamos si el admin ya está registrado comprobando varias formas de nombrar la clave ID
  const yaEstaInscrito = this.integrantes.some((personal) => {
    const idPersonal = Number(
      personal.Id_personal
    );
    return idPersonal === Number(currentUserId);
  });

  if (!yaEstaInscrito) {
    // 1. Si NO está inscrito, primero lo unimos usando el código de acceso del proyecto
    const codigoAcceso = this.proyecto.codigo_acceso;

    this.adminProjectsService.joinProyecto(this.selectedProyectoId, codigoAcceso).subscribe({
      next: () => {
        // Una vez unido, procedemos a registrar las horas
        this.guardarHoras();
      },
      error: (err) => {
        this.submitting = false;
        this.modalError = err.error?.error || err.error?.message || 'Error al unirse al proyecto automáticamente.';
      }
    });
  } else {
    // 2. Si YA está inscrito, guardamos horas directamente
    this.guardarHoras();
  }
}

  // Método auxiliar para realizar la petición HTTP de registro de horas
  private guardarHoras() {
    this.adminProjectsService.registrarHoras(this.selectedProyectoId!, Number(this.horasInput)).subscribe({
      next: () => {
        this.submitting = false;
        this.modalSuccess = '¡Horas registradas exitosamente!';
        
        // Recargamos los datos para actualizar la lista de integrantes y las horas sumadas
        if (this.selectedProyectoId) {
          this.cargarInformacionProyecto(this.selectedProyectoId);
        }

        setTimeout(() => {
          this.handleCloseModal();
        }, 1200);
      },
      error: (err) => {
        this.submitting = false;
        this.modalError = err.error?.error || err.error?.message || 'Error al guardar las horas.';
      }
    });
  }

  // Variables para el Modal de Ficha Editable
  isEditModalOpen: boolean = false;
  editForm = {
    nombre: '',
    codigo_acceso: '',
    fecha_inicio: '',
    horas_asignadas: 0,
    horas_aumentadas: 0,
    Id_estado: 1 // Usamos Id_estado para mantener coherencia con el [(ngModel)] del HTML
  };
  editModalError: string = '';
  editModalSuccess: string = '';
  editSubmitting: boolean = false;

  cargarEstados() {
    this.adminProjectsService.getEstados().subscribe({
      next: (res: any) => {
        this.listaEstados = res.estados || [];
      },
      error: (err) => console.error('Error al cargar estados:', err)
    });
  }

  // Abrir modal y cargar la ficha actual
  handleOpenEditModal() {
    if (!this.proyecto) return;

    const fechaFormateada = this.proyecto.fecha_inicio 
      ? new Date(this.proyecto.fecha_inicio).toISOString().split('T')[0] 
      : '';

    this.editForm = {
      nombre: this.proyecto.nombre || '',
      codigo_acceso: this.proyecto.codigo_acceso || '',
      fecha_inicio: fechaFormateada,
      horas_asignadas: this.proyecto.horas_asignadas || 0,
      horas_aumentadas: this.proyecto.horas_aumentadas || 0,
      Id_estado: this.proyecto.Id_estado || 1
    };

    this.editModalError = '';
    this.editModalSuccess = '';
    this.isEditModalOpen = true;
  }

  handleCloseEditModal() {
    this.isEditModalOpen = false;
  }

  // Restringir el código de acceso a 4 dígitos numéricos en tiempo real
  onCodigoInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '').slice(0, 4);
    this.editForm.codigo_acceso = input.value;
  }

  // Enviar la ficha completa al endpoint
  handleUpdateProyecto() {
    if (!this.editForm.nombre.trim()) {
      this.editModalError = 'El nombre del proyecto es obligatorio.';
      return;
    }

    if (this.editForm.codigo_acceso && this.editForm.codigo_acceso.length !== 4) {
      this.editModalError = 'El código de acceso debe tener exactamente 4 dígitos.';
      return;
    }

    this.editSubmitting = true;
    this.editModalError = '';
    this.editModalSuccess = '';

    const fechaLimpia = this.editForm.fecha_inicio ? this.editForm.fecha_inicio : '';

    this.adminProjectsService.updateProject(
      this.proyecto.Id_proyecto,                // id_proyecto
      this.editForm.codigo_acceso,              // clave
      this.editForm.nombre,                     // nombre
      fechaLimpia,                              // fecha (String YYYY-MM-DD)
      Number(this.editForm.Id_estado),          // <-- Estado actualizado del formulario
      Number(this.editForm.horas_asignadas),   // horas_asignadas
      Number(this.editForm.horas_aumentadas)    // horas_aumentadas
    ).subscribe({
      next: () => {
        this.editSubmitting = false;
        this.editModalSuccess = '¡Proyecto actualizado correctamente!';
        
        // Recargamos los datos actualizados en pantalla
        this.cargarInformacionProyecto(this.proyecto.Id_proyecto);

        setTimeout(() => {
          this.handleCloseEditModal();
        }, 1200);
      },
      error: (err) => {
        this.editSubmitting = false;
        this.editModalError = typeof err.error?.error === 'string' 
          ? err.error.error 
          : (err.error?.message || 'Error al actualizar el proyecto.');
      }
    });
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