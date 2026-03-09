const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// -- 1. LIBRERÍAS DE CONEXIÓN PARA PRISMA 7 --
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// Configuración de WebSockets para tiempo real
const io = new Server(server, {
  cors: { origin: "*" } 
});

// -- 2. CONEXIÓN OBLIGATORIA A LA BASE DE DATOS --
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// --- RUTAS DE LA API ---

// 1. RUTA DE PRUEBA
app.get('/', (req, res) => {
  res.send('🔥 Servidor de Entre Fuegos activo y conectado a la Base de Datos 🔥');
});

// 2. RUTA DE LOGIN: Valida el PIN del mesero
app.post('/api/login', async (req, res) => {
  try {
    const { pin } = req.body;
    const usuario = await prisma.user.findUnique({
      where: { pin: String(pin) }
    });

    if (!usuario) {
      return res.status(401).json({ error: 'PIN incorrecto. Intenta de nuevo.' });
    }

    res.json({ mensaje: `¡Bienvenido, ${usuario.name}!`, usuario: usuario });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: 'Error conectando con la base de datos' });
  }
});

// 3. NUEVA RUTA: Trae las 22 mesas actualizadas para el mapa
app.get('/api/tables', async (req, res) => {
  try {
    // Buscamos todas las mesas y las ordenamos por número
    const mesas = await prisma.table.findMany({
      orderBy: { number: 'asc' }
    });
    res.json(mesas);
  } catch (error) {
    console.error("Error al obtener mesas:", error);
    res.status(500).json({ error: 'No se pudieron cargar las mesas' });
  }
});

// -- 4. TIEMPO REAL: Conexión por WebSockets --
io.on('connection', (socket) => {
  console.log('📱 Dispositivo conectado al sistema:', socket.id);

  socket.on('nuevo_pedido_desde_app', (datosDelPedido) => {
    console.log('Llegó un pedido a la cocina:', datosDelPedido);
    io.emit('pedido_recibido_en_pantalla', datosDelPedido);
  });

  socket.on('disconnect', () => {
    console.log('❌ Dispositivo desconectado:', socket.id);
  });
});

// --- ENCENDIDO DEL SERVIDOR ---
const PORT = 3000;
// Usamos '0.0.0.0' para que el servidor sea visible en toda tu red local (IP: 192.168.1.9)
server.listen(PORT, '0.0.0.0', () => {
  console.log(`
  🚀 SERVIDOR INICIADO CON ÉXITO
  -----------------------------------------------
  Local:   http://localhost:${PORT}
  Red Wi-Fi: http://192.168.1.9:${PORT}
  -----------------------------------------------
  Esperando conexiones de mesas y pedidos...
  `);
});