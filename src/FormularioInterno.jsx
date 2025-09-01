import React, { useState } from "react";
import "./FormularioInterno.css";
import { Search, Save, RefreshCcw, Trash2 } from "lucide-react";

const FormularioInterno = () => {
  const [formData, setFormData] = useState({
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
    productos: Array(5).fill(""),
    cantidades: Array(5).fill(""),
    precios: Array(5).fill(""),
    notasAsesor: "",
    notasSupervision: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const limpiarFormulario = () => {
    setFormData({
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
      productos: Array(5).fill(""),
      cantidades: Array(5).fill(""),
      precios: Array(5).fill(""),
      notasAsesor: "",
      notasSupervision: "",
    });
  };

  const montoCobrar = formData.cantidades.reduce(
    (acc, qty, i) =>
      acc + (parseFloat(qty || 0) * parseFloat(formData.precios[i] || 0)),
    0
  );

  return (
    <div className="form-container">
      <h2 className="form-title">COD - YARA</h2>

      {/* BUSCAR */}
      <div className="form-group search-row">
        <input
          type="text"
          name="buscar"
          placeholder="🔍 Buscar..."
          value={formData.buscar}
          onChange={handleChange}
        />
        <button className="btn purple">
          <Search /> BUSCAR
        </button>
      </div>

      {/* INFO PRINCIPAL */}
      <div className="form-grid">
        <label>Asesor:</label>
        <input type="text" name="asesor" value={formData.asesor} onChange={handleChange} />

        <label>Estado:</label>
        <select name="estado" value={formData.estado} onChange={handleChange}>
          <option value="">Seleccione...</option>
          <option value="pendiente">Pendiente</option>
          <option value="confirmado">Confirmado</option>
          <option value="cancelado">Cancelado</option>
        </select>

        <label>Código:</label>
        <input type="text" name="codigo" value={formData.codigo} onChange={handleChange} />

        <label>N° Celular:</label>
        <input type="text" name="celular" value={formData.celular} onChange={handleChange} />

        <label>Cliente:</label>
        <input type="text" name="cliente" value={formData.cliente} onChange={handleChange} />

        <label>Provincia:</label>
        <input type="text" name="provincia" value={formData.provincia} onChange={handleChange} />

        <label>Distrito:</label>
        <input type="text" name="distrito" value={formData.distrito} onChange={handleChange} />

        <label>Dirección:</label>
        <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} />

        <label>Referencias:</label>
        <input type="text" name="referencias" value={formData.referencias} onChange={handleChange} />
      </div>

      {/* PRODUCTOS */}
      <h3 className="section-title">🛒 Productos</h3>
      <div className="products-table">
        {formData.productos.map((_, i) => (
          <div className="product-row" key={i}>
            <input
              type="text"
              placeholder={`Producto ${i + 1}`}
              value={formData.productos[i]}
              onChange={(e) => {
                const productos = [...formData.productos];
                productos[i] = e.target.value;
                setFormData({ ...formData, productos });
              }}
            />
            <input
              type="number"
              placeholder={`Cantidad ${i + 1}`}
              value={formData.cantidades[i]}
              onChange={(e) => {
                const cantidades = [...formData.cantidades];
                cantidades[i] = e.target.value;
                setFormData({ ...formData, cantidades });
              }}
            />
            <input
              type="number"
              placeholder="Precio"
              value={formData.precios[i]}
              onChange={(e) => {
                const precios = [...formData.precios];
                precios[i] = e.target.value;
                setFormData({ ...formData, precios });
              }}
            />
          </div>
        ))}
      </div>

      {/* MONTO */}
      <div className="total-box">
        💰 MONTO A COBRAR: <strong>S/. {montoCobrar.toFixed(2)}</strong>
      </div>

      {/* NOTAS */}
      <div className="form-notes">
        <label>Notas de Asesor:</label>
        <textarea name="notasAsesor" value={formData.notasAsesor} onChange={handleChange} />

        <label>Notas Supervisión:</label>
        <textarea
          name="notasSupervision"
          value={formData.notasSupervision}
          onChange={handleChange}
        />
      </div>

      {/* BOTONES */}
      <div className="btn-group">
        <button className="btn cyan">
          <RefreshCcw /> ACTUALIZAR
        </button>
        <button className="btn blue">
          <Save /> GUARDAR
        </button>
        <button className="btn green" onClick={limpiarFormulario}>
          <Trash2 /> LIMPIAR
        </button>
      </div>
    </div>
  );
};

export default FormularioInterno;