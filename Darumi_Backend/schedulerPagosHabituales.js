/* 
 * Sistema de programación de tareas para automatización de pagos habituales
 * Se ejecuta automáticamente el primer día de cada mes
 */

const fileName = 'schedulerPagosHabituales.js';

const cron = require('node-cron');
const connection = require('./db');

// Importar la función de procesamiento
const { procesarPagosHabitualesMensuales } = require('./methods/methodAutomatizacionPagos');

/**
 * Configuración del scheduler para ejecutar el procesamiento según diferentes recurrencias
 * Soporta procesamiento semanal, mensual y anual
 */
const configurarSchedulerCompleto = () => {
  console.log('Configurando scheduler completo para procesamiento de pagos habituales...');
  
  // Cron job para pagos semanales (domingos a las 00:01)
  cron.schedule('1 0 * * 0', async () => {
    console.log('Ejecutando procesamiento automático de pagos habituales SEMANALES...');
    
    try {
      const resultado = await procesarPagosHabitualesPorRecurrencia('semanal');
      console.log('Procesamiento semanal completado:', resultado);
      await registrarLogProcesamiento({ ...resultado, tipo: 'semanal' });
    } catch (error) {
      console.error('Error en procesamiento semanal:', error);
      await registrarLogProcesamiento({ error: error.message, tipo: 'semanal' });
    }
  }, {
    scheduled: true,
    timezone: "America/Argentina/Buenos_Aires"
  });
  
  // Cron job para pagos mensuales (primer día del mes a las 00:01)
  cron.schedule('1 0 1 * *', async () => {
    console.log('Ejecutando procesamiento automático de pagos habituales MENSUALES...');
    
    try {
      const resultado = await procesarPagosHabitualesPorRecurrencia('mensual');
      console.log('Procesamiento mensual completado:', resultado);
      await registrarLogProcesamiento({ ...resultado, tipo: 'mensual' });
    } catch (error) {
      console.error('Error en procesamiento mensual:', error);
      await registrarLogProcesamiento({ error: error.message, tipo: 'mensual' });
    }
  }, {
    scheduled: true,
    timezone: "America/Argentina/Buenos_Aires"
  });
  
  // Cron job para pagos anuales (1 de enero a las 00:01)
  cron.schedule('1 0 1 1 *', async () => {
    console.log('Ejecutando procesamiento automático de pagos habituales ANUALES...');
    
    try {
      const resultado = await procesarPagosHabitualesPorRecurrencia('anual');
      console.log('Procesamiento anual completado:', resultado);
      await registrarLogProcesamiento({ ...resultado, tipo: 'anual' });
    } catch (error) {
      console.error('Error en procesamiento anual:', error);
      await registrarLogProcesamiento({ error: error.message, tipo: 'anual' });
    }
  }, {
    scheduled: true,
    timezone: "America/Argentina/Buenos_Aires"
  });
  
  console.log('Scheduler completo configurado exitosamente');
};

/**
 * Función para procesar pagos habituales según el tipo de recurrencia
 */
async function procesarPagosHabitualesPorRecurrencia(tipoRecurrencia) {
  try {
    console.log(`Iniciando procesamiento de pagos habituales ${tipoRecurrencia}...`);
    
    // Obtener fecha actual y calcular período según recurrencia
    const fechaActual = new Date();
    let fechaInicio, fechaFin;
    
    switch (tipoRecurrencia) {
      case 'semanal':
        // Procesar para la semana actual
        const inicioSemana = new Date(fechaActual);
        inicioSemana.setDate(fechaActual.getDate() - fechaActual.getDay());
        fechaInicio = inicioSemana;
        fechaFin = new Date(inicioSemana);
        fechaFin.setDate(inicioSemana.getDate() + 6);
        break;
        
      case 'mensual':
        // Procesar para el mes actual
        fechaInicio = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
        fechaFin = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0);
        break;
        
      case 'anual':
        // Procesar para el año actual
        fechaInicio = new Date(fechaActual.getFullYear(), 0, 1);
        fechaFin = new Date(fechaActual.getFullYear(), 11, 31);
        break;
        
      default:
        throw new Error(`Tipo de recurrencia no válido: ${tipoRecurrencia}`);
    }
    
    console.log(`Procesando pagos habituales ${tipoRecurrencia} para el período: ${fechaInicio.toISOString().split('T')[0]} - ${fechaFin.toISOString().split('T')[0]}`);
    
    // Obtener pagos habituales activos con la recurrencia específica
    const pagosHabituales = await obtenerPagosHabitualesPorRecurrencia(tipoRecurrencia);
    
    if (pagosHabituales.length === 0) {
      console.log(`No hay pagos habituales ${tipoRecurrencia} activos para procesar`);
      return { procesados: 0, errores: 0, tipo: tipoRecurrencia };
    }
    
    let procesados = 0;
    let errores = 0;
    
    // Procesar cada pago habitual
    for (const pago of pagosHabituales) {
      try {
        // Verificar si ya se procesó este pago para este período
        const yaProcesado = await verificarPagoYaProcesadoPorPeriodo(pago.Id_PagoHabitual, fechaInicio, fechaFin);
        
        if (yaProcesado) {
          console.log(`Pago habitual ${pago.Id_PagoHabitual} ya fue procesado para este período ${tipoRecurrencia}`);
          continue;
        }
        
        // Crear el gasto correspondiente
        await crearGastoDesdePagoHabitual(pago, fechaInicio);
        
        // Crear notificación
        await crearNotificacionPagoProcesado(pago);
        
        procesados++;
        console.log(`Pago habitual ${tipoRecurrencia} procesado: ${pago.Titulo} - $${pago.Monto}`);
        
      } catch (error) {
        console.error(`Error procesando pago habitual ${pago.Id_PagoHabitual}:`, error);
        errores++;
      }
    }
    
    console.log(`Procesamiento ${tipoRecurrencia} completado. Procesados: ${procesados}, Errores: ${errores}`);
    return { procesados, errores, tipo: tipoRecurrencia };
    
  } catch (error) {
    console.error(`Error en procesamiento ${tipoRecurrencia} de pagos habituales:`, error);
    throw error;
  }
}

