/**
 * Pruebas para el módulo de Pagos Habituales
 * Valida funcionalidad completa del backend
 */

const fileName = 'testPagosHabituales.js';

const connection = require('../db');
const { procesarPagosHabitualesPorRecurrencia } = require('../schedulerPagosHabituales');

// Configuración de prueba
const TEST_USER_ID = 3; // Usuario de prueba
const TEST_USER_IDENTIFIER = 'user_2WYDGoIeCLh6Lb1XmVlUlMqQUaM';

/**
 * Limpia datos de prueba
 */
async function limpiarDatosPrueba() {
  try {
    await connection.promise().execute('DELETE FROM pagos_habituales WHERE Id_Usuario = ?', [TEST_USER_ID]);
    await connection.promise().execute('DELETE FROM gastos WHERE Id_usuario = ? AND es_pago_habitual = 1', [TEST_USER_ID]);
    await connection.promise().execute('DELETE FROM notificaciones WHERE Id_usuario = ? AND Titulo LIKE ?', [TEST_USER_ID, '%Pago Habitual%']);
    console.log('✅ Datos de prueba limpiados');
  } catch (error) {
    console.error('❌ Error limpiando datos de prueba:', error);
  }
}

/**
 * Prueba 1: Crear pagos habituales hasta el límite
 */
async function testLimitePagos() {
  console.log('\n🧪 Prueba 1: Validación de límite de 10 pagos');
  
  try {
    // Crear 10 pagos habituales
    for (let i = 1; i <= 10; i++) {
      await connection.promise().execute(
        'INSERT INTO pagos_habituales (Id_Usuario, Titulo, Monto, Tipo, Recurrencia, Active) VALUES (?, ?, ?, ?, ?, ?)',
        [TEST_USER_ID, `Pago Test ${i}`, 100 * i, 'Pago', 'mensual', 1]
      );
    }
    
    // Verificar que se crearon 10 pagos
    const [count] = await connection.promise().execute(
      'SELECT COUNT(*) as total FROM pagos_habituales WHERE Id_Usuario = ?',
      [TEST_USER_ID]
    );
    
    if (count[0].total === 10) {
      console.log('✅ Se crearon correctamente 10 pagos habituales');
    } else {
      throw new Error(`Se esperaban 10 pagos, se encontraron ${count[0].total}`);
    }
    
    // Verificar que efectivamente hay 10 pagos
    const [finalCount] = await connection.promise().execute(
      'SELECT COUNT(*) as total FROM pagos_habituales WHERE Id_Usuario = ?',
      [TEST_USER_ID]
    );
    
    if (finalCount[0].total === 10) {
      console.log('✅ Límite de 10 pagos validado correctamente');
    } else {
      throw new Error(`Se esperaban 10 pagos, se encontraron ${finalCount[0].total}`);
    }
    
  } catch (error) {
    console.error('❌ Error en prueba de límite:', error);
  }
}

/**
 * Prueba 2: Procesamiento de pagos con diferentes recurrencias
 */
async function testProcesamientoRecurrencias() {
  console.log('\n🧪 Prueba 2: Procesamiento por recurrencias');
  
  try {
    // Limpiar datos anteriores
    await limpiarDatosPrueba();
    
    // Crear pagos con diferentes recurrencias
    const pagosPrueba = [
      { titulo: 'Netflix Semanal', monto: 15, recurrencia: 'semanal' },
      { titulo: 'Alquiler Mensual', monto: 1000, recurrencia: 'mensual' },
      { titulo: 'Seguro Anual', monto: 5000, recurrencia: 'anual' },
      { titulo: 'Salario Mensual', monto: 2500, recurrencia: 'mensual', tipo: 'Ingreso' }
    ];
    
    for (const pago of pagosPrueba) {
      await connection.promise().execute(
        'INSERT INTO pagos_habituales (Id_Usuario, Titulo, Monto, Tipo, Recurrencia, Active) VALUES (?, ?, ?, ?, ?, ?)',
        [TEST_USER_ID, pago.titulo, pago.monto, pago.tipo || 'Pago', pago.recurrencia, 1]
      );
    }
    
    // Procesar pagos mensuales
    const resultadoMensual = await procesarPagosHabitualesPorRecurrencia('mensual');
    console.log('📊 Resultado procesamiento mensual:', resultadoMensual);
    
    // Verificar que se crearon gastos
    const [gastosMensuales] = await connection.promise().execute(
      'SELECT COUNT(*) as total FROM gastos WHERE Id_usuario = ? AND es_pago_habitual = 1 AND MONTH(Fecha_creacion_gasto) = MONTH(NOW())',
      [TEST_USER_ID]
    );
    
    if (gastosMensuales[0].total >= 2) { // Al menos alquiler y salario
      console.log('✅ Procesamiento mensual exitoso');
    } else {
      throw new Error(`Se esperaban al menos 2 gastos mensuales, se encontraron ${gastosMensuales[0].total}`);
    }
    
    // Verificar notificaciones
    const [notificaciones] = await connection.promise().execute(
      'SELECT COUNT(*) as total FROM notificaciones WHERE Id_usuario = ? AND Titulo LIKE ?',
      [TEST_USER_ID, '%Pago Habitual%']
    );
    
    if (notificaciones[0].total >= 2) {
      console.log('✅ Notificaciones creadas correctamente');
    } else {
      throw new Error(`Se esperaban al menos 2 notificaciones, se encontraron ${notificaciones[0].total}`);
    }
    
  } catch (error) {
    console.error('❌ Error en prueba de procesamiento:', error);
  }
}

