// Test script para probar la funcionalidad de objetivos personalizados
const { 
  obtenerCategorias, 
  obtenerTiposObjetivos, 
  crearObjetivoPersonalizado, 
  obtenerObjetivosPersonalizados,
  eliminarObjetivoPersonalizado 
} = require('./services/customObjectivesService');

const TEST_USER_IDENTIFIER = 'user_2WYDGoIeCLh6Lb1XmVlUlMqQUaM'; // Replace with a valid user identifier

async function testCustomObjectives() {
  console.log('🧪 Testing custom objectives functionality...');
  
  try {
    // 1. Obtener categorías
    console.log('\n1️⃣ Obteniendo categorías...');
    const categorias = await obtenerCategorias();
    console.log('📋 Categorías disponibles:', categorias.map(c => `${c.Id_categoria}: ${c.Nombre_categoria}`));
    
    // 2. Obtener tipos de objetivos
    console.log('\n2️⃣ Obteniendo tipos de objetivos...');
    const tipos = await obtenerTiposObjetivos();
    console.log('📋 Tipos de objetivos:', tipos.map(t => `${t.Id_tipo_objetivo}: ${t.Nombre_tipo_objetivo}`));
    
    // 3. Crear objetivo personalizado - Gastos generales
    console.log('\n3️⃣ Creando objetivo de gastos generales...');
    const objetivoGeneral = await crearObjetivoPersonalizado(TEST_USER_IDENTIFIER, {
      titulo: 'Test - Control de Gastos Generales',
      valorObjetivo: 5000,
      tipoObjetivo: 1, // Gastos generales
      multiplicador: 1.5,
      descripcion: 'Objetivo de prueba para controlar todos los gastos del mes'
    });
    
    if (objetivoGeneral.success) {
      console.log('✅ Objetivo general creado:', objetivoGeneral.objetivo);
    } else {
      console.log('❌ Error creando objetivo general:', objetivoGeneral.message);
      if (objetivoGeneral.errores) {
        console.log('   Errores:', objetivoGeneral.errores);
      }
    }
    
    // 4. Crear objetivo personalizado - Por categoría
    console.log('\n4️⃣ Creando objetivo por categoría...');
    const objetivoCategoria = await crearObjetivoPersonalizado(TEST_USER_IDENTIFIER, {
      titulo: 'Test - Control Gastos Restaurantes',
      valorObjetivo: 2000,
      tipoObjetivo: 2, // Gastos por categoría
      categoriaObjetivo: 2, // Comida/Restaurante
      multiplicador: 2,
      descripcion: 'Objetivo de prueba para controlar gastos en restaurantes'
    });
    
    if (objetivoCategoria.success) {
      console.log('✅ Objetivo por categoría creado:', objetivoCategoria.objetivo);
    } else {
      console.log('❌ Error creando objetivo por categoría:', objetivoCategoria.message);
      if (objetivoCategoria.errores) {
        console.log('   Errores:', objetivoCategoria.errores);
      }
    }
    
    // 5. Obtener objetivos personalizados del usuario
    console.log('\n5️⃣ Obteniendo objetivos personalizados...');
    const objetivos = await obtenerObjetivosPersonalizados(TEST_USER_IDENTIFIER);
    console.log(`📋 Objetivos encontrados: ${objetivos.length}`);
    
    objetivos.forEach((obj, index) => {
      console.log(`   ${index + 1}. ${obj.Titulo_objetivo}`);
      console.log(`      Tipo: ${obj.Nombre_tipo_objetivo}`);
      console.log(`      Valor: $${obj.Valor_objetivo}`);
      console.log(`      Multiplicador: ${obj.Multiplicador}`);
      console.log(`      Estado: ${obj.Status}`);
      if (obj.Nombre_categoria) {
        console.log(`      Categoría: ${obj.Nombre_categoria}`);
      }
    });
    
    // 6. Test de validación - Título vacío
    console.log('\n6️⃣ Probando validación - Título vacío...');
    const objetivoInvalido = await crearObjetivoPersonalizado(TEST_USER_IDENTIFIER, {
      titulo: '',
      valorObjetivo: 1000,
      tipoObjetivo: 1
    });
    
    if (!objetivoInvalido.success) {
      console.log('✅ Validación funcionando:', objetivoInvalido.message);
      if (objetivoInvalido.errores) {
        console.log('   Errores detectados:', objetivoInvalido.errores);
      }
    } else {
      console.log('❌ Validación falló - debería haber rechazado título vacío');
    }
    
    // 7. Test de límite de objetivos (opcional - comentado para evitar spam)
    /*
    console.log('\n7️⃣ Probando límite de objetivos...');
    for (let i = 0; i < 6; i++) {
      const objetivoExtra = await crearObjetivoPersonalizado(TEST_USER_IDENTIFIER, {
        titulo: `Test Objetivo ${i + 1}`,
        valorObjetivo: 1000,
        tipoObjetivo: 1
      });
      
      if (!objetivoExtra.success) {
        console.log(`✅ Límite alcanzado en objetivo ${i + 1}:`, objetivoExtra.message);
        break;
      }
    }
    */
    
    // 8. Eliminar objetivo de prueba (si se creó exitosamente)
    if (objetivoGeneral.success) {
      console.log('\n8️⃣ Eliminando objetivo de prueba...');
      const resultadoEliminacion = await eliminarObjetivoPersonalizado(
        TEST_USER_IDENTIFIER, 
        objetivoGeneral.objetivo.id
      );
      
      if (resultadoEliminacion.success) {
        console.log('✅ Objetivo eliminado exitosamente');
      } else {
        console.log('❌ Error eliminando objetivo:', resultadoEliminacion.message);
      }
    }
    
    console.log('\n✅ Test completado exitosamente!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  process.exit(0);
}

// Ejecutar test
testCustomObjectives();
