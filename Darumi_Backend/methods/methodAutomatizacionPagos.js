/* 
 * Módulo para automatización de pagos habituales
 * Se ejecuta mensualmente para convertir pagos habituales en gastos
 */

const fileName = 'methodAutomatizacionPagos.js';

const express = require('express');
const app = express();
const connection = require('../db');

const automatizacion = express.Router();

app.use(express.json());

/**
 * Procesa todos los pagos habituales activos y los convierte en gastos del mes actual
 * Esta función se ejecuta mensualmente para automatizar el registro de gastos recurrentes
 */
async function procesarPagosHabitualesMensuales() {
  try {
    console.log('Iniciando procesamiento mensual de pagos habituales...');
    
    // Obtener la fecha actual y calcular el primer día del mes
    const fechaActual = new Date();
    const primerDiaMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
    const ultimoDiaMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0);
    
    console.log(`Procesando pagos habituales para el período: ${primerDiaMes.toISOString().split('T')[0]} - ${ultimoDiaMes.toISOString().split('T')[0]}`);
    
    // Obtener todos los pagos habituales activos
    const pagosHabituales = await obtenerPagosHabitualesActivos();
    
    if (pagosHabituales.length === 0) {
      console.log('No hay pagos habituales activos para procesar');
      return { procesados: 0, errores: 0 };
    }
    
    let procesados = 0;
    let errores = 0;
    
    // Procesar cada pago habitual
    for (const pago of pagosHabituales) {
      try {
        // Verificar si ya se procesó este pago para este mes
        const yaProcesado = await verificarPagoYaProcesado(pago.Id_PagoHabitual, primerDiaMes, ultimoDiaMes);
        
        if (yaProcesado) {
          console.log(`Pago habitual ${pago.Id_PagoHabitual} ya fue procesado para este mes`);
          continue;
        }
        
        // Crear el gasto correspondiente
        await crearGastoDesdePagoHabitual(pago, primerDiaMes);
        
        // Crear notificación automática
        await crearNotificacionPagoProcesado(pago);
        
        procesados++;
        console.log(`Pago habitual procesado: ${pago.Titulo} - $${pago.Monto}`);
        
      } catch (error) {
        console.error(`Error procesando pago habitual ${pago.Id_PagoHabitual}:`, error);
        errores++;
      }
    }
    
    console.log(`Procesamiento completado. Procesados: ${procesados}, Errores: ${errores}`);
    return { procesados, errores };
    
  } catch (error) {
    console.error('Error en procesamiento mensual de pagos habituales:', error);
    throw error;
  }
}

/**
 * Obtiene todos los pagos habituales activos de todos los usuarios
 */
function obtenerPagosHabitualesActivos() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT PH.Id_PagoHabitual, PH.Id_Usuario, PH.Titulo, PH.Monto, U.Identifier_usuario
      FROM pagos_habituales PH
      JOIN usuarios U ON U.Id_usuario = PH.Id_Usuario
      WHERE PH.Active = 1
    `;
    
    connection.query(query, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

/**
 * Verifica si un pago habitual ya fue procesado para el mes actual
 */
function verificarPagoYaProcesado(pagoHabitualId, primerDiaMes, ultimoDiaMes) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT COUNT(*) as count
      FROM gastos 
      WHERE id_pago_habitual_origen = ? 
      AND Fecha_creacion_gasto >= ? 
      AND Fecha_creacion_gasto <= ?
      AND Active = 1
    `;
    
    connection.query(query, [pagoHabitualId, primerDiaMes, ultimoDiaMes], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results[0].count > 0);
      }
    });
  });
}

/**
 * Crea un gasto a partir de un pago habitual
 */
function crearGastoDesdePagoHabitual(pagoHabitual, fechaGasto) {
  return new Promise((resolve, reject) => {
    // Usar categoría "Varios" (ID 1) por defecto para pagos habituales
    const categoriaId = 1;
    const detalleGasto = `Pago habitual: ${pagoHabitual.Titulo}`;
    
    const query = `
      INSERT INTO gastos (Monto_gasto, Titulo_gasto, Detalle_gasto, Categoria_gasto, Id_usuario, Fecha_creacion_gasto, es_pago_habitual, id_pago_habitual_origen)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?)
    `;
    
    const valores = [
      pagoHabitual.Monto,
      pagoHabitual.Titulo,
      detalleGasto,
      categoriaId,
      pagoHabitual.Id_Usuario,
      fechaGasto,
      pagoHabitual.Id_PagoHabitual
    ];
    
    connection.query(query, valores, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results.insertId);
      }
    });
  });
}

