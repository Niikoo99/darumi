/*
 * Scheduler de metas y objetivos: cierra objetivos al final de cada mes
 */

const cron = require('node-cron');
const connection = require('./db');
const { Server } = require('socket.io');

const CRON_EXPRESSION = '1 0 1 * *'; // 00:01 del día 1 de cada mes

// Socket.IO instance (will be set by main.js)
let io = null;

function query(sql, params) {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

async function cerrarMetasMesAnterior() {
  const ahora = new Date();
  const year = ahora.getFullYear();
  const month = ahora.getMonth(); // 0-index, ahora es mes siguiente; evaluamos mes anterior
  const inicioMesAnterior = new Date(year, month - 1, 1, 0, 0, 0);
  const finMesAnterior = new Date(year, month, 0, 23, 59, 59);

  // 1) Traer metas en progreso con su objetivo y usuario
  const metas = await query(`
    SELECT m.Id_relacion_usuario_objetivo, m.Usuario as Id_usuario, m.Objetivo as Id_objetivo,
           m.Status, o.Multiplicador, o.Valor_objetivo, o.Categoria_objetivo
    FROM usuarios_y_objetivos m
    JOIN objetivos o ON o.Id_objetivo = m.Objetivo
    WHERE m.Status = 'En progreso'
  `);

  for (const meta of metas) {
    const { Id_relacion_usuario_objetivo, Id_usuario, Valor_objetivo, Categoria_objetivo, Multiplicador } = meta;

    // 2) Calcular gasto del periodo
    let totalGasto = 0;
    if (Categoria_objetivo) {
      const rows = await query(
        `SELECT COALESCE(SUM(CASE WHEN Monto_gasto < 0 THEN -Monto_gasto ELSE 0 END), 0) as total
         FROM gastos
         WHERE Id_usuario = ? AND Categoria_gasto = ? AND Fecha_creacion_gasto BETWEEN ? AND ? AND Active = 1`,
        [Id_usuario, Categoria_objetivo, inicioMesAnterior, finMesAnterior]
      );
      totalGasto = rows[0].total || 0;
    } else {
      const rows = await query(
        `SELECT COALESCE(SUM(CASE WHEN Monto_gasto < 0 THEN -Monto_gasto ELSE 0 END), 0) as total
         FROM gastos
         WHERE Id_usuario = ? AND Fecha_creacion_gasto BETWEEN ? AND ? AND Active = 1`,
        [Id_usuario, inicioMesAnterior, finMesAnterior]
      );
      totalGasto = rows[0].total || 0;
    }

    // 3) Determinar cumplimiento (gastar <= objetivo)
    const cumplido = totalGasto <= Valor_objetivo;
    const status = cumplido ? 'Cumplido' : 'Fallido';
    const puntos = cumplido ? Math.floor((Valor_objetivo - totalGasto) * (Multiplicador || 1)) : 0;

    // 4) Actualizar meta y puntos de usuario en transacción simple
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
        ? `Felicitaciones, ganaste ${puntos} puntos. Gasto final: $${totalGasto}.`
        : `Tu meta era $${Valor_objetivo}, pero tu gasto final fue $${totalGasto}.`;

      await query(
        `INSERT INTO notificaciones (Id_usuario, Titulo, Mensaje) VALUES (?, ?, ?)`,
        [Id_usuario, titulo, mensaje]
      );

      // Emit Socket.IO notification to user
      if (io) {
        const userIdentifier = await query(
          `SELECT Identifier_usuario FROM usuarios WHERE Id_usuario = ?`,
          [Id_usuario]
        );
        
        if (userIdentifier.length > 0) {
          const eventName = cumplido ? 'objective_completed' : 'objective_failed';
          const eventData = {
            userId: userIdentifier[0].Identifier_usuario,
            objectiveId: meta.Objetivo,
            title: meta.Titulo_objetivo,
            status: status,
            points: puntos,
            finalValue: totalGasto,
            targetValue: Valor_objetivo,
            message: mensaje,
            timestamp: new Date().toISOString(),
          };
          
          io.to(`user_${userIdentifier[0].Identifier_usuario}`).emit(eventName, eventData);
          console.log(`📡 Socket.IO event sent: ${eventName} to user ${userIdentifier[0].Identifier_usuario}`);
        }
      }

      await query('COMMIT');
    } catch (e) {
      await query('ROLLBACK');
      throw e;
    }
  }

  return { procesadas: metas.length, periodo: { inicio: inicioMesAnterior, fin: finMesAnterior } };
}

function configurarSchedulerMetas() {
  cron.schedule(CRON_EXPRESSION, async () => {
    try {
      const r = await cerrarMetasMesAnterior();
      console.log('Cierre de metas ejecutado:', r);
    } catch (e) {
      console.error('Error en cierre de metas:', e);
    }
  }, { scheduled: true, timezone: 'America/Argentina/Buenos_Aires' });
  console.log('Scheduler de metas configurado');
}

// Function to set Socket.IO instance
function setSocketIO(socketIOInstance) {
  io = socketIOInstance;
}

module.exports = { configurarSchedulerMetas, cerrarMetasMesAnterior, setSocketIO };


