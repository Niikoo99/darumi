/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

const fileName = 'methodEstados.js';

const express = require('express');
const app = express();
const port = 3000;
const connection = require('../db');

const estados = express.Router();

app.use(express.json());

// GET todos los registros de tabla estados
estados.get('/estados', (req, res) => {
    connection.query('SELECT * FROM estados', (error, results) => {
        if (error) {
            console.error('Error al ejecutar la consulta MySQL', error);
            res.status(500).json({error: 'Error de servidor'});
        } else {
            res.json(results);
        }
    });
});

// GET un estado por ID
estados.get('/estados/:id', (req, res) => {
  const userId = req.params.id; // Obten el ID desde los parámetros de la URL

  connection.query('SELECT * FROM estados WHERE Id_estado = ?', [userId], (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta MySQL', error);
      res.status(500).json({ error: 'Error de servidor' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'Estado no encontrado' });
    } else {
      res.json(results[0]); 
    }
  });
});

// POST nuevo estado
estados.post('/estados', (req, res) => {
  // Obtén los datos del nuevo usuario desde el cuerpo de la solicitud
  //const { id, apellido, nombre, email } = req.body;

  const id = req.body["Id_estado"];
  const nombre_estado = req.body["Nombre_estado"];

  // Realiza la inserción en la base de datos
  connection.query('INSERT INTO estados (Id_estado, Nombre_estado) VALUES (?, ?)', [id, nombre_estado], (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta MySQL', error);
      res.status(500).json({ error: 'Error de servidor' });
    } else {
      // Devuelve el ID de la categoria recién creado
      res.json({ id, nombre_estado});
    }
  });
});

module.exports = estados;
console.log(`Modulo ${fileName} cargado con exito`);



