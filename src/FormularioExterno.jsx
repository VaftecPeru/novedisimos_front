import React, { useState, useEffect } from "react";
import "./FormularioExterno.css";
import { Search, Save, RefreshCcw, Trash2, Plus, Minus } from "lucide-react";

const FormularioExterno = () => {
  // Estado inicial del formulario
  const initialFormData = {
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
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isModified, setIsModified] = useState(false);

  // Efecto para detectar cambios en el formulario
  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData);
    setIsModified(hasChanges);
  }, [formData]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Limpiar error si existe
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Manejar cambios en productos
  const handleProductChange = (index, field, value) => {
    const updatedProductos = [...formData.productos];
    updatedProductos[index][field] = value;
    setFormData({ ...formData, productos: updatedProductos });
  };

  // Agregar nuevo campo de producto
  const addProductField = () => {
    setFormData({
      ...formData,
      productos: [...formData.productos, { nombre: "", cantidad: "", precio: "" }]
    });
  };

  // Eliminar campo de producto
  const removeProductField = (index) => {
    if (formData.productos.length <= 1) return;
    
    const updatedProductos = [...formData.productos];
    updatedProductos.splice(index, 1);
    setFormData({ ...formData, productos: updatedProductos });
  };

  // Limpiar formulario
  const limpiarFormulario = () => {
    if (window.confirm("¿Estás seguro de que deseas limpiar el formulario? Se perderán todos los datos no guardados.")) {
      setFormData(initialFormData);
      setErrors({});
    }
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
  const guardarFormulario = () => {
    if (validarFormulario()) {
      // Aquí iría la lógica para guardar los datos
      console.log("Formulario guardado:", formData);
      alert("Formulario guardado con éxito");
      setIsModified(false);
    }
  };

  // Buscar pedido
  const buscarPedido = () => {
    if (!formData.buscar.trim()) {
      setErrors({ ...errors, buscar: "Ingrese un código o nombre para buscar" });
      return;
    }
    
    // Simulación de búsqueda
    console.log("Buscando:", formData.buscar);
    // Aquí iría la lógica real de búsqueda
  };

  // Calcular monto total
  const montoCobrar = formData.productos.reduce(
    (acc, producto) => acc + (parseFloat(producto.cantidad || 0) * parseFloat(producto.precio || 0)),
    0
  );

  return (
    <div className="form-container">
      <h2 className="form-title">COD - YARA</h2>

      {/* BUSCAR */}
      <div className="search-row">
        <div className="form-group search-container">
          <input
            type="text"
            name="buscar"
            placeholder="🔍 Buscar..."
            value={formData.buscar}
            onChange={handleChange}
            className={errors.buscar ? "error" : ""}
          />
          {errors.buscar && <span className="error-message">{errors.buscar}</span>}
        </div>
        <button className="btn purple" onClick={buscarPedido}>
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
          <label>Provincia:</label>
          <input 
            type="text" 
            name="provincia" 
            value={formData.provincia} 
            onChange={handleChange} 
          />
        </div>

        <div className="input-group">
          <label>Distrito:</label>
          <input 
            type="text" 
            name="distrito" 
            value={formData.distrito} 
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
          💰 MONTO TOTAL A COBRAR: <strong>S/. {montoCobrar.toFixed(2)}</strong>
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
        <button className="btn cyan">
          <RefreshCcw size={18} /> ACTUALIZAR
        </button>
        <button 
          className="btn blue" 
          onClick={guardarFormulario}
          disabled={!isModified}
        >
          <Save size={18} /> {isModified ? "GUARDAR CAMBIOS" : "GUARDADO"}
        </button>
        <button className="btn green" onClick={limpiarFormulario}>
          <Trash2 size={18} /> LIMPIAR
        </button>
      </div>
    </div>
  );
};

export default FormularioExterno;