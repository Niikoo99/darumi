/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

const fileName = 'methodPagosHabituales.js';

const express = require('express');
const app = express();
const port = 3000;
const connection = require('../db');

const gastos = express.Router();

app.use(express.json());

// GET todos los pagos habituales de un usuario por ID
gastos.get('/pagos-habituales', (req, res) => {
  const userId = req.query.Id_Usuario; // Get the ID from the query parameters

  console.log(`API call: GET /pagos-habituales, User ID: ${userId}`);

  const query = `SELECT PH.Id_PagoHabitual, PH.Titulo, PH.Monto, PH.Active, PH.InsDateTime, PH.UpdDateTime 
                 FROM pagos_habituales PH 
                 JOIN usuarios U ON U.Id_usuario = PH.Id_Usuario 
                 WHERE U.Identifier_usuario = ? AND PH.Active = 1 
                 ORDER BY PH.InsDateTime DESC`;
  console.log(`Executing query: ${query}`);

  connection.query(query, [userId], (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta MySQL', error);
      res.status(500).json({ error: 'Error de servidor' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'Pagos habituales no encontrados' });
    } else {
      res.json(results); 
    }
  });
});

// POST nuevo pago habitual
gastos.post('/pagos-habituales', (req, res) => {
    // Obtén los datos del nuevo pago habitual desde el cuerpo de la solicitud
    const { Id_Usuario, Titulo, Monto, Active, InsDateTime, UpdDateTime } = req.body;
  
    // Log the call and its parameters
    console.log(`New pago habitual request:
    Usuario: ${Id_Usuario}
    Titulo: ${Titulo}
    Monto: ${Monto}
    Active: ${Active}
    InsDateTime: ${InsDateTime}
    UpdDateTime: ${UpdDateTime}`);
  
    // Realiza la inserción en la base de datos
    connection.query('INSERT INTO pagos_habituales (Id_Usuario, Titulo, Monto, Active, InsDateTime, UpdDateTime) VALUES (?, ?, ?, ?, ?, ?)', [Id_Usuario, Titulo, Monto, Active, InsDateTime, UpdDateTime], (error, results, fields) => {
      if (error) {
        console.error('Error al ejecutar la consulta MySQL', error);
        res.status(500).json({ error: 'Error de servidor' });
      } else {
        // Devuelve el ID del pago habitual recién creado
        res.json({ id: results.insertId });
      }
    });
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

  // PUT para active pago habitual
gastos.put('/pagos-habituales/:id/active', (req, res) => {
    // Obtén el ID del pago habitual desde la URL
    const pagoHabitualId = req.params.id;
  
    // Log the call
    console.log(`Active pago habitual request for pago habitual ID ${pagoHabitualId}`);
  
    // Realiza la actualización en la base de datos
    connection.query('UPDATE pagos_habituales SET Active = 0 WHERE Id_PagoHabitual = ?', [pagoHabitualId], (error, results, fields) => {
      if (error) {
        console.error('Error al ejecutar la consulta MySQL', error);
        res.status(500).json({ error: 'Error de servidor' });
      } else {
        // Devuelve el ID del pago habitual desactivado
        res.json({ id: pagoHabitualId, active: 0 });
      }
    });
  });
  
  module.exports = gastos;
  console.log(`Módulo ${fileName} cargado con éxito`);