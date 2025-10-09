/* 
 * Script de prueba para el sistema de automatización de pagos habituales
 * Este script puede ejecutarse para probar la funcionalidad
 */

const fileName = 'testAutomatizacionPagos.js';

const connection = require('./db');
const { procesarPagosHabitualesMensuales } = require('./methods/methodAutomatizacionPagos');

/**
 * Función para probar el sistema de automatización
 */
async function probarSistemaAutomatizacion() {
  console.log('=== INICIANDO PRUEBA DEL SISTEMA DE AUTOMATIZACIÓN ===\n');
  
  try {
    // 1. Verificar estructura de base de datos
    console.log('1. Verificando estructura de base de datos...');
    await verificarEstructuraDB();
    
    // 2. Mostrar pagos habituales existentes
    console.log('\n2. Mostrando pagos habituales existentes...');
    await mostrarPagosHabituales();
    
    // 3. Mostrar gastos existentes
    console.log('\n3. Mostrando gastos existentes...');
    await mostrarGastosExistentes();
    
    // 4. Ejecutar procesamiento
    console.log('\n4. Ejecutando procesamiento de pagos habituales...');
    const resultado = await procesarPagosHabitualesMensuales();
    console.log('Resultado del procesamiento:', resultado);
    
    // 5. Mostrar gastos después del procesamiento
    console.log('\n5. Mostrando gastos después del procesamiento...');
    await mostrarGastosExistentes();
    
    // 6. Mostrar logs de procesamiento
    console.log('\n6. Mostrando logs de procesamiento...');
    await mostrarLogsProcesamiento();
    
    console.log('\n=== PRUEBA COMPLETADA EXITOSAMENTE ===');
    
  } catch (error) {
    console.error('Error en la prueba:', error);
  } finally {
    connection.end();
  }
}

/**
 * Verifica que la estructura de base de datos esté correcta
 */
function verificarEstructuraDB() {
  return new Promise((resolve, reject) => {
    const queries = [
      "SHOW TABLES LIKE 'logs_procesamiento_pagos'",
      "SHOW COLUMNS FROM gastos LIKE 'es_pago_habitual'",
      "SHOW COLUMNS FROM gastos LIKE 'id_pago_habitual_origen'"
    ];
    
    let verificaciones = 0;
    const resultados = [];
    
    queries.forEach((query, index) => {
      connection.query(query, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resultados[index] = results.length > 0;
          verificaciones++;
          
          if (verificaciones === queries.length) {
            console.log('Tabla logs_procesamiento_pagos:', resultados[0] ? '✓ Existe' : '✗ No existe');
            console.log('Columna es_pago_habitual:', resultados[1] ? '✓ Existe' : '✗ No existe');
            console.log('Columna id_pago_habitual_origen:', resultados[2] ? '✓ Existe' : '✗ No existe');
            resolve();
          }
        }
      });
    });
  });
}

/**
 * Muestra los pagos habituales existentes
 */
function mostrarPagosHabituales() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT PH.Id_PagoHabitual, PH.Titulo, PH.Monto, PH.Active, U.Identifier_usuario
      FROM pagos_habituales PH
      JOIN usuarios U ON U.Id_usuario = PH.Id_Usuario
      ORDER BY PH.Id_PagoHabitual
    `;
    
    connection.query(query, (error, results) => {
      if (error) {
        reject(error);
      } else {
        if (results.length === 0) {
          console.log('No hay pagos habituales registrados');
        } else {
          console.log('Pagos habituales encontrados:');
          results.forEach(pago => {
            console.log(`  - ID: ${pago.Id_PagoHabitual}, Usuario: ${pago.Identifier_usuario}, Título: ${pago.Titulo}, Monto: $${pago.Monto}, Activo: ${pago.Active}`);
          });
        }
        resolve();
      }
    });
  });
}

/**
 * Muestra los gastos existentes
 */
function mostrarGastosExistentes() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT G.Id_gasto, G.Titulo_gasto, G.Monto_gasto, G.Fecha_creacion_gasto, 
             G.es_pago_habitual, G.id_pago_habitual_origen, U.Identifier_usuario
      FROM gastos G
      JOIN usuarios U ON U.Id_usuario = G.Id_usuario
      ORDER BY G.Fecha_creacion_gasto DESC
      LIMIT 10
    `;
    
    connection.query(query, (error, results) => {
      if (error) {
        reject(error);
      } else {
        if (results.length === 0) {
          console.log('No hay gastos registrados');
        } else {
          console.log('Últimos 10 gastos:');
          results.forEach(gasto => {
            const esPagoHabitual = gasto.es_pago_habitual ? ' (Pago Habitual)' : '';
            console.log(`  - ID: ${gasto.Id_gasto}, Usuario: ${gasto.Identifier_usuario}, Título: ${gasto.Titulo_gasto}, Monto: $${gasto.Monto_gasto}, Fecha: ${gasto.Fecha_creacion_gasto}${esPagoHabitual}`);
          });
        }
        resolve();
      }
    });
  });
}

/**
 * Muestra los logs de procesamiento
 */
function mostrarLogsProcesamiento() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT id_log, fecha_procesamiento, tipo_procesamiento, resultado, fecha_creacion
      FROM logs_procesamiento_pagos
      ORDER BY fecha_creacion DESC
      LIMIT 5
    `;
    
    connection.query(query, (error, results) => {
      if (error) {
        reject(error);
      } else {
        if (results.length === 0) {
          console.log('No hay logs de procesamiento');
        } else {
          console.log('Últimos 5 logs de procesamiento:');
          results.forEach(log => {
            console.log(`  - ID: ${log.id_log}, Fecha: ${log.fecha_procesamiento}, Tipo: ${log.tipo_procesamiento}, Resultado: ${log.resultado}`);
          });
        }
        resolve();
      }
    });
  });
}

// Ejecutar la prueba si el archivo se ejecuta directamente
if (require.main === module) {
  probarSistemaAutomatizacion();
}

module.exports = {
  probarSistemaAutomatizacion,
  verificarEstructuraDB,
  mostrarPagosHabituales,
  mostrarGastosExistentes,
  mostrarLogsProcesamiento
};

console.log(`Script de prueba ${fileName} cargado con éxito`);
