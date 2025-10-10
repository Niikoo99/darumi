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
  console.log('GET /usuarios/:id with params', req.params);

  connection.query('SELECT * FROM usuarios WHERE Id_usuario = ?;', [userId], (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta MySQL', error);
      res.status(500).json({ error: 'Error de servidor' });
    } else if (results.length === 0) {
      // Insert new user if it doesn't exist
      const newUser = {
        Apellido_usuario: req.params.apellido, // Replace with the desired value
        Nombre_usuario: req.params.nombre, // Replace with the desired value
        Identifier_usuario: userId // Replace with the desired value
      };
      connection.query('INSERT INTO usuarios SET ?;', newUser, (error, result) => {
        if (error) {
          console.error('Error al insertar el nuevo usuario', error);
          res.status(500).json({ error: 'Error de servidor' });
        } else {
          res.json(newUser);
        }
      });
    } else {
      res.json(results[0]); 
    }
  });
});

// POST nuevo usuario
usuarios.post('/usuarios', (req, res) => {
  console.log('POST /usuarios with query params', req.query);
  // Obtén los datos del nuevo usuario desde los query parameters
  const apellido = req.query["Apellido_usuario"];
  const nombre = req.query["Nombre_usuario"];
  const identifier = req.query["Identifier_usuario"];

  console.log(`Creating user: ${nombre} ${apellido} (${identifier})`);

  if (!identifier) {
    console.error('Error: Identifier_usuario is required');
    return res.status(400).json({ error: 'Identifier_usuario is required' });
  }

  // Chequea que el usuario no exista en la base de datos
  connection.query('SELECT * FROM usuarios WHERE Identifier_usuario = ?', [identifier], (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta MySQL', error);
      res.status(500).json({ error: 'Error de servidor' });
    } else if (results.length === 0) {
      // Usuario no existe, crear nuevo
      console.log('Usuario no encontrado, creando nuevo usuario');
      connection.query('INSERT INTO usuarios (Apellido_usuario, Nombre_usuario, Identifier_usuario) VALUES (?, ?, ?)', [apellido || '', nombre || '', identifier], (error, results) => {
        if (error) {
          console.error('Error al ejecutar la consulta MySQL', error);
          res.status(500).json({ error: 'Error de servidor' });
        } else {
          console.log('Usuario creado exitosamente con ID:', results.insertId);
          res.json({ 
            id: results.insertId, 
            apellido: apellido || '', 
            nombre: nombre || '', 
            identifier: identifier 
          });
        }
      });
    } else {
      // Usuario ya existe
      console.log('Usuario ya existe:', results[0]);
      res.json({ 
        id: results[0].Id_usuario, 
        apellido: results[0].Apellido_usuario, 
        nombre: results[0].Nombre_usuario, 
        identifier: results[0].Identifier_usuario 
      });
    }
  });
});

module.exports = usuarios;
console.log(`Modulo ${fileName} cargado con exito`);

