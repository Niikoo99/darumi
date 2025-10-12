// Test script para probar la verificación de objetivos completados en tiempo real
const { verificarObjetivosCompletados, verificarTodosLosObjetivosCompletados } = require('./services/realTimeObjectiveChecker');

async function testRealTimeCheck() {
  console.log('🧪 Testing real-time objective completion check...');
  
  // Usuario de prueba
  const testUserIdentifier = 'user_2WYDGoIeCLh6Lb1XmVlUlMqQUaM'; // Usuario existente en la BD
  
  try {
    console.log(`\n📋 Testing user: ${testUserIdentifier}`);
    
    // 1. Verificar objetivos completados para un usuario específico
    console.log('\n1️⃣ Verificando objetivos completados...');
    const resultado = await verificarObjetivosCompletados(testUserIdentifier);
    
    console.log(`📊 Resultado:`);
    console.log(`   Objetivos verificados: ${resultado.verificados}`);
    console.log(`   Objetivos completados: ${resultado.completados}`);
    console.log(`   Objetivos fallidos: ${resultado.fallidos}`);
    
    if (resultado.actualizados.length > 0) {
      console.log(`\n🎯 Objetivos actualizados:`);
      resultado.actualizados.forEach((obj, index) => {
        console.log(`   ${index + 1}. ${obj.titulo}`);
        console.log(`      Status: ${obj.status}`);
        console.log(`      Puntos: ${obj.puntos}`);
        console.log(`      Gasto final: $${obj.gastoFinal.toLocaleString()}`);
        console.log(`      Valor objetivo: $${obj.valorObjetivo.toLocaleString()}`);
        console.log(`      Cumplido: ${obj.cumplido}`);
      });
    } else {
      console.log(`\nℹ️ No se actualizaron objetivos`);
    }
    
    // 2. Verificar todos los objetivos (opcional, comentado para evitar procesamiento masivo)
    /*
    console.log('\n2️⃣ Verificando todos los objetivos...');
    const resultadoGlobal = await verificarTodosLosObjetivosCompletados();
    
    console.log(`📊 Resultado global:`);
    console.log(`   Usuarios procesados: ${resultadoGlobal.usuariosProcesados}`);
    console.log(`   Objetivos verificados: ${resultadoGlobal.objetivosVerificados}`);
    console.log(`   Objetivos completados: ${resultadoGlobal.objetivosCompletados}`);
    console.log(`   Objetivos fallidos: ${resultadoGlobal.objetivosFallidos}`);
    */
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  process.exit(0);
}

// Ejecutar test
testRealTimeCheck();
