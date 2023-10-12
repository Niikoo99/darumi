/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost', 
  user: 'root', 
//  password: ' ', 
  database: 'darumi'
});

connection.connect((error) => {
  if (error) {
    console.error('Error al conectar a la base de datos MySQL', error);
    throw error;
  }
  console.log('Conexión a la base de datos MySQL establecida');
});

module.exports = connection;

