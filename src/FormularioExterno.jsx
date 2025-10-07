import React, { useState } from "react";
import "./FormularioExterno.css";
import {
  fetchOrderByName, fetchEstadosPedidos, fetchPedidoExterno, guardarPedidoExterno, guardarPedidoExternoEnvio,
} from './components/services/shopifyService';

import { Search, Save, RefreshCcw, Trash2, Plus, Minus, Calendar, Truck, DollarSign, UsbIcon } from "lucide-react";
import Swal from 'sweetalert2';

const FormularioExterno = () => {
  // Estado inicial para Form1 (COD - YARA)
  const initialFormData1 = {
    buscar: "",
    shopify_order_id: "",
    asesor: "",
    codigo: "",
    estado: "",
    cliente: "",
    celular: "",
    ubicacion: "",
    direccion: "",
    referencias: "",
    productos: [{ nombre: "", cantidad: "", precio: "" }],
    notasAsesor: "",
    notasSupervision: "",
  };

  // Estado inicial para Form2 (ADMINISTRATIVO)
  const initialFormData2 = {
    shopify_order_id: "",
    estadoAgencial: "",
    fechaEnvio: "",
    fechaLlegada: "",
    costoEnvio: "",
    codigoInicial: "",
    montoPendiente: "",
    fechaDepositada: "",
    medioPago: "",
    numeroOperacion: "",
    notasAdministrativas: "",
  };

  const [formData1, setFormData1] = useState(initialFormData1);
  const [formData2, setFormData2] = useState(initialFormData2);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("form1");
  const [isModified, setIsModified] = useState(false);

  // Validar Form1
  const validarFormulario1 = () => {
    const newErrors = {};
    if (!formData1.shopify_order_id) newErrors.general = "Debe buscar un pedido primero";
    if (formData1.productos.some(p => !p.nombre.trim() || !p.cantidad || !p.precio)) newErrors.productos = "Productos inválidos";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validar Form2
  const validarFormulario2 = () => {
    const newErrors = {};
    if (!formData2.shopify_order_id) newErrors.general = "Debe buscar un pedido primero";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para formatear fecha a YYYY-MM-DDThh:mm (para datetime-local)
  const formatToLocalDateTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const pad = (num) => String(num).padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Función para buscar pedido
  const buscarPedido = async () => {
    if (!formData1.buscar.trim()) {
      setErrors({ ...errors, buscar: "Ingrese un código o nombre para buscar" });
      return;
    }

    setErrors({});
    const valorBuscar = formData1.buscar.trim();
    const pedidoShopify = await fetchOrderByName(valorBuscar);

    if (pedidoShopify) {
      console.log(`Pedido encontrado (${pedidoShopify.name})`);

      const pedidoBD = await fetchPedidoExterno(pedidoShopify.id);
      const estadosInternos = await fetchEstadosPedidos();
      let arrayEstados = Array.isArray(estadosInternos) ? estadosInternos : (estadosInternos.data || []);

      const estadoInterno = arrayEstados.find(
        (estado) => estado.shopify_order_id === pedidoShopify.id
      );

      const mapShopifyStatus = (order, estadoInterno) => {
        if (order.cancelled_at) return "cancelado";
        if (estadoInterno) {
          if (
            estadoInterno.estado_pago === "pagado" &&
            estadoInterno.estado_preparacion === "preparado"
          ) {
            if (order.fulfillment_status === "fulfilled") return "entregado";
            return "en-camino";
          }
          if (estadoInterno.estado_pago === "pagado") return "confirmado";
          if (estadoInterno.estado_pago === "pendiente") return "pendiente";
        }
        if (order.financial_status === "paid") return "confirmado";
        if (order.financial_status === "pending") return "pendiente";
        return "pendiente";
      };

      const noteAttributes = pedidoShopify.note_attributes || [];
      const celularEnAtributos = noteAttributes.find((attr) => attr.name === "Celular")?.value || "";
      const ubicacionEnAtributos = noteAttributes.find((attr) => attr.name === "Provincia y Distrito:")?.value || "";
      const direccionEnAtributos = noteAttributes.find((attr) => attr.name === "Dirección")?.value || "";
      const referenciasEnAtributos = noteAttributes.find((attr) => attr.name === "Referencias")?.value || "";
      const clienteEnAtributos = noteAttributes.find((attr) => attr.name === "Nombre y Apellidos")?.value || "";

      const pedidoFormateado1 = {
        buscar: valorBuscar,
        shopify_order_id: pedidoShopify.id,
        asesor: pedidoShopify.asesor || "Asesor 1",
        codigo: pedidoShopify.name || "",
        estado: mapShopifyStatus(pedidoShopify, estadoInterno),
        cliente: clienteEnAtributos || "",
        celular: celularEnAtributos,
        ubicacion: ubicacionEnAtributos ? ubicacionEnAtributos.split(',')[0].trim() || "" : "", 
        direccion: direccionEnAtributos || "",
        referencias: referenciasEnAtributos || "",
        productos: pedidoShopify.line_items && Array.isArray(pedidoShopify.line_items)
          ? pedidoShopify.line_items.map((producto) => ({
            nombre: producto.title || producto.name || "",
            cantidad: producto.quantity?.toString() || "1",
            precio: producto.price?.toString() || "0.00",
          }))
          : initialFormData1.productos,
        notasAsesor: pedidoShopify.notasAsesor || pedidoShopify.note || "",
        notasSupervision: pedidoShopify.notasSupervision || "",
      };

      if (pedidoBD) {
        console.log("Pedido externo encontrado en BD:", pedidoBD);
        pedidoFormateado1.asesor = pedidoBD.asesor || pedidoFormateado1.asesor;
        pedidoFormateado1.estado = pedidoBD.estado || pedidoFormateado1.estado;
        pedidoFormateado1.cliente = pedidoBD.cliente || pedidoFormateado1.cliente;
        pedidoFormateado1.celular = pedidoBD.celular || pedidoFormateado1.celular;
        pedidoFormateado1.ubicacion = pedidoBD.provincia_distrito || pedidoFormateado1.ubicacion; 
        pedidoFormateado1.direccion = pedidoBD.direccion || pedidoFormateado1.direccion;
        pedidoFormateado1.referencias = pedidoBD.referencias || pedidoFormateado1.referencias;
        pedidoFormateado1.notasAsesor = pedidoBD.notas_asesor || pedidoFormateado1.notasAsesor;
        pedidoFormateado1.notasSupervision = pedidoBD.notas_supervisor || pedidoFormateado1.notasSupervision;

        if (pedidoBD.productos && pedidoBD.productos.length > 0) {
          pedidoFormateado1.productos = pedidoBD.productos.map((p) => ({
            nombre: p.nombre_producto,
            cantidad: String(p.cantidad),
            precio: String(p.precio_unitario),
          }));
        }
      }

      setFormData1(pedidoFormateado1);
      setIsModified(false);

      if (pedidoBD && pedidoBD.envio) {
        const envioBD = pedidoBD.envio;
        setFormData2({
          shopify_order_id: pedidoShopify.id,
          estadoAgencial: envioBD.estado_agencial || "",
          fechaEnvio: formatToLocalDateTime(envioBD.fecha_envio),
          fechaLlegada: formatToLocalDateTime(envioBD.fecha_llegada),
          costoEnvio: String(envioBD.costo_envio || ""),
          codigoInicial: envioBD.codigo_inicial || "",
          montoPendiente: String(envioBD.monto_pendiente || ""),
          fechaDepositada: envioBD.fecha_depositada ? new Date(envioBD.fecha_depositada).toISOString().slice(0, 10) : "",
          medioPago: envioBD.medio_pago || "",
          numeroOperacion: envioBD.numero_operacion || "",
          notasAdministrativas: envioBD.notas_administrativas || "",
        });
      } else {
        setFormData2({ ...initialFormData2, shopify_order_id: pedidoShopify.id });
      }
    } else {
      console.log("Pedido no encontrado");
      setFormData1(initialFormData1);
      setFormData2(initialFormData2);
      setErrors({ buscar: "Pedido no encontrado en Shopify" });
    }
  };

  // Manejar cambios en el primer formulario
  const handleChange1 = (e) => {
    const { name, value } = e.target;
    setFormData1((prev) => ({ ...prev, [name]: value }));
    setIsModified(true);
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Manejar cambios en el segundo formulario
  const handleChange2 = (e) => {
    const { name, value } = e.target;
    setFormData2((prev) => ({ ...prev, [name]: value }));
    setIsModified(true);
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Manejar cambios en productos
  const handleProductChange = (index, field, value) => {
    const updatedProductos = [...formData1.productos];
    updatedProductos[index][field] = value;
    setFormData1({ ...formData1, productos: updatedProductos });
    setIsModified(true);
  };

  // Agregar nuevo campo de producto
  const addProductField = () => {
    setFormData1({
      ...formData1,
      productos: [...formData1.productos, { nombre: "", cantidad: "", precio: "" }]
    });
    setIsModified(true);
  };

  // Eliminar campo de producto
  const removeProductField = (index) => {
    if (formData1.productos.length <= 1) return;

    const updatedProductos = [...formData1.productos];
    updatedProductos.splice(index, 1);
    setFormData1({ ...formData1, productos: updatedProductos });
    setIsModified(true);
  };

  // Guardar Form1
  const handleGuardarFormulario1 = async () => {
    if (!validarFormulario1()) return;

    Swal.fire({
      title: "¿Guardar pedido?",
      text: "¿Estás seguro de que deseas guardar este pedido?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#6b0f1a",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, guardar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const payload = {
            shopify_order_id: formData1.shopify_order_id,
            asesor: formData1.asesor,
            estado: formData1.estado,
            codigo: formData1.codigo,
            celular: formData1.celular,
            cliente: formData1.cliente,
            provincia_distrito: `${formData1.ubicacion}`.trim(),
            direccion: formData1.direccion,
            referencias: formData1.referencias,
            notas_asesor: formData1.notasAsesor,
            notas_supervisor: formData1.notasSupervision,
            productos: formData1.productos
              ? formData1.productos.map((p) => ({
                nombre: p.nombre,
                cantidad: parseInt(p.cantidad) || 0,
                precio: parseFloat(p.precio) || 0,
              })).filter(p => p.nombre.trim()) // Filtrar vacíos
              : [],
          };

          console.log("Datos que se enviarán (Form1):", JSON.stringify(payload, null, 2));

          const data = await guardarPedidoExterno(payload);
          console.log("✅ Guardado en backend:", data);
          setIsModified(false);

          Swal.fire({
            title: "¡Guardado!",
            text: "El pedido se ha guardado correctamente.",
            icon: "success",
            confirmButtonColor: "#6b0f1a",
            confirmButtonText: "OK",
          });
        } catch (error) {
          console.error("❌ Error al guardar pedido:", error);
          Swal.fire({
            title: "Error",
            text: "No se pudo guardar el pedido: " + error.message,
            icon: "error",
            confirmButtonColor: "#6b0f1a",
          });
        }
      }
    });
  };

  // Guardar Form2
  const handleGuardarFormulario2 = async () => {
    if (!validarFormulario2()) return;

    Swal.fire({
      title: "¿Guardar envío?",
      text: "¿Estás seguro de que deseas guardar los datos de envío?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#6b0f1a",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, guardar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const payload = {
            shopify_order_id: formData2.shopify_order_id,
            estado_agencial: formData2.estadoAgencial,
            fecha_envio: formatToLocalDateTime(formData2.fechaEnvio),
            fecha_llegada: formatToLocalDateTime(formData2.fechaLlegada),
            costo_envio: parseFloat(formData2.costoEnvio) || null,
            codigo_inicial: formData2.codigoInicial,
            monto_pendiente: parseFloat(formData2.montoPendiente) || null,
            fecha_depositada: formData2.fechaDepositada ? new Date(formData2.fechaDepositada).toISOString().slice(0, 10) : null,
            medio_pago: formData2.medioPago,
            numero_operacion: formData2.numeroOperacion,
            notas_administrativas: formData2.notasAdministrativas,
          };

          console.log("Datos que se enviarán (Form2):", JSON.stringify(payload, null, 2));

          const data = await guardarPedidoExternoEnvio(payload);
          console.log("✅ Envío guardado en backend:", data);
          setIsModified(false);

          Swal.fire({
            title: "¡Guardado!",
            text: "El envío se ha guardado correctamente.",
            icon: "success",
            confirmButtonColor: "#6b0f1a",
            confirmButtonText: "OK",
          });
        } catch (error) {
          console.error("❌ Error al guardar envío:", error);
          Swal.fire({
            title: "Error",
            text: "No se pudo guardar el envío: " + error.message,
            icon: "error",
            confirmButtonColor: "#6b0f1a",
          });
        }
      }
    });
  };

  // Reset formularios
  const resetForm1 = () => {
    setFormData1(initialFormData1);
    setFormData2(initialFormData2);
    setErrors({});
    setIsModified(false);
    Swal.fire({
      title: "¡Limpiado!",
      text: "Los formularios se han limpiado.",
      icon: "info",
      confirmButtonColor: "#6b0f1a",
    });
  };

  // Reset Form2 (limpia solo administrativo)
  const resetForm2 = () => {
    setFormData2(initialFormData2);
    setErrors({});
    setIsModified(false);
    Swal.fire({
      title: "¡Limpiado!",
      text: "El formulario administrativo se ha limpiado.",
      icon: "info",
      confirmButtonColor: "#6b0f1a",
    });
  };

  // Calcular monto total
  const montoCobrar = formData1.productos.reduce(
    (acc, producto) => acc + (parseFloat(producto.cantidad || 0) * parseFloat(producto.precio || 0)),
    0
  );

  return (
    <div className="dual-form-container">
      {/* Pestañas para alternar entre formularios */}
      <div className="form-tabs">
        <button
          className={`tab-btn ${activeTab === "form1" ? "active" : ""}`}
          onClick={() => setActiveTab("form1")}
        >
          COD - YARA
        </button>
        <button
          className={`tab-btn ${activeTab === "form2" ? "active" : ""}`}
          onClick={() => setActiveTab("form2")}
        >
          ADMINISTRATIVO
        </button>
      </div>

      <div className="forms-wrapper">
        {/* Primer formulario (COD - YARA) */}
        <div className={`form-container ${activeTab === "form1" ? "active" : ""}`}>
          <h2 className="form-title">COD - YARA</h2>

          {/* BUSCAR */}
          <div className="form-group search-row">
            <div className="search-container">
              <input
                type="text"
                name="buscar"
                placeholder="Ingrese código o nombre de cliente"
                value={formData1.buscar}
                onChange={handleChange1}
                className={errors.buscar ? "error" : ""}
              />
              {errors.buscar && <span className="error-message">{errors.buscar}</span>}
            </div>
            <button className="btn blue" onClick={buscarPedido}>
              <Search size={18} /> BUSCAR
            </button>
          </div>

          {/* INFO PRINCIPAL */}
          <div className="form-grid">
            <div className="input-group">
              <label>Asesor:</label>
              <input
                type="text"
                name="asesor"
                value={formData1.asesor}
                onChange={handleChange1}
              />
            </div>

            <div className="input-group">
              <label>Estado:</label>
              <select name="estado" value={formData1.estado} onChange={handleChange1}>
                <option value="">Seleccione...</option>
                <option value="pendiente">Pendiente</option>
                <option value="confirmado">Confirmado</option>
                <option value="cancelado">Cancelado</option>
                <option value="entregado">Entregado</option>
                <option value="en-camino">En camino</option>
              </select>
            </div>

            <div className="input-group">
              <label>Código:</label>
              <input
                type="text"
                name="codigo"
                value={formData1.codigo}
                onChange={handleChange1}
              />
            </div>

            <div className="input-group">
              <label>N° Celular: *</label>
              <input
                type="text"
                name="celular"
                value={formData1.celular}
                onChange={handleChange1}
                className={errors.celular ? "error" : ""}
              />
              {errors.celular && <span className="error-message">{errors.celular}</span>}
            </div>

            <div className="input-group">
              <label>Cliente: *</label>
              <input
                type="text"
                name="cliente"
                value={formData1.cliente}
                onChange={handleChange1}
                className={errors.cliente ? "error" : ""}
              />
              {errors.cliente && <span className="error-message">{errors.cliente}</span>}
            </div>

            <div className="input-group">
              <label>ubicacion:</label>
              <input
                type="text"
                name="ubicacion"
                value={formData1.ubicacion}
                onChange={handleChange1}
              />
            </div>

            <div className="input-group full-width">
              <label>Dirección: *</label>
              <input
                type="text"
                name="direccion"
                value={formData1.direccion}
                onChange={handleChange1}
                className={errors.direccion ? "error" : ""}
              />
              {errors.direccion && <span className="error-message">{errors.direccion}</span>}
            </div>

            <div className="input-group full-width">
              <label>Referencias:</label>
              <input
                type="text"
                name="referencias"
                value={formData1.referencias}
                onChange={handleChange1}
              />
            </div>
          </div>

          {/* PRODUCTOS */}
          <div className="products-section">
            <div className="section-header">
              <h3 className="section-title">Productos</h3>
              <button className="btn green" onClick={addProductField}>
                <Plus size={16} /> Añadir Producto
              </button>
            </div>

            <div className="products-table">
              <div className="table-header">
                <span>Producto</span>
                <span>Cantidad</span>
                <span>Precio Unit. (S/.)</span>
                <span>Subtotal (S/.)</span>
                <span>Acción</span>
              </div>

              {formData1.productos.map((producto, index) => (
                <div className="product-row" key={index}>
                  <input
                    type="text"
                    placeholder={`Nombre del producto ${index + 1}`}
                    value={producto.nombre}
                    onChange={(e) => handleProductChange(index, "nombre", e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="0"
                    min="1"
                    value={producto.cantidad}
                    onChange={(e) => handleProductChange(index, "cantidad", e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={producto.precio}
                    onChange={(e) => handleProductChange(index, "precio", e.target.value)}
                  />
                  <div className="subtotal">
                    S/. {(parseFloat(producto.cantidad || 0) * parseFloat(producto.precio || 0)).toFixed(2)}
                  </div>
                  <button
                    className="btn-remove"
                    onClick={() => removeProductField(index)}
                    disabled={formData1.productos.length <= 1}
                  >
                    <Minus size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* MONTO TOTAL */}
            <div className="total-box">
              MONTO TOTAL A COBRAR: <strong>S/. {montoCobrar.toFixed(2)}</strong>
            </div>
          </div>

          {/* NOTAS */}
          <div className="form-notes">
            <div className="input-group">
              <label>Notas de Asesor:</label>
              <textarea
                name="notasAsesor"
                value={formData1.notasAsesor}
                onChange={handleChange1}
                placeholder="Ingrese observaciones del asesor..."
              />
            </div>

            <div className="input-group">
              <label>Notas Supervisión:</label>
              <textarea
                name="notasSupervision"
                value={formData1.notasSupervision}
                onChange={handleChange1}
                placeholder="Ingrese observaciones de supervisión..."
              />
            </div>
          </div>

          {/* BOTONES */}
          <div className="btn-group">
            <button className="btn blue" onClick={handleGuardarFormulario1} disabled={!isModified}>
              <Save size={18} /> GUARDAR
            </button>
            <button className="btn green" onClick={resetForm1}>
              <Trash2 size={18} /> LIMPIAR
            </button>
          </div>
        </div>

        {/* Segundo formulario (ADMINISTRATIVO) */}
        <div className={`form-container administrative ${activeTab === "form2" ? "active" : ""}`}>
          <h2 className="form-title administrative-title">ADMINISTRATIVO</h2>

          {/* ESTADO AGENCIAL */}
          <div className="administrative-section">
            <h3 className="section-title administrative-subtitle">
              <Truck size={20} /> ESTADO AGENCIAL
            </h3>

            <div className="form-grid">
              <div className="input-group">
                <label>Estado Agencial:</label>
                <select name="estadoAgencial" value={formData2.estadoAgencial} onChange={handleChange2}>
                  <option value="">Seleccione...</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="en-transito">En tránsito</option>
                  <option value="entregado">Entregado</option>
                  <option value="incidencia">Incidencia</option>
                </select>
              </div>

              <div className="input-group">
                <label>Fecha de envío:</label>
                <div className="input-with-icon">
                  <input
                    type="datetime-local"
                    name="fechaEnvio"
                    value={formData2.fechaEnvio}
                    onChange={handleChange2}
                  />
                  <Calendar size={18} className="input-icon" />
                </div>
              </div>

              <div className="input-group">
                <label>Fecha de llegada:</label>
                <div className="input-with-icon">
                  <input
                    type="datetime-local"
                    name="fechaLlegada"
                    value={formData2.fechaLlegada}
                    onChange={handleChange2}
                  />
                  <Calendar size={18} className="input-icon" />
                </div>
              </div>
            </div>
          </div>

          {/* COSTO DE ENVÍO */}
          <div className="administrative-section">
            <h3 className="section-title administrative-subtitle">
              <DollarSign size={20} /> COSTO DE ENVÍO
            </h3>

            <div className="input-group full-width">
              <label>Costo de envío (Para el Canal Agencial):</label>
              <input
                type="text"
                name="costoEnvio"
                value={formData2.costoEnvio}
                onChange={handleChange2}
                placeholder="Ingrese el costo de envío"
              />
            </div>

            <div className="input-group full-width">
              <label>La de éste cabeza inicial del Código:</label>
              <input
                type="text"
                name="codigoInicial"
                value={formData2.codigoInicial}
                onChange={handleChange2}
                placeholder="Ingrese código inicial"
              />
            </div>
          </div>

          {/* PENDIENTE DE PAGO */}
          <div className="administrative-section">
            <h3 className="section-title administrative-subtitle">PENDIENTE DE PAGO</h3>

            <div className="form-grid">
              <div className="input-group">
                <label>Pendiente de pago:</label>
                <input
                  type="text"
                  name="montoPendiente"
                  value={formData2.montoPendiente}
                  onChange={handleChange2}
                  placeholder="Monto pendiente"
                />
              </div>

              <div className="input-group">
                <label>Fecha Depositada:</label>
                <div className="input-with-icon">
                  <input
                    type="date"
                    name="fechaDepositada"
                    value={formData2.fechaDepositada}
                    onChange={handleChange2}
                  />
                  <Calendar size={18} className="input-icon" />
                </div>
              </div>

              <div className="input-group">
                <label>Medio de Pago:</label>
                <select name="medioPago" value={formData2.medioPago} onChange={handleChange2}>
                  <option value="">Seleccione...</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="yape">Yape/Plin</option>
                </select>
              </div>

              <div className="input-group">
                <label>Número de Operación:</label>
                <input
                  type="text"
                  name="numeroOperacion"
                  value={formData2.numeroOperacion}
                  onChange={handleChange2}
                  placeholder="Número de operación"
                />
              </div>
            </div>
          </div>


          {/* NOTAS ADMINISTRATIVAS */}
          <div className="administrative-section">
            <div className="input-group full-width">
              <label>Notas Administrativas:</label>
              <textarea
                name="notasAdministrativas"
                value={formData2.notasAdministrativas}
                onChange={handleChange2}
                placeholder="Ingrese observaciones administrativas..."
                rows="4"
              />
            </div>
          </div>

          {/* BOTONES */}
          <div className="btn-group">
            <button className="btn blue" onClick={handleGuardarFormulario2} disabled={!isModified}>
              <Save size={18} /> GUARDAR
            </button>
            <button className="btn green" onClick={resetForm2}>
              <Trash2 size={18} /> LIMPIAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormularioExterno;