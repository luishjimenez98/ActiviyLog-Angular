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
    const parts = token.split('.');
    if (parts.length !== 3) {
      localStorage.removeItem('token');
      router.navigate(['/login']);
      return false;
    }

    // Decodificar Base64URL de forma segura
    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decodedPayload = JSON.parse(atob(payloadBase64));

    // Validar expiración del token (2.2): 'exp' viene en segundos según el estándar JWT
    if (decodedPayload.exp && Date.now() >= decodedPayload.exp * 1000) {
      localStorage.removeItem('token');
      router.navigate(['/login']);
      return false;
    }

    // Revisar si es Administrador
    const isAdmin = decodedPayload.Admin === true;

    if (isAdmin) {
      return true; // Permitir acceso a la ruta de administrador
    }
  } catch (error) {
    console.error('Error al validar token en Guard:', error);
    localStorage.removeItem('token');
    router.navigate(['/login']);
    return false;
  }

  // Si el token es válido pero el usuario no es admin, redirigir al dashboard normal
  router.navigate(['/dashboard']);
  return false;
};