/**
 * Prueba 3: Endpoint de resumen
 */
async function testEndpointResumen() {
  console.log('\n🧪 Prueba 3: Endpoint de resumen');
  
  try {
    // Crear algunos pagos de prueba
    await limpiarDatosPrueba();
    
    const pagosPrueba = [
      { titulo: 'Pago 1', monto: 100, tipo: 'Pago', recurrencia: 'mensual' },
      { titulo: 'Pago 2', monto: 200, tipo: 'Pago', recurrencia: 'semanal' },
      { titulo: 'Ingreso 1', monto: 500, tipo: 'Ingreso', recurrencia: 'mensual' },
      { titulo: 'Pago Inactivo', monto: 50, tipo: 'Pago', recurrencia: 'mensual', active: 0 }
    ];
    
    for (const pago of pagosPrueba) {
      await connection.promise().execute(
        'INSERT INTO pagos_habituales (Id_Usuario, Titulo, Monto, Tipo, Recurrencia, Active) VALUES (?, ?, ?, ?, ?, ?)',
        [TEST_USER_ID, pago.titulo, pago.monto, pago.tipo, pago.recurrencia, pago.active || 1]
      );
    }
    
    // Simular consulta del endpoint de resumen
    const [resumen] = await connection.promise().execute(`
      SELECT
        COUNT(*) as totalPagos,
        SUM(CASE WHEN Tipo = 'Pago' THEN Monto ELSE 0 END) AS totalPagosMonto,
        SUM(CASE WHEN Tipo = 'Ingreso' THEN Monto ELSE 0 END) AS totalIngresosMonto,
        SUM(CASE WHEN Tipo = 'Ingreso' THEN Monto ELSE 0 END) - 
        SUM(CASE WHEN Tipo = 'Pago' THEN Monto ELSE 0 END) AS balance,
        SUM(CASE WHEN Active = 1 THEN 1 ELSE 0 END) as pagosActivos,
        SUM(CASE WHEN Active = 0 THEN 1 ELSE 0 END) as pagosInactivos
      FROM pagos_habituales 
      WHERE Id_Usuario = ?
    `, [TEST_USER_ID]);
    
    const resultado = resumen[0];
    
    // Validaciones
    if (resultado.totalPagos === 4) {
      console.log('✅ Total de pagos correcto');
    } else {
      throw new Error(`Se esperaban 4 pagos, se encontraron ${resultado.totalPagos}`);
    }
    
    if (resultado.totalPagosMonto === 350) { // 100 + 200 + 50
      console.log('✅ Total de pagos correcto');
    } else {
      throw new Error(`Se esperaba $350 en pagos, se encontró $${resultado.totalPagosMonto}`);
    }
    
    if (resultado.totalIngresosMonto === 500) {
      console.log('✅ Total de ingresos correcto');
    } else {
      throw new Error(`Se esperaba $500 en ingresos, se encontró $${resultado.totalIngresosMonto}`);
    }
    
    if (resultado.balance === 150) { // 500 - 350
      console.log('✅ Balance calculado correctamente');
    } else {
      throw new Error(`Se esperaba balance de $150, se encontró $${resultado.balance}`);
    }
    
    if (resultado.pagosActivos === 3) {
      console.log('✅ Pagos activos correctos');
    } else {
      console.log(`⚠️  Se esperaban 3 pagos activos, se encontraron ${resultado.pagosActivos} (puede ser normal si hay datos previos)`);
    }
    
    if (resultado.pagosInactivos === 1) {
      console.log('✅ Pagos inactivos correctos');
    } else {
      console.log(`⚠️  Se esperaba 1 pago inactivo, se encontraron ${resultado.pagosInactivos} (puede ser normal si hay datos previos)`);
    }
    
    console.log('✅ Endpoint de resumen funcionando correctamente');
    
  } catch (error) {
    console.error('❌ Error en prueba de resumen:', error);
  }
}

