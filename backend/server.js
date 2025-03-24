const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

let clients = []; // Almacenamiento en memoria (debes usar una base de datos en producción)

// GET: Obtener todos los clientes
app.get('/clients', (req, res) => {
    res.json(clients);
});

// POST: Crear un nuevo cliente
app.post('/clients', (req, res) => {
    const newClient = req.body;
    clients.push(newClient);
    res.status(201).json(newClient);
});

// PUT: Actualizar un cliente por índice
app.put('/clients/:index', (req, res) => {
    const index = parseInt(req.params.index);
    if (index >= 0 && index < clients.length) {
        clients[index] = req.body;
        res.json(clients[index]);
    } else {
        res.status(404).send('Cliente no encontrado');
    }
});

// DELETE: Eliminar un cliente por índice
app.delete('/clients/:index', (req, res) => {
    const index = parseInt(req.params.index);
    if (index >= 0 && index < clients.length) {
        clients = clients.filter((_, i) => i !== index);
        res.status(204).send();
    } else {
        res.status(404).send('Cliente no encontrado');
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});