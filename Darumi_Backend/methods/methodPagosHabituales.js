/* 
 * Módulo para gestión de pagos habituales
 * Incluye CRUD completo, validaciones y endpoints de resumen
 */

const fileName = 'methodPagosHabituales.js';

const express = require('express');
const app = express();
const port = 3000;
const connection = require('../db');

const gastos = express.Router();

app.use(express.json());

// GET todos los pagos habituales de un usuario por ID
gastos.get('/pagos-habituales', async (req, res) => {
  try {
    const userId = req.query.Id_Usuario; // Get the ID from the query parameters
    const includeInactive = req.query.includeInactive === 'true';

    console.log(`API call: GET /pagos-habituales, User ID: ${userId}, Include inactive: ${includeInactive}`);

    if (!userId) {
      return res.status(400).json({ 
        error: 'Id_Usuario es requerido',
        message: 'Debe proporcionar el ID del usuario'
      });
    }

    // Verificar que el usuario existe
    const [userCheck] = await connection.promise().execute(
      'SELECT Id_usuario FROM usuarios WHERE Identifier_usuario = ?',
      [userId]
    );

    if (userCheck.length === 0) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado',
        message: 'El usuario especificado no existe'
      });
    }

    const userDbId = userCheck[0].Id_usuario;

    let query = `SELECT PH.Id_PagoHabitual, PH.Titulo, PH.Monto, PH.Active, PH.InsDateTime, PH.UpdDateTime, 
                        PH.Tipo, PH.Recurrencia
                 FROM pagos_habituales PH 
                 WHERE PH.Id_Usuario = ?`;
    
    if (!includeInactive) {
      query += ` AND PH.Active = 1`;
    }
    
    query += ` ORDER BY PH.InsDateTime DESC`;
    
    console.log(`Executing query: ${query}`);

    const [results] = await connection.promise().execute(query, [userDbId]);
    
    if (results.length === 0) {
      return res.status(404).json({ 
        error: 'Pagos habituales no encontrados',
        message: 'No se encontraron pagos habituales para este usuario'
      });
    }
    
    res.json({
      data: results,
      total: results.length,
      message: 'Pagos habituales obtenidos exitosamente'
    });
    
  } catch (error) {
    console.error('Error al ejecutar la consulta MySQL', error);
    res.status(500).json({ 
      error: 'Error de servidor',
      message: error.message 
    });
  }
});

// POST nuevo pago habitual
gastos.post('/pagos-habituales', async (req, res) => {
  try {
    // Obtén los datos del nuevo pago habitual desde el cuerpo de la solicitud
    const { Id_Usuario, Titulo, Monto, Active, InsDateTime, UpdDateTime, Tipo, Recurrencia } = req.body;
  
    // Log the call and its parameters
    console.log(`New pago habitual request:
    Usuario: ${Id_Usuario}
    Titulo: ${Titulo}
    Monto: ${Monto}
    Tipo: ${Tipo}
    Recurrencia: ${Recurrencia}
    Active: ${Active}`);
  
    if (!Id_Usuario || !Titulo || !Monto) {
      return res.status(400).json({ 
        error: 'Datos incompletos',
        message: 'Id_Usuario, Titulo y Monto son requeridos'
      });
    }

    // Verificar que el usuario existe y obtener su ID de base de datos
    const [userCheck] = await connection.promise().execute(
      'SELECT Id_usuario FROM usuarios WHERE Identifier_usuario = ?',
      [Id_Usuario]
    );

    if (userCheck.length === 0) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado',
        message: 'El usuario especificado no existe'
      });
    }

    const userDbId = userCheck[0].Id_usuario;
  
    // Validar límite de 10 pagos por usuario
    const [count] = await connection.promise().execute(
      'SELECT COUNT(*) as total FROM pagos_habituales WHERE Id_Usuario = ?', 
      [userDbId]
    );
    
    if (count[0].total >= 10) {
      return res.status(400).json({ 
        error: 'Límite de 10 pagos habituales alcanzado',
        message: 'Solo puedes tener máximo 10 pagos habituales activos'
      });
    }

    // Validaciones básicas
    if (!Titulo || !Monto || !Id_Usuario) {
      return res.status(400).json({ 
        error: 'Datos incompletos',
        message: 'Título, monto e ID de usuario son requeridos'
      });
    }

    // Realiza la inserción en la base de datos
    const query = 'INSERT INTO pagos_habituales (Id_Usuario, Titulo, Monto, Active, InsDateTime, UpdDateTime, Tipo, Recurrencia) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const [results] = await connection.promise().execute(query, [
      userDbId, 
      Titulo, 
      Monto, 
      Active || 1, 
      InsDateTime || new Date(), 
      UpdDateTime || new Date(),
      Tipo || 'Pago',
      Recurrencia || 'mensual'
    ]);
    
    // Devuelve el ID del pago habitual recién creado
    res.json({ 
      id: results.insertId,
      message: 'Pago habitual creado exitosamente'
    });
    
  } catch (error) {
    console.error('Error al ejecutar la consulta MySQL', error);
    res.status(500).json({ 
      error: 'Error de servidor',
      message: error.message 
    });
  }
});
  
  // PUT para actualizar monto de un pago habitual
  gastos.put('/pagos-habituales/:id/monto', (req, res) => {
    // Obtén el ID del pago habitual desde la URL
    const pagoHabitualId = req.params.id;
  
    // Obtén el nuevo monto desde el cuerpo de la solicitud
    const { Monto } = req.body;
  
    // Log the call and its parameters
    console.log(`Update monto request for pago habitual ID ${pagoHabitualId}:
    Nuevo Monto: ${Monto}`);
  
    // Realiza la actualización en la base de datos
    connection.query('UPDATE pagos_habituales SET Monto = ? WHERE Id_PagoHabitual = ?', [Monto, pagoHabitualId], (error, results, fields) => {
      if (error) {
        console.error('Error al ejecutar la consulta MySQL', error);
        res.status(500).json({ error: 'Error de servidor' });
      } else {
        // Devuelve el ID del pago habitual actualizado
        res.json({ id: pagoHabitualId });
      }
    });
  });
  
  module.exports = gastos;
  console.log(`Módulo ${fileName} cargado con éxito`);

