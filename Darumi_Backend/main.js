/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/javascript.js to edit this template
 */

// Usar method.js como middleware en main.js:

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: '*', // Permitir cualquier origen durante desarrollo
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
const { router: automatizacionPagos } = require('./methods/methodAutomatizacionPagos');
const { mountGraphql } = require('./graphql');
const { configurarSchedulerMetas, setSocketIO } = require('./schedulerMetas');
const transactionsRoutes = require('./routes/transactionsRoutes');
const reportsRoutes = require('./routes/reportsRoutes');

app.use(express.json());

app.use('/', usuarios);
app.use('/', categorias);
app.use('/', estados);
app.use('/', gastos);
app.use('/', objetivos);
app.use('/', tipos);
app.use('/', metas);
app.use('/', pagosHabituales);
app.use('/', automatizacionPagos);
app.use('/', transactionsRoutes);
app.use('/', reportsRoutes);
mountGraphql(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  // Handle user room joining
  socket.on('join_user_room', (userId) => {
    const roomName = `user_${userId}`;
    socket.join(roomName);
    console.log(`👤 User ${userId} joined room: ${roomName}`);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Set Socket.IO instance for scheduler
setSocketIO(io);

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

server.listen(port, '0.0.0.0', () => {
  console.log(`El servidor está escuchando en el puerto ${port} en todas las interfaces`);
  
  // Inicializar el sistema de automatización de pagos habituales
  const { configurarSchedulerMensual, ejecutarProcesamientoAlInicio, crearTablaLogsSiNoExiste } = require('./schedulerPagosHabituales');
  
  // Crear tabla de logs si no existe
  crearTablaLogsSiNoExiste();
  
  // Configurar el scheduler mensual
  configurarSchedulerMensual();
  configurarSchedulerMetas();
  
  // Ejecutar procesamiento al inicio (opcional)
  setTimeout(() => {
    ejecutarProcesamientoAlInicio();
  }, 5000); // Esperar 5 segundos después del inicio del servidor
});

