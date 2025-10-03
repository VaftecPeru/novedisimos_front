import React, { useState } from "react";
import { Search, Save, RefreshCcw, Trash2, Plus, Minus, Calendar, Truck, DollarSign } from "lucide-react";
import "./FormularioExterno.css";

const FormularioExterno = () => {
  // Estado para el primer formulario (COD - YARA)
  const [formData1, setFormData1] = useState({
    buscar: "",
    asesor: "",
    codigo: "",
    estado: "",
    cliente: "",
    celular: "",
    provincia: "",
    distrito: "",
    direccion: "",
    referencias: "",
    productos: [{ nombre: "", cantidad: "", precio: "" }],
    notasAsesor: "",
    notasSupervision: "",
  });

  // Estado para el segundo formulario (ADMINISTRATIVO)
  const [formData2, setFormData2] = useState({
    estadoAgencial: "",
    fechaEnvio: "",
    fechaLlegada: "",
    costoEnvio: "",
    codigoInicial: "",
    pendientePago: "",
    medioDepositado: "",
    fechaDepositada: "",
    medioPago: "",
    numeroOperacion: "",
    notasAdministrativas: ""
  });

  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("form1");

  // Manejar cambios en el primer formulario
  const handleChange1 = (e) => {
    const { name, value } = e.target;
    setFormData1((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Manejar cambios en el segundo formulario
  const handleChange2 = (e) => {
    const { name, value } = e.target;
    setFormData2((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Manejar cambios en productos
  const handleProductChange = (index, field, value) => {
    const updatedProductos = [...formData1.productos];
    updatedProductos[index][field] = value;
    setFormData1({ ...formData1, productos: updatedProductos });
  };

  // Agregar nuevo campo de producto
  const addProductField = () => {
    setFormData1({
      ...formData1,
      productos: [...formData1.productos, { nombre: "", cantidad: "", precio: "" }]
    });
  };

  // Eliminar campo de producto
  const removeProductField = (index) => {
    if (formData1.productos.length <= 1) return;
    
    const updatedProductos = [...formData1.productos];
    updatedProductos.splice(index, 1);
    setFormData1({ ...formData1, productos: updatedProductos });
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
            <button className="btn purple">
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
              <label>Provincia:</label>
              <input 
                type="text" 
                name="provincia" 
                value={formData1.provincia} 
                onChange={handleChange1} 
              />
            </div>

            <div className="input-group">
              <label>Distrito:</label>
              <input 
                type="text" 
                name="distrito" 
                value={formData1.distrito} 
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
              <h3 className="section-title">🛒 Productos</h3>
              <button className="btn-add" onClick={addProductField}>
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
              💰 MONTO TOTAL A COBRAR: <strong>S/. {montoCobrar.toFixed(2)}</strong>
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
            <button className="btn blue">
              <Save size={18} /> GUARDAR
            </button>
            <button className="btn green">
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
                    type="date" 
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
                    type="date" 
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
                  name="pendientePago" 
                  value={formData2.pendientePago} 
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
            <button className="btn blue">
              <Save size={18} /> GUARDAR
            </button>
            <button className="btn green">
              <Trash2 size={18} /> LIMPIAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormularioExterno;