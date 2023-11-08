/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

const fileName = 'methodObjetivos.js';

const express = require('express');
const app = express();
const port = 3000;
const connection = require('../db');

const objetivos = express.Router();

app.use(express.json());

// GET todos los registros de tabla objetivos
objetivos.get('/objetivos', (req, res) => {
    connection.query('SELECT * FROM objetivos', (error, results) => {
        if (error) {
            console.error('Error al ejecutar la consulta MySQL', error);
            res.status(500).json({error: 'Error de servidor'});
        } else {
            res.json(results);
        }
    });
});

// GET un objetivo por ID
objetivos.get('/objetivos/:id', (req, res) => {
  const userId = req.params.id; // Obten el ID desde los parámetros de la URL

  connection.query('SELECT * FROM objetivos WHERE Id_objetivo = ?', [userId], (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta MySQL', error);
      res.status(500).json({ error: 'Error de servidor' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'Objetivo no encontrado' });
    } else {
      res.json(results[0]); 
    }
  });
});

// POST nuevo objetivo
objetivos.post('/objetivos', (req, res) => {
  // Obtén los datos del nuevo usuario desde el cuerpo de la solicitud
  //const { id, apellido, nombre, email } = req.body;
  const id = req.query["Id_objetivo"];
  const titulo = req.query["Titulo_objetivo"];
  const fecha = req.query["Fecha_creacion_objetivo"];
  const tipo = req.query["Tipo_objetivo"];
  const estado = req.query["Estado_objetivo"];

  // Realiza la inserción en la base de datos
  connection.query('INSERT INTO objetivos (Id_objetivo, Titulo_objetivo, Fecha_creacion_objetivo, Tipo_objetivo, Estado_objetivo) VALUES (?, ?, ?, ?, ?)', [id, titulo, fecha, tipo, estado], (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta MySQL', error);
      res.status(500).json({ error: 'Error de servidor' });
    } else {
      // Devuelve el ID del usuario recién creado
      //res.json({ id: results.insertId, apellido, nombre, email });
      res.json({ id, titulo, fecha, tipo, estado });
    }
  });
});

module.exports = objetivos;
console.log(`Modulo ${fileName} cargado con exito`);


