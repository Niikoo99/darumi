// Test script para probar la generación de objetivos por defecto
const { generarObjetivosPorDefecto, necesitaObjetivosPorDefecto, obtenerDineroDisponible } = require('./services/defaultObjectivesGenerator');

async function testDefaultObjectives() {
  console.log('🧪 Testing default objectives generation...');
  
  // Usuario de prueba (usar un usuario existente o crear uno nuevo)
  const testUserIdentifier = 'user_2WYDGoIeCLh6Lb1XmVlUlMqQUaM'; // Usuario existente en la BD
  
  try {
    console.log(`\n📋 Testing user: ${testUserIdentifier}`);
    
    // 1. Verificar si necesita objetivos
    console.log('\n1️⃣ Verificando si necesita objetivos...');
    const necesitaObjetivos = await necesitaObjetivosPorDefecto(testUserIdentifier);
    console.log(`Necesita objetivos: ${necesitaObjetivos}`);
    
    // 2. Obtener dinero disponible
    console.log('\n2️⃣ Obteniendo dinero disponible...');
    const dineroDisponible = await obtenerDineroDisponible(testUserIdentifier);
    console.log(`Dinero disponible: $${dineroDisponible.toLocaleString()}`);
    
    // 3. Generar objetivos si es necesario
    if (necesitaObjetivos && dineroDisponible > 0) {
      console.log('\n3️⃣ Generando objetivos por defecto...');
      const resultado = await generarObjetivosPorDefecto(testUserIdentifier, dineroDisponible);
      
      if (resultado.success) {
        console.log('✅ Objetivos generados exitosamente!');
        console.log(`📊 Objetivos creados: ${resultado.objetivos.length}`);
        
        resultado.objetivos.forEach((obj, index) => {
          console.log(`\n🎯 Objetivo ${index + 1} (${obj.nivel}):`);
          console.log(`   Título: ${obj.titulo}`);
          console.log(`   Descripción: ${obj.descripcion}`);
          console.log(`   Valor objetivo: $${obj.valorObjetivo.toLocaleString()}`);
          console.log(`   Multiplicador: ${obj.multiplicador}x`);
        });
      } else {
        console.log(`❌ Error: ${resultado.message}`);
      }
    } else if (!necesitaObjetivos) {
      console.log('ℹ️ El usuario ya tiene objetivos asignados');
    } else {
      console.log('⚠️ No se puede generar objetivos: dinero disponible es 0');
    }
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  process.exit(0);
}

// Ejecutar test
testDefaultObjectives();
