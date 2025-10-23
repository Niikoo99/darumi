/*
 * Servicio para generar objetivos por defecto para nuevos usuarios
 * Se activa cuando un usuario registra su primer ingreso (dinero disponible)
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
 * Genera objetivos por defecto para un nuevo usuario basado en su dinero disponible
 * @param {string} userIdentifier - Identificador único del usuario
 * @param {number} dineroDisponible - Cantidad de dinero disponible del usuario
 * @returns {Promise<Object>} Resultado de la generación
 */
async function generarObjetivosPorDefecto(userIdentifier, dineroDisponible) {
  try {
    console.log(`🎯 Generando objetivos por defecto para usuario ${userIdentifier} con $${dineroDisponible}`);

    // Verificar si el usuario ya tiene objetivos
    const usuario = await query(
      `SELECT Id_usuario FROM usuarios WHERE Identifier_usuario = ?`,
      [userIdentifier]
    );

    if (usuario.length === 0) {
      throw new Error(`Usuario ${userIdentifier} no encontrado`);
    }

    const userId = usuario[0].Id_usuario;

    // Verificar si ya tiene objetivos asignados
    const objetivosExistentes = await query(
      `SELECT COUNT(*) as count FROM usuarios_y_objetivos WHERE Usuario = ?`,
      [userId]
    );

    if (objetivosExistentes[0].count > 0) {
      console.log(`Usuario ${userIdentifier} ya tiene objetivos asignados`);
      return { success: false, message: 'Usuario ya tiene objetivos' };
    }

    // Definir objetivos por defecto basados en porcentajes del dinero disponible
    const objetivosPorDefecto = [
      {
        titulo: "Desafío Bronce - Control de Gastos",
        descripcion: `Mantén tus gastos por debajo del 90% de tu dinero disponible ($${Math.round(dineroDisponible * 0.9).toLocaleString()})`,
        valorObjetivo: dineroDisponible * 0.9,
        multiplicador: 1.0,
        tipoObjetivo: 1, // Gastos generales
        categoriaObjetivo: null,
        nivel: "Bronce"
      },
      {
        titulo: "Desafío Plata - Ahorro Moderado",
        descripcion: `Mantén tus gastos por debajo del 80% de tu dinero disponible ($${Math.round(dineroDisponible * 0.8).toLocaleString()})`,
        valorObjetivo: dineroDisponible * 0.8,
        multiplicador: 1.5,
        tipoObjetivo: 1, // Gastos generales
        categoriaObjetivo: null,
        nivel: "Plata"
      },
      {
        titulo: "Desafío Oro - Ahorro Excelente",
        descripcion: `Ahorra al menos el 25% de tu dinero disponible (gasta menos de $${Math.round(dineroDisponible * 0.75).toLocaleString()})`,
        valorObjetivo: dineroDisponible * 0.75,
        multiplicador: 2.0,
        tipoObjetivo: 1, // Gastos generales
        categoriaObjetivo: null,
        nivel: "Oro"
      }
    ];

    // Obtener el estado "En progreso"
    const estadoEnProgreso = await query(
      `SELECT Id_estado FROM estados WHERE Nombre_estado = 'En progreso'`
    );

    if (estadoEnProgreso.length === 0) {
      throw new Error('Estado "En progreso" no encontrado');
    }

    const estadoId = estadoEnProgreso[0].Id_estado;

    // Crear objetivos y asignarlos al usuario en una transacción
    await query('START TRANSACTION');

    try {
      const objetivosCreados = [];

      for (const objetivo of objetivosPorDefecto) {
        // Crear el objetivo
        const objetivoResult = await query(
          `INSERT INTO objetivos (Titulo_objetivo, Fecha_creacion_objetivo, Multiplicador, Tipo_objetivo, Valor_objetivo, Categoria_objetivo) 
           VALUES (?, NOW(), ?, ?, ?, ?)`,
          [
            objetivo.titulo,
            objetivo.multiplicador,
            objetivo.tipoObjetivo,
            objetivo.valorObjetivo,
            objetivo.categoriaObjetivo
          ]
        );

        const objetivoId = objetivoResult.insertId;

        // Asignar el objetivo al usuario
        await query(
          `INSERT INTO usuarios_y_objetivos (Usuario, Objetivo, Status, Fecha_completado, Puntos_otorgados) 
           VALUES (?, ?, 'En progreso', NULL, NULL)`,
          [userId, objetivoId]
        );

        objetivosCreados.push({
          id: objetivoId,
          titulo: objetivo.titulo,
          descripcion: objetivo.descripcion,
          valorObjetivo: objetivo.valorObjetivo,
          multiplicador: objetivo.multiplicador,
          nivel: objetivo.nivel
        });

        console.log(`✅ Objetivo ${objetivo.nivel} creado: ${objetivo.titulo}`);
      }

      await query('COMMIT');

      // Crear notificación de bienvenida
      await query(
        `INSERT INTO notificaciones (Id_usuario, Titulo, Mensaje) 
         VALUES (?, ?, ?)`,
        [
          userId,
          '🎯 ¡Objetivos de Bienvenida Creados!',
          `Se han creado 3 objetivos personalizados basados en tu dinero disponible de $${dineroDisponible.toLocaleString()}. ¡Comienza tu desafío de ahorro!`
        ]
      );

      console.log(`🎉 Objetivos por defecto generados exitosamente para usuario ${userIdentifier}`);

      return {
        success: true,
        message: 'Objetivos generados exitosamente',
        objetivos: objetivosCreados,
        dineroDisponible: dineroDisponible
      };

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('❌ Error generando objetivos por defecto:', error);
    throw error;
  }
}

/**
 * Verifica si un usuario necesita objetivos por defecto
 * @param {string} userIdentifier - Identificador único del usuario
 * @returns {Promise<boolean>} True si necesita objetivos por defecto
 */
async function necesitaObjetivosPorDefecto(userIdentifier) {
  try {
    const usuario = await query(
      `SELECT Id_usuario FROM usuarios WHERE Identifier_usuario = ?`,
      [userIdentifier]
    );

    if (usuario.length === 0) {
      return false;
    }

    const userId = usuario[0].Id_usuario;

    // Verificar si ya tiene objetivos asignados
    const objetivosExistentes = await query(
      `SELECT COUNT(*) as count FROM usuarios_y_objetivos WHERE Usuario = ?`,
      [userId]
    );

    return objetivosExistentes[0].count === 0;

  } catch (error) {
    console.error('❌ Error verificando necesidad de objetivos:', error);
    return false;
  }
}

/**
 * Obtiene el dinero disponible de un usuario basado en sus ingresos
 * @param {string} userIdentifier - Identificador único del usuario
 * @returns {Promise<number>} Cantidad de dinero disponible
 */
async function obtenerDineroDisponible(userIdentifier) {
  try {
    const usuario = await query(
      `SELECT Id_usuario FROM usuarios WHERE Identifier_usuario = ?`,
      [userIdentifier]
    );

    if (usuario.length === 0) {
      return 0;
    }

    const userId = usuario[0].Id_usuario;

    // Obtener ingresos del mes actual
    const now = new Date();
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    const finMes = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const ingresos = await query(
      `SELECT COALESCE(SUM(CASE WHEN Monto_gasto > 0 THEN Monto_gasto ELSE 0 END), 0) as total
       FROM gastos 
       WHERE Id_usuario = ? AND Fecha_creacion_gasto BETWEEN ? AND ? AND Active = 1`,
      [userId, inicioMes, finMes]
    );

    return ingresos[0].total || 0;

  } catch (error) {
    console.error('❌ Error obteniendo dinero disponible:', error);
    return 0;
  }
}

module.exports = {
  generarObjetivosPorDefecto,
  necesitaObjetivosPorDefecto,
  obtenerDineroDisponible
};
