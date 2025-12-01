import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById } from "./components/services/shopifyService";
import {
  Box,
  Paper,
  Typography,
  Divider,
  Button,
  Grid,
  Chip,
  Avatar,
  Stack,
  IconButton,
  Tooltip,
  TextField,
  Modal,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PaidIcon from "@mui/icons-material/Paid";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import NoteIcon from "@mui/icons-material/Note";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import "./DetallePedido.css";

function getNoteAttr(attrs, name) {
  if (!attrs) return "";
  const found = attrs.find((a) => a.name === name);
  return found ? found.value : "";
}

function setNoteAttr(attrs, name, value) {
  const index = attrs.findIndex((a) => a.name === name);
  if (index !== -1) {
    attrs[index].value = value;
  } else {
    attrs.push({ name, value });
  }
  return attrs;
}

const DetallePedido = () => {
  const { orderId } = useParams();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [openNoteModal, setOpenNoteModal] = useState(false);
  const [editedNote, setEditedNote] = useState("");
  const [openInfoModal, setOpenInfoModal] = useState(false);

  const [editedFirstName, setEditedFirstName] = useState("");
  const [editedLastName, setEditedLastName] = useState("");
  const [editedCompany, setEditedCompany] = useState("");
  const [editedAddress1, setEditedAddress1] = useState("");
  const [editedAddress2, setEditedAddress2] = useState("");
  const [editedCity, setEditedCity] = useState("");
  const [editedProvince, setEditedProvince] = useState("");
  const [editedCountry, setEditedCountry] = useState("");
  const [editedZip, setEditedZip] = useState("");
  const [editedPhone, setEditedPhone] = useState("");

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

  useEffect(() => {
    if (pedido) {
      setEditedNote(pedido.note || "");

      const currentNombre = getNoteAttr(pedido.note_attributes, "Nombre y Apellidos") ||
        (pedido.customer?.first_name + " " + pedido.customer?.last_name) || "";
      const nameParts = currentNombre.trim().split(" ");
      setEditedFirstName(nameParts[0] || "");
      setEditedLastName(nameParts.slice(1).join(" ") || "");

      const currentCompany = getNoteAttr(pedido.note_attributes, "company") ||
        pedido.shipping_address?.company || "";
      setEditedCompany(currentCompany);

      const currentDireccion = getNoteAttr(pedido.note_attributes, "Dirección") ||
        pedido.shipping_address?.address1 || "";
      setEditedAddress1(currentDireccion);
      setEditedAddress2(pedido.shipping_address?.address2 || "");

      const currentProvinciaDistrito = getNoteAttr(
        pedido.note_attributes,
        "Provincia y Distrito:"
      ) || (pedido.shipping_address?.province + " y " + pedido.shipping_address?.city) || "";
      const pdParts = currentProvinciaDistrito.split(" y ");
      setEditedProvince(pdParts[0] || "");
      setEditedCity(pdParts[1] || "");

      const currentCountry = getNoteAttr(pedido.note_attributes, "country") ||
        pedido.shipping_address?.country || "";
      setEditedCountry(currentCountry);

      const currentZip = getNoteAttr(pedido.note_attributes, "zip") ||
        pedido.shipping_address?.zip || "";
      setEditedZip(currentZip);

      const currentPhone = getNoteAttr(pedido.note_attributes, "Celular") ||
        pedido.phone ||
        pedido.customer?.phone ||
        pedido.shipping_address?.phone || "";
      setEditedPhone(currentPhone);
    }
  }, [pedido]);

  if (loading)
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Typography>Cargando detalle...</Typography>
      </Box>
    );

  if (error)
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );

  if (!pedido)
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Typography>No se encontró el pedido.</Typography>
      </Box>
    );

  const productos = pedido.line_items || [];
  const fechaPreparado = pedido.created_at
    ? new Date(pedido.created_at).toLocaleDateString("es-PE", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";
  const nombreCliente =
    getNoteAttr(pedido.note_attributes, "Nombre y Apellidos") ||
    pedido.customer?.first_name + " " + pedido.customer?.last_name;
  const celular =
    getNoteAttr(pedido.note_attributes, "Celular") ||
    pedido.phone ||
    pedido.customer?.phone;
  const provinciaDistrito = getNoteAttr(
    pedido.note_attributes,
    "Provincia y Distrito:"
  );
  const direccion =
    getNoteAttr(pedido.note_attributes, "Dirección") ||
    pedido.shipping_address?.address1;
  const referencias = getNoteAttr(pedido.note_attributes, "Referencias");
  const metodoEnvio = getNoteAttr(pedido.note_attributes, "Método de envío");
  const pais =
    getNoteAttr(pedido.note_attributes, "country") ||
    pedido.shipping_address?.country_code;
  const company =
    getNoteAttr(pedido.note_attributes, "company") ||
    pedido.shipping_address?.company ||
    "";
  const zip =
    getNoteAttr(pedido.note_attributes, "zip") ||
    pedido.shipping_address?.zip ||
    "";
  const estadoPago =
    pedido.financial_status === "paid" ? "Pagado" : "Pendiente";
  const estadoPreparado =
    pedido.fulfillment_status === "fulfilled" ? "Preparado" : "No preparado";

  const subtotalCalculado = productos.reduce((acc, item) => {
    return acc + Number(item.price) * Number(item.quantity);
  }, 0);

  const subtotal =
    subtotalCalculado > 0
      ? subtotalCalculado.toFixed(2)
      : pedido.subtotal_price || pedido.current_subtotal_price || "0.00";
  const envio =
    pedido.total_shipping_price_set?.shop_money?.amount ||
    pedido.shipping_lines?.[0]?.price ||
    "0.00";

  const totalCalculado = Number(subtotal) + Number(envio);
  const total =
    totalCalculado > 0
      ? totalCalculado.toFixed(2)
      : pedido.total_price || pedido.current_total_price || "0.00";

  const orderNumber = pedido.name || pedido.order_number;
  const note =
    pedido.note && pedido.note !== ""
      ? pedido.note
      : "No hay notas del cliente";

  const totalArticulos = productos.reduce(
    (acc, item) => acc + Number(item.quantity),
    0
  );

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

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
  };

  const handleSaveNote = () => {
    setPedido({ ...pedido, note: editedNote });
    setOpenNoteModal(false);
  };

  const handleSaveInfo = () => {
    const updatedAttrs = [...(pedido.note_attributes || [])];
    setNoteAttr(updatedAttrs, "Nombre y Apellidos", `${editedFirstName} ${editedLastName}`.trim());
    setNoteAttr(updatedAttrs, "company", editedCompany);
    setNoteAttr(updatedAttrs, "Dirección", `${editedAddress1} ${editedAddress2}`.trim());
    setNoteAttr(updatedAttrs, "Provincia y Distrito:", `${editedProvince} y ${editedCity}`.trim());
    setNoteAttr(updatedAttrs, "country", editedCountry);
    setNoteAttr(updatedAttrs, "zip", editedZip);
    setNoteAttr(updatedAttrs, "Celular", editedPhone);
    setPedido({ ...pedido, note_attributes: updatedAttrs });
    setOpenInfoModal(false);
  };

  return (
    <div>
      <div className="shop-header">
        <img
          className="shop-header-logo"
          src="../images/img2.png"
          alt="Imagen de login"
        />

        <div className="shop-header-search">
          <input type="text" placeholder="Buscar en la tienda..." />
        </div>

        <div className="shop-header-actions">
          <Avatar className="user-avatar green">{inicialesCliente}</Avatar>
        </div>
      </div>
      <div className="detalle-container">
        <div className="card header-card">
          <div className="header-content">
            <IconButton onClick={() => navigate(-1)} size="small">
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" className="header-title">
              #{orderNumber}
            </Typography>

            <Chip label="Pagado" size="small" className="status-chip pagado" />
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
          </div>

          <Typography variant="body2" color="text.secondary">
            {pedido.created_at &&
              new Date(pedido.created_at).toLocaleDateString("es-PE", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
            a las{" "}
            {pedido.created_at &&
              new Date(pedido.created_at).toLocaleTimeString("es-PE", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
            de EasySell COD Form (a través de importación)
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
                  <Typography component="h4">Preparado</Typography>
                  <Typography component="p">{fechaPreparado}</Typography>
                </div>

                {productos.map((item) => (
                  <div key={item.id} className="producto-item">
                    <Avatar
                      src={item.image_url || "/static/product_placeholder.png"}
                      variant="rounded"
                      className="producto-imagen"
                    />
                    <div className="producto-info">
                      <div className="producto-titulo">{item.title}</div>
                      <div className="producto-variante">
                        {item.variant_title}
                      </div>
                    </div>
                    <div className="producto-precio">
                      {Number(item.price).toFixed(2)} PEN × {item.quantity}
                      <span className="producto-total">
                        {(Number(item.price) * Number(item.quantity)).toFixed(
                          2
                        )}{" "}
                        PEN
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
                  <Typography component="h3">Pagado</Typography>
                </div>

                <div className="pago-detalle">
                  <div className="pago-linea">
                    <span>Subtotal</span>
                    <span>
                      {totalArticulos}{" "}
                      {totalArticulos === 1 ? "artículo" : "artículos"}
                    </span>
                    <span>{Number(subtotal).toFixed(2)} PEN</span>
                  </div>

                  <div className="pago-linea">
                    <span>Envío</span>
                    <span>
                      Envío (0.0 kg: artículos 0.0 kg, embalaje 0.0 kg)
                    </span>
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
                  <Typography component="h4">Pagado</Typography>
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
                  <Typography component="h3">Notas</Typography>
                  <Tooltip title="Editar nota">
                    <IconButton size="small" onClick={() => setOpenNoteModal(true)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </div>
                <div className="notas-content">{note}</div>
              </div>
            </div>

            <div className="card">
              <div className="info-section">
                <div className="section-header">
                  <Typography component="h3">Información adicional</Typography>
                  <Tooltip title="Editar información">
                    <IconButton size="small" onClick={() => setOpenInfoModal(true)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </div>

                <div className="info-item">
                  <div className="info-label">Nombre y Apellidos</div>
                  <div className="info-value">{nombreCliente || "-"}</div>
                </div>

                <div className="info-item">
                  <div className="info-label">Celular</div>
                  <div className="info-value">{celular || "-"}</div>
                </div>

                <div className="info-item">
                  <div className="info-label">Provincia y Distrito:</div>
                  <div className="info-value">{provinciaDistrito || "-"}</div>
                </div>

                <div className="info-item">
                  <div className="info-label">Dirección</div>
                  <div className="info-value">{direccion || "-"}</div>
                </div>

                <div className="info-item">
                  <div className="info-label">Referencias</div>
                  <div className="info-value">{referencias || "-"}</div>
                </div>

                <div className="info-item">
                  <div className="info-label">Método de envío</div>
                  <div className="info-value envio-value">
                    <LocalShippingIcon className="envio-icon" />
                    <span>{metodoEnvio || "Lima: Pago Contra Entrega"}</span>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-label">country</div>
                  <div className="info-value">{pais || "PE"}</div>
                </div>

                <div className="info-item">
                  <div className="info-label">Company</div>
                  <div className="info-value">{company || "-"}</div>
                </div>

                <div className="info-item">
                  <div className="info-label">Zip</div>
                  <div className="info-value">{zip || "-"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={openNoteModal}
        onClose={() => setOpenNoteModal(false)}
        aria-labelledby="modal-note-title"
        aria-describedby="modal-note-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-note-title" variant="h6" component="h2">
            Editar Nota
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={editedNote}
            onChange={(e) => setEditedNote(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={() => setOpenNoteModal(false)}>Cancelar</Button>
            <Button
              onClick={handleSaveNote}
              variant="contained"
              sx={{ ml: 1 }}
            >
              Guardar
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal
        open={openInfoModal}
        onClose={() => setOpenInfoModal(false)}
        aria-labelledby="modal-info-title"
        aria-describedby="modal-info-description"
      >
        <Box sx={{ ...modalStyle, width: 500 }}>
          <Typography id="modal-info-title" variant="h6" component="h2">
            Editar Información Adicional
          </Typography>
          <TextField
            label="First Name"
            fullWidth
            value={editedFirstName}
            onChange={(e) => setEditedFirstName(e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            label="Last Name"
            fullWidth
            value={editedLastName}
            onChange={(e) => setEditedLastName(e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            label="Company"
            fullWidth
            value={editedCompany}
            onChange={(e) => setEditedCompany(e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            label="Address 1"
            fullWidth
            value={editedAddress1}
            onChange={(e) => setEditedAddress1(e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            label="Address 2"
            fullWidth
            value={editedAddress2}
            onChange={(e) => setEditedAddress2(e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            label="City"
            fullWidth
            value={editedCity}
            onChange={(e) => setEditedCity(e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            label="Province"
            fullWidth
            value={editedProvince}
            onChange={(e) => setEditedProvince(e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            label="Country"
            fullWidth
            value={editedCountry}
            onChange={(e) => setEditedCountry(e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            label="Zip"
            fullWidth
            value={editedZip}
            onChange={(e) => setEditedZip(e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            label="Phone"
            fullWidth
            value={editedPhone}
            onChange={(e) => setEditedPhone(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={() => setOpenInfoModal(false)}>Cancelar</Button>
            <Button
              onClick={handleSaveInfo}
              variant="contained"
              sx={{ ml: 1 }}
            >
              Guardar
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default DetallePedido;