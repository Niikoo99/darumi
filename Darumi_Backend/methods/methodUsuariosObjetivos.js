/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

const fileName = 'methodUsuariosObjetivos.js';

const express = require('express');
const app = express();
const port = 3000;
const connection = require('../db');

const asignaciones = express.Router();

app.use(express.json());

// GET todos los registros de tabla usuarios_y_objetivos 
asignaciones.get('/asignaciones', (req, res) => {
    connection.query('SELECT * FROM usuarios_y_objetivos', (error, results) => {
        if (error) {
            console.error('Error al ejecutar la consulta MySQL', error);
            res.status(500).json({error: 'Error de servidor'});
        } else {
            res.json(results);
        }
    });
});

// GET un usuarios_y_objetivos por ID
asignaciones.get('/asignaciones/:id', (req, res) => {
  const userId = req.params.id; // Obten el ID desde los parámetros de la URL

  connection.query('SELECT * FROM usuarios_y_objetivos WHERE Id_relacion_usuario_objetivo = ?', [userId], (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta MySQL', error);
      res.status(500).json({ error: 'Error de servidor' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'Asignacion no encontrada' });
    } else {
      res.json(results[0]); 
    }
  });
});

// POST nuevo usuarios_y_objetivos
asignaciones.post('/asignaciones', (req, res) => {
  // Obtén los datos del nuevo usuario desde el cuerpo de la solicitud
  //const { id, apellido, nombre, email } = req.body;

  const id = req.body["Id_relacion_usuario_objetivo"];
  const usuario = req.body["Usuario"];
  const objetivo = req.body["Objetivo"];

  // Realiza la inserción en la base de datos
  connection.query('INSERT INTO usuarios_y_objetivos (Id_relacion_usuario_objetivo, Usuario, Objetivo) VALUES (?, ?, ?)', [id, usuario, objetivo], (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta MySQL', error);
      res.status(500).json({ error: 'Error de servidor' });
    } else {
      // Devuelve el ID de la categoria recién creado
      res.json({ id, usuario, objetivo});
    }
  });
});

module.exports = asignaciones;
console.log(`Modulo ${fileName} cargado con exito`);




