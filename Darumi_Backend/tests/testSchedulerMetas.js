// Test script to manually trigger the objectives scheduler
const { cerrarMetasMesAnterior } = require('./schedulerMetas');

async function testScheduler() {
  console.log('🧪 Testing objectives scheduler...');
  
  try {
    const result = await cerrarMetasMesAnterior();
    console.log('✅ Scheduler test completed:', result);
  } catch (error) {
    console.error('❌ Scheduler test failed:', error);
  }
  
  process.exit(0);
}

testScheduler();
