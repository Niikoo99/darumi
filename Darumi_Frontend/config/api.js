// Configuración centralizada de la API
const API_CONFIG = {
  // Cambia esta IP por la IP de tu máquina donde está ejecutándose el backend
  // Para encontrar tu IP: ejecuta 'ipconfig' en Windows o 'ifconfig' en Mac/Linux
  BASE_URL: 'http://192.168.0.10:3000', // 172.20.10.2
  
  // URLs específicas de endpoints
  ENDPOINTS: {
    CATEGORIES: '/categorias',
    GASTOS: '/gastos',
    OBJETIVOS: '/objetivos',
    USUARIOS_OBJETIVOS: '/usuarios_y_objetivos',
    PAGOS_HABITUALES: '/pagos_habituales',
    ESTADOS: '/estados',
    TIPOS_OBJETIVOS: '/tipos_objetivos',
    AUTOMATIZACION_PAGOS: '/automatizacion_pagos',
    // Nuevos endpoints para transacciones unificadas
    TRANSACTIONS: '/api/transactions',
    TRANSACTIONS_STATS: '/api/transactions/stats',
    TRANSACTIONS_CATEGORIES: '/api/transactions/categories',
  },
  
  // Configuración de timeout para requests
  TIMEOUT: 10000, // 10 segundos
  
  // Headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  }
};

// Función helper para construir URLs completas
export const buildApiUrl = (endpoint) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  console.log('🔗 API URL construida:', url); // Debug log
  return url;
};

// Función helper para obtener la URL base
export const getBaseUrl = () => {
  return API_CONFIG.BASE_URL;
};

// Función helper para obtener endpoints
export const getEndpoints = () => {
  return API_CONFIG.ENDPOINTS;
};

// Función de prueba para verificar conectividad
export const testConnection = async () => {
  try {
    console.log('🧪 Probando conexión con:', API_CONFIG.BASE_URL);
    const response = await fetch(`${API_CONFIG.BASE_URL}/categorias/`);
    console.log('✅ Conexión exitosa:', response.status);
    return response.ok;
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    return false;
  }
};

export default API_CONFIG;
