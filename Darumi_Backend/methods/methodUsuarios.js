/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

const fileName = 'methodUsuarios.js';

const express = require('express');
const app = express();
const port = 3000;
const connection = require('../db');

const usuarios = express.Router();

app.use(express.json());

// GET todos los registros de tabla usuarios
usuarios.get('/usuarios', (req, res) => {
    connection.query('SELECT * FROM usuarios', (error, results) => {
        if (error) {
            console.error('Error al ejecutar la consulta MySQL', error);
            res.status(500).json({error: 'Error de servidor'});
        } else {
            res.json(results);
        }
    });
});

// GET un usuario por ID
usuarios.get('/usuarios/:id', (req, res) => {
  const userId = req.params.id; // Obten el ID desde los parámetros de la URL

  connection.query('SELECT * FROM usuarios WHERE Id_usuario = ?', [userId], (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta MySQL', error);
      res.status(500).json({ error: 'Error de servidor' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'Usuario no encontrado' });
    } else {
      res.json(results[0]); 
    }
  });
});

// POST nuevo usuario
usuarios.post('/usuarios', (req, res) => {
  // Obtén los datos del nuevo usuario desde el cuerpo de la solicitud
  //const { id, apellido, nombre, email } = req.body;
  const id = req.query["Id_usuario"];
  const apellido = req.query["Apellido_usuario"];
  const nombre = req.query["Nombre_usuario"];
  const email = req.query["Email_usuario"];

  // Realiza la inserción en la base de datos
  connection.query('INSERT INTO usuarios (Id_usuario, Apellido_usuario, Nombre_usuario, Email_usuario) VALUES (?, ?, ?, ?)', [id, apellido, nombre, email], (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta MySQL', error);
      res.status(500).json({ error: 'Error de servidor' });
    } else {
      // Devuelve el ID del usuario recién creado
      //res.json({ id: results.insertId, apellido, nombre, email });
      res.json({ id, apellido, nombre, email });
    }
  });
});

module.exports = usuarios;
console.log(`Modulo ${fileName} cargado con exito`);

