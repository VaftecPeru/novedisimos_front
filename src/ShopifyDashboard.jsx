import React, { useState } from 'react';
import './ShopifyDashboard.css';

function ShopifyDashboard() {
    const [isConnected, setIsConnected] = useState(false);
    const [formData, setFormData] = useState({
        webhookUrl: 'https://aliclick-store-b4a58dbc118c.herokuapp.com/shopify-webhook/order-proce',
        importType: 'WEBHOOK',
        storeDomain: 'novedisimos',
        accessToken: 'shpat_37f888a73913eef773b3965ea95ecca'
    });
    const [isTesting, setIsTesting] = useState(false);
    const [showGuide, setShowGuide] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleTestConnection = () => {
        setIsTesting(true);
        setTimeout(() => {
            setIsTesting(false);
            setIsConnected(true);
        }, 1500);
    };

    const handleSaveConnection = () => {
        alert('Conexión guardada exitosamente');
    };

    const toggleGuide = () => {
        setShowGuide(!showGuide);
    };

    return (
        <div className="shopify-container">
            <div className="shopify-top-section">
                <div className="shopify-logo">
                    <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Shopify_logo_2018.svg/1280px-Shopify_logo_2018.svg.png" 
                        alt="Shopify Logo" 
                        className="shopify-logo-image"
                    />
                </div>
                <h2>Crea tu cuenta aquí</h2>
                <h3>Instala nuestra integración de releasit y ten la cobertura Aliclick lista para vender</h3>
                <p className="shopify-description">
                    Ingrese los datos de su tienda para comenzar la integración con Shopify
                </p>
                <div className="guide-section">
                    <button className="guide-button shine-button" onClick={toggleGuide}>
                        <i className="fas fa-info-circle"></i> ¡Mira cómo hacerlo!
                    </button>
                </div>
            </div>

            {isConnected && (
                <div className="connected-notice">
                    <i className="fas fa-check-circle"></i>
                    <p>Tu tienda ya está conectada a Shopify. Si deseas cambiar la conexión, por favor, ingresa tus nuevos datos</p>
                </div>
            )}

            <div className="form-group">
                <label>Shopify Webhook URL</label>
                <input 
                    type="text" 
                    name="webhookUrl" 
                    value={formData.webhookUrl} 
                    onChange={handleInputChange}
                    className="form-control"
                />
                <small>Use esta URL para recibir notificaciones de Shopify</small>
            </div>

            <div className="form-group">
                <label>Tipo de importación</label>
                <div className="select-wrapper">
                    <select 
                        name="importType" 
                        value={formData.importType} 
                        onChange={handleInputChange}
                        className="form-control"
                    >
                        <option value="WEBHOOK">WEBHOOK</option>
                        <option value="API">API</option>
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label>Dominio de la tienda</label>
                <input 
                    type="text" 
                    name="storeDomain" 
                    value={formData.storeDomain} 
                    onChange={handleInputChange}
                    className="form-control"
                />
            </div>

            <div className="form-group">
                <label>Access Token</label>
                <input 
                    type="text" 
                    name="accessToken" 
                    value={formData.accessToken} 
                    onChange={handleInputChange}
                    className="form-control"
                />
            </div>

            <div className="form-buttons">
                <button 
                    className="btn test-connection" 
                    onClick={handleTestConnection}
                    disabled={isTesting}
                >
                    {isTesting ? 'Probando...' : 'Probar conexión'}
                </button>
                <button 
                    className="btn save-connection"
                    onClick={handleSaveConnection}
                >
                    Guardar
                </button>
            </div>

            {showGuide && (
                <div className="shopify-guide">
                    <div className="guide-header">
                        <h3>Guía de Configuración</h3>
                        <button className="close-guide" onClick={toggleGuide}>×</button>
                    </div>
                    <div className="guide-content">
                        <h4>Pasos para conectar tu tienda Shopify:</h4>
                        <ol>
                            <li>Inicia sesión en tu cuenta de Shopify</li>
                            <li>Ve a Configuración Aplicaciones y canales de venta</li>
                            <li>Haz clic en "Desarrollar aplicaciones"</li>
                            <li>Crea una nueva aplicación privada</li>
                            <li>Configura los permisos necesarios (orders, products, customers)</li>
                            <li>Copia el Access Token generado</li>
                            <li>Ingresa el nombre de tu tienda y el Access Token en este formulario</li>
                            <li>Haz clic en "Probar conexión" para verificar</li>
                            <li>Guarda la configuración</li>
                        </ol>
                        <div className="guide-images">
                            <img src="/api/placeholder/400/300" alt="Configuración Shopify Paso 1" />
                            <img src="/api/placeholder/400/300" alt="Configuración Shopify Paso 2" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ShopifyDashboard;