/**
 * Obtiene pagos habituales activos por tipo de recurrencia
 */
function obtenerPagosHabitualesPorRecurrencia(tipoRecurrencia) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT PH.Id_PagoHabitual, PH.Id_Usuario, PH.Titulo, PH.Monto, PH.Tipo, U.Identifier_usuario
      FROM pagos_habituales PH
      JOIN usuarios U ON U.Id_usuario = PH.Id_Usuario
      WHERE PH.Active = 1 AND PH.Recurrencia = ?
    `;
    
    connection.query(query, [tipoRecurrencia], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

/**
 * Verifica si un pago habitual ya fue procesado para un período específico
 */
function verificarPagoYaProcesadoPorPeriodo(pagoHabitualId, fechaInicio, fechaFin) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT COUNT(*) as count
      FROM gastos 
      WHERE id_pago_habitual_origen = ? 
      AND Fecha_creacion_gasto >= ? 
      AND Fecha_creacion_gasto <= ?
      AND Active = 1
    `;
    
    connection.query(query, [pagoHabitualId, fechaInicio, fechaFin], (error, results) => {
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

// Mantener función original para compatibilidad
const configurarSchedulerMensual = () => {
  console.log('Configurando scheduler para procesamiento mensual de pagos habituales...');
  
  // Cron job que se ejecuta el primer día de cada mes a las 00:01
  const cronExpression = '1 0 1 * *'; // minuto hora día mes día_semana
  
  cron.schedule(cronExpression, async () => {
    console.log('Ejecutando procesamiento automático de pagos habituales...');
    
    try {
      const resultado = await procesarPagosHabitualesMensuales();
      console.log('Procesamiento automático completado:', resultado);
      
      // Opcional: Registrar el resultado en una tabla de logs
      await registrarLogProcesamiento(resultado);
      
    } catch (error) {
      console.error('Error en procesamiento automático:', error);
      await registrarLogProcesamiento({ error: error.message });
    }
  }, {
    scheduled: true,
    timezone: "America/Argentina/Buenos_Aires" // Ajustar según la zona horaria del servidor
  });
  
  console.log('Scheduler configurado exitosamente');
};

/**
 * Función alternativa para ejecutar el procesamiento al inicio del servidor
 * Útil para testing o para procesar pagos pendientes
 */
const ejecutarProcesamientoAlInicio = async () => {
  console.log('Verificando si hay pagos habituales pendientes de procesar...');
  
  try {
    // Verificar si ya se procesó este mes
    const fechaActual = new Date();
    const primerDiaMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
    
    const yaProcesadoEsteMes = await verificarProcesamientoDelMes(primerDiaMes);
    
    if (!yaProcesadoEsteMes) {
      console.log('Ejecutando procesamiento de pagos habituales al inicio del servidor...');
      const resultado = await procesarPagosHabitualesMensuales();
      console.log('Procesamiento al inicio completado:', resultado);
    } else {
      console.log('Los pagos habituales ya fueron procesados este mes');
    }
    
  } catch (error) {
    console.error('Error en procesamiento al inicio:', error);
  }
};

/**
 * Verifica si ya se procesaron los pagos habituales para el mes actual
 */
const verificarProcesamientoDelMes = (primerDiaMes) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT COUNT(*) as count
      FROM logs_procesamiento_pagos 
      WHERE fecha_procesamiento >= ? 
      AND tipo_procesamiento = 'mensual'
    `;
    
    connection.query(query, [primerDiaMes], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results[0].count > 0);
      }
    });
  });
};

/**
 * Registra el resultado del procesamiento en una tabla de logs
 */
const registrarLogProcesamiento = (resultado) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO logs_procesamiento_pagos (fecha_procesamiento, tipo_procesamiento, resultado, fecha_creacion)
      VALUES (?, ?, ?, NOW())
    `;
    
    const valores = [
      new Date(),
      'mensual',
      JSON.stringify(resultado)
    ];
    
    connection.query(query, valores, (error, results) => {
      if (error) {
        console.error('Error registrando log de procesamiento:', error);
        reject(error);
      } else {
        resolve(results.insertId);
      }
    });
  });
};

/**
 * Función para crear la tabla de logs si no existe
 */
const crearTablaLogsSiNoExiste = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS logs_procesamiento_pagos (
      id_log INT AUTO_INCREMENT PRIMARY KEY,
      fecha_procesamiento DATETIME NOT NULL,
      tipo_procesamiento VARCHAR(50) NOT NULL,
      resultado TEXT,
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error creando tabla de logs:', error);
    } else {
      console.log('Tabla de logs de procesamiento verificada/creada');
    }
  });
};

module.exports = {
  configurarSchedulerMensual,
  configurarSchedulerCompleto,
  ejecutarProcesamientoAlInicio,
  crearTablaLogsSiNoExiste,
  procesarPagosHabitualesPorRecurrencia
};

console.log(`Módulo ${fileName} cargado con éxito`);