/**
 * Crea una notificación cuando se procesa un pago habitual
 */
function crearNotificacionPagoProcesado(pagoHabitual) {
  return new Promise((resolve, reject) => {
    const titulo = `💳 Pago Habitual Procesado`;
    const mensaje = `Se procesó el pago habitual: ${pagoHabitual.Titulo} ($${pagoHabitual.Monto})`;
    
    const query = `
      INSERT INTO notificaciones (Id_usuario, Titulo, Mensaje, Fecha_creacion)
      VALUES (?, ?, ?, NOW())
    `;
    
    connection.query(query, [pagoHabitual.Id_Usuario, titulo, mensaje], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results.insertId);
      }
    });
  });
}

/**
 * Endpoint manual para procesar pagos habituales (para testing)
 */
automatizacion.post('/procesar-pagos-habituales', async (req, res) => {
  try {
    console.log('Solicitud manual de procesamiento de pagos habituales');
    const resultado = await procesarPagosHabitualesMensuales();
    
    res.json({
      success: true,
      message: 'Pagos habituales procesados exitosamente',
      resultado
    });
    
  } catch (error) {
    console.error('Error en procesamiento manual:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

/**
 * Endpoint para obtener estadísticas de pagos habituales procesados
 */
automatizacion.get('/estadisticas-pagos-habituales', (req, res) => {
  const userId = req.query.Id_Usuario;
  
  if (!userId) {
    return res.status(400).json({ error: 'Id_Usuario es requerido' });
  }
  
  const query = `
    SELECT 
      COUNT(*) as total_pagos_habituales,
      SUM(Monto) as monto_total_pendiente
    FROM pagos_habituales PH
    JOIN usuarios U ON U.Id_usuario = PH.Id_Usuario
    WHERE U.Identifier_usuario = ? AND PH.Active = 1
  `;
  
  connection.query(query, [userId], (error, results) => {
    if (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({ error: 'Error de servidor' });
    } else {
      res.json(results[0]);
    }
  });
});

/**
 * Endpoint para obtener gastos generados por pagos habituales de un usuario
 */
automatizacion.get('/gastos-pagos-habituales', (req, res) => {
  const userId = req.query.Id_Usuario;
  const mes = req.query.mes; // Formato: YYYY-MM
  const año = req.query.año; // Formato: YYYY
  
  if (!userId) {
    return res.status(400).json({ error: 'Id_Usuario es requerido' });
  }
  
  let query = `
    SELECT G.Id_gasto, G.Monto_gasto, G.Titulo_gasto, G.Detalle_gasto, 
           G.Fecha_creacion_gasto, C.Nombre_categoria, PH.Titulo as titulo_pago_habitual
    FROM gastos G
    JOIN usuarios U ON U.Id_usuario = G.Id_usuario
    JOIN categorias C ON C.Id_categoria = G.Id_categoria
    LEFT JOIN pagos_habituales PH ON PH.Id_PagoHabitual = G.id_pago_habitual_origen
    WHERE U.Identifier_usuario = ? AND G.es_pago_habitual = 1 AND G.Active = 1
  `;
  
  const params = [userId];
  
  // Filtrar por mes si se especifica
  if (mes && año) {
    query += ` AND YEAR(G.Fecha_creacion_gasto) = ? AND MONTH(G.Fecha_creacion_gasto) = ?`;
    params.push(año, mes);
  }
  
  query += ` ORDER BY G.Fecha_creacion_gasto DESC`;
  
  connection.query(query, params, (error, results) => {
    if (error) {
      console.error('Error al obtener gastos de pagos habituales:', error);
      res.status(500).json({ error: 'Error de servidor' });
    } else {
      res.json(results);
    }
  });
});

module.exports = {
  router: automatizacion,
  procesarPagosHabitualesMensuales
};
console.log(`Módulo ${fileName} cargado con éxito`);
