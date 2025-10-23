/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

const fileName = 'methodGastos.js';

const express = require('express');
const app = express();
const port = 3000;
const connection = require('../db');
const { generarObjetivosPorDefecto, necesitaObjetivosPorDefecto, obtenerDineroDisponible } = require('../services/defaultObjectivesGenerator');
const { verificarObjetivosInmediatamente } = require('../services/immediateObjectiveChecker');

const gastos = express.Router();

app.use(express.json());

// Socket.IO instance (will be set by main.js)
let io = null;

// Function to set Socket.IO instance
function setSocketIO(socketIOInstance) {
  io = socketIOInstance;
}

// // GET todos los registros de tabla gastos
// gastos.get('/gastos', (req, res) => {
//     connection.query('SELECT * FROM gastos', (error, results) => {
//         if (error) {
//             console.error('Error al ejecutar la consulta MySQL', error);
//             res.status(500).json({error: 'Error de servidor'});
//         } else {
//             res.json(results);
//         }
//     });
// });

// GET un gasto por ID
gastos.get('/gastos/:id', (req, res) => {
  const userId = req.params.id; // Obten el ID desde los parámetros de la URL

  connection.query('SELECT * FROM gastos WHERE Id_gasto = ?', [userId], (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta MySQL', error);
      res.status(500).json({ error: 'Error de servidor' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'Gasto no encontrado' });
    } else {
      res.json(results[0]); 
    }
  });
});

// GET todos los gastos de un usuario por ID
gastos.get('/gastos', (req, res) => {
  const userId = req.query.Id_Usuario; // Get the ID from the query parameters

  console.log(`API call: GET /gastos, User ID: ${userId}`);

  if (!userId) {
    console.error('Error: User ID is required');
    return res.status(400).json({ error: 'User ID is required' });
  }

  // Primero verificar si el usuario existe
  connection.query('SELECT Id_usuario FROM usuarios WHERE Identifier_usuario = ?', [userId], (error, userResults) => {
    if (error) {
      console.error('Error verificando usuario:', error);
      return res.status(500).json({ error: 'Error de servidor' });
    }
    
    if (userResults.length === 0) {
      console.log(`Usuario ${userId} no encontrado en la base de datos`);
      return res.status(404).json({ error: 'Usuario no encontrado. Por favor, inicia sesión nuevamente.' });
    }
    
    console.log(`Usuario encontrado con ID interno: ${userResults[0].Id_usuario}`);
    
    // Ahora obtener los gastos
    const query = `SELECT G.Monto_gasto, G.Titulo_gasto, G.Detalle_gasto, G.Fecha_creacion_gasto, C.Nombre_categoria FROM gastos G JOIN usuarios U ON U.Id_usuario = G.Id_usuario INNER JOIN categorias C ON C.Id_categoria = G.Categoria_gasto WHERE U.Identifier_usuario = ? ORDER BY G.Fecha_creacion_gasto DESC`;
    console.log(`Executing query with user ID: ${userId}`);

    connection.query(query, [userId], (error, results) => {
      if (error) {
        console.error('Error al ejecutar la consulta MySQL', error);
        res.status(500).json({ error: 'Error de servidor' });
      } else {
        console.log(`Query successful, found ${results.length} gastos`);
        res.json(results); 
      }
    });
  });
});

