/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

const fileName = 'methodCategorias.js';

const express = require('express');
const app = express();
const port = 3000;
const connection = require('../db');

const categorias = express.Router();

app.use(express.json());

// GET todos los registros de tabla categorias
categorias.get('/categorias', (req, res) => {
    connection.query('SELECT * FROM categorias', (error, results) => {
        if (error) {
            console.error('Error al ejecutar la consulta MySQL', error);
            res.status(500).json({error: 'Error de servidor'});
        } else {
            res.json(results);
        }
    });
});

// GET una categoria por ID
categorias.get('/categorias/:id', (req, res) => {
  const userId = req.params.id; // Obten el ID desde los parámetros de la URL

  connection.query('SELECT * FROM categorias WHERE Id_categoria = ?', [userId], (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta MySQL', error);
      res.status(500).json({ error: 'Error de servidor' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'Categoria no encontrada' });
    } else {
      res.json(results[0]); 
    }
  });
});

// POST nueva categoria
categorias.post('/categorias', (req, res) => {
  // Obtén los datos del nuevo usuario desde el cuerpo de la solicitud
  //const { id, apellido, nombre, email } = req.body;
  const id = req.query["Id_categoria"];
  const nombre_categoria = req.query["Nombre_categoria"];

  // Realiza la inserción en la base de datos
  connection.query('INSERT INTO categorias (Id_categoria, Nombre_categoria) VALUES (?, ?)', [id, nombre_categoria], (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta MySQL', error);
      res.status(500).json({ error: 'Error de servidor' });
    } else {
      // Devuelve el ID de la categoria recién creado
      res.json({ id, nombre_categoria});
    }
  });
});

module.exports = categorias;
console.log(`Modulo ${fileName} cargado con exito`);


