import React, { useState } from "react";

// Simulación de productos
const mockProducts = [
  { id: 1, title: "Producto A", price: 25, quantity: 1 },
  { id: 2, title: "Producto B", price: 40, quantity: 1 },
  { id: 3, title: "Producto C", price: 15, quantity: 1 },
];

function AddPedido({ onClose, onPedidoCreated }) {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [mainSearchInput, setMainSearchInput] = useState("");
  const [cliente, setCliente] = useState("");
  const [notas, setNotas] = useState("");
  const [moneda, setMoneda] = useState("USD");

  // Agregar producto desde buscador (mock)
  const handleAddProduct = (prod) => {
    setSelectedProducts((prev) => [...prev, { ...prod }]);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const pedido = {
      cliente,
      notas,
      moneda,
      products: selectedProducts,
      total: totalCost,
    };
    console.log("Pedido creado:", pedido);
    onPedidoCreated?.(pedido);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="form-card">
          <div className="header-row">
            <h3>Nuevo Pedido</h3>
            <button className="btn-discard" onClick={onClose}>
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-content-grid">
              {/* COLUMNA IZQUIERDA: Productos */}
              <div className="left-column-productos">
                <div className="form-group-border">
                  <div className="form-group">
                    <label>Buscar Producto</label>
                    <div style={{ display: "flex", gap: "10px", marginTop: 8 }}>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Escribe para buscar..."
                        value={mainSearchInput}
                        onChange={(e) => setMainSearchInput(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const found = mockProducts.find(
                            (p) =>
                              p.title.toLowerCase() ===
                              mainSearchInput.toLowerCase()
                          );
                          if (found) handleAddProduct(found);
                        }}
                      >
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>

                <div className="form-group-border">
                  <div className="form-group" style={{ marginTop: 20 }}>
                    <label>Productos Seleccionados</label>
                    <div
                      style={{
                        border: "1px solid #e1e1e1",
                        borderRadius: 8,
                        padding: 10,
                        maxHeight: 250,
                        overflowY: "auto",
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
                          }}
                        >
                          No hay productos seleccionados
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
                      Total: {moneda} {totalCost.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* COLUMNA DERECHA: Moneda y otros */}
              <div className="right-column-productos">
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
                <div className="form-group-border">
                  <div className="form-group" style={{ marginTop: 20 }}>
                    <label>Cliente / ID</label>
                    <input
                      type="text"
                      className="input-field"
                      value={cliente}
                      onChange={(e) => setCliente(e.target.value)}
                      placeholder="Nombre o ID del cliente"
                    />
                  </div>
                </div>
                <div className="form-group-border">
                  <div className="form-group">
                    <label>Moneda</label>
                    <select
                      value={moneda}
                      onChange={(e) => setMoneda(e.target.value)}
                      style={{ width: "100%", marginTop: 8 }}
                    >
                      <option value="PEN">PEN</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 20, textAlign: "right" }}>
              <button type="submit" className="btn-base btn-primary">
                Crear Pedido
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddPedido;
