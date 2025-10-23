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

// GraphQL mutation helper
export const graphqlMutation = async (mutation, variables = {}) => {
  try {
    console.log('🔧 GraphQL Mutation:', mutation);
    console.log('📝 Variables:', variables);
    
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: mutation,
        variables,
      }),
    });

    const result = await response.json();
    
    if (result.errors) {
      console.error('❌ GraphQL Mutation Errors:', result.errors);
      throw new Error(result.errors[0].message);
    }

    console.log('✅ GraphQL Mutation Response:', result.data);
    return result.data;
  } catch (error) {
    console.error('❌ GraphQL Mutation Request Error:', error);
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
        valorObjetivo
      }
    }
  `,

  // Get categories
  GET_CATEGORIES: `
    query Categorias {
      categorias {
        id
        nombre
      }
    }
  `,

  // Get objective types
  GET_OBJECTIVE_TYPES: `
    query TiposObjetivos {
      tiposObjetivos {
        id
        nombre
      }
    }
  `,

  // Get custom objectives
  GET_CUSTOM_OBJECTIVES: `
    query ObjetivosPersonalizados($usuarioIdentifier: String!) {
      objetivosPersonalizados(usuarioIdentifier: $usuarioIdentifier) {
        id
        titulo
        valorObjetivo
        multiplicador
        tipoObjetivo
        categoriaObjetivo
        fechaCreacion
        status
        fechaCompletado
        puntosOtorgados
        valorFinal
        nombreCategoria
        nombreTipoObjetivo
      }
    }
  `,

  // Get user statistics including streak
  GET_USER_STATS: `
    query EstadisticasUsuario($usuarioIdentifier: String!) {
      estadisticasUsuario(usuarioIdentifier: $usuarioIdentifier) {
        puntosTotal
        rachaActual
        objetivosEnProgreso
        objetivosCompletados
      }
    }
  `,
};

// GraphQL mutations for objectives
export const OBJECTIVES_MUTATIONS = {
  // Generate default objectives (moved from Query to Mutation)
  GENERATE_DEFAULT_OBJECTIVES: `
    mutation GenerarObjetivosPorDefecto($usuarioIdentifier: String!) {
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

  // Create custom objective
  CREATE_CUSTOM_OBJECTIVE: `
    mutation CrearObjetivoPersonalizado(
      $usuarioIdentifier: String!
      $titulo: String!
      $valorObjetivo: Float!
      $tipoObjetivo: Int!
      $categoriaObjetivo: Int
      $descripcion: String
    ) {
      crearObjetivoPersonalizado(
        usuarioIdentifier: $usuarioIdentifier
        titulo: $titulo
        valorObjetivo: $valorObjetivo
        tipoObjetivo: $tipoObjetivo
        categoriaObjetivo: $categoriaObjetivo
        descripcion: $descripcion
      ) {
        success
        message
        objetivo {
          id
          titulo
          valorObjetivo
          tipoObjetivo
          categoriaObjetivo
          fechaCreacion
        }
        errores
      }
    }
  `,

  // Delete custom objective
  DELETE_CUSTOM_OBJECTIVE: `
    mutation EliminarObjetivoPersonalizado(
      $usuarioIdentifier: String!
      $objetivoId: Int!
    ) {
      eliminarObjetivoPersonalizado(
        usuarioIdentifier: $usuarioIdentifier
        objetivoId: $objetivoId
      ) {
        success
        message
        errores
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

  // Generate default objectives (now a mutation)
  generateDefaultObjectives: async (usuarioIdentifier) => {
    try {
      const data = await graphqlMutation(OBJECTIVES_MUTATIONS.GENERATE_DEFAULT_OBJECTIVES, {
        usuarioIdentifier,
      });
      return data.generarObjetivosPorDefecto || { success: false, message: 'Error desconocido' };
    } catch (error) {
      console.error('Error generating default objectives:', error);
      return { success: false, message: error.message };
    }
  },

  // Get categories
  getCategories: async () => {
    try {
      const data = await graphqlQuery(OBJECTIVES_QUERIES.GET_CATEGORIES);
      return data.categorias || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  // Get objective types
  getObjectiveTypes: async () => {
    try {
      const data = await graphqlQuery(OBJECTIVES_QUERIES.GET_OBJECTIVE_TYPES);
      return data.tiposObjetivos || [];
    } catch (error) {
      console.error('Error fetching objective types:', error);
      return [];
    }
  },

  // Get custom objectives
  getCustomObjectives: async (usuarioIdentifier) => {
    try {
      const data = await graphqlQuery(OBJECTIVES_QUERIES.GET_CUSTOM_OBJECTIVES, {
        usuarioIdentifier,
      });
      return data.objetivosPersonalizados || [];
    } catch (error) {
      console.error('Error fetching custom objectives:', error);
      return [];
    }
  },

  // Get user statistics including streak
  getUserStats: async (usuarioIdentifier) => {
    try {
      const data = await graphqlQuery(OBJECTIVES_QUERIES.GET_USER_STATS, {
        usuarioIdentifier,
      });
      return data.estadisticasUsuario || null;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  },

  // Create custom objective (now uses mutation)
  createCustomObjective: async (usuarioIdentifier, objectiveData) => {
    try {
      const data = await graphqlMutation(OBJECTIVES_MUTATIONS.CREATE_CUSTOM_OBJECTIVE, {
        usuarioIdentifier,
        ...objectiveData,
      });
      return data.crearObjetivoPersonalizado || { success: false, message: 'Error desconocido' };
    } catch (error) {
      console.error('Error creating custom objective:', error);
      return { success: false, message: error.message };
    }
  },

  // Delete custom objective (now uses mutation)
  deleteCustomObjective: async (usuarioIdentifier, objetivoId) => {
    try {
      const data = await graphqlMutation(OBJECTIVES_MUTATIONS.DELETE_CUSTOM_OBJECTIVE, {
        usuarioIdentifier,
        objetivoId,
      });
      return data.eliminarObjetivoPersonalizado || { success: false, message: 'Error desconocido' };
    } catch (error) {
      console.error('Error deleting custom objective:', error);
      return { success: false, message: error.message };
    }
  },
};

export default objectivesService;
