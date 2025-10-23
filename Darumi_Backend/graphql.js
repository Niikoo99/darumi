const { buildSchema, graphql } = require('graphql');
const express = require('express');
const connection = require('./db');
const { generarObjetivosPorDefecto, necesitaObjetivosPorDefecto, obtenerDineroDisponible } = require('./services/defaultObjectivesGenerator');
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
    nombreCategoria: String
  }

  type Logro {
    idRelacion: Int!
    objetivoId: Int!
    titulo: String!
    fechaCompletado: String!
    puntos: Int!
    status: String!
    finalValue: Float
    valorObjetivo: Float!
    categoriaId: Int
    nombreCategoria: String
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

  type EstadisticasUsuario {
    puntosTotal: Int!
    rachaActual: Int!
    objetivosEnProgreso: Int!
    objetivosCompletados: Int!
  }

  type Query {
    progresoActual(usuarioIdentifier: String!): [ObjetivoProgreso!]!
    historialLogros(usuarioIdentifier: String!): [Logro!]!
    categorias: [Categoria!]!
    tiposObjetivos: [TipoObjetivo!]!
    objetivosPersonalizados(usuarioIdentifier: String!): [ObjetivoPersonalizado!]!
    estadisticasUsuario(usuarioIdentifier: String!): EstadisticasUsuario
  }

  type Mutation {
    generarObjetivosPorDefecto(usuarioIdentifier: String!): ResultadoGeneracion!
    
    crearObjetivoPersonalizado(
      usuarioIdentifier: String!
      titulo: String!
      valorObjetivo: Float!
      tipoObjetivo: Int!
      categoriaObjetivo: Int
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
    try {
      console.log(`🔍 GraphQL: Obteniendo progreso actual para usuario ${usuarioIdentifier}`);
      
      // 1. Obtener ID del usuario (optimizado con índice)
      const usuarios = await query(
        `SELECT Id_usuario FROM usuarios WHERE Identifier_usuario = ?`, 
        [usuarioIdentifier]
      );
      
      if (!usuarios.length) {
        console.log(`⚠️ Usuario ${usuarioIdentifier} no encontrado`);
        return [];
      }
      
      const userId = usuarios[0].Id_usuario;
      console.log(`👤 Usuario encontrado con ID interno: ${userId}`);

      // 2. Calcular fechas del mes actual (una sola vez)
      const now = new Date();
      const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      const finMes = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      
      console.log(`📅 Período: ${inicioMes.toISOString()} - ${finMes.toISOString()}`);

      // 3. Query ultra-optimizada: usar JOINs en lugar de subconsultas para mejor rendimiento
      const objetivosConProgreso = await query(`
        SELECT 
          m.Id_relacion_usuario_objetivo,
          o.Id_objetivo,
          o.Titulo_objetivo,
          o.Valor_objetivo,
          o.Categoria_objetivo,
          c.Nombre_categoria,
          COALESCE(
            CASE 
              WHEN o.Categoria_objetivo IS NOT NULL THEN (
                SELECT COALESCE(SUM(CASE WHEN g.Monto_gasto < 0 THEN -g.Monto_gasto ELSE 0 END), 0)
                FROM gastos g
                WHERE g.Id_usuario = ? 
                  AND g.Categoria_gasto = o.Categoria_objetivo 
                  AND g.Active = 1 
                  AND g.Fecha_creacion_gasto BETWEEN ? AND ?
              )
              ELSE (
                SELECT COALESCE(SUM(CASE WHEN g.Monto_gasto < 0 THEN -g.Monto_gasto ELSE 0 END), 0)
                FROM gastos g
                WHERE g.Id_usuario = ? 
                  AND g.Active = 1 
                  AND g.Fecha_creacion_gasto BETWEEN ? AND ?
              )
            END, 0
          ) as valorActual
        FROM usuarios_y_objetivos m
        INNER JOIN objetivos o ON o.Id_objetivo = m.Objetivo
        LEFT JOIN categorias c ON c.Id_categoria = o.Categoria_objetivo
        WHERE m.Usuario = ? AND m.Status IN ('En progreso', 'Fallido')
        ORDER BY o.Valor_objetivo ASC
      `, [userId, inicioMes, finMes, userId, inicioMes, finMes, userId]);

      console.log(`📊 Encontrados ${objetivosConProgreso.length} objetivos activos (en progreso y fallidos)`);

      // 4. Transformar resultados al formato esperado por GraphQL
      const results = objetivosConProgreso.map(obj => {
        const progreso = {
          idRelacion: obj.Id_relacion_usuario_objetivo,
          objetivoId: obj.Id_objetivo,
          titulo: obj.Titulo_objetivo,
          valorObjetivo: obj.Valor_objetivo,
          valorActual: obj.valorActual || 0,
          categoriaId: obj.Categoria_objetivo || null,
          nombreCategoria: obj.Nombre_categoria || null,
        };
        
        console.log(`🎯 ${obj.Titulo_objetivo}: $${progreso.valorActual.toLocaleString()} / $${progreso.valorObjetivo.toLocaleString()}`);
        return progreso;
      });

      console.log(`✅ Progreso actual obtenido exitosamente para ${usuarioIdentifier}`);
      return results;

    } catch (error) {
      console.error(`❌ Error obteniendo progreso actual para ${usuarioIdentifier}:`, error);
      return [];
    }
  },

  historialLogros: async ({ usuarioIdentifier }) => {
    // Salón de la Fama: Solo objetivos cumplidos exitosamente
    const usuarios = await query(`SELECT Id_usuario FROM usuarios WHERE Identifier_usuario = ?`, [usuarioIdentifier]);
    if (!usuarios.length) return [];
    const userId = usuarios[0].Id_usuario;

    const rows = await query(`
      SELECT m.Id_relacion_usuario_objetivo, m.Objetivo as Id_objetivo, o.Titulo_objetivo, o.Valor_objetivo, o.Categoria_objetivo, c.Nombre_categoria, m.Fecha_completado, m.Puntos_otorgados, m.Status, m.Final_value
      FROM usuarios_y_objetivos m
      JOIN objetivos o ON o.Id_objetivo = m.Objetivo
      LEFT JOIN categorias c ON c.Id_categoria = o.Categoria_objetivo
      WHERE m.Usuario = ? AND m.Status = 'Cumplido'
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
      valorObjetivo: r.Valor_objetivo,
      categoriaId: r.Categoria_objetivo || null,
      nombreCategoria: r.Nombre_categoria || null,
    }));
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

  // Nueva query para obtener estadísticas del usuario incluyendo racha_actual
  estadisticasUsuario: async ({ usuarioIdentifier }) => {
    try {
      const usuarios = await query(`SELECT Id_usuario, Points_total, racha_actual FROM usuarios WHERE Identifier_usuario = ?`, [usuarioIdentifier]);
      if (!usuarios.length) return null;
      
      const usuario = usuarios[0];
      
      // Obtener objetivos en progreso
      const objetivosEnProgreso = await query(`
        SELECT COUNT(*) as count
        FROM usuarios_y_objetivos 
        WHERE Usuario = ? AND Status = 'En progreso'
      `, [usuario.Id_usuario]);
      
      // Obtener objetivos completados
      const objetivosCompletados = await query(`
        SELECT COUNT(*) as count
        FROM usuarios_y_objetivos 
        WHERE Usuario = ? AND Status = 'Cumplido'
      `, [usuario.Id_usuario]);
      
      return {
        puntosTotal: usuario.Points_total || 0,
        rachaActual: usuario.racha_actual || 0,
        objetivosEnProgreso: objetivosEnProgreso[0].count || 0,
        objetivosCompletados: objetivosCompletados[0].count || 0
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas del usuario:', error);
      return null;
    }
  },

  // Mutations para objetivos personalizados
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

  crearObjetivoPersonalizado: async ({ usuarioIdentifier, titulo, valorObjetivo, tipoObjetivo, categoriaObjetivo, descripcion }) => {
    try {
      console.log(`🎯 GraphQL: Creando objetivo personalizado para ${usuarioIdentifier}`);
      
      const resultado = await crearObjetivoPersonalizado(usuarioIdentifier, {
        titulo,
        valorObjetivo,
        tipoObjetivo,
        categoriaObjetivo,
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


