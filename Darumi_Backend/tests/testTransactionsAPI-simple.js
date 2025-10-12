/**
 * Script de prueba simple para los endpoints de transacciones
 * Usa fetch nativo (sin dependencias externas)
 * Ejecutar con: node testTransactionsAPI-simple.js
 */

const BASE_URL = 'http://localhost:3000';
const TEST_USER_ID = 'test_user_id'; // Reemplazar con un ID de usuario real

// Colores para console.log
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const testEndpoint = async (name, url, params = {}) => {
  try {
    log(`\n🧪 Probando: ${name}`, 'blue');
    log(`📡 URL: ${url}`, 'yellow');
    log(`📋 Parámetros: ${JSON.stringify(params)}`, 'yellow');
    
    // Construir URL con parámetros
    const urlObj = new URL(url);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        urlObj.searchParams.append(key, params[key]);
      }
    });
    
    const response = await fetch(urlObj.toString());
    const data = await response.json();
    
    if (response.ok) {
      log(`✅ Status: ${response.status}`, 'green');
      log(`📊 Respuesta:`, 'green');
      console.log(JSON.stringify(data, null, 2));
      return data;
    } else {
      log(`❌ Status: ${response.status}`, 'red');
      log(`📋 Error:`, 'red');
      console.log(JSON.stringify(data, null, 2));
      return null;
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return null;
  }
};

const runTests = async () => {
  log('🚀 Iniciando pruebas de la API de Transacciones', 'blue');
  log('='.repeat(50), 'blue');
  
  // Test 1: Health check
  await testEndpoint(
    'Health Check',
    `${BASE_URL}/api/transactions/health`
  );
  
  // Test 2: Obtener categorías
  await testEndpoint(
    'Obtener Categorías',
    `${BASE_URL}/api/transactions/categories`
  );
  
  // Test 3: Obtener transacciones básicas
  await testEndpoint(
    'Transacciones Básicas',
    `${BASE_URL}/api/transactions`,
    { Id_Usuario: TEST_USER_ID }
  );
  
  // Test 4: Transacciones con paginación
  await testEndpoint(
    'Transacciones con Paginación',
    `${BASE_URL}/api/transactions`,
    { 
      Id_Usuario: TEST_USER_ID,
      page: 1,
      limit: 5
    }
  );
  
  // Test 5: Transacciones con filtro de tipo
  await testEndpoint(
    'Filtro por Tipo - Gastos',
    `${BASE_URL}/api/transactions`,
    { 
      Id_Usuario: TEST_USER_ID,
      type: 'gasto'
    }
  );

  // Test 6: Transacciones con filtro de tipo
  await testEndpoint(
    'Filtro por Tipo - Ingresos',
    `${BASE_URL}/api/transactions`,
    { 
      Id_Usuario: TEST_USER_ID,
      type: 'ingreso'
    }
  );

  // Test 7: Transacciones con filtro de categoría
  await testEndpoint(
    'Filtro por Categoría',
    `${BASE_URL}/api/transactions`,
    { 
      Id_Usuario: TEST_USER_ID,
      category: 'Transporte'
    }
  );
  
  // Test 8: Transacciones con filtro de fecha
  await testEndpoint(
    'Filtro por Fecha',
    `${BASE_URL}/api/transactions`,
    { 
      Id_Usuario: TEST_USER_ID,
      from: '2024-01-01',
      to: '2024-12-31'
    }
  );
  
  // Test 9: Transacciones con filtro de monto
  await testEndpoint(
    'Filtro por Monto',
    `${BASE_URL}/api/transactions`,
    { 
      Id_Usuario: TEST_USER_ID,
      min: 1000,
      max: 10000
    }
  );
  
  // Test 10: Transacciones con búsqueda
  await testEndpoint(
    'Búsqueda por Texto',
    `${BASE_URL}/api/transactions`,
    { 
      Id_Usuario: TEST_USER_ID,
      search: 'uber'
    }
  );
  
  // Test 11: Transacciones con ordenamiento
  await testEndpoint(
    'Ordenamiento por Monto',
    `${BASE_URL}/api/transactions`,
    { 
      Id_Usuario: TEST_USER_ID,
      order: 'amount_desc'
    }
  );
  
  // Test 12: Estadísticas
  await testEndpoint(
    'Estadísticas de Transacciones',
    `${BASE_URL}/api/transactions/stats`,
    { Id_Usuario: TEST_USER_ID }
  );
  
  // Test 13: Filtros combinados
  await testEndpoint(
    'Filtros Combinados',
    `${BASE_URL}/api/transactions`,
    { 
      Id_Usuario: TEST_USER_ID,
      type: 'gasto',
      category: 'Comida',
      from: '2024-01-01',
      min: 500,
      search: 'restaurante',
      order: 'date_desc',
      page: 1,
      limit: 10
    }
  );
  
  // Test 14: Casos de error
  await testEndpoint(
    'Error: Sin User ID',
    `${BASE_URL}/api/transactions`
  );
  
  await testEndpoint(
    'Error: User ID Inválido',
    `${BASE_URL}/api/transactions`,
    { Id_Usuario: 'usuario_inexistente' }
  );
  
  log('\n🏁 Pruebas completadas', 'blue');
  log('='.repeat(50), 'blue');
};

// Verificar que el servidor esté corriendo
const checkServer = async () => {
  try {
    const response = await fetch(`${BASE_URL}/hola`);
    if (response.ok) {
      log('✅ Servidor está corriendo', 'green');
      return true;
    } else {
      log('❌ Servidor no responde correctamente', 'red');
      return false;
    }
  } catch (error) {
    log('❌ Servidor no está corriendo. Inicia el servidor con: npm start', 'red');
    return false;
  }
};

// Ejecutar pruebas
const main = async () => {
  const serverRunning = await checkServer();
  
  if (serverRunning) {
    log(`\n⚠️  IMPORTANTE: Reemplaza TEST_USER_ID con un ID de usuario real de tu base de datos`, 'yellow');
    log(`📝 Actualmente usando: ${TEST_USER_ID}`, 'yellow');
    log(`\n💡 Para obtener un ID de usuario real, ejecuta:`, 'yellow');
    log(`   SELECT Identifier_usuario FROM usuarios LIMIT 1;`, 'yellow');
    
    await runTests();
  }
};

main().catch(console.error);
