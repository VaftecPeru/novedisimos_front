const express = require('express');
const axios = require('axios');
const router = express.Router();

const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2023-04';

router.get('/shop', async (req, res) => {
  try {
    const response = await axios.get(`https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN
      }
    });
    res.json({ tienda: response.data.shop });
  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener información de la tienda',
      details: error.response ? error.response.data : error.message
    });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const response = await axios.get(`https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}/orders.json`, {
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener órdenes',
      details: error.response ? error.response.data : error.message,
      message: error.message
    });
  }
});

router.get('/orders/:id', async (req, res) => {
  try {
    const response = await axios.get(`https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}/orders/${req.params.id}.json`, {
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener el pedido',
      details: error.response ? error.response.data : error.message
    });
  }
});

router.post('/setup', async (req, res) => {
  try {
    const { appType, storeName, apiKey, apiSecret, notificationEmail } = req.body;
    
    const shopUrl = `https://${storeName}.myshopify.com`;
    const response = await axios.get(`${shopUrl}/admin/api/${SHOPIFY_API_VERSION}/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': apiSecret // Para apps privadas, el API Secret suele funcionar como token
      }
    });
    
    res.json({ 
      success: true, 
      message: 'Integración configurada correctamente',
      shop: response.data.shop.name
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al configurar la integración con Shopify',
      details: error.response ? error.response.data : error.message
    });
  }
});

router.get('/check-credentials', (req, res) => {
  res.json({
    store: process.env.SHOPIFY_STORE,
    tokenFirstChars: process.env.SHOPIFY_ACCESS_TOKEN ? 
      process.env.SHOPIFY_ACCESS_TOKEN.substring(0, 5) + "..." : "No configurado",
    apiKeyConfigured: !!process.env.SHOPIFY_API_KEY
  });
});

router.get('/diagnose-permissions', async (req, res) => {
  try {
    const shopResponse = await axios.get(`https://${process.env.SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN
      }
    });
    
    try {
      await axios.get(`https://${process.env.SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}/orders.json?limit=1`, {
        headers: {
          'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN
        }
      });
      res.json({
        shopConnected: true,
        shopName: shopResponse.data.shop.name,
        ordersAccessible: true,
        token: {
          first5Chars: process.env.SHOPIFY_ACCESS_TOKEN.substring(0, 5),
          length: process.env.SHOPIFY_ACCESS_TOKEN.length
        },
        message: "Tienes conexión a la tienda y permisos para leer órdenes."
      });
    } catch (ordersError) {
      res.json({
        shopConnected: true,
        shopName: shopResponse.data.shop.name,
        ordersAccessible: false,
        error: {
          status: ordersError.response ? ordersError.response.status : "Unknown",
          message: ordersError.message,
          details: ordersError.response ? ordersError.response.data : "No details available"
        },
        token: {
          first5Chars: process.env.SHOPIFY_ACCESS_TOKEN.substring(0, 5),
          length: process.env.SHOPIFY_ACCESS_TOKEN.length
        },
        message: "Puedes conectarte a la tienda pero NO tienes permisos para leer órdenes."
      });
    }
  } catch (shopError) {
    res.status(500).json({
      shopConnected: false,
      error: {
        status: shopError.response ? shopError.response.status : "Unknown",
        message: shopError.message,
        details: shopError.response ? shopError.response.data : "No details available"
      },
      token: {
        first5Chars: process.env.SHOPIFY_ACCESS_TOKEN.substring(0, 5),
        length: process.env.SHOPIFY_ACCESS_TOKEN.length
      },
      message: "No puedes conectarte a la tienda. Hay un problema con las credenciales."
    });
  }
});

module.exports = router;