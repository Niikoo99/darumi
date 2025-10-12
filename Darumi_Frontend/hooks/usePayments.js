import { useState, useEffect, useCallback } from 'react';
import { PaymentsService } from '../services/PaymentsService';
import { useUser } from '@clerk/clerk-react';

/**
 * Hook personalizado para gestión de pagos habituales
 * Maneja el estado, carga de datos y operaciones CRUD
 */
export const usePayments = () => {
  const { user } = useUser();
  const [payments, setPayments] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Obtener ID del usuario
  const userId = user?.id || 'user_2WYDGoIeCLh6Lb1XmVlUlMqQUaM'; // Fallback para testing

  /**
   * Carga todos los pagos habituales
   */
  const loadPayments = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await PaymentsService.getAll(userId);
      setPayments(response.data || []);
      
    } catch (err) {
      console.error('Error cargando pagos:', err);
      setError(err.message || 'Error al cargar pagos habituales');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * Carga el resumen de pagos habituales
   */
  const loadResumen = useCallback(async () => {
    if (!userId) return;
    
    try {
      const response = await PaymentsService.getResumen(userId);
      setResumen(response);
    } catch (err) {
      console.error('Error cargando resumen:', err);
      // No establecer error aquí para no interferir con la carga principal
    }
  }, [userId]);

  /**
   * Crea un nuevo pago habitual
   */
  const createPayment = useCallback(async (paymentData) => {
    if (!userId) throw new Error('Usuario no identificado');
    
    try {
      setIsCreating(true);
      setError(null);
      
      const dataToSend = {
        Id_Usuario: userId,
        Titulo: paymentData.titulo,
        Monto: parseFloat(paymentData.monto),
        Tipo: paymentData.tipo || 'Pago',
        Recurrencia: paymentData.recurrencia || 'mensual',
        Active: 1,
        InsDateTime: new Date().toISOString(),
        UpdDateTime: new Date().toISOString()
      };
      
      const response = await PaymentsService.create(dataToSend);
      
      // Recargar datos después de crear
      await loadPayments();
      await loadResumen();
      
      return response;
    } catch (err) {
      console.error('Error creando pago:', err);
      setError(err.message || 'Error al crear pago habitual');
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, [userId, loadPayments, loadResumen]);

  /**
   * Actualiza un pago habitual
   */
  const updatePayment = useCallback(async (id, updateData) => {
    try {
      setIsUpdating(true);
      setError(null);
      
      const response = await PaymentsService.update(id, updateData);
      
      // Recargar datos después de actualizar
      await loadPayments();
      await loadResumen();
      
      return response;
    } catch (err) {
      console.error('Error actualizando pago:', err);
      setError(err.message || 'Error al actualizar pago habitual');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [loadPayments, loadResumen]);

  /**
   * Elimina un pago habitual
   */
  const deletePayment = useCallback(async (id) => {
    try {
      setIsDeleting(true);
      setError(null);
      
      const response = await PaymentsService.delete(id);
      
      // Recargar datos después de eliminar
      await loadPayments();
      await loadResumen();
      
      return response;
    } catch (err) {
      console.error('Error eliminando pago:', err);
      setError(err.message || 'Error al eliminar pago habitual');
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, [loadPayments, loadResumen]);

  /**
   * Activa o desactiva un pago habitual
   */
  const toggleActive = useCallback(async (id, active) => {
    try {
      setError(null);
      
      const response = await PaymentsService.toggleActive(id, active);
      
      // Actualizar estado local sin recargar todos los datos
      setPayments(prevPayments => 
        prevPayments.map(payment => 
          payment.Id_PagoHabitual === id 
            ? { ...payment, Active: active ? 1 : 0 }
            : payment
        )
      );
      
      // Recargar resumen para actualizar estadísticas
      await loadResumen();
      
      return response;
    } catch (err) {
      console.error('Error cambiando estado del pago:', err);
      setError(err.message || 'Error al cambiar estado del pago');
      throw err;
    }
  }, [loadResumen]);

  /**
   * Procesa pagos habituales manualmente
   */
  const procesarPagos = useCallback(async () => {
    try {
      setError(null);
      
      const response = await PaymentsService.procesarPagos();
      
      // Recargar datos después de procesar
      await loadPayments();
      await loadResumen();
      
      return response;
    } catch (err) {
      console.error('Error procesando pagos:', err);
      setError(err.message || 'Error al procesar pagos habituales');
      throw err;
    }
  }, [loadPayments, loadResumen]);

  /**
   * Obtiene estadísticas de pagos habituales
   */
  const getEstadisticas = useCallback(async () => {
    if (!userId) return null;
    
    try {
      const response = await PaymentsService.getEstadisticas(userId);
      return response;
    } catch (err) {
      console.error('Error obteniendo estadísticas:', err);
      return null;
    }
  }, [userId]);

  /**
   * Obtiene gastos generados por pagos habituales
   */
  const getGastosGenerados = useCallback(async (mes = null, año = null) => {
    if (!userId) return [];
    
    try {
      const response = await PaymentsService.getGastosGenerados(userId, mes, año);
      return response;
    } catch (err) {
      console.error('Error obteniendo gastos generados:', err);
      return [];
    }
  }, [userId]);

  /**
   * Refresca todos los datos
   */
  const refresh = useCallback(async () => {
    await Promise.all([
      loadPayments(),
      loadResumen()
    ]);
  }, [loadPayments, loadResumen]);

  /**
   * Limpia el error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cargar datos al montar el componente
  useEffect(() => {
    if (userId) {
      refresh();
    }
  }, [userId, refresh]);

  // Calcular estadísticas locales
  const stats = {
    totalPagos: payments.filter(p => p.Tipo === 'Pago').length,
    totalIngresos: payments.filter(p => p.Tipo === 'Ingreso').length,
    pagosActivos: payments.filter(p => p.Active === 1).length,
    pagosInactivos: payments.filter(p => p.Active === 0).length,
    totalMontoPagos: payments
      .filter(p => p.Tipo === 'Pago')
      .reduce((sum, p) => sum + parseFloat(p.Monto || 0), 0),
    totalMontoIngresos: payments
      .filter(p => p.Tipo === 'Ingreso')
      .reduce((sum, p) => sum + parseFloat(p.Monto || 0), 0),
  };

  return {
    // Datos
    payments,
    resumen,
    stats,
    
    // Estados de carga
    loading,
    isCreating,
    isUpdating,
    isDeleting,
    
    // Error
    error,
    clearError,
    
    // Acciones
    createPayment,
    updatePayment,
    deletePayment,
    toggleActive,
    procesarPagos,
    getEstadisticas,
    getGastosGenerados,
    refresh,
    
    // Utilidades
    userId
  };
};

export default usePayments;
