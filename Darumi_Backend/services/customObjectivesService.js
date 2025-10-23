/*
 * Servicio para manejo de objetivos personalizados creados por usuarios
 */

const connection = require('../db');

function query(sql, params) {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

/**
 * Obtiene las categorías disponibles para objetivos
 * @returns {Promise<Array>} Lista de categorías
 */
async function obtenerCategorias() {
  try {
    const categorias = await query(
      `SELECT Id_categoria, Nombre_categoria FROM categorias WHERE Id_categoria != 8 ORDER BY Nombre_categoria`,
      []
    );
    return categorias;
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    throw error;
  }
}

/**
 * Obtiene los tipos de objetivos disponibles
 * @returns {Promise<Array>} Lista de tipos de objetivos
 */
async function obtenerTiposObjetivos() {
  try {
    const tipos = await query(
      `SELECT Id_tipo_objetivo, Nombre_tipo_objetivo FROM tipos_objetivos ORDER BY Id_tipo_objetivo`,
      []
    );
    return tipos;
  } catch (error) {
    console.error('Error obteniendo tipos de objetivos:', error);
    throw error;
  }
}

/**
 * Valida los datos de un objetivo personalizado
 * @param {Object} objetivoData - Datos del objetivo a validar
 * @returns {Object} Resultado de la validación
 */
function validarObjetivoPersonalizado(objetivoData) {
  const { titulo, valorObjetivo, tipoObjetivo, categoriaObjetivo, multiplicador } = objetivoData;
  
  const errores = [];
  
  // Validar título
  if (!titulo || titulo.trim().length === 0) {
    errores.push('El título es requerido');
  } else if (titulo.length > 50) {
    errores.push('El título no puede exceder 50 caracteres');
  }
  
  // Validar valor objetivo
  if (!valorObjetivo || valorObjetivo <= 0) {
    errores.push('El valor objetivo debe ser mayor que 0');
  } else if (valorObjetivo > 1000000) {
    errores.push('El valor objetivo no puede exceder $1,000,000');
  }
  
  // Validar tipo de objetivo
  if (!tipoObjetivo || (tipoObjetivo !== 1 && tipoObjetivo !== 2)) {
    errores.push('Tipo de objetivo inválido');
  }
  
  // Validar categoría (requerida solo para tipo 2)
  if (tipoObjetivo === 2 && (!categoriaObjetivo || categoriaObjetivo <= 0)) {
    errores.push('La categoría es requerida para objetivos por categoría');
  }
  
  // Validar multiplicador
  if (multiplicador && (multiplicador < 0.1 || multiplicador > 10)) {
    errores.push('El multiplicador debe estar entre 0.1 y 10');
  }
  
  return {
    valido: errores.length === 0,
    errores: errores
  };
}

/**
 * Crea un objetivo personalizado para un usuario
 * @param {string} userIdentifier - Identificador único del usuario
 * @param {Object} objetivoData - Datos del objetivo a crear
 * @returns {Promise<Object>} Resultado de la creación
 */
async function crearObjetivoPersonalizado(userIdentifier, objetivoData) {
  try {
    console.log(`🎯 Creando objetivo personalizado para usuario ${userIdentifier}:`, objetivoData);
    
    // Validar datos
    const validacion = validarObjetivoPersonalizado(objetivoData);
    if (!validacion.valido) {
      return {
        success: false,
        message: 'Datos inválidos',
        errores: validacion.errores
      };
    }
    
    // Obtener ID del usuario
    const usuario = await query(
      `SELECT Id_usuario FROM usuarios WHERE Identifier_usuario = ?`,
      [userIdentifier]
    );
    
    if (usuario.length === 0) {
      return {
        success: false,
        message: 'Usuario no encontrado'
      };
    }
    
    const userId = usuario[0].Id_usuario;
    
    // Verificar límite de objetivos activos (máximo 5)
    const objetivosActivos = await query(
      `SELECT COUNT(*) as count FROM usuarios_y_objetivos 
       WHERE Usuario = ? AND Status = 'En progreso'`,
      [userId]
    );
    
    if (objetivosActivos[0].count >= 5) {
      return {
        success: false,
        message: 'No puedes tener más de 5 objetivos activos simultáneamente'
      };
    }
    
    const {
      titulo,
      valorObjetivo,
      tipoObjetivo,
      categoriaObjetivo,
      descripcion = ''
    } = objetivoData;
    
    // Asignar multiplicador por defecto controlado por el sistema
    const multiplicador = 1.0;
    
    const fechaActual = new Date();
    const estadoEnProgreso = 1; // Estado "En progreso"
    
    // Iniciar transacción
    await query('START TRANSACTION');
    
    try {
      // Insertar objetivo en la tabla objetivos
      const insertObjetivoResult = await query(
        `INSERT INTO objetivos (
          Titulo_objetivo, 
          Fecha_creacion_objetivo, 
          Multiplicador, 
          Tipo_objetivo, 
          Valor_objetivo, 
          Categoria_objetivo
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          titulo.trim(),
          fechaActual,
          multiplicador,
          tipoObjetivo,
          valorObjetivo,
          tipoObjetivo === 2 ? categoriaObjetivo : null
        ]
      );
      
      const objetivoId = insertObjetivoResult.insertId;
      
      // Insertar relación usuario-objetivo
      await query(
        `INSERT INTO usuarios_y_objetivos (Usuario, Objetivo, Status) VALUES (?, ?, ?)`,
        [userId, objetivoId, 'En progreso']
      );
      
      // Confirmar transacción
      await query('COMMIT');
      
      console.log(`✅ Objetivo personalizado creado exitosamente: ID ${objetivoId}`);
      
      return {
        success: true,
        message: 'Objetivo personalizado creado exitosamente',
        objetivo: {
          id: objetivoId,
          titulo: titulo.trim(),
          valorObjetivo: valorObjetivo,
          tipoObjetivo: tipoObjetivo,
          categoriaObjetivo: tipoObjetivo === 2 ? categoriaObjetivo : null,
          multiplicador: multiplicador,
          descripcion: descripcion,
          fechaCreacion: fechaActual
        }
      };
      
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error('Error creando objetivo personalizado:', error);
    return {
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    };
  }
}

/**
 * Obtiene los objetivos personalizados de un usuario
 * @param {string} userIdentifier - Identificador único del usuario
 * @returns {Promise<Array>} Lista de objetivos del usuario
 */
async function obtenerObjetivosPersonalizados(userIdentifier) {
  try {
    const usuario = await query(
      `SELECT Id_usuario FROM usuarios WHERE Identifier_usuario = ?`,
      [userIdentifier]
    );
    
    if (usuario.length === 0) {
      return [];
    }
    
    const userId = usuario[0].Id_usuario;
    
    const objetivos = await query(`
      SELECT 
        o.Id_objetivo,
        o.Titulo_objetivo,
        o.Valor_objetivo,
        o.Multiplicador,
        o.Tipo_objetivo,
        o.Categoria_objetivo,
        o.Fecha_creacion_objetivo,
        uyo.Status,
        uyo.Fecha_completado,
        uyo.Puntos_otorgados,
        uyo.Final_value,
        c.Nombre_categoria,
        t.Nombre_tipo_objetivo
      FROM objetivos o
      JOIN usuarios_y_objetivos uyo ON o.Id_objetivo = uyo.Objetivo
      JOIN usuarios u ON uyo.Usuario = u.Id_usuario
      LEFT JOIN categorias c ON o.Categoria_objetivo = c.Id_categoria
      LEFT JOIN tipos_objetivos t ON o.Tipo_objetivo = t.Id_tipo_objetivo
      WHERE u.Id_usuario = ?
      ORDER BY o.Fecha_creacion_objetivo DESC
    `, [userId]);
    
    return objetivos;
    
  } catch (error) {
    console.error('Error obteniendo objetivos personalizados:', error);
    throw error;
  }
}

/**
 * Elimina un objetivo personalizado
 * @param {string} userIdentifier - Identificador único del usuario
 * @param {number} objetivoId - ID del objetivo a eliminar
 * @returns {Promise<Object>} Resultado de la eliminación
 */
async function eliminarObjetivoPersonalizado(userIdentifier, objetivoId) {
  try {
    const usuario = await query(
      `SELECT Id_usuario FROM usuarios WHERE Identifier_usuario = ?`,
      [userIdentifier]
    );
    
    if (usuario.length === 0) {
      return {
        success: false,
        message: 'Usuario no encontrado'
      };
    }
    
    const userId = usuario[0].Id_usuario;
    
    // Verificar que el objetivo pertenece al usuario
    const objetivoUsuario = await query(
      `SELECT uyo.Id_relacion_usuario_objetivo, o.Titulo_objetivo
       FROM usuarios_y_objetivos uyo
       JOIN objetivos o ON uyo.Objetivo = o.Id_objetivo
       WHERE uyo.Usuario = ? AND uyo.Objetivo = ?`,
      [userId, objetivoId]
    );
    
    if (objetivoUsuario.length === 0) {
      return {
        success: false,
        message: 'Objetivo no encontrado o no pertenece al usuario'
      };
    }
    
    // Verificar que el objetivo esté en progreso
    if (objetivoUsuario[0].Status !== 'En progreso') {
      return {
        success: false,
        message: 'Solo se pueden eliminar objetivos en progreso'
      };
    }
    
    // Iniciar transacción
    await query('START TRANSACTION');
    
    try {
      // Eliminar relación usuario-objetivo
      await query(
        `DELETE FROM usuarios_y_objetivos WHERE Usuario = ? AND Objetivo = ?`,
        [userId, objetivoId]
      );
      
      // Eliminar objetivo
      await query(
        `DELETE FROM objetivos WHERE Id_objetivo = ?`,
        [objetivoId]
      );
      
      await query('COMMIT');
      
      console.log(`✅ Objetivo ${objetivoId} eliminado exitosamente`);
      
      return {
        success: true,
        message: 'Objetivo eliminado exitosamente'
      };
      
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error('Error eliminando objetivo personalizado:', error);
    return {
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    };
  }
}

module.exports = {
  obtenerCategorias,
  obtenerTiposObjetivos,
  validarObjetivoPersonalizado,
  crearObjetivoPersonalizado,
  obtenerObjetivosPersonalizados,
  eliminarObjetivoPersonalizado
};
