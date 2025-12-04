import React, { useState, useEffect } from "react";

// Lista de países (puedes agregar más si es necesario)
const countries = [
  { code: "PE", name: "Peru" },
  { code: "US", name: "United States" },
  // Agrega otros países según necesites
];

// Lista de provincias/departamentos de Perú con códigos estándar
const peruvianProvinces = [
  { code: "AMA", name: "Amazonas" },
  { code: "ANC", name: "Áncash" },
  { code: "APU", name: "Apurímac" },
  { code: "ARE", name: "Arequipa" },
  { code: "AYA", name: "Ayacucho" },
  { code: "CAJ", name: "Cajamarca" },
  { code: "CAL", name: "Callao" },
  { code: "CUS", name: "Cusco" },
  { code: "HUV", name: "Huancavelica" },
  { code: "HUC", name: "Huánuco" },
  { code: "ICA", name: "Ica" },
  { code: "JUN", name: "Junín" },
  { code: "LAL", name: "La Libertad" },
  { code: "LAM", name: "Lambayeque" },
  { code: "LIM", name: "Lima" },
  { code: "LOR", name: "Loreto" },
  { code: "MDD", name: "Madre de Dios" },
  { code: "MOQ", name: "Moquegua" },
  { code: "PAS", name: "Pasco" },
  { code: "PIU", name: "Piura" },
  { code: "PUN", name: "Puno" },
  { code: "SAM", name: "San Martín" },
  { code: "TAC", name: "Tacna" },
  { code: "TUM", name: "Tumbes" },
  { code: "UCA", name: "Ucayali" },
];

// Simulación de productos para el buscador (mantengo como placeholder, en real fetch de API)
const mockProducts = [
  { id: 1, title: "Producto A", price: 25, quantity: 1 },
  { id: 2, title: "Producto B", price: 40, quantity: 1 },
  { id: 3, title: "Producto C", price: 15, quantity: 1 },
];

