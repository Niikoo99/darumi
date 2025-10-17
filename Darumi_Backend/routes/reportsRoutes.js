/**
 * Rutas para reportes de categorías top (gastos e ingresos)
 * Proporciona endpoints separados para obtener las categorías principales por tipo
 */

const express = require('express');
const router = express.Router();
const {
  getTopExpenses,
  getTopIncomes
} = require('../controllers/reportsController');

/**
 * @route GET /api/reports/top-expenses
 * @desc Obtiene las categorías principales de gastos para un mes específico
 * @access Private (requiere user ID)
 * @query {string} Id_Usuario - ID del usuario (requerido)
 * @query {string} month - Mes en formato YYYY-MM (opcional, default: mes actual)
 * @query {number} limit - Número máximo de categorías a devolver (opcional, default: 3)
 * @returns {Object} Respuesta con categorías de gastos y totales
 */
router.get('/api/reports/top-expenses', getTopExpenses);

/**
 * @route GET /api/reports/top-incomes
 * @desc Obtiene las categorías principales de ingresos para un mes específico
 * @access Private (requiere user ID)
 * @query {string} Id_Usuario - ID del usuario (requerido)
 * @query {string} month - Mes en formato YYYY-MM (opcional, default: mes actual)
 * @query {number} limit - Número máximo de categorías a devolver (opcional, default: 3)
 * @returns {Object} Respuesta con categorías de ingresos y totales
 */
router.get('/api/reports/top-incomes', getTopIncomes);

/**
 * @route GET /api/reports/health
 * @desc Endpoint de salud para verificar que el servicio de reportes está funcionando
 * @access Public
 * @returns {Object} Estado del servicio
 */
router.get('/api/reports/health', (req, res) => {
  res.json({
    success: true,
    message: 'Reports service is running',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/reports/top-expenses',
      'GET /api/reports/top-incomes'
    ]
  });
});

module.exports = router;


