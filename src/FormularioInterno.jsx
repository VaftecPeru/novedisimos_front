import React, { useState, useEffect } from "react";
import "./FormularioInterno.css";
import { fetchEstadosPedidos, fetchOrderByName, fetchPedidoInterno, guardarPedidoInterno } from './components/services/shopifyService';

import { Search, Save, RefreshCcw, Trash2, Plus, Minus } from "lucide-react";
import Swal from 'sweetalert2';

const FormularioInterno = () => {

  const initialFormData = {

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

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isModified, setIsModified] = useState(false);

  const buscarPedido = async () => {
    if (!formData.buscar.trim()) {
      setErrors({ ...errors, buscar: "Ingrese un código o nombre para buscar" });
      return;
    }

    const valorBuscar = formData.buscar.trim();
    const pedidoShopify = await fetchOrderByName(valorBuscar);

    if (pedidoShopify) {
      console.log(`Pedido encontrado (${pedidoShopify.name})`);

      // Buscar si existe en BD 
      const pedidoBD = await fetchPedidoInterno(pedidoShopify.id);

      const estadosInternos = await fetchEstadosPedidos();
      let arrayEstados = Array.isArray(estadosInternos)
        ? estadosInternos
        : (estadosInternos.data || []);

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
            if (order.fulfillment_status === "fulfilled") {
              return "entregado";
            }
            return "en-camino";
          }
          if (estadoInterno.estado_pago === "pagado") {
            return "confirmado";
          }
          if (estadoInterno.estado_pago === "pendiente") {
            return "pendiente";
          }
        }
        if (order.financial_status === "paid") return "confirmado";
        if (order.financial_status === "pending") return "pendiente";
        return "pendiente";
      };

      const noteAttributes = pedidoShopify.note_attributes || [];
      const celularEnAtributos =
        noteAttributes.find((attr) => attr.name === "Celular")?.value || "";
      const provUbicacionEnAtributos =
        noteAttributes.find((attr) => attr.name === "Provincia y Distrito:")?.value || "";
      const direccionEnAtributos =
        noteAttributes.find((attr) => attr.name === "Dirección")?.value || "";
      const referenciasEnAtributos =
        noteAttributes.find((attr) => attr.name === "Referencias")?.value || "";
      const clienteEnAtributos =
        noteAttributes.find((attr) => attr.name === "Nombre y Apellidos")?.value || "";

      const pedidoFormateado = {

        buscar: valorBuscar,
        shopify_order_id: pedidoShopify.id,
        asesor: pedidoShopify.asesor || "Asesor 1",
        codigo: pedidoShopify.name || "",
        estado: mapShopifyStatus(pedidoShopify, estadoInterno),
        cliente: clienteEnAtributos || "",
        celular: celularEnAtributos,
        ubicacion: provUbicacionEnAtributos || "",
        direccion: direccionEnAtributos || "",
        referencias: referenciasEnAtributos || "",
        productos:
          pedidoShopify.line_items && Array.isArray(pedidoShopify.line_items)
            ? pedidoShopify.line_items.map((producto) => ({
              nombre: producto.title || producto.name || "",
              cantidad:
                producto.quantity?.toString() || producto.cantidad?.toString() || "",
              precio:
                producto.price?.toString() || producto.precio?.toString() || "0.00",
            }))
            : initialFormData.productos,

        notasAsesor: pedidoShopify.notasAsesor || pedidoShopify.note || "",
        notasSupervision: pedidoShopify.notasSupervision || "",
        originalOrder: pedidoShopify,
      };

      // Si en BD hay registro
      if (pedidoBD) {
        console.log("Pedido interno encontrado en BD:", pedidoBD);

        pedidoFormateado.asesor = pedidoBD.asesor || pedidoFormateado.asesor;
        pedidoFormateado.estado = pedidoBD.estado || pedidoFormateado.estado;
        pedidoFormateado.cliente = pedidoBD.cliente || pedidoFormateado.cliente;
        pedidoFormateado.celular = pedidoBD.celular || pedidoFormateado.celular;
        pedidoFormateado.ubicacion = pedidoBD.provincia_distrito || pedidoFormateado.ubicacion;
        pedidoFormateado.direccion = pedidoBD.direccion || pedidoFormateado.direccion;
        pedidoFormateado.referencias = pedidoBD.referencias || pedidoFormateado.referencias;
        pedidoFormateado.notasAsesor = pedidoBD.notas_asesor || pedidoFormateado.notasAsesor;
        pedidoFormateado.notasSupervision = pedidoBD.notas_supervisor || pedidoFormateado.notasSupervision;

        // Productos de BD reemplazan si existen
        if (pedidoBD.productos && pedidoBD.productos.length > 0) {
          pedidoFormateado.productos = pedidoBD.productos.map((p) => ({
            nombre: p.nombre_producto,
            cantidad: String(p.cantidad),
            precio: String(p.precio_unitario),
          }));
        }
      }

      setFormData(pedidoFormateado);
    } else {
      console.log("Pedido no encontrado");
      setFormData(initialFormData);
    }
  };


  // Mostrar alerta de confirmación con SweetAlert2
  const showConfirmationAlert = (title, message, onConfirm) => {
    Swal.fire({
      title: title,
      text: message,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6b0f1a',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'SI, cambiar',
      cancelButtonText: 'Cancelar',
      background: '#fff',
      customClass: {
        popup: 'custom-swal-popup',
        title: 'custom-swal-title',
        confirmButton: 'custom-swal-confirm-btn',
        cancelButton: 'custom-swal-cancel-btn'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        onConfirm();
      }
    });
  };

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setIsModified(true);
  };


  // Manejar cambios en productos
  const handleProductChange = (index, field, value) => {
    const updatedProductos = [...formData.productos];
    updatedProductos[index][field] = value;
    setFormData({ ...formData, productos: updatedProductos });
    setIsModified(true);
  };

  // Agregar nuevo campo de producto
  const addProductField = () => {
    setFormData({
      ...formData,
      productos: [...formData.productos, { nombre: "", cantidad: "", precio: "" }]
    });
    setIsModified(true);
  };

  // Eliminar campo de producto
  const removeProductField = (index) => {
    if (formData.productos.length <= 1) return;

    const updatedProductos = [...formData.productos];
    updatedProductos.splice(index, 1);
    setFormData({ ...formData, productos: updatedProductos });
    setIsModified(true);
  };

  // Limpiar formulario
  const handleLimpiarFormulario = () => {
    showConfirmationAlert(
      "¿Limpiar formulario?",
      "Se perderán todos los datos no guardados. ¿Estás seguro?",
      () => {
        setFormData(initialFormData);
        setErrors({});

        // Mostrar alerta de éxito
        Swal.fire({
          title: '¡Formulario limpiado!',
          text: 'El formulario se ha restablecido correctamente.',
          icon: 'success',
          confirmButtonColor: '#6b0f1a',
          confirmButtonText: 'OK'
        });
      }
    );
  };

  // Validar formulario
  const validarFormulario = () => {
    const newErrors = {};

    if (!formData.cliente) newErrors.cliente = "El cliente es requerido";
    if (!formData.celular) newErrors.celular = "El celular es requerido";
    if (!formData.direccion) newErrors.direccion = "La dirección es requerida";

    // Validar productos
    formData.productos.forEach((producto, index) => {
      if (producto.nombre && (!producto.cantidad || !producto.precio)) {
        newErrors[`producto-${index}`] = "Complete cantidad y precio si añade un producto";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  // Guardar formulario
  const handleGuardarFormulario = async () => {
    if (!validarFormulario()) return;

    showConfirmationAlert(
      "¿Guardar pedido?",
      "¿Estás seguro de que deseas guardar este pedido?",
      async () => {
        try {
          const payload = {
            shopify_order_id: formData.shopify_order_id,
            asesor: formData.asesor,
            estado: formData.estado,
            codigo: formData.codigo,
            celular: formData.celular,
            cliente: formData.cliente,
            provincia_distrito: formData.ubicacion,
            direccion: formData.direccion,
            referencias: formData.referencias,
            notas_asesor: formData.notasAsesor,
            notas_supervisor: formData.notasSupervision,
            productos: formData.productos
              ? formData.productos.map((p) => ({

                nombre: p.nombre,
                cantidad: p.cantidad,
                precio: p.precio,
              }))
              : [],
          };

          console.log("Datos que se enviarán:", JSON.stringify(payload, null, 2));

          const data = await guardarPedidoInterno(payload, formData.shopify_order_id);

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
          console.error("❌ Error al guardar:", error);
          Swal.fire({
            title: "Error",
            text: "No se pudo guardar el pedido: " + error.message,
            icon: "error",
            confirmButtonColor: "#6b0f1a",
          });
        }

      }
    )
  };




  // Calcular monto total
  const montoCobrar = formData.productos.reduce(
    (acc, producto) => acc + (parseFloat(producto.cantidad || 0) * parseFloat(producto.precio || 0)),
    0
  );

  return (
    <div className="form-container-interno">
      <h2 className="form-title">COD - YARA</h2>

      {/* BUSCAR */}
      <div className="form-group search-row">
        <div className="search-container">
          <input
            type="text"
            name="buscar"
            placeholder="Ingrese código o nombre de cliente"
            value={formData.buscar}
            onChange={handleChange}
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
            value={formData.asesor}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>Estado:</label>
          <select name="estado" value={formData.estado} onChange={handleChange}>
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
            value={formData.codigo}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>N° Celular: *</label>
          <input
            type="text"
            name="celular"
            value={formData.celular}
            onChange={handleChange}
            className={errors.celular ? "error" : ""}
          />
          {errors.celular && <span className="error-message">{errors.celular}</span>}
        </div>

        <div className="input-group">
          <label>Cliente: *</label>
          <input
            type="text"
            name="cliente"
            value={formData.cliente}
            onChange={handleChange}
            className={errors.cliente ? "error" : ""}
          />
          {errors.cliente && <span className="error-message">{errors.cliente}</span>}
        </div>

        <div className="input-group">
          <label>Provincia y Distrito:</label>
          <input
            type="text"
            name="ubicacion"
            value={formData.ubicacion}
            onChange={handleChange}
          />
        </div>


        <div className="input-group full-width">
          <label>Dirección: *</label>
          <input
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            className={errors.direccion ? "error" : ""}
          />
          {errors.direccion && <span className="error-message">{errors.direccion}</span>}
        </div>

        <div className="input-group full-width">
          <label>Referencias:</label>
          <input
            type="text"
            name="referencias"
            value={formData.referencias}
            onChange={handleChange}
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

          {formData.productos.map((producto, index) => (
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
                disabled={formData.productos.length <= 1}
              >
                <Minus size={16} />
              </button>
            </div>
          ))}

          {Object.keys(errors).some(key => key.startsWith('producto-')) && (
            <div className="error-message">
              {Object.entries(errors)
                .filter(([key]) => key.startsWith('producto-'))
                .map(([_, value]) => value)
                .join(', ')}
            </div>
          )}
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
            value={formData.notasAsesor}
            onChange={handleChange}
            placeholder="Ingrese observaciones del asesor..."
          />
        </div>

        <div className="input-group">
          <label>Notas Supervisión:</label>
          <textarea
            name="notasSupervision"
            value={formData.notasSupervision}
            onChange={handleChange}
            placeholder="Ingrese observaciones de supervisión..."
          />
        </div>
      </div>

      {/* BOTONES */}
      <div className="btn-group">
        <button
          className="btn blue"
          onClick={handleGuardarFormulario}
          disabled={!isModified}
        >
          <Save size={18} /> {isModified ? "GUARDAR CAMBIOS" : "GUARDADO"}
        </button>
        <button className="btn green" onClick={handleLimpiarFormulario}>
          <Trash2 size={18} /> LIMPIAR
        </button>
      </div>
    </div>
  );

};
export default FormularioInterno; 