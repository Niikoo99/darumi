import { buildApiUrl } from '../config/api';

/**
 * Servicio para gestión de pagos habituales
 * Proporciona métodos para comunicarse con la API del backend
 */
export const PaymentsService = {
  /**
   * Obtiene todos los pagos habituales de un usuario
   * @param {string} userId - ID del usuario
   * @param {boolean} includeInactive - Incluir pagos inactivos
   * @returns {Promise<Object>} Respuesta de la API
   */
  async getAll(userId, includeInactive = false) {
    try {
      const url = buildApiUrl('/pagos-habituales');
      const params = new URLSearchParams({
        Id_Usuario: userId,
        includeInactive: includeInactive.toString()
      });
      
      const response = await fetch(`${url}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo pagos habituales:', error);
      throw error;
    }
  },

  /**
   * Obtiene el resumen de pagos habituales
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} Resumen de pagos
   */
  async getResumen(userId) {
    try {
      const url = buildApiUrl('/pagos-habituales/resumen');
      const params = new URLSearchParams({
        Id_Usuario: userId
      });
      
      const response = await fetch(`${url}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo resumen de pagos:', error);
      throw error;
    }
  },

  /**
   * Crea un nuevo pago habitual
   * @param {Object} paymentData - Datos del pago
   * @returns {Promise<Object>} Respuesta de la API
   */
  async create(paymentData) {
    try {
      const url = buildApiUrl('/pagos-habituales');
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creando pago habitual:', error);
      throw error;
    }
  },

  /**
   * Actualiza un pago habitual
   * @param {number} id - ID del pago habitual
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} Respuesta de la API
   */
  async update(id, updateData) {
    try {
      const url = buildApiUrl(`/pagos-habituales/${id}`);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error actualizando pago habitual:', error);
      throw error;
    }
  },

  /**
   * Elimina un pago habitual
   * @param {number} id - ID del pago habitual
   * @returns {Promise<Object>} Respuesta de la API
   */
  async delete(id) {
    try {
      const url = buildApiUrl(`/pagos-habituales/${id}`);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error eliminando pago habitual:', error);
      throw error;
    }
  },

  /**
   * Activa o desactiva un pago habitual
   * @param {number} id - ID del pago habitual
   * @param {boolean} active - Estado activo/inactivo
   * @returns {Promise<Object>} Respuesta de la API
   */
  async toggleActive(id, active) {
    try {
      const url = buildApiUrl(`/pagos-habituales/${id}/active`);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error cambiando estado del pago habitual:', error);
      throw error;
    }
  },

  /**
   * Procesa pagos habituales manualmente (para testing)
   * @returns {Promise<Object>} Respuesta de la API
   */
  async procesarPagos() {
    try {
      const url = buildApiUrl('/procesar-pagos-habituales');
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error procesando pagos habituales:', error);
      throw error;
    }
  },

  /**
   * Obtiene estadísticas de pagos habituales
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} Estadísticas
   */
  async getEstadisticas(userId) {
    try {
      const url = buildApiUrl('/estadisticas-pagos-habituales');
      const params = new URLSearchParams({
        Id_Usuario: userId
      });
      
      const response = await fetch(`${url}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  },

  /**
   * Obtiene gastos generados por pagos habituales
   * @param {string} userId - ID del usuario
   * @param {string} mes - Mes (opcional)
   * @param {string} año - Año (opcional)
   * @returns {Promise<Object>} Gastos generados
   */
  async getGastosGenerados(userId, mes = null, año = null) {
    try {
      const url = buildApiUrl('/gastos-pagos-habituales');
      const params = new URLSearchParams({
        Id_Usuario: userId
      });
      
      if (mes) params.append('mes', mes);
      if (año) params.append('año', año);
      
      const response = await fetch(`${url}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo gastos generados:', error);
      throw error;
    }
  }
};

export default PaymentsService;
