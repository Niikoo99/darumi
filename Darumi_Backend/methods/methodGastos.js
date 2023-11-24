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

// GET todos los registros de tabla gastos
gastos.get('/gastos', (req, res) => {
    connection.query('SELECT * FROM gastos', (error, results) => {
        if (error) {
            console.error('Error al ejecutar la consulta MySQL', error);
            res.status(500).json({error: 'Error de servidor'});
        } else {
            res.json(results);
        }
    });
});

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
gastos.get('/gastos/:idUser', (req, res) => {
  const userId = req.params.idUser; // Obten el ID desde los parámetros de la URL

  connection.query('SELECT G.* FROM gastos G JOIN usuarios U ON U.Id_usuario = G.Id_usuario WHERE G.Identifier_usuario = ?', [idUser], (error, results) => {
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

// POST nuevo gasto
gastos.post('/gastos', (req, res) => {
  // Obtén los datos del nuevo usuario desde el cuerpo de la solicitud
  //const { id, apellido, nombre, email } = req.body;
  const id = req.query["Id_gasto"];
  const monto = req.query["Monto_gasto"];
  const titulo = req.query["Titulo_gasto"];
  const detalle = req.query["Detalle_gasto"];
  //const fecha = req.query["Fecha_creacion_gasto"]; // Hay que hacer que sea la fecha en que se carga el gasto; new Date() lo hace
  const fecha = new Date();
  const categoria = req.query["Categoria_gasto"];
  const usuario = req.query["Id_usuario"];

  // Realiza la inserción en la base de datos
  connection.query('INSERT INTO gastos (Id_gasto, Monto_gasto, Titulo_gasto, Detalle_gasto, Fecha_creacion_gasto, Categoria_gasto, Id_usuario) VALUES (?, ?, ?, ?, ?, ?, ?)', [id, monto, titulo, detalle, fecha, categoria, usuario], (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta MySQL', error);
      res.status(500).json({ error: 'Error de servidor' });
    } else {
      // Devuelve el ID del usuario recién creado
      //res.json({ id: results.insertId, apellido, nombre, email });
      res.json({ id, monto, titulo, detalle, fecha, categoria, usuario });
    }
  });
});

module.exports = gastos;
console.log(`Modulo ${fileName} cargado con exito`);


