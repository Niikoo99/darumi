/**
 * Servicio para verificación inmediata de objetivos de límite de gasto
 * Este servicio se ejecuta después de crear un nuevo gasto para verificar
 * si algún objetivo de límite de gasto ha sido excedido inmediatamente
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
 * Verifica si algún objetivo de límite de gasto ha sido excedido después de un nuevo gasto
 * @param {string} userIdentifier - Identificador único del usuario
 * @param {number} expenseAmount - Monto del gasto recién creado (valor absoluto)
 * @param {number} expenseCategoryId - ID de la categoría del gasto
 * @param {Object} io - Instancia de Socket.IO para notificaciones
 * @returns {Promise<Object>} Resultado de la verificación
 */
async function verificarObjetivosInmediatamente(userIdentifier, expenseAmount, expenseCategoryId, io) {
  try {
    console.log(`🔍 Verificando objetivos inmediatamente para usuario ${userIdentifier}, gasto: $${expenseAmount}, categoría: ${expenseCategoryId}`);

    // 1. Obtener ID interno del usuario
    const usuario = await query(
      `SELECT Id_usuario FROM usuarios WHERE Identifier_usuario = ?`,
      [userIdentifier]
    );

    if (usuario.length === 0) {
      console.log(`⚠️ Usuario ${userIdentifier} no encontrado`);
      return { success: false, message: 'Usuario no encontrado' };
    }

    const userId = usuario[0].Id_usuario;

    // 2. Obtener objetivos "En progreso" de tipo límite de gasto
    // Incluye objetivos generales (tipo 1) y por categoría específica (tipo 2)
    const objetivosQuery = `
      SELECT 
        uo.Id_relacion_usuario_objetivo,
        uo.Objetivo as Id_objetivo,
        o.Titulo_objetivo,
        o.Valor_objetivo,
        o.Categoria_objetivo,
        o.Multiplicador
      FROM usuarios_y_objetivos uo
      JOIN objetivos o ON o.Id_objetivo = uo.Objetivo
      WHERE uo.Usuario = ? 
        AND uo.Status = 'En progreso'
        AND o.Tipo_objetivo IN (1, 2)  -- Gastos generales y por categoría
    `;

    const objetivos = await query(objetivosQuery, [userId]);

    if (objetivos.length === 0) {
      console.log(`ℹ️ Usuario ${userIdentifier} no tiene objetivos de límite de gasto activos`);
      return { success: true, message: 'No hay objetivos activos para verificar', objetivosFallidos: [] };
    }

    console.log(`📊 Encontrados ${objetivos.length} objetivos activos para verificar`);

    const objetivosFallidos = [];

    // 3. Para cada objetivo, calcular el total gastado y verificar si excede el límite
    for (const objetivo of objetivos) {
      const { Id_relacion_usuario_objetivo, Id_objetivo, Titulo_objetivo, Valor_objetivo, Categoria_objetivo, Multiplicador } = objetivo;

      // Calcular total gastado según el tipo de objetivo
      let totalGastado = 0;

      if (Categoria_objetivo) {
        // Objetivo por categoría específica
        if (Categoria_objetivo === expenseCategoryId) {
          // Solo calcular si el gasto es de la misma categoría
          const gastosQuery = `
            SELECT COALESCE(SUM(CASE WHEN Monto_gasto < 0 THEN -Monto_gasto ELSE 0 END), 0) as total
            FROM gastos
            WHERE Id_usuario = ? 
              AND Categoria_gasto = ? 
              AND Active = 1
          `;
          const resultado = await query(gastosQuery, [userId, Categoria_objetivo]);
          totalGastado = resultado[0].total || 0;
        } else {
          // Si el gasto no es de esta categoría, no afecta este objetivo
          continue;
        }
      } else {
        // Objetivo general (todos los gastos)
        const gastosQuery = `
          SELECT COALESCE(SUM(CASE WHEN Monto_gasto < 0 THEN -Monto_gasto ELSE 0 END), 0) as total
          FROM gastos
          WHERE Id_usuario = ? 
            AND Active = 1
        `;
        const resultado = await query(gastosQuery, [userId]);
        totalGastado = resultado[0].total || 0;
      }

      console.log(`💰 Objetivo "${Titulo_objetivo}": Total gastado $${totalGastado}, Límite $${Valor_objetivo}`);

      // 4. Verificar si el objetivo ha fallado
      if (totalGastado > Valor_objetivo) {
        console.log(`❌ OBJETIVO FALLIDO: "${Titulo_objetivo}" - Gastado: $${totalGastado}, Límite: $${Valor_objetivo}`);

        // Actualizar objetivo a estado "Fallido"
        await query('START TRANSACTION');
        try {
          await query(
            `UPDATE usuarios_y_objetivos
             SET Status = 'Fallido', 
                 Final_value = ?, 
                 Fecha_completado = NOW(), 
                 Puntos_otorgados = 0
             WHERE Id_relacion_usuario_objetivo = ?`,
            [totalGastado, Id_relacion_usuario_objetivo]
          );

          // Crear notificación
          const titulo = 'Objetivo excedido';
          const mensaje = `Tu objetivo "${Titulo_objetivo}" ha sido excedido. Límite: $${Valor_objetivo}, Gastado: $${totalGastado}`;

          await query(
            `INSERT INTO notificaciones (Id_usuario, Titulo, Mensaje) VALUES (?, ?, ?)`,
            [userId, titulo, mensaje]
          );

          await query('COMMIT');

          // Emitir evento Socket.IO
          if (io) {
            const eventData = {
              userId: userIdentifier,
              objectiveId: Id_objetivo,
              title: Titulo_objetivo,
              status: 'Fallido',
              points: 0,
              finalValue: totalGastado,
              targetValue: Valor_objetivo,
              message: mensaje,
              timestamp: new Date().toISOString(),
            };

            io.to(`user_${userIdentifier}`).emit('objective_failed', eventData);
            console.log(`📡 Socket.IO event sent: objective_failed to user ${userIdentifier}`);
          }

          objetivosFallidos.push({
            id: Id_objetivo,
            titulo: Titulo_objetivo,
            totalGastado,
            valorObjetivo: Valor_objetivo,
            exceso: totalGastado - Valor_objetivo
          });

        } catch (error) {
          await query('ROLLBACK');
          console.error(`❌ Error actualizando objetivo fallido ${Id_objetivo}:`, error);
          throw error;
        }
      }
    }

    const resultado = {
      success: true,
      objetivosVerificados: objetivos.length,
      objetivosFallidos: objetivosFallidos.length,
      detalles: objetivosFallidos
    };

    if (objetivosFallidos.length > 0) {
      console.log(`✅ Verificación completada: ${objetivosFallidos.length} objetivos marcados como fallidos`);
    } else {
      console.log(`✅ Verificación completada: Ningún objetivo excedido`);
    }

    return resultado;

  } catch (error) {
    console.error('❌ Error en verificación inmediata de objetivos:', error);
    return { success: false, message: 'Error interno del servidor', error: error.message };
  }
}

module.exports = {
  verificarObjetivosInmediatamente
};
