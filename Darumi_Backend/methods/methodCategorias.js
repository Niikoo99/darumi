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
  const { Nombre_categoria } = req.body;

  if (!Nombre_categoria || Nombre_categoria.trim() === '') {
    return res.status(400).json({ error: 'El nombre de la categoría es requerido' });
  }

  // Realiza la inserción en la base de datos (Id_categoria es AUTO_INCREMENT)
  connection.query('INSERT INTO categorias (Nombre_categoria) VALUES (?)', [Nombre_categoria.trim()], (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta MySQL', error);
      res.status(500).json({ error: 'Error de servidor' });
    } else {
      // Devuelve la categoría recién creada
      const newCategory = {
        Id_categoria: results.insertId,
        Nombre_categoria: Nombre_categoria.trim()
      };
      res.status(201).json(newCategory);
    }
  });
});

// PUT actualizar categoria
categorias.put('/categorias/:id', (req, res) => {
  const categoryId = req.params.id;
  const { Nombre_categoria } = req.body;

  if (!Nombre_categoria || Nombre_categoria.trim() === '') {
    return res.status(400).json({ error: 'El nombre de la categoría es requerido' });
  }

  // Verificar que la categoría existe
  connection.query('SELECT * FROM categorias WHERE Id_categoria = ?', [categoryId], (error, results) => {
    if (error) {
      console.error('Error al verificar la categoría:', error);
      return res.status(500).json({ error: 'Error de servidor' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    // Actualizar la categoría
    connection.query('UPDATE categorias SET Nombre_categoria = ? WHERE Id_categoria = ?', 
      [Nombre_categoria.trim(), categoryId], (updateError, updateResults) => {
      if (updateError) {
        console.error('Error al actualizar la categoría:', updateError);
        return res.status(500).json({ error: 'Error de servidor' });
      }

      // Devolver la categoría actualizada
      const updatedCategory = {
        Id_categoria: parseInt(categoryId),
        Nombre_categoria: Nombre_categoria.trim()
      };
      res.json(updatedCategory);
    });
  });
});

// DELETE eliminar categoria
categorias.delete('/categorias/:id', (req, res) => {
  const categoryId = req.params.id;

  // Verificar que la categoría existe
  connection.query('SELECT * FROM categorias WHERE Id_categoria = ?', [categoryId], (error, results) => {
    if (error) {
      console.error('Error al verificar la categoría:', error);
      return res.status(500).json({ error: 'Error de servidor' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    // Verificar si la categoría está siendo usada en gastos
    connection.query('SELECT COUNT(*) as count FROM gastos WHERE Categoria_gasto = ?', [categoryId], (checkError, checkResults) => {
      if (checkError) {
        console.error('Error al verificar uso de la categoría:', checkError);
        return res.status(500).json({ error: 'Error de servidor' });
      }

      const usageCount = checkResults[0].count;
      if (usageCount > 0) {
        return res.status(400).json({ 
          error: 'No se puede eliminar la categoría porque está siendo utilizada en transacciones',
          usageCount: usageCount
        });
      }

      // Eliminar la categoría
      connection.query('DELETE FROM categorias WHERE Id_categoria = ?', [categoryId], (deleteError, deleteResults) => {
        if (deleteError) {
          console.error('Error al eliminar la categoría:', deleteError);
          return res.status(500).json({ error: 'Error de servidor' });
        }

        res.json({ 
          message: 'Categoría eliminada exitosamente',
          deletedId: parseInt(categoryId)
        });
      });
    });
  });
});

module.exports = categorias;
console.log(`Modulo ${fileName} cargado con exito`);


