/*
 * Servicio para verificar y actualizar objetivos completados en tiempo real
 * Se ejecuta cuando se registran gastos para verificar si algún objetivo se completó
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
 * Verifica y actualiza objetivos completados para un usuario específico
 * @param {string} userIdentifier - Identificador único del usuario
 * @returns {Promise<Object>} Resultado de la verificación
 */
async function verificarObjetivosCompletados(userIdentifier) {
  try {
    console.log(`🔍 Verificando objetivos completados para usuario ${userIdentifier}`);

    // Obtener ID del usuario
    const usuario = await query(
      `SELECT Id_usuario FROM usuarios WHERE Identifier_usuario = ?`,
      [userIdentifier]
    );

    if (usuario.length === 0) {
      throw new Error(`Usuario ${userIdentifier} no encontrado`);
    }

    const userId = usuario[0].Id_usuario;

    // Obtener objetivos en progreso del usuario
    const objetivosEnProgreso = await query(`
      SELECT m.Id_relacion_usuario_objetivo, m.Usuario as Id_usuario, m.Objetivo as Id_objetivo,
             o.Multiplicador, o.Valor_objetivo, o.Categoria_objetivo, o.Titulo_objetivo
      FROM usuarios_y_objetivos m
      JOIN objetivos o ON o.Id_objetivo = m.Objetivo
      WHERE m.Usuario = ? AND m.Status = 'En progreso'
    `, [userId]);

    if (objetivosEnProgreso.length === 0) {
      console.log(`ℹ️ Usuario ${userIdentifier} no tiene objetivos en progreso`);
      return { verificados: 0, completados: 0, fallidos: 0 };
    }

    // Calcular gastos del mes actual
    const now = new Date();
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    const finMes = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    let objetivosCompletados = 0;
    let objetivosFallidos = 0;
    const objetivosActualizados = [];

    for (const objetivo of objetivosEnProgreso) {
      const { Id_relacion_usuario_objetivo, Id_usuario, Valor_objetivo, Categoria_objetivo, Multiplicador, Titulo_objetivo } = objetivo;

      // Calcular gasto del mes actual
      let totalGasto = 0;
      if (Categoria_objetivo) {
        const gastosCategoria = await query(
          `SELECT COALESCE(SUM(CASE WHEN Monto_gasto < 0 THEN -Monto_gasto ELSE 0 END), 0) as total
           FROM gastos
           WHERE Id_usuario = ? AND Categoria_gasto = ? AND Fecha_creacion_gasto BETWEEN ? AND ? AND Active = 1`,
          [Id_usuario, Categoria_objetivo, inicioMes, finMes]
        );
        totalGasto = gastosCategoria[0].total || 0;
      } else {
        const gastosGenerales = await query(
          `SELECT COALESCE(SUM(CASE WHEN Monto_gasto < 0 THEN -Monto_gasto ELSE 0 END), 0) as total
           FROM gastos
           WHERE Id_usuario = ? AND Fecha_creacion_gasto BETWEEN ? AND ? AND Active = 1`,
          [Id_usuario, inicioMes, finMes]
        );
        totalGasto = gastosGenerales[0].total || 0;
      }

      // Verificar si el objetivo se completó o falló
      const cumplido = totalGasto <= Valor_objetivo;
      const porcentajeCompletado = Math.min(100, Math.round((totalGasto / Valor_objetivo) * 100));

      // Solo actualizar si el objetivo está al 100% o más
      if (porcentajeCompletado >= 100) {
        const status = cumplido ? 'Cumplido' : 'Fallido';
        const puntos = cumplido ? Math.floor((Valor_objetivo - totalGasto) * (Multiplicador || 1)) : 0;

        // Actualizar objetivo en transacción
        await query('START TRANSACTION');
        try {
          await query(
            `UPDATE usuarios_y_objetivos
               SET Status = ?, Final_value = ?, Fecha_completado = NOW(), Puntos_otorgados = ?
             WHERE Id_relacion_usuario_objetivo = ?`,
            [status, totalGasto, puntos, Id_relacion_usuario_objetivo]
          );

          if (puntos > 0) {
            await query(
              `UPDATE usuarios SET Points_total = Points_total + ? WHERE Id_usuario = ?`,
              [puntos, Id_usuario]
            );
          }

          const titulo = cumplido ? '¡Objetivo cumplido!' : 'Objetivo no cumplido';
          const mensaje = cumplido
            ? `Felicitaciones, ganaste ${puntos} puntos. Gasto final: $${totalGasto.toLocaleString()}.`
            : `Tu meta era $${Valor_objetivo.toLocaleString()}, pero tu gasto final fue $${totalGasto.toLocaleString()}.`;

          await query(
            `INSERT INTO notificaciones (Id_usuario, Titulo, Mensaje) VALUES (?, ?, ?)`,
            [Id_usuario, titulo, mensaje]
          );

          await query('COMMIT');

          objetivosActualizados.push({
            id: Id_relacion_usuario_objetivo,
            titulo: Titulo_objetivo,
            status: status,
            puntos: puntos,
            gastoFinal: totalGasto,
            valorObjetivo: Valor_objetivo,
            cumplido: cumplido
          });

          if (cumplido) {
            objetivosCompletados++;
            console.log(`✅ Objetivo completado: ${Titulo_objetivo} - ${puntos} puntos`);
          } else {
            objetivosFallidos++;
            console.log(`❌ Objetivo fallido: ${Titulo_objetivo}`);
          }

        } catch (error) {
          await query('ROLLBACK');
          console.error(`❌ Error actualizando objetivo ${Id_relacion_usuario_objetivo}:`, error);
        }
      }
    }

    console.log(`📊 Verificación completada: ${objetivosCompletados} completados, ${objetivosFallidos} fallidos`);

    return {
      verificados: objetivosEnProgreso.length,
      completados: objetivosCompletados,
      fallidos: objetivosFallidos,
      actualizados: objetivosActualizados
    };

  } catch (error) {
    console.error('❌ Error verificando objetivos completados:', error);
    throw error;
  }
}

/**
 * Verifica objetivos completados para todos los usuarios (función de mantenimiento)
 * @returns {Promise<Object>} Resultado de la verificación global
 */
async function verificarTodosLosObjetivosCompletados() {
  try {
    console.log('🔍 Verificando objetivos completados para todos los usuarios...');

    // Obtener todos los usuarios
    const usuarios = await query(`SELECT Identifier_usuario FROM usuarios`);

    let totalVerificados = 0;
    let totalCompletados = 0;
    let totalFallidos = 0;

    for (const usuario of usuarios) {
      try {
        const resultado = await verificarObjetivosCompletados(usuario.Identifier_usuario);
        totalVerificados += resultado.verificados;
        totalCompletados += resultado.completados;
        totalFallidos += resultado.fallidos;
      } catch (error) {
        console.error(`❌ Error verificando usuario ${usuario.Identifier_usuario}:`, error);
      }
    }

    console.log(`📊 Verificación global completada: ${totalCompletados} completados, ${totalFallidos} fallidos de ${totalVerificados} verificados`);

    return {
      usuariosProcesados: usuarios.length,
      objetivosVerificados: totalVerificados,
      objetivosCompletados: totalCompletados,
      objetivosFallidos: totalFallidos
    };

  } catch (error) {
    console.error('❌ Error en verificación global:', error);
    throw error;
  }
}

module.exports = {
  verificarObjetivosCompletados,
  verificarTodosLosObjetivosCompletados
};
