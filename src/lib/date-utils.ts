/**
 * Utilidades para manejo de fechas sin problemas de zona horaria
 */

/**
 * Convierte una fecha a formato YYYY-MM-DD manteniendo la fecha local
 * @param date - Fecha a convertir (Date, string, o null/undefined)
 * @returns Fecha en formato YYYY-MM-DD o string vacío si es inválida
 */
export function formatDateForInput(date: Date | string | null | undefined): string {
  if (!date) return "";
  
  try {
    let dateObj: Date;
    
    if (typeof date === 'string') {
      // Si ya está en formato YYYY-MM-DD, devolverlo tal como está
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date;
      }
      // Crear fecha agregando tiempo local para evitar conversión UTC
      dateObj = new Date(date + (date.includes('T') ? '' : 'T00:00:00'));
    } else {
      dateObj = date;
    }
    
    if (isNaN(dateObj.getTime())) {
      return "";
    }
    
    // Formatear usando componentes locales para evitar UTC
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    return "";
  }
}

/**
 * Convierte una fecha a formato para mostrar al usuario (DD/MM/YYYY)
 * @param date - Fecha a convertir
 * @returns Fecha formateada para mostrar o "Fecha inválida"
 */
export function formatDateForDisplay(date: Date | string | null | undefined): string {
  if (!date) return "Fecha inválida";
  
  try {
    let dateObj: Date;
    
    if (typeof date === 'string') {
      // Crear fecha agregando tiempo local para evitar conversión UTC
      dateObj = new Date(date + (date.includes('T') ? '' : 'T00:00:00'));
    } else {
      dateObj = date;
    }
    
    if (isNaN(dateObj.getTime())) {
      return "Fecha inválida";
    }
    
    // Formatear usando componentes locales
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    return "Fecha inválida";
  }
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 * @returns Fecha actual en formato YYYY-MM-DD
 */
export function getCurrentDateForInput(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Valida si una fecha está en formato YYYY-MM-DD válido
 * @param dateString - String de fecha a validar
 * @returns true si es válida, false si no
 */
export function isValidDateString(dateString: string): boolean {
  if (!dateString || typeof dateString !== 'string') return false;
  
  // Verificar formato YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;
  
  // Verificar que sea una fecha válida
  const date = new Date(dateString + 'T00:00:00');
  return !isNaN(date.getTime());
}
