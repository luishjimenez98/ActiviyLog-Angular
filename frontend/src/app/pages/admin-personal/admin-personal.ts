import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminPersonalService } from '../../services/admin-personal';

@Component({
  selector: 'app-admin-personal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-personal.html'
})
export class AdminPersonalComponent implements OnInit {
  private router = inject(Router);
  private adminPersonalService = inject(AdminPersonalService);

  // Listas de datos
  listaPersonal: any[] = [];
  proyectosPersonal: any[] = [];

  // Estado del formulario
  selectedPersonalId: number | null = null;
  trabajadorSeleccionado: any = null;

  // Estados UI
  cargandoPersonal = false;
  cargandoProyectos = false;
  errorMsg = '';

  ngOnInit(): void {
    this.obtenerListaPersonal();
  }

  // Carga el listado para llenar el ComboBox
  obtenerListaPersonal() {
    this.cargandoPersonal = true;
    this.adminPersonalService.getPersonal().subscribe({
      next: (res: any) => {
        this.listaPersonal = res.personal || [];
        this.cargandoPersonal = false;
      },
      error: (err) => {
        console.error('Error al obtener personal:', err);
        this.cargandoPersonal = false;
      }
    });
  }

  // Se dispara automáticamente al elegir una opción en el ComboBox
  onSeleccionarTrabajador() {
    if (!this.selectedPersonalId) {
      this.trabajadorSeleccionado = null;
      this.proyectosPersonal = [];
      return;
    }

    // Buscamos el objeto del trabajador seleccionado
    this.trabajadorSeleccionado = this.listaPersonal.find(
      (p) => Number(p.Id_personal) === Number(this.selectedPersonalId)
    );

    this.cargarProyectosDelTrabajador(this.selectedPersonalId);
  }

  // Consulta los proyectos asociados al trabajador
  cargarProyectosDelTrabajador(idPersonal: number) {
    this.cargandoProyectos = true;
    this.proyectosPersonal = [];

    this.adminPersonalService.getProyectosPersonal(idPersonal).subscribe({
      next: (res: any) => {
        this.proyectosPersonal = res.proyectos || [];
        this.cargandoProyectos = false;
      },
      error: (err) => {
        console.error('Error al cargar proyectos del trabajador:', err);
        this.cargandoProyectos = false;
      }
    });
  }

  // Navegación
  navigate(route: string) {
    this.router.navigate([route]);
  }

  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  // Redirige a administrar el proyecto seleccionado
  administrarPersonalProyecto(idProyecto: number) {
  if (!this.selectedPersonalId) return;

  this.router.navigate(['/admin/personal/proyecto'], {
    state: { 
      id_personal: this.selectedPersonalId,
      id_proyecto: idProyecto 
    }
  });
}
  // Variables del Modal
isRegisterModalOpen: boolean = false;
registerSubmitting: boolean = false;
registerModalError: string = '';
registerModalSuccess: string = '';

registerForm = {
  nombre: '',
  apellido_paterno: '',
  apellido_materno: '',
  telefono: '',
  isAdmin: false, //  true = Administrador
  email: '',
  contrasena: ''
};

handleOpenRegisterModal() {
  this.registerForm = {
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    telefono: '',
    isAdmin: false,
    email: '',
    contrasena: ''
  };
  this.registerModalError = '';
  this.registerModalSuccess = '';
  this.isRegisterModalOpen = true;
}

handleCloseRegisterModal() {
  this.isRegisterModalOpen = false;
}

// Restringe el teléfono a solo números y máximo 10 dígitos en tiempo real
onTelefonoInput(event: Event) {
  const input = event.target as HTMLInputElement;
  input.value = input.value.replace(/\D/g, '').slice(0, 10);
  this.registerForm.telefono = input.value;
}

handleRegisterPersonal() {
  if (
    !this.registerForm.nombre.trim() || 
    !this.registerForm.apellido_paterno.trim() || 
    !this.registerForm.email.trim() || 
    !this.registerForm.contrasena.trim()
  ) {
    this.registerModalError = 'Por favor completa los campos obligatorios.';
    return;
  }

  // Validación de email: requiere '@' y '.'
  const emailLimpio = this.registerForm.email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailLimpio)) {
    this.registerModalError = 'Por favor ingresa un correo electrónico válido.';
    return;
  }

  // Validación de teléfono: solo números y máximo 10 dígitos (si se ingresa)
  if (this.registerForm.telefono && this.registerForm.telefono.length !== 10) {
    this.registerModalError = 'Por favor ingresa un numero telefonico válido.';
    return;
  }

  this.registerSubmitting = true;
  this.registerModalError = '';
  this.registerModalSuccess = '';

  // Invocación a tu servicio con los nombres de parámetros exactos
  this.adminPersonalService.crearPersonal(
    this.registerForm.nombre,
    this.registerForm.apellido_paterno,
    this.registerForm.apellido_materno,
    this.registerForm.telefono,
    this.registerForm.isAdmin ? 1 : 0, // Convierte a 1/0 o boolean según requiera el backend
    this.registerForm.email,
    this.registerForm.contrasena
  ).subscribe({
    next: () => {
      this.registerSubmitting = false;
      this.registerModalSuccess = '¡Personal registrado exitosamente!';
      
      // Recargamos el ComboBox del personal
      this.obtenerListaPersonal();

      setTimeout(() => {
        this.handleCloseRegisterModal();
      }, 1200);
    },
    error: (err) => {
      this.registerSubmitting = false;
      this.registerModalError = err.error?.error || err.error?.message || 'Error al registrar personal.';
    }
  });
}
}