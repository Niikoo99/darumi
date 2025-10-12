/**
 * Rutas para el manejo de transacciones unificadas
 * Soporta filtros, ordenamiento y paginación
 */

const express = require('express');
const router = express.Router();
const {
  getAllTransactions,
  getTransactionStats,
  getCategories
} = require('../controllers/transactionsController');

/**
 * @route GET /api/transactions
 * @desc Obtiene todas las transacciones de un usuario con filtros aplicados
 * @access Private (requiere user ID)
 * @query {string} Id_Usuario - ID del usuario (requerido)
 * @query {string} category - Filtro por categoría (opcional)
 * @query {string} from - Fecha desde (YYYY-MM-DD) (opcional)
 * @query {string} to - Fecha hasta (YYYY-MM-DD) (opcional)
 * @query {number} min - Monto mínimo (opcional)
 * @query {number} max - Monto máximo (opcional)
 * @query {string} search - Búsqueda en título o descripción (opcional)
 * @query {string} type - Tipo de transacción: gasto, ingreso, all (opcional, default: all)
 * @query {string} order - Ordenamiento: date_asc, date_desc, amount_asc, amount_desc (opcional, default: date_desc)
 * @query {number} page - Número de página (opcional, default: 1)
 * @query {number} limit - Elementos por página (opcional, default: 20, max: 100)
 * @returns {Object} Respuesta con transacciones paginadas y metadatos
 */
router.get('/api/transactions', getAllTransactions);

/**
 * @route GET /api/transactions/stats
 * @desc Obtiene estadísticas de transacciones para un usuario
 * @access Private (requiere user ID)
 * @query {string} Id_Usuario - ID del usuario (requerido)
 * @returns {Object} Estadísticas de transacciones
 */
router.get('/api/transactions/stats', getTransactionStats);

/**
 * @route GET /api/transactions/categories
 * @desc Obtiene todas las categorías disponibles con conteo de transacciones
 * @access Public
 * @returns {Object} Lista de categorías con conteo de transacciones
 */
router.get('/api/transactions/categories', getCategories);

/**
 * @route GET /api/transactions/health
 * @desc Endpoint de salud para verificar que el servicio está funcionando
 * @access Public
 * @returns {Object} Estado del servicio
 */
router.get('/api/transactions/health', (req, res) => {
  res.json({
    success: true,
    message: 'Transactions API is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

module.exports = router;