// PUT para activar/desactivar pago habitual
gastos.put('/pagos-habituales/:id/active', async (req, res) => {
  try {
    const pagoHabitualId = req.params.id;
    const { active } = req.body;
  
    console.log(`Toggle active pago habitual request for ID ${pagoHabitualId}, active: ${active}`);
  
    // Realiza la actualización en la base de datos
    const [results] = await connection.promise().execute(
      'UPDATE pagos_habituales SET Active = ?, UpdDateTime = NOW() WHERE Id_PagoHabitual = ?', 
      [active ? 1 : 0, pagoHabitualId]
    );
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ 
        error: 'Pago habitual no encontrado',
        message: 'El pago habitual especificado no existe'
      });
    }
    
    res.json({ 
      id: pagoHabitualId, 
      active: active ? 1 : 0,
      message: `Pago habitual ${active ? 'activado' : 'desactivado'} exitosamente`
    });
    
  } catch (error) {
    console.error('Error al ejecutar la consulta MySQL', error);
    res.status(500).json({ 
      error: 'Error de servidor',
      message: error.message 
    });
  }
});

// DELETE para eliminar pago habitual
gastos.delete('/pagos-habituales/:id', async (req, res) => {
  try {
    const pagoHabitualId = req.params.id;
    
    console.log(`Delete pago habitual request for ID ${pagoHabitualId}`);
    
    // Realiza la eliminación en la base de datos
    const [results] = await connection.promise().execute(
      'DELETE FROM pagos_habituales WHERE Id_PagoHabitual = ?', 
      [pagoHabitualId]
    );
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ 
        error: 'Pago habitual no encontrado',
        message: 'El pago habitual especificado no existe'
      });
    }
    
    res.json({ 
      id: pagoHabitualId,
      message: 'Pago habitual eliminado exitosamente'
    });
    
  } catch (error) {
    console.error('Error al ejecutar la consulta MySQL', error);
    res.status(500).json({ 
      error: 'Error de servidor',
      message: error.message 
    });
  }
});

// GET resumen de pagos habituales
gastos.get('/pagos-habituales/resumen', async (req, res) => {
  try {
    const userId = req.query.Id_Usuario;
    
    if (!userId) {
      return res.status(400).json({ 
        error: 'Id_Usuario es requerido',
        message: 'Debe proporcionar el ID del usuario'
      });
    }
    
    console.log(`Resumen pagos habituales request for user: ${userId}`);
    
    // Verificar que el usuario existe
    const [userCheck] = await connection.promise().execute(
      'SELECT Id_usuario FROM usuarios WHERE Identifier_usuario = ?',
      [userId]
    );

    if (userCheck.length === 0) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado',
        message: 'El usuario especificado no existe'
      });
    }

    const userDbId = userCheck[0].Id_usuario;
    
    // Obtener resumen de pagos e ingresos
    const [rows] = await connection.promise().execute(`
      SELECT
        COUNT(*) as totalPagos,
        COALESCE(SUM(CASE WHEN Tipo = 'Pago' THEN Monto ELSE 0 END), 0) AS totalPagosMonto,
        COALESCE(SUM(CASE WHEN Tipo = 'Ingreso' THEN Monto ELSE 0 END), 0) AS totalIngresosMonto,
        COALESCE(SUM(CASE WHEN Tipo = 'Ingreso' THEN Monto ELSE 0 END), 0) - 
        COALESCE(SUM(CASE WHEN Tipo = 'Pago' THEN Monto ELSE 0 END), 0) AS balance,
        SUM(CASE WHEN Active = 1 THEN 1 ELSE 0 END) as pagosActivos,
        SUM(CASE WHEN Active = 0 THEN 1 ELSE 0 END) as pagosInactivos
      FROM pagos_habituales 
      WHERE Id_Usuario = ?
    `, [userDbId]);
    
    const resumen = rows[0];
    
    // Obtener distribución por recurrencia
    const [recurrenciaRows] = await connection.promise().execute(`
      SELECT
        Recurrencia,
        COUNT(*) as cantidad,
        SUM(Monto) as montoTotal
      FROM pagos_habituales 
      WHERE Id_Usuario = ? AND Active = 1
      GROUP BY Recurrencia
    `, [userDbId]);
    
    res.json({
      ...resumen,
      distribucionRecurrencia: recurrenciaRows,
      message: 'Resumen obtenido exitosamente'
    });
    
  } catch (error) {
    console.error('Error al obtener resumen:', error);
    res.status(500).json({ 
      error: 'Error de servidor',
      message: error.message 
    });
  }
});

module.exports = gastos;
console.log(`Módulo ${fileName} cargado con éxito`);