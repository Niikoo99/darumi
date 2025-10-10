const { buildSchema, graphql } = require('graphql');
const express = require('express');
const connection = require('./db');
const { generarObjetivosPorDefecto, necesitaObjetivosPorDefecto, obtenerDineroDisponible } = require('./services/defaultObjectivesGenerator');
const { verificarObjetivosCompletados, verificarTodosLosObjetivosCompletados } = require('./services/realTimeObjectiveChecker');
const { 
  obtenerCategorias, 
  obtenerTiposObjetivos, 
  crearObjetivoPersonalizado, 
  obtenerObjetivosPersonalizados,
  eliminarObjetivoPersonalizado 
} = require('./services/customObjectivesService');

function query(sql, params) {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

const schema = buildSchema(`
  type ObjetivoProgreso {
    idRelacion: Int!
    objetivoId: Int!
    titulo: String!
    valorObjetivo: Float!
    valorActual: Float!
    categoriaId: Int
  }

  type Logro {
    idRelacion: Int!
    objetivoId: Int!
    titulo: String!
    fechaCompletado: String!
    puntos: Int!
    status: String!
    finalValue: Float
  }

  type ObjetivoGenerado {
    id: Int!
    titulo: String!
    descripcion: String!
    valorObjetivo: Float!
    multiplicador: Float!
    nivel: String!
  }

  type ResultadoGeneracion {
    success: Boolean!
    message: String!
    objetivos: [ObjetivoGenerado!]!
    dineroDisponible: Float!
  }

  type ObjetivoActualizado {
    id: Int!
    titulo: String!
    status: String!
    puntos: Int!
    gastoFinal: Float!
    valorObjetivo: Float!
    cumplido: Boolean!
  }

  type ResultadoVerificacion {
    verificados: Int!
    completados: Int!
    fallidos: Int!
    actualizados: [ObjetivoActualizado!]!
  }

  type Categoria {
    id: Int!
    nombre: String!
  }

  type TipoObjetivo {
    id: Int!
    nombre: String!
  }

  type ObjetivoPersonalizado {
    id: Int!
    titulo: String!
    valorObjetivo: Float!
    multiplicador: Float!
    tipoObjetivo: Int!
    categoriaObjetivo: Int
    fechaCreacion: String!
    status: String!
    fechaCompletado: String
    puntosOtorgados: Int
    valorFinal: Float
    nombreCategoria: String
    nombreTipoObjetivo: String
  }

  type ResultadoCreacionObjetivo {
    success: Boolean!
    message: String!
    objetivo: ObjetivoPersonalizado
    errores: [String!]
  }

  type Query {
    progresoActual(usuarioIdentifier: String!): [ObjetivoProgreso!]!
    historialLogros(usuarioIdentifier: String!): [Logro!]!
    generarObjetivosPorDefecto(usuarioIdentifier: String!): ResultadoGeneracion!
    verificarObjetivosCompletados(usuarioIdentifier: String!): ResultadoVerificacion!
    categorias: [Categoria!]!
    tiposObjetivos: [TipoObjetivo!]!
    objetivosPersonalizados(usuarioIdentifier: String!): [ObjetivoPersonalizado!]!
  }

  type Mutation {
    crearObjetivoPersonalizado(
      usuarioIdentifier: String!
      titulo: String!
      valorObjetivo: Float!
      tipoObjetivo: Int!
      categoriaObjetivo: Int
      multiplicador: Float
      descripcion: String
    ): ResultadoCreacionObjetivo!
    
    eliminarObjetivoPersonalizado(
      usuarioIdentifier: String!
      objetivoId: Int!
    ): ResultadoCreacionObjetivo!
  }
`);

const root = {
  progresoActual: async ({ usuarioIdentifier }) => {
    const usuarios = await query(`SELECT Id_usuario FROM usuarios WHERE Identifier_usuario = ?`, [usuarioIdentifier]);
    if (!usuarios.length) return [];
    const userId = usuarios[0].Id_usuario;

    const metas = await query(`
      SELECT m.Id_relacion_usuario_objetivo, o.Id_objetivo, o.Titulo_objetivo, o.Valor_objetivo, o.Categoria_objetivo
      FROM usuarios_y_objetivos m
      JOIN objetivos o ON o.Id_objetivo = m.Objetivo
      WHERE m.Usuario = ? AND m.Status = 'En progreso'
    `, [userId]);

    const now = new Date();
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    const finMes = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const results = [];
    for (const m of metas) {
      let total = 0;
      if (m.Categoria_objetivo) {
        const rows = await query(
          `SELECT COALESCE(SUM(CASE WHEN Monto_gasto < 0 THEN -Monto_gasto ELSE 0 END), 0) as total
           FROM gastos WHERE Id_usuario = ? AND Categoria_gasto = ? AND Active = 1 AND Fecha_creacion_gasto BETWEEN ? AND ?`,
          [userId, m.Categoria_objetivo, inicioMes, finMes]
        );
        total = rows[0].total || 0;
      } else {
        const rows = await query(
          `SELECT COALESCE(SUM(CASE WHEN Monto_gasto < 0 THEN -Monto_gasto ELSE 0 END), 0) as total
           FROM gastos WHERE Id_usuario = ? AND Active = 1 AND Fecha_creacion_gasto BETWEEN ? AND ?`,
          [userId, inicioMes, finMes]
        );
        total = rows[0].total || 0;
      }
      results.push({
        idRelacion: m.Id_relacion_usuario_objetivo,
        objetivoId: m.Id_objetivo,
        titulo: m.Titulo_objetivo,
        valorObjetivo: m.Valor_objetivo,
        valorActual: total,
        categoriaId: m.Categoria_objetivo || null,
      });
    }
    return results;
  },

  historialLogros: async ({ usuarioIdentifier }) => {
    const usuarios = await query(`SELECT Id_usuario FROM usuarios WHERE Identifier_usuario = ?`, [usuarioIdentifier]);
    if (!usuarios.length) return [];
    const userId = usuarios[0].Id_usuario;

    const rows = await query(`
      SELECT m.Id_relacion_usuario_objetivo, m.Objetivo as Id_objetivo, o.Titulo_objetivo, m.Fecha_completado, m.Puntos_otorgados, m.Status, m.Final_value
      FROM usuarios_y_objetivos m
      JOIN objetivos o ON o.Id_objetivo = m.Objetivo
      WHERE m.Usuario = ? AND m.Status IN ('Cumplido', 'Fallido')
      ORDER BY m.Fecha_completado DESC
    `, [userId]);

    return rows.map(r => ({
      idRelacion: r.Id_relacion_usuario_objetivo,
      objetivoId: r.Id_objetivo,
      titulo: r.Titulo_objetivo,
      fechaCompletado: r.Fecha_completado ? r.Fecha_completado.toISOString() : '',
      puntos: r.Puntos_otorgados || 0,
      status: r.Status,
      finalValue: r.Final_value == null ? null : r.Final_value,
    }));
  },

  generarObjetivosPorDefecto: async ({ usuarioIdentifier }) => {
    try {
      console.log(`🎯 GraphQL: Generando objetivos por defecto para ${usuarioIdentifier}`);
      
      // Obtener dinero disponible
      const dineroDisponible = await obtenerDineroDisponible(usuarioIdentifier);
      
      if (dineroDisponible <= 0) {
        return {
          success: false,
          message: 'No se puede generar objetivos sin dinero disponible. Registra ingresos primero.',
          objetivos: [],
          dineroDisponible: 0
        };
      }

      // Generar objetivos
      const resultado = await generarObjetivosPorDefecto(usuarioIdentifier, dineroDisponible);
      
      return resultado;
    } catch (error) {
      console.error('❌ Error en GraphQL generarObjetivosPorDefecto:', error);
      return {
        success: false,
        message: `Error generando objetivos: ${error.message}`,
        objetivos: [],
        dineroDisponible: 0
      };
    }
  },

  verificarObjetivosCompletados: async ({ usuarioIdentifier }) => {
    try {
      console.log(`🔍 GraphQL: Verificando objetivos completados para ${usuarioIdentifier}`);
      
      const resultado = await verificarObjetivosCompletados(usuarioIdentifier);
      
      return resultado;
    } catch (error) {
      console.error('❌ Error en GraphQL verificarObjetivosCompletados:', error);
      return {
        verificados: 0,
        completados: 0,
        fallidos: 0,
        actualizados: []
      };
    }
  },

  // Queries para objetivos personalizados
  categorias: async () => {
    try {
      const categorias = await obtenerCategorias();
      return categorias.map(cat => ({
        id: cat.Id_categoria,
        nombre: cat.Nombre_categoria
      }));
    } catch (error) {
      console.error('Error obteniendo categorías:', error);
      return [];
    }
  },

  tiposObjetivos: async () => {
    try {
      const tipos = await obtenerTiposObjetivos();
      return tipos.map(tipo => ({
        id: tipo.Id_tipo_objetivo,
        nombre: tipo.Nombre_tipo_objetivo
      }));
    } catch (error) {
      console.error('Error obteniendo tipos de objetivos:', error);
      return [];
    }
  },

  objetivosPersonalizados: async ({ usuarioIdentifier }) => {
    try {
      const objetivos = await obtenerObjetivosPersonalizados(usuarioIdentifier);
      return objetivos.map(obj => ({
        id: obj.Id_objetivo,
        titulo: obj.Titulo_objetivo,
        valorObjetivo: obj.Valor_objetivo,
        multiplicador: obj.Multiplicador,
        tipoObjetivo: obj.Tipo_objetivo,
        categoriaObjetivo: obj.Categoria_objetivo,
        fechaCreacion: obj.Fecha_creacion_objetivo,
        status: obj.Status,
        fechaCompletado: obj.Fecha_completado,
        puntosOtorgados: obj.Puntos_otorgados,
        valorFinal: obj.Final_value,
        nombreCategoria: obj.Nombre_categoria,
        nombreTipoObjetivo: obj.Nombre_tipo_objetivo
      }));
    } catch (error) {
      console.error('Error obteniendo objetivos personalizados:', error);
      return [];
    }
  },

  // Mutations para objetivos personalizados
  crearObjetivoPersonalizado: async ({ usuarioIdentifier, titulo, valorObjetivo, tipoObjetivo, categoriaObjetivo, multiplicador, descripcion }) => {
    try {
      console.log(`🎯 GraphQL: Creando objetivo personalizado para ${usuarioIdentifier}`);
      
      const resultado = await crearObjetivoPersonalizado(usuarioIdentifier, {
        titulo,
        valorObjetivo,
        tipoObjetivo,
        categoriaObjetivo,
        multiplicador,
        descripcion
      });
      
      return resultado;
    } catch (error) {
      console.error('❌ Error en GraphQL crearObjetivoPersonalizado:', error);
      return {
        success: false,
        message: `Error creando objetivo: ${error.message}`,
        objetivo: null,
        errores: [error.message]
      };
    }
  },

  eliminarObjetivoPersonalizado: async ({ usuarioIdentifier, objetivoId }) => {
    try {
      console.log(`🗑️ GraphQL: Eliminando objetivo ${objetivoId} para ${usuarioIdentifier}`);
      
      const resultado = await eliminarObjetivoPersonalizado(usuarioIdentifier, objetivoId);
      
      return resultado;
    } catch (error) {
      console.error('❌ Error en GraphQL eliminarObjetivoPersonalizado:', error);
      return {
        success: false,
        message: `Error eliminando objetivo: ${error.message}`,
        objetivo: null,
        errores: [error.message]
      };
    }
  },
};

function mountGraphql(app) {
  const router = express.Router();
  router.post('/graphql', express.json(), async (req, res) => {
    try {
      const { query: q, variables } = req.body;
      const response = await graphql({ schema, source: q, rootValue: root, variableValues: variables });
      res.json(response);
    } catch (e) {
      console.error('GraphQL error', e);
      res.status(500).json({ errors: [{ message: e.message }] });
    }
  });
  app.use('/', router);
  console.log('GraphQL endpoint mounted at POST /graphql');
}

module.exports = { mountGraphql };


