/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

const fileName = 'methodGastos.js';

const express = require('express');
const app = express();
const port = 3000;
const connection = require('../db');

const gastos = express.Router();

app.use(express.json());

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

  const query = `SELECT G.Monto_gasto, G.Titulo_gasto, G.Detalle_gasto, G.Fecha_creacion_gasto, C.Nombre_categoria FROM gastos G JOIN usuarios U ON U.Id_usuario = G.Id_usuario INNER JOIN categorias C ON C.Id_categoria = G.Id_categoria WHERE U.Identifier_usuario = '${userId}' ORDER BY G.Fecha_creacion_gasto DESC`;
  console.log(`Executing query: ${query}`);

  connection.query(query, [userId], (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta MySQL', error);
      res.status(500).json({ error: 'Error de servidor' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'Gasto no encontrado' });
    } else {
      res.json(results); 
    }
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
      connection.query('INSERT INTO gastos (Monto_gasto, Titulo_gasto, Detalle_gasto, Id_categoria, Id_usuario) VALUES (?, ?, ?, ?, @idUser)', [Monto_gasto, Titulo_gasto, Detalle_gasto, Id_categoria], (error, results, fields) => {
        if (error) {
          console.error('Error al ejecutar la consulta MySQL', error);
          res.status(500).json({ error: 'Error de servidor' });
        } else {
          // Devuelve el ID del gasto recién creado
          res.json({ id: results.insertId });
          // res.json({ id, monto, titulo, detalle, fecha, categoria, usuario });
        }
      });
    });
  });
  
module.exports = gastos;
console.log(`Modulo ${fileName} cargado con exito`);


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
      connection.query('UPDATE gastos SET Monto_gasto = ?, Titulo_gasto = ?, Detalle_gasto = ?, Id_categoria = @idCategoria, Id_usuario = @idUser WHERE Id_gasto = ?', [Monto_gasto, Titulo_gasto, Detalle_gasto, gastoId], (error, results, fields) => {
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

module.exports = gastos;
console.log(`Módulo ${fileName} cargado con éxito`);

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

module.exports = gastos;
console.log(`Módulo ${fileName} cargado con éxito`);
