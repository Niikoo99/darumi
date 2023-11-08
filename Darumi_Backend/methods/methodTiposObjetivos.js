/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

const fileName = 'methodTiposObjetivos.js';

const express = require('express');
const app = express();
const port = 3000;
const connection = require('../db');

const tipos = express.Router();

app.use(express.json());

// GET todos los registros de tabla tipos_objetivos
tipos.get('/tipos', (req, res) => {
    connection.query('SELECT * FROM tipos_objetivos', (error, results) => {
        if (error) {
            console.error('Error al ejecutar la consulta MySQL', error);
            res.status(500).json({error: 'Error de servidor'});
        } else {
            res.json(results);
        }
    });
});

// GET un tipo por ID
tipos.get('/tipos/:id', (req, res) => {
  const userId = req.params.id; // Obten el ID desde los parámetros de la URL

  connection.query('SELECT * FROM tipos_objetivos WHERE Id_tipo_objetivo = ?', [userId], (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta MySQL', error);
      res.status(500).json({ error: 'Error de servidor' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'Tipo de objetivo no encontrado' });
    } else {
      res.json(results[0]); 
    }
  });
});

// POST nuevo tipo
tipos.post('/tipos', (req, res) => {
  // Obtén los datos del nuevo usuario desde el cuerpo de la solicitud
  //const { id, apellido, nombre, email } = req.body;
  const id = req.query["Id_tipo_objetivo"];
  const nombre_tipo = req.query["Nombre_tipo_objetivo"];

  // Realiza la inserción en la base de datos
  connection.query('INSERT INTO tipos (Id_tipo_objetivo, Nombre_tipo_objetivo) VALUES (?, ?)', [id, nombre_tipo], (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta MySQL', error);
      res.status(500).json({ error: 'Error de servidor' });
    } else {
      // Devuelve el ID de la categoria recién creado
      res.json({ id, nombre_tipo});
    }
  });
});

module.exports = tipos;
console.log(`Modulo ${fileName} cargado con exito`);




