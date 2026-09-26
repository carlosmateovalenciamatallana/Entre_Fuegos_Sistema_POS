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

// 2. RUTA DE LOGIN
app.post('/api/login', async (req, res) => {
  try {
    const { pin } = req.body;
    const usuario = await prisma.user.findUnique({
      where: { pin: String(pin) }
    });
    if (!usuario) return res.status(401).json({ error: 'PIN incorrecto' });
    res.json({ mensaje: `¡Bienvenido, ${usuario.name}!`, usuario });
  } catch (error) {
    res.status(500).json({ error: 'Error en login' });
  }
});

// 3. RUTA DE MESAS
app.get('/api/tables', async (req, res) => {
  try {
    const mesas = await prisma.table.findMany({ orderBy: { number: 'asc' } });
    res.json(mesas);
  } catch (error) {
    res.status(500).json({ error: 'Error al cargar mesas' });
  }
});

// 4. RUTA DE PRODUCTOS
app.get('/api/products', async (req, res) => {
  try {
    const productos = await prisma.product.findMany();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: 'Error al cargar menú' });
  }
});

// 5. CREAR ORDEN (Meseros)
app.post('/api/orders', async (req, res) => {
  try {
    const { tableId, userId, items } = req.body;
    const nuevaOrden = await prisma.order.create({
      data: {
        tableId: Number(tableId),
        userId: Number(userId),
        status: "PENDIENTE", 
        items: {
          create: items.map(item => ({
            productId: Number(item.productId),
            quantity: Number(item.quantity),
            notes: item.notes || ""
          }))
        }
      },
      include: { table: true, user: true, items: { include: { product: true } } }
    });

    await prisma.table.update({ where: { id: Number(tableId) }, data: { status: "ocupada" } });

    io.emit('nueva_orden_creada', nuevaOrden);
    io.emit('estado_mesa_actualizado', { id: Number(tableId), status: 'ocupada' });

    res.json({ mensaje: "Comanda enviada", orden: nuevaOrden });
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar comanda' });
  }
});

// --- RUTAS DE ADMINISTRACIÓN Y GESTIÓN ---

// 6. COMANDAS ACTIVAS
app.get('/api/orders/active', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: { in: ['PENDIENTE', 'PREPARANDO'] } },
      include: { table: true, user: true, items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Error al cargar activas' });
  }
});

// 7. ACTUALIZAR ESTADO (Pendiente -> Listo)
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const actualizada = await prisma.order.update({
      where: { id: Number(id) },
      data: { status },
      include: { table: true }
    });
    io.emit('orden_actualizada', actualizada);
    res.json(actualizada);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
});

// 8. OBTENER ORDEN POR MESA (Para edición)
app.get('/api/orders/table/:tableId', async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: { tableId: Number(req.params.tableId), status: 'PENDIENTE' },
      include: { items: { include: { product: true } }, user: true }
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Error al recuperar orden' });
  }
});

// 9. AÑADIR ITEMS A ORDEN EXISTENTE
app.patch('/api/orders/:id/add-items', async (req, res) => {
  try {
    const { id } = req.params;
    const { items } = req.body;
    await prisma.orderItem.createMany({
      data: items.map(item => ({
        orderId: Number(id),
        productId: Number(item.productId),
        quantity: Number(item.quantity),
        notes: item.notes || ""
      }))
    });
    const ordenCompleta = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: { table: true, user: true, items: { include: { product: true } } }
    });
    io.emit('orden_actualizada_items', ordenCompleta);
    res.json(ordenCompleta);
  } catch (error) {
    res.status(500).json({ error: 'Error al añadir productos' });
  }
});

// 10. ELIMINAR ITEM Y LIBERAR MESA SI QUEDA VACÍA
app.delete('/api/order-items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const itemABorrar = await prisma.orderItem.findUnique({ where: { id: Number(id) } });
    if (!itemABorrar) return res.status(404).json({ error: "No encontrado" });

    const orderId = itemABorrar.orderId;

    await prisma.orderItem.delete({ where: { id: Number(id) } });

    const itemsRestantes = await prisma.orderItem.count({
      where: { orderId: orderId }
    });

    if (itemsRestantes === 0) {
      const ordenEliminada = await prisma.order.delete({
        where: { id: orderId }
      });

      await prisma.table.update({ 
        where: { id: ordenEliminada.tableId }, 
        data: { status: 'libre' } 
      });

      // 🔥 ESTO ES LO QUE LE AVISA AL MONITOR:
      io.emit('orden_eliminada_por_vacia', { id: orderId, tableId: ordenEliminada.tableId });
      io.emit('estado_mesa_actualizado', { id: ordenEliminada.tableId, status: 'libre' });

      return res.json({ mensaje: "Mesa liberada", mesaLiberada: true });
    } else {
      const actualizada = await prisma.order.findUnique({
        where: { id: orderId },
        include: { table: true, user: true, items: { include: { product: true } } }
      });
      io.emit('orden_actualizada_items', actualizada);
      return res.json({ mensaje: "Producto eliminado", mesaLiberada: false });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al borrar item' });
  }
});

