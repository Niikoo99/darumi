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

  // 1) Traer metas en progreso con su objetivo y usuario, incluyendo racha_actual
  const metas = await query(`
    SELECT m.Id_relacion_usuario_objetivo, m.Usuario as Id_usuario, m.Objetivo as Id_objetivo,
           m.Status, o.Multiplicador, o.Valor_objetivo, o.Categoria_objetivo, o.Titulo_objetivo,
           u.racha_actual, u.Points_total
    FROM usuarios_y_objetivos m
    JOIN objetivos o ON o.Id_objetivo = m.Objetivo
    JOIN usuarios u ON u.Id_usuario = m.Usuario
    WHERE m.Status = 'En progreso'
  `);

  for (const meta of metas) {
    const { 
      Id_relacion_usuario_objetivo, 
      Id_usuario, 
      Valor_objetivo, 
      Categoria_objetivo, 
      Multiplicador,
      Titulo_objetivo,
      racha_actual,
      Points_total
    } = meta;

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

    // 4) Calcular puntos según el nuevo sistema de rachas
    let puntos_otorgados = 0;
    let nueva_racha = racha_actual;
    let bono_racha = 0;

    if (cumplido) {
      // CASO CUMPLIDO: Sistema de rachas con bonos
      const puntos_base = 100; // Puntos base por objetivo cumplido
      nueva_racha = racha_actual + 1; // Incrementar racha
      bono_racha = (nueva_racha - 1) * 50; // Bono por racha (ej: racha 3 = (3-1)*50 = 100 puntos extra)
      puntos_otorgados = puntos_base + bono_racha;
    } else {
      // CASO FALLIDO: Cero puntos y reinicio de racha
      puntos_otorgados = 0;
      nueva_racha = 0; // Reiniciar racha
    }

    // 5) Actualizar meta, puntos de usuario y racha en transacción
    await query('START TRANSACTION');
    try {
      // Actualizar la meta
      await query(
        `UPDATE usuarios_y_objetivos
           SET Status = ?, Final_value = ?, Fecha_completado = NOW(), Puntos_otorgados = ?
         WHERE Id_relacion_usuario_objetivo = ?`,
        [status, totalGasto, puntos_otorgados, Id_relacion_usuario_objetivo]
      );

      // Actualizar puntos totales del usuario (solo si hay puntos positivos)
      if (puntos_otorgados > 0) {
        await query(
          `UPDATE usuarios SET Points_total = Points_total + ?, racha_actual = ? WHERE Id_usuario = ?`,
          [puntos_otorgados, nueva_racha, Id_usuario]
        );
      } else {
        // Solo actualizar racha (reiniciar a 0)
        await query(
          `UPDATE usuarios SET racha_actual = ? WHERE Id_usuario = ?`,
          [nueva_racha, Id_usuario]
        );
      }

      // Crear notificación con información de racha
      const titulo = cumplido ? '¡Objetivo cumplido!' : 'Objetivo no cumplido';
      let mensaje;
      
      if (cumplido) {
        mensaje = `¡Felicitaciones! Ganaste ${puntos_otorgados} puntos (${100} base + ${bono_racha} bono por racha ${nueva_racha}). Gasto final: $${totalGasto}.`;
      } else {
        mensaje = `Tu meta era $${Valor_objetivo}, pero tu gasto final fue $${totalGasto}. Tu racha se reinició. ¡Sigue intentando!`;
      }

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
            title: Titulo_objetivo,
            status: status,
            points: puntos_otorgados,
            basePoints: cumplido ? 100 : 0,
            streakBonus: bono_racha,
            currentStreak: nueva_racha,
            finalValue: totalGasto,
            targetValue: Valor_objetivo,
            message: mensaje,
            timestamp: new Date().toISOString(),
          };
          
          io.to(`user_${userIdentifier[0].Identifier_usuario}`).emit(eventName, eventData);
          console.log(`📡 Socket.IO event sent: ${eventName} to user ${userIdentifier[0].Identifier_usuario} - Streak: ${nueva_racha}, Points: ${puntos_otorgados}`);
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


