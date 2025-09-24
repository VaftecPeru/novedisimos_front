import React, { useState } from 'react';
import { shopifyService } from '../services/shopifyService';

function ShopifyIntegration() {
  const [formData, setFormData] = useState({
    appType: 'private',
    storeName: '',
    apiKey: '',
    apiSecret: '',
    notificationEmail: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await shopifyService.setupIntegration(formData);
      if (response.success) {
        setMessage(`Integración configurada correctamente para la tienda: ${response.shop}`);
      } else {
        setMessage(`Error: ${response.message}`);
      }
    } catch (error) {
      setMessage('Error al conectar con el servidor');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="integration-form">
      <h2>Integración con Shopify</h2>
      {message && <div className="alert">{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tipo de aplicación</label>
          <select 
            name="appType" 
            value={formData.appType} 
            onChange={handleChange}
          >
            <option value="private">Privada</option>
            <option value="public">Pública</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Nombre de la tienda</label>
          <input 
            type="text" 
            name="storeName" 
            value={formData.storeName} 
            onChange={handleChange} 
            placeholder="Ejemplo: mitienda (sin .myshopify.com)"
          />
        </div>
        
        <div className="form-group">
          <label>API Key</label>
          <input 
            type="text" 
            name="apiKey" 
            value={formData.apiKey} 
            onChange={handleChange} 
            placeholder="Ingresa tu API Key de Shopify"
          />
        </div>
        
        <div className="form-group">
          <label>API Secret</label>
          <input 
            type="password" 
            name="apiSecret" 
            value={formData.apiSecret} 
            onChange={handleChange} 
            placeholder="Ingresa tu API Secret de Shopify"
          />
        </div>
        
        <div className="form-group">
          <label>Email para notificaciones</label>
          <input 
            type="email" 
            name="notificationEmail" 
            value={formData.notificationEmail} 
            onChange={handleChange} 
            placeholder="ejemplo@tudominio.com"
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Configurando...' : 'Crear cuenta Shopify'}
        </button>
      </form>
    </div>
  );
}

export default ShopifyIntegration;