import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById } from "./components/services/shopifyService";
import {
  Box, Paper, Typography, Divider, Button, Grid, Chip, Avatar, Stack, IconButton, Tooltip
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaidIcon from '@mui/icons-material/Paid';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import NoteIcon from '@mui/icons-material/Note';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import './DetallePedido.css';

function getNoteAttr(attrs, name) {
  if (!attrs) return "";
  const found = attrs.find(a => a.name === name);
  return found ? found.value : "";
}

const DetallePedido = () => {
  const { orderId } = useParams();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getOrderById(orderId);
        setPedido(data.order || data);
      } catch (e) {
        setError("No se pudo cargar el detalle del pedido.");
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  if (loading) return <Typography>Cargando detalle...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!pedido) return <Typography>No se encontró el pedido.</Typography>;


  const productos = pedido.line_items || [];
  const fechaPreparado = pedido.created_at ? new Date(pedido.created_at).toLocaleDateString("es-PE", { year: 'numeric', month: 'long', day: 'numeric' }) : "";
  const nombreCliente = getNoteAttr(pedido.note_attributes, "Nombre y Apellidos") || pedido.customer?.first_name + " " + pedido.customer?.last_name;
  const celular = getNoteAttr(pedido.note_attributes, "Celular") || pedido.phone || pedido.customer?.phone;
  const provinciaDistrito = getNoteAttr(pedido.note_attributes, "Provincia y Distrito:");
  const direccion = getNoteAttr(pedido.note_attributes, "Dirección") || pedido.shipping_address?.address1;
  const referencias = getNoteAttr(pedido.note_attributes, "Referencias");
  const metodoEnvio = getNoteAttr(pedido.note_attributes, "Método de envío");
  const pais = getNoteAttr(pedido.note_attributes, "country") || pedido.shipping_address?.country_code;
  const estadoPago = pedido.financial_status === "paid" ? "Pagado" : "Pendiente";
  const estadoPreparado = pedido.fulfillment_status === "fulfilled" ? "Preparado" : "No preparado";
  
  const subtotalCalculado = productos.reduce((acc, item) => {
    return acc + (Number(item.price) * Number(item.quantity));
  }, 0);
  
  const subtotal = subtotalCalculado > 0 ? subtotalCalculado.toFixed(2) : (pedido.subtotal_price || pedido.current_subtotal_price || "0.00");
  const envio = pedido.total_shipping_price_set?.shop_money?.amount || pedido.shipping_lines?.[0]?.price || "0.00";
  
  const totalCalculado = Number(subtotal) + Number(envio);
  const total = totalCalculado > 0 ? totalCalculado.toFixed(2) : (pedido.total_price || pedido.current_total_price || "0.00");
  
  const orderNumber = pedido.name || pedido.order_number;
  const note = pedido.note && pedido.note !== "" ? pedido.note : "No hay notas del cliente";
  
  const totalArticulos = productos.reduce((acc, item) => acc + Number(item.quantity), 0);
  
  const obtenerIniciales = (nombre) => {
    if (!nombre) return "CL";
    const palabras = nombre.trim().split(" ");
    if (palabras.length >= 2) {
      return (palabras[0][0] + palabras[1][0]).toUpperCase();
    } else if (palabras.length === 1) {
      return palabras[0].substring(0, 2).toUpperCase();
    }
    return "CL";
  };
  
  const inicialesCliente = obtenerIniciales(nombreCliente);

  return (
    <div className="detalle-container">
      <div className="card header-card">
        <div className="header-content">
          <IconButton onClick={() => navigate(-1)} size="small">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" className="header-title">
            #{orderNumber}
          </Typography>
          
          <Chip 
            label="Pagado" 
            size="small"
            className="status-chip pagado"
          />
          <Chip 
            label="Preparado" 
            size="small"
            className="status-chip pagado"
          />
          <Chip 
            label="Archivado" 
            size="small"
            className="status-chip archivado"
          />
          
          <Button variant="outlined" size="small" className="action-button">
            Reembolsar
          </Button>
          <Button variant="outlined" size="small" className="action-button">
            Devolución
          </Button>
          <Button variant="outlined" size="small" className="action-button">
            Editar
          </Button>
          <Button variant="outlined" size="small" className="action-button">
            Más acciones
          </Button>
          <IconButton size="small">
            <MoreVertIcon />
          </IconButton>
          
          <Avatar className="user-avatar green">{inicialesCliente}</Avatar>
        </div>
        
        <Typography variant="body2" color="text.secondary">
          {pedido.created_at && new Date(pedido.created_at).toLocaleDateString("es-PE", { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })} a las {pedido.created_at && new Date(pedido.created_at).toLocaleTimeString("es-PE", { 
            hour: '2-digit', 
            minute: '2-digit' 
          })} de EasySell COD Form (a través de importación)
        </Typography>
      </div>

      <div className="main-layout">
        <div className="left-column">
          <div className="card">
            <div className="preparados-header">
              <div className="preparados-title">
                <CheckCircleIcon sx={{ color: "#4CAF50", fontSize: 20 }} />
                <Typography component="h3">
                  Preparados ({totalArticulos})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  #{orderNumber}-F1
                </Typography>
              </div>
              <IconButton size="small">
                <MoreHorizIcon />
              </IconButton>
            </div>
            
            <div className="preparados-content">
              <div className="preparado-info">
                <Typography component="h4">
                  Preparado
                </Typography>
                <Typography component="p">
                  {fechaPreparado}
                </Typography>
              </div>
              
              {productos.map(item => (
                <div key={item.id} className="producto-item">
                  <Avatar 
                    src={item.image_url || "/static/product_placeholder.png"} 
                    variant="rounded" 
                    className="producto-imagen"
                  />
                  <div className="producto-info">
                    <div className="producto-titulo">
                      {item.title}
                    </div>
                    <div className="producto-variante">
                      {item.variant_title}
                    </div>
                  </div>
                  <div className="producto-precio">
                    {Number(item.price).toFixed(2)} PEN × {item.quantity}
                    <span className="producto-total">
                      {(Number(item.price) * Number(item.quantity)).toFixed(2)} PEN
                    </span>
                  </div>
                </div>
              ))}
              
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                size="small"
                className="tracking-button"
              >
                Agregar seguimiento
              </Button>
            </div>
          </div>

          <div className="card">
            <div className="pago-section">
              <div className="pago-header">
                <PaidIcon sx={{ color: "#4CAF50", fontSize: 20 }} />
                <Typography component="h3">
                  Pagado
                </Typography>
              </div>
              
              <div className="pago-detalle">
                <div className="pago-linea">
                  <span>Subtotal</span>
                  <span>{totalArticulos} {totalArticulos === 1 ? 'artículo' : 'artículos'}</span>
                  <span>{Number(subtotal).toFixed(2)} PEN</span>
                </div>
                
                <div className="pago-linea">
                  <span>Envío</span>
                  <span>Envío (0.0 kg: artículos 0.0 kg, embalaje 0.0 kg)</span>
                  <span>{Number(envio).toFixed(2)} PEN</span>
                </div>
                
                <hr className="divider" />
                
                <div className="pago-linea total-linea">
                  <span>Total</span>
                  <span></span>
                  <span>{Number(total).toFixed(2)} PEN</span>
                </div>
              </div>
              
              <div className="pagado-final">
                <Typography component="h4">
                  Pagado
                </Typography>
                <Typography component="p">
                  {Number(total).toFixed(2)} PEN
                </Typography>
              </div>
            </div>
          </div>
        </div>

        <div className="right-column">
          <div className="card">
            <div className="notas-section">
              <div className="section-header">
                <Typography component="h3">
                  Notas
                </Typography>
                <Tooltip title="Editar nota">
                  <IconButton size="small">
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </div>
              <div className="notas-content">
                {note}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="info-section">
              <div className="section-header">
                <Typography component="h3">
                  Información adicional
                </Typography>
                <Tooltip title="Editar información">
                  <IconButton size="small">
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </div>
              
              <div className="info-item">
                <div className="info-label">
                  Nombre y Apellidos
                </div>
                <div className="info-value">
                  {nombreCliente || "-"}
                </div>
              </div>
              
              <div className="info-item">
                <div className="info-label">
                  Celular
                </div>
                <div className="info-value">
                  {celular || "-"}
                </div>
              </div>
              
              <div className="info-item">
                <div className="info-label">
                  Provincia y Distrito:
                </div>
                <div className="info-value">
                  {provinciaDistrito || "-"}
                </div>
              </div>
              
              <div className="info-item">
                <div className="info-label">
                  Dirección
                </div>
                <div className="info-value">
                  {direccion || "-"}
                </div>
              </div>
              
              <div className="info-item">
                <div className="info-label">
                  Referencias
                </div>
                <div className="info-value">
                  {referencias || "-"}
                </div>
              </div>
              
              <div className="info-item">
                <div className="info-label">
                  Método de envío
                </div>
                <div className="info-value envio-value">
                  <LocalShippingIcon className="envio-icon" />
                  <span>{metodoEnvio || "Lima: Pago Contra Entrega"}</span>
                </div>
              </div>
              
              <div className="info-item">
                <div className="info-label">
                  country
                </div>
                <div className="info-value">
                  {pais || "PE"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetallePedido;