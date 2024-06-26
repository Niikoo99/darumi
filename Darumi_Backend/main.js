/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/javascript.js to edit this template
 */

// Usar method.js como middleware en main.js:

const express = require('express');
const cors = require('cors');
const app = express();

const corsOptions = {
  origin: 'http://localhost:3000', // Add your frontend url here
  allowedHeaders: 'Origin, X-Api-Key, X-Requested-With, Content-Type, Accept, Authorization',
  methods: 'POST, PUT, PATCH, GET, DELETE, OPTIONS', // Add the allowed methods here
    
};

app.use(cors(corsOptions));

const port = 3000;
const connection = require('./db');

const usuarios = require('./methods/methodUsuarios');
const categorias = require('./methods/methodCategorias');
const estados = require('./methods/methodEstados');
const gastos = require('./methods/methodGastos');
const pagosHabituales = require('./methods/methodPagosHabituales');
const objetivos = require('./methods/methodObjetivos');
const tipos = require('./methods/methodTiposObjetivos');
const metas = require('./methods/methodUsuariosObjetivos');

app.use(express.json());

app.use('/', usuarios);
app.use('/', categorias);
app.use('/', estados);
app.use('/', gastos);
app.use('/', objetivos);
app.use('/', tipos);
app.use('/', metas);
app.use('/', pagosHabituales);

// Redirect to /hola
app.get('/', (req, res) => {
  console.log('GET /');
  res.redirect('/hola');
});

app.get('/hola', (req, res) => {
  console.log('GET /hola');
  res.send('¡Hola, mundo!');
});

app.get('/chau', (req, res) => {
  console.log('GET /chau');
  res.send('¡Adios, mundo cruel!');
});

app.listen(port, () => {
  console.log(`El servidor está escuchando en el puerto ${port}`);
});

