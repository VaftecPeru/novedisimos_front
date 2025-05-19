const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000; 

app.use(cors({
  origin: ['https://novedadeswow.com', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/api/shopify', shopifyRoutes);

app.get('/', (req, res) => {
  res.send('API funcionando correctamente');
});

app.get('/test', (req, res) => {
  res.json({ 
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    env: {
      shopify_store_configured: !!process.env.SHOPIFY_STORE,
      shopify_token_configured: !!process.env.SHOPIFY_ACCESS_TOKEN,
      node_env: process.env.NODE_ENV
    }
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});