export default function EditPedido({ open, onClose, pedido, onUpdate }) {
  if (!open) return null;

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [mainSearchInput, setMainSearchInput] = useState("");
  const [notes, setNotes] = useState("");
  const [email, setEmail] = useState("");
  const [shippingAddress, setShippingAddress] = useState({});
  const [moneda, setMoneda] = useState("USD");

  // Estados para sub-modals
  const [editNotesOpen, setEditNotesOpen] = useState(false);
  const [tempNotes, setTempNotes] = useState("");
  const [editClientOpen, setEditClientOpen] = useState(false);
  const [tempEmail, setTempEmail] = useState("");
  const [tempShipping, setTempShipping] = useState({});

  // Cargar datos del pedido (asumiendo que 'pedido' es el objeto completo de Shopify)
  useEffect(() => {
    if (pedido) {
      setNotes(pedido.note || "");
      setEmail(pedido.email || "");
      setShippingAddress(
        pedido.shipping_address || {
          first_name: "",
          last_name: "",
          company: null,
          address1: "",
          address2: "",
          city: "",
          province: "",
          province_code: "",
          country: "",
          country_code: "",
          zip: "",
          phone: "",
        }
      );
      setMoneda(pedido.currency || "USD");

      // Cargar productos desde line_items (real)
      if (pedido.line_items) {
        setSelectedProducts(
          pedido.line_items.map((li) => ({
            id: li.variant_id,
            title: li.name,
            price: li.price,
            quantity: li.quantity,
          }))
        );
      }
    }
  }, [pedido]);

  // Lógica de productos (igual)
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

  // Abrir sub-modal de notas
  const openEditNotes = () => {
    setTempNotes(notes);
    setEditNotesOpen(true);
  };

  // Guardar notas desde sub-modal
  const saveNotes = () => {
    setNotes(tempNotes);
    setEditNotesOpen(false);
  };

  // Abrir sub-modal de cliente/dirección
  const openEditClient = () => {
    setTempEmail(email);
    setTempShipping({ ...shippingAddress });
    setEditClientOpen(true);
  };

  // Guardar cliente/dirección desde sub-modal
  const saveClient = () => {
    setEmail(tempEmail);
    setShippingAddress(tempShipping);
    setEditClientOpen(false);
  };

  // Guardar cambios principales
  const handleSubmit = async (e) => {
    e.preventDefault();

    const pedidoActualizado = {
      id: pedido.id,
      email,
      shipping_address: shippingAddress,
      note: notes,
      line_items: selectedProducts.map((p) => ({
        variant_id: p.id,
        quantity: p.quantity,
      })),
      currency: moneda,
      // Agrega más campos si necesitas, como note_attributes
    };

    console.log("Guardando cambios del pedido:", pedidoActualizado);
    // Aquí llama a tu backend: await updateOrder(pedido.id, pedidoActualizado);

    if (onUpdate) onUpdate();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="form-card">
          <div className="header-row">
            <h3>Editar Pedido #{pedido?.name || pedido?.id || ""}</h3>{" "}
            {/* Usa 'name' como en Shopify para #orden */}
            <button className="btn-discard" onClick={onClose}>
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-content-grid">
              {/* COLUMNA IZQUIERDA: Productos (editable directamente) */}
              <div className="left-column-productos">
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
                          const found = mockProducts.find((p) =>
                            p.title
                              .toLowerCase()
                              .includes(mainSearchInput.toLowerCase())
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
                    <label>Productos en la Orden</label>
                    <div
                      style={{
                        border: "1px solid #e1e1e1",
                        borderRadius: 8,
                        padding: 10,
                        maxHeight: 250,
                        overflowY: "auto",
                        backgroundColor: "#fff",
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
                                  fontWeight: "bold",
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
                            fontSize: "0.9em",
                          }}
                        >
                          No hay productos.
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

              {/* COLUMNA DERECHA: Datos del Pedido (mostrar con icono editar) */}
              <div className="right-column-productos">
                {/* Sección Notas */}
                <div className="form-group-border">
                  <div className="form-group" style={{ marginTop: 20 }}>
                    <label>
                      Notas{" "}
                      <button
                        type="button"
                        onClick={openEditNotes}
                        style={{
                          marginLeft: 10,
                          fontSize: "0.8em",
                          cursor: "pointer",
                        }}
                      >
                        Editar
                      </button>
                    </label>
                    <div style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>
                      {notes || "Sin nota"}
                    </div>
                  </div>
                </div>

                {/* Sección Cliente y Dirección */}
                <div className="form-group-border">
                  <div className="form-group" style={{ marginTop: 20 }}>
                    <label>
                      Cliente y Dirección de Envío{" "}
                      <button
                        type="button"
                        onClick={openEditClient}
                        style={{
                          marginLeft: 10,
                          fontSize: "0.8em",
                          cursor: "pointer",
                        }}
                      >
                        Editar
                      </button>
                    </label>
                    <div style={{ marginTop: 8 }}>
                      <p>
                        Nombre: {shippingAddress.first_name}{" "}
                        {shippingAddress.last_name}
                      </p>
                      <p>Email: {email || "Sin email"}</p>
                      <p>Teléfono: {shippingAddress.phone || "Sin teléfono"}</p>
                      <p>
                        Dirección: {shippingAddress.address1 || ""}{" "}
                        {shippingAddress.address2 || ""},{" "}
                        {shippingAddress.city || ""},{" "}
                        {shippingAddress.province || ""},{" "}
                        {shippingAddress.country || ""}{" "}
                        {shippingAddress.zip || ""}
                      </p>
                      <p>
                        Compañía: {shippingAddress.company || "Sin compañía"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Moneda (mantiene editable directo) */}
                <div className="form-group-border">
                  <div className="form-group">
                    <label>Moneda</label>
                    <select
                      value={moneda}
                      onChange={(e) => setMoneda(e.target.value)}
                      style={{
                        width: "100%",
                        marginTop: 8,
                        padding: 8,
                        borderRadius: 4,
                        borderColor: "#ccc",
                      }}
                    >
                      <option value="PEN">PEN</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
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

      {/* Sub-Modal para Editar Notas */}
      {editNotesOpen && (
        <div className="modal-overlay" onClick={() => setEditNotesOpen(false)}>
          <div
            className="modal-container form-group-border"
            onClick={(e) => e.stopPropagation()}
            style={{ width: "400px" }}
          >
            <h3>Editar Notas</h3>
            <textarea
              className="input-field"
              value={tempNotes}
              onChange={(e) => setTempNotes(e.target.value)}
              style={{ width: "100%", height: 100 }}
            />
            <div style={{ marginTop: 20, textAlign: "right" }}>
              <button
                onClick={() => setEditNotesOpen(false)}
                style={{ marginRight: 10 }}
              >
                Cancelar
              </button>
              <button onClick={saveNotes}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Modal para Editar Cliente y Dirección */}
      {editClientOpen && (
        <div className="modal-overlay" onClick={() => setEditClientOpen(false)}>
          <div
            className="modal-container form-group-border"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "500px",
              maxHeight: "60vh",
              overflowY: "auto",
            }}
          >
            <h3>Editar Información del Cliente y Dirección</h3>
            <form>
              <div className="form-group">
                <label>Nombre</label>
                <input
                  className="input-field"
                  type="text"
                  value={tempShipping.first_name}
                  onChange={(e) =>
                    setTempShipping({
                      ...tempShipping,
                      first_name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Apellido</label>
                <input
                  className="input-field"
                  type="text"
                  value={tempShipping.last_name}
                  onChange={(e) =>
                    setTempShipping({
                      ...tempShipping,
                      last_name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  className="input-field"
                  type="email"
                  value={tempEmail}
                  onChange={(e) => setTempEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input
                  className="input-field"
                  type="text"
                  value={tempShipping.phone}
                  onChange={(e) =>
                    setTempShipping({ ...tempShipping, phone: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Compañía</label>
                <input
                  className="input-field"
                  type="text"
                  value={tempShipping.company || ""}
                  onChange={(e) =>
                    setTempShipping({
                      ...tempShipping,
                      company: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Dirección 1</label>
                <input
                  className="input-field"
                  type="text"
                  value={tempShipping.address1}
                  onChange={(e) =>
                    setTempShipping({
                      ...tempShipping,
                      address1: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Dirección 2</label>
                <input
                  className="input-field"
                  type="text"
                  value={tempShipping.address2 || ""}
                  onChange={(e) =>
                    setTempShipping({
                      ...tempShipping,
                      address2: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Ciudad</label>
                <input
                  className="input-field"
                  type="text"
                  value={tempShipping.city}
                  onChange={(e) =>
                    setTempShipping({ ...tempShipping, city: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>País</label>
                <select
                  value={tempShipping.country_code || ""}
                  onChange={(e) => {
                    const code = e.target.value;
                    const country = countries.find((c) => c.code === code);
                    setTempShipping({
                      ...tempShipping,
                      country_code: code,
                      country: country ? country.name : "",
                      province: "",
                      province_code: "",
                    });
                  }}
                >
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              {tempShipping.country_code === "PE" && (
                <div className="form-group">
                  <label>Provincia/Departamento</label>
                  <select
                    value={tempShipping.province_code || ""}
                    onChange={(e) => {
                      const code = e.target.value;
                      const prov = peruvianProvinces.find(
                        (p) => p.code === code
                      );
                      setTempShipping({
                        ...tempShipping,
                        province_code: code,
                        province: prov ? prov.name : "",
                      });
                    }}
                  >
                    <option value="">Selecciona</option>
                    {peruvianProvinces.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>Código Postal</label>
                <input
                  className="input-field"
                  type="text"
                  value={tempShipping.zip || ""}
                  onChange={(e) =>
                    setTempShipping({ ...tempShipping, zip: e.target.value })
                  }
                />
              </div>
            </form>
            <div style={{ marginTop: 20, textAlign: "right" }}>
              <button
                onClick={() => setEditClientOpen(false)}
                style={{ marginRight: 10 }}
              >
                Cancelar
              </button>
              <button onClick={saveClient}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
