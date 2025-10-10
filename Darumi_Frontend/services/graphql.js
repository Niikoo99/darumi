// GraphQL client service for Darumi app
import { getBaseUrl } from '../config/api';

const GRAPHQL_ENDPOINT = `${getBaseUrl()}/graphql`;

// GraphQL query helper
export const graphqlQuery = async (query, variables = {}) => {
  try {
    console.log('🔍 GraphQL Query:', query);
    console.log('📝 Variables:', variables);
    
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const result = await response.json();
    
    if (result.errors) {
      console.error('❌ GraphQL Errors:', result.errors);
      throw new Error(result.errors[0].message);
    }

    console.log('✅ GraphQL Response:', result.data);
    return result.data;
  } catch (error) {
    console.error('❌ GraphQL Request Error:', error);
    throw error;
  }
};

// GraphQL queries for objectives
export const OBJECTIVES_QUERIES = {
  // Get current month progress for objectives
  PROGRESS_CURRENT: `
    query ProgresoActual($usuarioIdentifier: String!) {
      progresoActual(usuarioIdentifier: $usuarioIdentifier) {
        idRelacion
        objetivoId
        titulo
        valorObjetivo
        valorActual
        categoriaId
      }
    }
  `,

  // Get achievements history
  ACHIEVEMENTS_HISTORY: `
    query HistorialLogros($usuarioIdentifier: String!) {
      historialLogros(usuarioIdentifier: $usuarioIdentifier) {
        idRelacion
        objetivoId
        titulo
        fechaCompletado
        puntos
        status
        finalValue
      }
    }
  `,

  // Generate default objectives
  GENERATE_DEFAULT_OBJECTIVES: `
    query GenerarObjetivosPorDefecto($usuarioIdentifier: String!) {
      generarObjetivosPorDefecto(usuarioIdentifier: $usuarioIdentifier) {
        success
        message
        dineroDisponible
        objetivos {
          id
          titulo
          descripcion
          valorObjetivo
          multiplicador
          nivel
        }
      }
    }
  `,

  // Check completed objectives
  CHECK_COMPLETED_OBJECTIVES: `
    query VerificarObjetivosCompletados($usuarioIdentifier: String!) {
      verificarObjetivosCompletados(usuarioIdentifier: $usuarioIdentifier) {
        verificados
        completados
        fallidos
        actualizados {
          id
          titulo
          status
          puntos
          gastoFinal
          valorObjetivo
          cumplido
        }
      }
    }
  `,
};

// Helper functions for objectives
export const objectivesService = {
  // Get current month progress
  getCurrentProgress: async (usuarioIdentifier) => {
    try {
      const data = await graphqlQuery(OBJECTIVES_QUERIES.PROGRESS_CURRENT, {
        usuarioIdentifier,
      });
      return data.progresoActual || [];
    } catch (error) {
      console.error('Error fetching current progress:', error);
      return [];
    }
  },

  // Get achievements history
  getAchievementsHistory: async (usuarioIdentifier) => {
    try {
      const data = await graphqlQuery(OBJECTIVES_QUERIES.ACHIEVEMENTS_HISTORY, {
        usuarioIdentifier,
      });
      return data.historialLogros || [];
    } catch (error) {
      console.error('Error fetching achievements history:', error);
      return [];
    }
  },

  // Generate default objectives
  generateDefaultObjectives: async (usuarioIdentifier) => {
    try {
      const data = await graphqlQuery(OBJECTIVES_QUERIES.GENERATE_DEFAULT_OBJECTIVES, {
        usuarioIdentifier,
      });
      return data.generarObjetivosPorDefecto || { success: false, message: 'Error desconocido' };
    } catch (error) {
      console.error('Error generating default objectives:', error);
      return { success: false, message: error.message };
    }
  },

  // Check completed objectives
  checkCompletedObjectives: async (usuarioIdentifier) => {
    try {
      const data = await graphqlQuery(OBJECTIVES_QUERIES.CHECK_COMPLETED_OBJECTIVES, {
        usuarioIdentifier,
      });
      return data.verificarObjetivosCompletados || { verificados: 0, completados: 0, fallidos: 0, actualizados: [] };
    } catch (error) {
      console.error('Error checking completed objectives:', error);
      return { verificados: 0, completados: 0, fallidos: 0, actualizados: [] };
    }
  },
};

export default objectivesService;
