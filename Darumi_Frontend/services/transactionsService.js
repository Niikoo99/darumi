/**
 * Servicio para manejar transacciones unificadas
 * Integra con los nuevos endpoints del backend
 */

import axios from 'axios';
import { buildApiUrl, getEndpoints } from '../config/api';

class TransactionsService {
  /**
   * Obtiene todas las transacciones con filtros aplicados
   * @param {Object} params - Parámetros de filtro y paginación
   * @returns {Promise<Object>} Respuesta con transacciones paginadas
   */
  static async getTransactions(params = {}) {
    try {
      console.log('🔍 Fetching transactions with params:', params);
      
      const response = await axios.get(buildApiUrl(getEndpoints().TRANSACTIONS), {
        params: {
          ...params,
          // Asegurar que el parámetro del usuario esté presente
          Id_Usuario: params.Id_Usuario || params.userId,
        },
        timeout: 10000,
      });

      console.log('✅ Transactions fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching transactions:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtiene estadísticas de transacciones
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} Estadísticas de transacciones
   */
  static async getTransactionStats(userId) {
    try {
      console.log('📊 Fetching transaction stats for user:', userId);
      
      const response = await axios.get(buildApiUrl(getEndpoints().TRANSACTIONS_STATS), {
        params: { Id_Usuario: userId },
        timeout: 10000,
      });

      console.log('✅ Transaction stats fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching transaction stats:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtiene categorías disponibles
   * @returns {Promise<Object>} Lista de categorías
   */
  static async getCategories() {
    try {
      console.log('🏷️ Fetching categories');
      
      const response = await axios.get(buildApiUrl(getEndpoints().TRANSACTIONS_CATEGORIES), {
        timeout: 10000,
      });

      console.log('✅ Categories fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Aplica filtros a las transacciones
   * @param {Object} filters - Filtros a aplicar
   * @param {string} userId - ID del usuario
   * @param {Object} pagination - Parámetros de paginación
   * @returns {Promise<Object>} Transacciones filtradas
   */
  static async applyFilters(filters = {}, userId, pagination = {}) {
    try {
      const params = {
        Id_Usuario: userId,
        ...filters,
        ...pagination,
      };

      // Limpiar parámetros vacíos
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      console.log('🔍 Applying filters:', params);
      return await this.getTransactions(params);
    } catch (error) {
      console.error('❌ Error applying filters:', error);
      throw error;
    }
  }

  /**
   * Busca transacciones por texto
   * @param {string} searchTerm - Término de búsqueda
   * @param {string} userId - ID del usuario
   * @param {Object} additionalFilters - Filtros adicionales
   * @returns {Promise<Object>} Resultados de búsqueda
   */
  static async searchTransactions(searchTerm, userId, additionalFilters = {}) {
    try {
      const params = {
        Id_Usuario: userId,
        search: searchTerm,
        ...additionalFilters,
      };

      console.log('🔍 Searching transactions:', params);
      return await this.getTransactions(params);
    } catch (error) {
      console.error('❌ Error searching transactions:', error);
      throw error;
    }
  }

  /**
   * Obtiene transacciones por categoría
   * @param {string} category - Categoría a filtrar
   * @param {string} userId - ID del usuario
   * @param {Object} additionalFilters - Filtros adicionales
   * @returns {Promise<Object>} Transacciones de la categoría
   */
  static async getTransactionsByCategory(category, userId, additionalFilters = {}) {
    try {
      const params = {
        Id_Usuario: userId,
        category: category,
        ...additionalFilters,
      };

      console.log('🏷️ Getting transactions by category:', params);
      return await this.getTransactions(params);
    } catch (error) {
      console.error('❌ Error getting transactions by category:', error);
      throw error;
    }
  }

  /**
   * Obtiene transacciones por rango de fechas
   * @param {string} fromDate - Fecha desde
   * @param {string} toDate - Fecha hasta
   * @param {string} userId - ID del usuario
   * @param {Object} additionalFilters - Filtros adicionales
   * @returns {Promise<Object>} Transacciones del rango
   */
  static async getTransactionsByDateRange(fromDate, toDate, userId, additionalFilters = {}) {
    try {
      const params = {
        Id_Usuario: userId,
        from: fromDate,
        to: toDate,
        ...additionalFilters,
      };

      console.log('📅 Getting transactions by date range:', params);
      return await this.getTransactions(params);
    } catch (error) {
      console.error('❌ Error getting transactions by date range:', error);
      throw error;
    }
  }

  /**
   * Obtiene transacciones por rango de montos
   * @param {number} minAmount - Monto mínimo
   * @param {number} maxAmount - Monto máximo
   * @param {string} userId - ID del usuario
   * @param {Object} additionalFilters - Filtros adicionales
   * @returns {Promise<Object>} Transacciones del rango
   */
  static async getTransactionsByAmountRange(minAmount, maxAmount, userId, additionalFilters = {}) {
    try {
      const params = {
        Id_Usuario: userId,
        min: minAmount,
        max: maxAmount,
        ...additionalFilters,
      };

      console.log('💰 Getting transactions by amount range:', params);
      return await this.getTransactions(params);
    } catch (error) {
      console.error('❌ Error getting transactions by amount range:', error);
      throw error;
    }
  }

  /**
   * Maneja errores de la API
   * @param {Error} error - Error de la API
   * @returns {Error} Error formateado
   */
  static handleError(error) {
    if (error.response) {
      // Error de respuesta del servidor
      const { status, data } = error.response;
      const message = data?.message || data?.error || 'Error del servidor';
      
      return new Error(`Error ${status}: ${message}`);
    } else if (error.request) {
      // Error de red
      return new Error('Error de conexión. Verifica tu conexión a internet.');
    } else {
      // Error desconocido
      return new Error(error.message || 'Error desconocido');
    }
  }

  /**
   * Valida parámetros de filtro
   * @param {Object} filters - Filtros a validar
   * @returns {Object} Filtros validados
   */
  static validateFilters(filters) {
    const validated = {};

    // Validar categoría
    if (filters.category && typeof filters.category === 'string') {
      validated.category = filters.category.trim();
    }

    // Validar fechas
    if (filters.from && typeof filters.from === 'string') {
      validated.from = filters.from;
    }
    if (filters.to && typeof filters.to === 'string') {
      validated.to = filters.to;
    }

    // Validar montos
    if (filters.min && !isNaN(parseFloat(filters.min))) {
      validated.min = parseFloat(filters.min);
    }
    if (filters.max && !isNaN(parseFloat(filters.max))) {
      validated.max = parseFloat(filters.max);
    }

    // Validar búsqueda
    if (filters.search && typeof filters.search === 'string') {
      validated.search = filters.search.trim();
    }

    // Validar tipo de transacción
    const validTypes = ['gasto', 'ingreso', 'all'];
    if (filters.type && validTypes.includes(filters.type)) {
      validated.type = filters.type;
    }

    // Validar ordenamiento
    const validOrders = ['date_asc', 'date_desc', 'amount_asc', 'amount_desc'];
    if (filters.order && validOrders.includes(filters.order)) {
      validated.order = filters.order;
    }

    return validated;
  }

  /**
   * Valida parámetros de paginación
   * @param {Object} pagination - Parámetros de paginación
   * @returns {Object} Parámetros validados
   */
  static validatePagination(pagination) {
    const validated = {};

    // Validar página
    if (pagination.page && !isNaN(parseInt(pagination.page))) {
      validated.page = Math.max(1, parseInt(pagination.page));
    }

    // Validar límite
    if (pagination.limit && !isNaN(parseInt(pagination.limit))) {
      validated.limit = Math.min(100, Math.max(1, parseInt(pagination.limit)));
    }

    return validated;
  }
}

export default TransactionsService;
