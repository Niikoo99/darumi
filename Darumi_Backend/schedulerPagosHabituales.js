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
 * Configuración del scheduler para ejecutar el procesamiento mensual
 * Se ejecuta el primer día de cada mes a las 00:01
 */
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
  ejecutarProcesamientoAlInicio,
  crearTablaLogsSiNoExiste
};

console.log(`Módulo ${fileName} cargado con éxito`);
