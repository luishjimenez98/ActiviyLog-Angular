import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  try {
    // Decodificar el payload Base64 del JWT
    const payloadBase64 = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));

    // Revisar 'admin' o 'Admin' en el payload decodificado
    const isAdmin = decodedPayload.Admin === true;

    if (isAdmin) {
      return true; // Permitir acceso a la ruta de administrador
    }
  } catch (error) {
    console.error('Error al validar token en Guard:', error);
  }

  // Si no es admin o el token es inválido, redirigir al dashboard normal
  router.navigate(['/dashboard']);
  return false;
};