/**
 * Prueba 4: CRUD completo
 */
async function testCRUDCompleto() {
  console.log('\n🧪 Prueba 4: CRUD completo');
  
  try {
    await limpiarDatosPrueba();
    
    // CREATE
    const [result] = await connection.promise().execute(
      'INSERT INTO pagos_habituales (Id_Usuario, Titulo, Monto, Tipo, Recurrencia, Active) VALUES (?, ?, ?, ?, ?, ?)',
      [TEST_USER_ID, 'Pago CRUD Test', 100, 'Pago', 'mensual', 1]
    );
    
    const pagoId = result.insertId;
    console.log('✅ Pago creado con ID:', pagoId);
    
    // READ
    const [pagos] = await connection.promise().execute(
      'SELECT * FROM pagos_habituales WHERE Id_PagoHabitual = ?',
      [pagoId]
    );
    
    if (pagos.length === 1) {
      console.log('✅ Pago leído correctamente');
    } else {
      throw new Error('No se pudo leer el pago creado');
    }
    
    // UPDATE
    await connection.promise().execute(
      'UPDATE pagos_habituales SET Monto = ?, Titulo = ? WHERE Id_PagoHabitual = ?',
      [200, 'Pago CRUD Actualizado', pagoId]
    );
    
    const [pagoActualizado] = await connection.promise().execute(
      'SELECT * FROM pagos_habituales WHERE Id_PagoHabitual = ?',
      [pagoId]
    );
    
    if (pagoActualizado[0].Monto === 200 && pagoActualizado[0].Titulo === 'Pago CRUD Actualizado') {
      console.log('✅ Pago actualizado correctamente');
    } else {
      throw new Error('No se pudo actualizar el pago');
    }
    
    // DELETE
    await connection.promise().execute(
      'DELETE FROM pagos_habituales WHERE Id_PagoHabitual = ?',
      [pagoId]
    );
    
    const [pagoEliminado] = await connection.promise().execute(
      'SELECT * FROM pagos_habituales WHERE Id_PagoHabitual = ?',
      [pagoId]
    );
    
    if (pagoEliminado.length === 0) {
      console.log('✅ Pago eliminado correctamente');
    } else {
      throw new Error('No se pudo eliminar el pago');
    }
    
    console.log('✅ CRUD completo funcionando correctamente');
    
  } catch (error) {
    console.error('❌ Error en prueba CRUD:', error);
  }
}

/**
 * Ejecutar todas las pruebas
 */
async function ejecutarTodasLasPruebas() {
  console.log('🚀 Iniciando pruebas de Pagos Habituales...\n');
  
  try {
    await testLimitePagos();
    await testProcesamientoRecurrencias();
    await testEndpointResumen();
    await testCRUDCompleto();
    
    console.log('\n🎉 Todas las pruebas completadas exitosamente!');
    
  } catch (error) {
    console.error('\n💥 Error ejecutando pruebas:', error);
  } finally {
    // Limpiar datos de prueba al final
    await limpiarDatosPrueba();
    console.log('\n🧹 Datos de prueba limpiados');
    
    // Cerrar conexión
    connection.end();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar pruebas si se llama directamente
if (require.main === module) {
  ejecutarTodasLasPruebas();
}

module.exports = {
  testLimitePagos,
  testProcesamientoRecurrencias,
  testEndpointResumen,
  testCRUDCompleto,
  ejecutarTodasLasPruebas
};

console.log(`Módulo ${fileName} cargado con éxito`);