// 11. ACTUALIZAR NOTA
app.patch('/api/order-items/:id/notes', async (req, res) => {
  try {
    const item = await prisma.orderItem.update({
      where: { id: Number(req.params.id) },
      data: { notes: req.body.notes }
    });
    const actualizada = await prisma.order.findUnique({
      where: { id: item.orderId },
      include: { table: true, user: true, items: { include: { product: true } } }
    });
    io.emit('orden_actualizada_items', actualizada);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Error al editar nota' });
  }
});

// 12. COMPLETAR ORDEN Y LIBERAR MESA
app.patch('/api/orders/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const finalizada = await prisma.order.update({
      where: { id: Number(id) },
      data: { status: 'COMPLETADA' },
      include: { table: true }
    });
    await prisma.table.update({ where: { id: finalizada.tableId }, data: { status: 'libre' } });
    io.emit('estado_mesa_actualizado', { id: finalizada.tableId, status: 'libre' });
    io.emit('orden_finalizada_admin', { id: finalizada.id });
    res.json({ mensaje: "Mesa liberada" });
  } catch (error) {
    res.status(500).json({ error: 'Error al cerrar cuenta' });
  }
});

// --- RUTAS DE HISTORIAL Y ARCHIVO (Business Intelligence) ---

// 13. VENTAS DE HOY (Desde las 00:00)
app.get('/api/orders/history', async (req, res) => {
  try {
    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);
    const history = await prisma.order.findMany({
      where: { status: 'COMPLETADA', createdAt: { gte: inicioDia } },
      include: { table: true, user: true, items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Error en historial de hoy' });
  }
});

// 14. LISTA DE DÍAS CON VENTAS (Para el Archivo)
app.get('/api/orders/archive-dates', async (req, res) => {
  try {
    // Obtenemos fechas únicas de órdenes completadas
    const orders = await prisma.order.findMany({
      where: { status: 'COMPLETADA' },
      select: { createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    // Formateamos para tener solo la fecha (YYYY-MM-DD) y quitar duplicados
    const fechasUnicas = [...new Set(orders.map(o => o.createdAt.toISOString().split('T')[0]))];
    const resultado = fechasUnicas.map(f => ({ date: f }));
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener fechas del archivo' });
  }
});

// 15. VENTAS POR FECHA ESPECÍFICA (Archivo Histórico)
app.get('/api/orders/history-by-date', async (req, res) => {
  const { date } = req.query; // Espera 'YYYY-MM-DD'
  try {
    const inicio = new Date(date + "T00:00:00");
    const fin = new Date(date + "T23:59:59");
    const history = await prisma.order.findMany({
      where: { status: 'COMPLETADA', createdAt: { gte: inicio, lte: fin } },
      include: { table: true, user: true, items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Error al recuperar fecha' });
  }
});



// --- RUTAS DE LISTA DE ESPERA (NUEVO) ---

// 16. Obtener la lista de espera activa
app.get('/api/waitlist', async (req, res) => {
  try {
    const list = await prisma.waitlist.findMany({
      where: { status: 'WAITING' },
      orderBy: { createdAt: 'asc' } // Orden cronológico (el que llegó primero va primero)
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Error al cargar lista de espera' });
  }
});

// 17. Añadir un cliente a la lista de espera
app.post('/api/waitlist', async (req, res) => {
  try {
    const { name, partySize, phone } = req.body;
    const entry = await prisma.waitlist.create({
      data: {
        name,
        partySize: Number(partySize),
        phone: phone || "",
        status: 'WAITING'
      }
    });
    // Avisamos a todos los dispositivos por Sockets
    io.emit('waitlist_updated', entry); 
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: 'Error al añadir a lista' });
  }
});

// 18. Asignar mesa (Quitar de la lista de espera)
app.patch('/api/waitlist/:id/seat', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma.waitlist.update({
      where: { id: Number(id) },
      data: { status: 'SEATED' }
    });
    io.emit('waitlist_updated', updated);
    res.json({ mensaje: "Cliente asignado a mesa", updated });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar lista' });
  }
});




// --- TIEMPO REAL ---
io.on('connection', (socket) => {
  console.log('📱 Dispositivo conectado:', socket.id);
  socket.on('disconnect', () => console.log('❌ Desconectado:', socket.id));
});

// --- ENCENDIDO ---
const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SERVIDOR ENTRE FUEGOS INICIADO EN PUERTO ${PORT}`);
});