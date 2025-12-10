import React, { useState } from "react";
// 1. Importar el componente del modal
import ProductPedidoSelectModal from "./ProductPedidoSelectModal"; // Ajusta la ruta si es necesario

// NOTA: El mockProducts ya no es necesario, el modal carga los datos de la API

function AddPedido({ onClose, onPedidoCreated }) {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // 2. Nuevo estado para el modal
  const [cliente, setCliente] = useState("");
  const [notas, setNotas] = useState("");
  const [moneda, setMoneda] = useState("USD");

  // La función handleAddProduct anterior ya no se usa

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

  // --------------------------------------------------------
  // Manejo de productos seleccionados del modal
  // --------------------------------------------------------
  const handleSelectProducts = (newProducts) => {
    // 4. Recibe los productos del modal
    const currentIds = selectedProducts.map((p) => p.id);
    const uniqueNewProducts = newProducts.filter(
      (p) => !currentIds.includes(p.id)
    );

    // Agregamos los nuevos productos. Inicializamos la cantidad en 1.
    // NOTA: Los productos del modal tienen propiedades como 'price', 'title', 'id', 'stock', etc.
    // Las mantenemos aquí para mostrarlas en la UI (tabla de seleccionados).
    const productsToAdd = uniqueNewProducts.map((p) => ({
      ...p,
      quantity: 1, // Inicializar cantidad a 1
    }));

    setSelectedProducts((prev) => [...prev, ...productsToAdd]);
    setIsModalOpen(false); // Cerrar el modal
  };

  const totalCost = selectedProducts.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    // 5. Ajuste CRÍTICO: Mapeamos selectedProducts para crear la estructura final
    // que solo incluye el ID (del producto/variante, según tu API) y la cantidad.
    const productDataForAPI = selectedProducts.map((p) => ({
      // Aquí usas el ID que te devuelve la API (Product ID o Variant ID).
      // Asumimos que el 'id' que viene del modal (p.id) es el que necesitas
      // para crear la línea de pedido. Si es el ID del producto, está bien.
      // Si el ID que necesitas es el de la VARIANTE (que es el más común
      // para los pedidos), asegúrate de que el modal lo devuelva.
      product_variant_id: p.id, // O el nombre de campo que use tu API
      quantity: p.quantity,
    }));

    const pedido = {
      cliente,
      notas,
      moneda,
      // Solo enviamos los IDs y cantidades
      products: productDataForAPI, 
      total: totalCost,
    };
    
    // NOTA: Revisa tu lógica para manejar los límites de los proyectos 
    // (factores de tiempo, dinero, alcance) si este pedido excede algo.
    // Esto es un recordatorio de tus notas guardadas.
    console.log("Pedido creado (Estructura para API):", pedido);
    onPedidoCreated?.(pedido);
    onClose();
  };

  return (
    <>
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
                      <label>Buscar y Agregar Producto</label>
                      <div
                        style={{ display: "flex", gap: "10px", marginTop: 8 }}
                      >
                        {/* 3. Reemplazamos el input de búsqueda manual 
                            con un botón para abrir el modal. */}
                        <button
                          type="button"
                          onClick={() => setIsModalOpen(true)} // Abrir modal
                          className="btn-base btn-secondary"
                          style={{ width: "100%" }}
                        >
                          Seleccionar Productos del Catálogo
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ... El resto de la lista de productos seleccionados es la misma, 
                      pero ahora mostrando 'title' y 'price' que vienen del modal ... */}
                  
                  {/* (Contenido de Productos Seleccionados y Total) */}
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
                              {/* Ahora mostramos datos enriquecidos del producto */}
                              <span style={{ flexGrow: 1 }}>
                                {p.title} (${p.price})
                              </span>
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

                {/* COLUMNA DERECHA: Moneda y otros (sin cambios) */}
                <div className="right-column-productos">
                  {/* ... campos Cliente, Notas y Moneda ... */}
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
      
      {/* 6. Renderizar el Modal */}
      <ProductPedidoSelectModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddProducts={handleSelectProducts}
      />
    </>
  );
}

export default AddPedido;