// POST nuevo gasto
gastos.post('/gastos', (req, res) => {
  // Obtén los datos del nuevo usuario desde el cuerpo de la solicitud
  const { Id_categoria, Detalle_gasto, Id_usuario, Monto_gasto, Titulo_gasto } = req.body;
  
  // Log the call and its parameters
  console.log(`New gasto request:
  Monto: ${Monto_gasto}
  Titulo: ${Titulo_gasto}
  Detalle: ${Detalle_gasto}
  Categoria: ${Id_categoria}
  Usuario: ${Id_usuario}`);

  // Realiza la inserción en la base de datos
  connection.query('SET @idUser = (SELECT Id_usuario FROM usuarios WHERE Identifier_Usuario = ?)', [Id_usuario], (error, results, fields) => {
    if (error) throw error;
      connection.query('INSERT INTO gastos (Monto_gasto, Titulo_gasto, Detalle_gasto, Categoria_gasto, Id_usuario) VALUES (?, ?, ?, ?, @idUser)', [Monto_gasto, Titulo_gasto, Detalle_gasto, Id_categoria], async (error, results, fields) => {
        if (error) {
          console.error('Error al ejecutar la consulta MySQL', error);
          res.status(500).json({ error: 'Error de servidor' });
        } else {
          // Verificar si es un ingreso y si el usuario necesita objetivos por defecto
          if (Monto_gasto > 0) {
            try {
              console.log(`💰 Ingreso registrado: $${Monto_gasto} para usuario ${Id_usuario}`);
              
              // Verificar si el usuario necesita objetivos por defecto
              const necesitaObjetivos = await necesitaObjetivosPorDefecto(Id_usuario);
              
              if (necesitaObjetivos) {
                console.log(`🎯 Usuario ${Id_usuario} necesita objetivos por defecto`);
                
                // Obtener dinero disponible actualizado
                const dineroDisponible = await obtenerDineroDisponible(Id_usuario);
                
                if (dineroDisponible > 0) {
                  // Generar objetivos por defecto
                  const resultado = await generarObjetivosPorDefecto(Id_usuario, dineroDisponible);
                  
                  if (resultado.success) {
                    console.log(`✅ Objetivos por defecto generados para usuario ${Id_usuario}:`, resultado.objetivos.length);
                  } else {
                    console.log(`ℹ️ ${resultado.message} para usuario ${Id_usuario}`);
                  }
                } else {
                  console.log(`⚠️ Dinero disponible es 0 para usuario ${Id_usuario}, no se generan objetivos`);
                }
              } else {
                console.log(`ℹ️ Usuario ${Id_usuario} ya tiene objetivos asignados`);
              }
            } catch (error) {
              console.error('❌ Error en generación de objetivos por defecto:', error);
              // No fallar la transacción principal por este error
            }
          }

          // Verificación inmediata de objetivos de límite de gasto
          // Solo para gastos negativos (gastos reales, no ingresos)
          if (Monto_gasto < 0) {
            try {
              console.log(`🔍 Ejecutando verificación inmediata de objetivos para gasto de $${Math.abs(Monto_gasto)}`);
              
              const resultadoVerificacion = await verificarObjetivosInmediatamente(
                Id_usuario, 
                Math.abs(Monto_gasto), // Convertir a valor absoluto
                Id_categoria, 
                io
              );
              
              if (resultadoVerificacion.success && resultadoVerificacion.objetivosFallidos > 0) {
                console.log(`⚠️ ${resultadoVerificacion.objetivosFallidos} objetivos marcados como fallidos inmediatamente`);
              }
            } catch (error) {
              console.error('❌ Error en verificación inmediata de objetivos:', error);
              // No fallar la transacción principal por este error
            }
          }

          // NOTA: La verificación de objetivos completados se maneja exclusivamente 
          // por el cron job mensual (schedulerMetas.js) para optimizar rendimiento
          
          // Devuelve el ID del gasto recién creado
          res.json({ id: results.insertId });
        }
      });
    });
  });
  
// PUT actualizar gasto
gastos.put('/gastos/:id', (req, res) => {
  // Obtén los datos actualizados del gasto desde el cuerpo de la solicitud
  // TODO: Ahora actuliza todo pero deberiamos ver que quitar
  const { Categoria_gasto, Detalle_gasto, Id_usuario, Monto_gasto, Titulo_gasto } = req.body;
  const gastoId = req.params.id;

  // Log the call and its parameters
  console.log(`Update gasto request:
  Gasto ID: ${gastoId}
  Monto: ${Monto_gasto}
  Titulo: ${Titulo_gasto}
  Detalle: ${Detalle_gasto}
  Categoria: ${Categoria_gasto}
  Usuario: ${Id_usuario}`);

  // Realiza la actualización en la base de datos
  connection.query('SET @idUser = (SELECT Id_usuario FROM usuarios WHERE Identifier_Usuario = ?)', [Id_usuario], (error, results, fields) => {
      if (error) throw error;
      connection.query('UPDATE gastos SET Monto_gasto = ?, Titulo_gasto = ?, Detalle_gasto = ?, Categoria_gasto = @idCategoria, Id_usuario = @idUser WHERE Id_gasto = ?', [Monto_gasto, Titulo_gasto, Detalle_gasto, gastoId], (error, results, fields) => {
        if (error) {
          console.error('Error al ejecutar la consulta MySQL', error);
          res.status(500).json({ error: 'Error de servidor' });
        } else {
          // Devuelve el ID del gasto actualizado
          res.json({ id: gastoId });
          // res.json({ id, monto, titulo, detalle, fecha, categoria, usuario });
        }
      });
    });
  });

// PUT actualizar campo 'Active' de un gasto
gastos.put('/gastos/:id/active', (req, res) => {
  // Obtén el ID del gasto desde la URL
  const gastoId = req.params.id;

  // Log the call and its parameters
  console.log(`Update Active field request for gasto ID ${gastoId}`);

  // Realiza la actualización en la base de datos
  connection.query('UPDATE gastos SET Active = 0 WHERE Id_gasto = ?', [gastoId], (error, results, fields) => {
    if (error) {
      console.error('Error al ejecutar la consulta MySQL', error);
      res.status(500).json({ error: 'Error de servidor' });
    } else {
      // Devuelve el ID del gasto actualizado
      res.json({ id: gastoId, active: 0 });
    }
  });
});

module.exports = { gastos, setSocketIO };
console.log(`Módulo ${fileName} cargado con éxito`);
