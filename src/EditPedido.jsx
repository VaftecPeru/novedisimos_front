// EditPedido.jsx
import React, { useState, useEffect } from "react";

// Simulación de productos (Mismas referencias que en AddPedido para el buscador)
const mockProducts = [
  { id: 1, title: "Producto A", price: 25, quantity: 1 },
  { id: 2, title: "Producto B", price: 40, quantity: 1 },
  { id: 3, title: "Producto C", price: 15, quantity: 1 },
];

export default function EditPedido({ open, onClose, pedido, onUpdate }) {
  // Si no está abierto, no renderizamos nada (o podrías manejarlo con el padre)
  if (!open) return null;

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [mainSearchInput, setMainSearchInput] = useState("");
  const [cliente, setCliente] = useState("");
  const [notas, setNotas] = useState("");
  const [moneda, setMoneda] = useState("USD");

  // --- Cargar datos del pedido al abrir ---
  useEffect(() => {
    if (pedido) {
      setCliente(pedido.cliente || "");
      setNotas(pedido.nota === "Sin nota" ? "" : pedido.nota || "");
      
      // NOTA: Aquí deberías mapear los productos reales de tu pedido.
      // Como el objeto 'pedido' del dashboard suele tener los items aplanados en strings,
      // aquí simulamos que cargamos productos si existiera la estructura correcta.
      // Si tienes los datos crudos (raw), úsalos aquí:
      if (pedido.line_items_raw) {
         // Lógica para setear selectedProducts desde datos reales
      } else {
         // Por defecto iniciamos vacío o tratamos de parsear lo que haya
         setSelectedProducts([]); 
      }
      
      // Si tuvieras el campo moneda en el objeto pedido:
      // setMoneda(pedido.currency || "USD");
    }
  }, [pedido]);

  // --- Lógica de Productos (Igual que AddPedido) ---
  const handleAddProduct = (prod) => {
    const exists = selectedProducts.find((p) => p.id === prod.id);
    if (exists) {
      handleQuantityChange(prod.id, exists.quantity + 1);
    } else {
      setSelectedProducts((prev) => [...prev, { ...prod, quantity: 1 }]);
    }
    setMainSearchInput("");
  };

  const handleRemoveProduct = (id) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== id));
  };

  const handleQuantityChange = (id, value) => {
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, quantity: parseInt(value) || 1 } : p
      )
    );
  };

  const totalCost = selectedProducts.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0
  );

  // --- Guardar Cambios ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Objeto con los datos editados
    const pedidoActualizado = {
      id: pedido.id, // Importante mantener el ID para el update
      cliente,
      notas,
      moneda,
      products: selectedProducts,
      total: totalCost,
    };

    console.log("Guardando cambios del pedido:", pedidoActualizado);

    // Aquí llamarías a tu servicio de backend, ej: await updateOrder(pedido.id, pedidoActualizado);

    if (onUpdate) onUpdate(); // Notificar al padre para recargar
    onClose(); // Cerrar modal
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="form-card">
          
          {/* Header */}
          <div className="header-row">
            <h3>Editar Pedido #{pedido?.orden || ""}</h3>
            <button className="btn-discard" onClick={onClose}>
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-content-grid">
              
              {/* COLUMNA IZQUIERDA: Productos */}
              <div className="left-column-productos">
                {/* Buscador */}
                <div className="form-group-border">
                  <div className="form-group">
                    <label>Agregar Producto (Buscador)</label>
                    <div style={{ display: "flex", gap: "10px", marginTop: 8 }}>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Buscar para agregar..."
                        value={mainSearchInput}
                        onChange={(e) => setMainSearchInput(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const found = mockProducts.find(
                            (p) =>
                              p.title.toLowerCase().includes(mainSearchInput.toLowerCase())
                          );
                          if (found) handleAddProduct(found);
                        }}
                      >
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lista de productos */}
                <div className="form-group-border">
                  <div className="form-group" style={{ marginTop: 20 }}>
                    <label>Productos en la Orden</label>
                    <div
                      style={{
                        border: "1px solid #e1e1e1",
                        borderRadius: 8,
                        padding: 10,
                        maxHeight: 250,
                        overflowY: "auto",
                        backgroundColor: "#fff"
                      }}
                    >
                      {selectedProducts.length > 0 ? (
                        selectedProducts.map((p) => (
                          <div
                            key={p.id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "5px 0",
                              borderBottom: "1px solid #f0f0f0",
                            }}
                          >
                            <span>{p.title}</span>
                            <div>
                              <input
                                type="number"
                                min={1}
                                value={p.quantity}
                                onChange={(e) =>
                                  handleQuantityChange(p.id, e.target.value)
                                }
                                style={{ width: 50, marginRight: 8 }}
                              />
                              <button
                                type="button"
                                style={{
                                    border: "none", 
                                    background: "transparent", 
                                    cursor: "pointer",
                                    color: "red",
                                    fontWeight: "bold"
                                }}
                                onClick={() => handleRemoveProduct(p.id)}
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div
                          style={{
                            textAlign: "center",
                            color: "#888",
                            padding: 20,
                            fontSize: "0.9em"
                          }}
                        >
                          {/* Mensaje condicional dependiendo de si cargaste datos reales */}
                          No hay productos editables cargados.
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        marginTop: 10,
                        fontWeight: 600,
                        textAlign: "right",
                      }}
                    >
                      Total Estimado: {moneda} {totalCost.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* COLUMNA DERECHA: Datos del Pedido */}
              <div className="right-column-productos">
                
                {/* Notas */}
                <div className="form-group-border">
                  <div className="form-group" style={{ marginTop: 20 }}>
                    <label>Notas</label>
                    <textarea
                      className="input-field"
                      value={notas}
                      onChange={(e) => setNotas(e.target.value)}
                      style={{ width: "100%", height: 60 }}
                    />
                  </div>
                </div>

                {/* Cliente */}
                <div className="form-group-border">
                  <div className="form-group" style={{ marginTop: 20 }}>
                    <label>Cliente / Nombre</label>
                    <input
                      type="text"
                      className="input-field"
                      value={cliente}
                      onChange={(e) => setCliente(e.target.value)}
                      placeholder="Nombre del cliente"
                    />
                  </div>
                </div>

                {/* Moneda */}
                <div className="form-group-border">
                  <div className="form-group">
                    <label>Moneda</label>
                    <select
                      value={moneda}
                      onChange={(e) => setMoneda(e.target.value)}
                      style={{ width: "100%", marginTop: 8, padding: 8, borderRadius: 4, borderColor: "#ccc" }}
                    >
                      <option value="USD">USD</option>
                      <option value="PEN">PEN</option>
                    </select>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer Botones */}
            <div style={{ marginTop: 20, textAlign: "right" }}>
              <button 
                type="button" 
                className="btn-discard" 
                onClick={onClose}
                style={{ marginRight: 10 }}
              >
                Cancelar
              </button>
              <button type="submit" className="btn-base btn-primary">
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}