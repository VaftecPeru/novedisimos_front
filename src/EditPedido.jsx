import React, { useState, useEffect } from "react";
import {
  getOrderById,
  fetchVariantesMediaSelect,
  actualizarPedido,
} from "./components/services/shopifyService";
import Swal from "sweetalert2";
const PAIS_UNICO = {
  name: "Perú",
  code: "PE",
};

const PROVINCIAS_PERU = [
  { name: "Amazonas", code: "PE-AMA" },
  { name: "Áncash", code: "PE-ANC" },
  { name: "Apurímac", code: "PE-APU" },
  { name: "Arequipa", code: "PE-ARE" },
  { name: "Ayacucho", code: "PE-AYA" },
  { name: "Cajamarca", code: "PE-CAJ" },
  { name: "Callao", code: "PE-CAL" },
  { name: "Cusco", code: "PE-CUS" },
  { name: "Huancavelica", code: "PE-HUV" },
  { name: "Huánuco", code: "PE-HUC" },
  { name: "Ica", code: "PE-ICA" },
  { name: "Junín", code: "PE-JUN" },
  { name: "La Libertad", code: "PE-LAL" },
  { name: "Lambayeque", code: "PE-LAM" },
  { name: "Lima (departamento)", code: "PE-LIM" },
  { name: "Lima (provincia)", code: "PE-LMA" },
  { name: "Loreto", code: "PE-LOR" },
  { name: "Madre de Dios", code: "PE-MDD" },
  { name: "Moquegua", code: "PE-MOQ" },
  { name: "Pasco", code: "PE-PAS" },
  { name: "Piura", code: "PE-PIU" },
  { name: "Puno", code: "PE-PUN" },
  { name: "San Martín", code: "PE-SAM" },
  { name: "Tacna", code: "PE-TAC" },
  { name: "Tumbes", code: "PE-TUM" },
  { name: "Ucayali", code: "PE-UCA" },
];

export default function EditPedido({ open, onClose, pedido, onUpdate }) {
  if (!open) return null;

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [notes, setNotes] = useState("");
  const [email, setEmail] = useState("");
  const [loadingImages, setLoadingImages] = useState(false);

  const [metodoEnvio, setMetodoEnvio] = useState("");
  const [empresaEnvio, setEmpresaEnvio] = useState("");
  const [costoEnvio, setCostoEnvio] = useState("");
  const [primerAbono, setPrimerAbono] = useState("");
  const [saldo, setSaldo] = useState("");
  const [almacen, setAlmacen] = useState("");
  const [shippingMethod, setShippingMethod] = useState("");

  const [shippingLocked, setShippingLocked] = useState(false);

  const [shipping, setShipping] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    company: "",
    address1: "",
    address2: "",
    city: "",
    province: "",
    province_code: "",
    zip: "",
  });

  const [orderTotals, setOrderTotals] = useState({
    subtotal: 0,
    discounts: 0,
    shipping: 0, // <--- Añadimos este
    total: 0,
  });

  useEffect(() => {
    if (!pedido?.id) return;

    const loadOrder = async () => {
      try {
        const response = await getOrderById(pedido.id);
        const order = response.order;

        const hasShopifyShipping =
          order.shipping_lines && order.shipping_lines.length > 0;
        setShippingLocked(hasShopifyShipping);

        setNotes(order.note || "");
        setEmail(order.email || "");

        setShippingMethod(order.shipping_lines?.[0]?.title || "—");

        setOrderTotals({
          subtotal: Number(order.total_line_items_price) || 0,
          discounts: Number(order.total_discounts) || 0,
          shipping: Number(
            order.total_shipping_price_set?.shop_money?.amount || 0
          ),
          total: Number(order.total_price) || 0,
        });
        const addr = order.shipping_address || {};

        setShipping({
          first_name: addr.first_name || "",
          last_name: addr.last_name || "",
          phone: addr.phone || "",
          company: addr.company || "",
          address1: addr.address1 || "",
          address2: addr.address2 || "",
          city: addr.city || "",
          province: addr.province || "",
          province_code: addr.province_code || "",
          zip: addr.zip || "",
        });

        if (order.line_items) {
          let products = order.line_items.map((item) => ({
            id: item.variant_id || item.id,
            title: item.name || item.title,
            price: Number(item.price),
            quantity: item.quantity || 1,
          }));
          setSelectedProducts(products);

          if (order.line_items.length > 0) {
            setLoadingImages(true);
            const variantIds = order.line_items.map(
              (item) => item.variant_id || item.id
            );
            const images = await fetchVariantesMediaSelect(variantIds);
            products = products.map((p) => {
              const imgObj = images.find((img) => img.id === p.id);
              return {
                ...p,
                image: imgObj?.image || "/images/default-image.png",
              };
            });
            setSelectedProducts(products);
          }
        }

        const attrs = order.note_attributes || [];

        // Leer directamente desde note_attributes
        const attrMetodo =
          attrs.find((a) => a.name === "metodo_envio")?.value || "";
        const attrEmpresa =
          attrs.find((a) => a.name === "empresa_envio")?.value || "";
        const attrCosto =
          attrs.find((a) => a.name === "costo_envio")?.value || "";

        // Establecer valor
        setMetodoEnvio(attrMetodo);
        setEmpresaEnvio(attrEmpresa);
        setCostoEnvio(attrCosto);

        // Otros atributos ya existentes
        setPrimerAbono(
          attrs.find((a) => a.name === "primer_abono")?.value || ""
        );
        setSaldo(attrs.find((a) => a.name === "saldo")?.value || "");
        setAlmacen(attrs.find((a) => a.name === "almacen")?.value || "");
      } catch (err) {
        console.error("Error cargando pedido:", err);
      } finally {
        setLoadingImages(false);
      }
    };

    loadOrder();
  }, [pedido]);

  const total = selectedProducts.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Construcción del payload
    const dataToSend = {
      note: notes,
      email,
      first_name: shipping.first_name,
      last_name: shipping.last_name,
      company: shipping.company,
      address1: shipping.address1,
      address2: shipping.address2,
      city: shipping.city,
      province: shipping.province,
      province_code: shipping.province_code,
      country: PAIS_UNICO.name,
      country_code: PAIS_UNICO.code,
      zip: shipping.zip,
      phone: shipping.phone,

      // Campos personalizados
      metodo_envio: metodoEnvio,
      empresa_envio: empresaEnvio,
      costo_envio: costoEnvio,
      primer_abono: primerAbono,
      saldo: saldo,
      almacen: almacen,
    };

    // Confirmación
    const { isConfirmed } = await Swal.fire({
      title: "¿Guardar cambios?",
      text: "Se actualizará el pedido.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
    });

    if (!isConfirmed) return;

    // Loader
    Swal.fire({
      title: "Guardando cambios...",
      text: "Por favor espera",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      console.log("Enviando actualización:", dataToSend);

      await actualizarPedido(pedido.id, dataToSend);

      Swal.close();

      await Swal.fire({
        title: "¡Actualizado!",
        text: "El pedido fue actualizado correctamente.",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });

      onUpdate?.();
      onClose();
    } catch (err) {
      Swal.close();

      Swal.fire(
        "Error",
        err.message || "No se pudo actualizar el pedido",
        "error"
      );

      console.error("Error actualizando pedido:", err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="form-card">
          <div className="header-row">
            <h3>Editar Pedido #{pedido?.name || pedido?.id}</h3>
            <button className="btn-discard" onClick={onClose}>
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-content-grid">
              <div className="left-column-productos">
                <div className="form-group-border">
                  <label>Productos ({selectedProducts.length})</label>

                  <div
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: 8,
                      padding: 12,
                      maxHeight: 540,
                      overflowY: "auto",
                      background: "#fdfdfd",
                      marginTop: "8px",
                    }}
                  >
                    {loadingImages ? (
                      <div style={{ textAlign: "center", padding: 20 }}>
                        Cargando imágenes...
                      </div>
                    ) : selectedProducts.length === 0 ? (
                      <p
                        style={{
                          textAlign: "center",
                          color: "#888",
                          margin: 20,
                        }}
                      >
                        No hay productos
                      </p>
                    ) : (
                      selectedProducts.map((p) => (
                        <div
                          key={p.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "8px 0",
                            borderBottom: "1px solid #eee",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              flexGrow: 1,
                            }}
                          >
                            <img
                              src={p.image}
                              alt={p.title}
                              style={{
                                width: 40,
                                height: 40,
                                objectFit: "cover",
                                marginRight: 10,
                              }}
                            />
                            <div>
                              <div style={{ fontWeight: 500 }}>{p.title}</div>
                              <small>S/ {p.price.toFixed(2)} c/u</small>
                            </div>
                          </div>
                          <div>Cantidad: {p.quantity}</div>
                        </div>
                      ))
                    )}
                  </div>
                  <div
                    style={{
                      marginTop: 15,
                      padding: "10px 5px",
                      borderTop: "2px solid #eee",
                      fontSize: "0.9rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <span>Suma de productos:</span>
                      <span>S/ {orderTotals.subtotal.toFixed(2)}</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <span>Descuentos totales:</span>
                      <span>- S/ {orderTotals.discounts.toFixed(2)}</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <span>Método de envío (Shopify):</span>
                      <span>{shippingMethod}</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <span>Costo de envío (Shopify):</span>
                      <span>S/ {orderTotals.shipping.toFixed(2)}</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: 8,
                        fontWeight: "bold",
                        fontSize: "1rem",
                        color: "#2e7d32",
                      }}
                    >
                      <span>Total a Pagar:</span>
                      <span>S/ {orderTotals.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="form-group-border">
                  <div className="form-group">
                    <label>Método de Envío (Personalizado)</label>
                    <input
                      className="input-field"
                      value={metodoEnvio}
                      onChange={(e) => setMetodoEnvio(e.target.value)}
                      disabled={shippingLocked}
                    />
                  </div>
                  <div className="form-group">
                    <label>Empresa de Envío</label>
                    <input
                      className="input-field"
                      value={empresaEnvio}
                      onChange={(e) => setEmpresaEnvio(e.target.value)}
                      disabled={shippingLocked}
                    />
                  </div>
                  <div className="form-group">
                    <label>Costo de Envío</label>
                    <input
                      className="input-field"
                      value={costoEnvio}
                      onChange={(e) => setCostoEnvio(e.target.value)}
                      disabled={shippingLocked}
                    />
                  </div>
                  {/* SOLO mostrar si NO existe shipping_lines */}
                  {!shippingLocked && (
                    <div
                      style={{
                        marginTop: 10,
                        padding: "8px 0",
                        textAlign: "center",
                        fontWeight: "bold",
                        color: "#2e7d32",
                        fontSize: "1rem",
                      }}
                    >
                      Total a pagar (incluye envío Personalizado): S/{" "}
                      {(orderTotals.total + Number(costoEnvio || 0)).toFixed(2)}
                    </div>
                  )}

                  {shippingLocked && (
                    <small
                      style={{
                        color: "red",
                        fontWeight: 500,
                        textAlign: "center",
                        display: "block",
                        marginTop: 8,
                      }}
                    >
                      Shopify ya asignó un método de envío, estos campos no se
                      pueden editar.
                    </small>
                  )}
                </div>
                <div className="form-group-border">
                  <div className="form-group">
                    <label>Primer Abono</label>
                    <input
                      className="input-field"
                      value={primerAbono}
                      onChange={(e) => setPrimerAbono(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Saldo</label>
                    <input
                      className="input-field"
                      value={saldo}
                      onChange={(e) => setSaldo(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group-border">
                  <div className="form-group">
                    <label>Almacén</label>
                    <input
                      className="input-field"
                      value={almacen}
                      onChange={(e) => setAlmacen(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="right-column-productos">
                {/* Notas */}
                <div className="form-group-border">
                  <label>Notas del Pedido</label>
                  <textarea
                    className="input-field"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Notas internas o mensaje del cliente..."
                    style={{ marginTop: 8, width: "100%" }}
                  />
                </div>

                <div className="form-group-border" style={{ marginTop: 20 }}>
                  {/* País fijo */}
                  <div className="form-group">
                    <label>País</label>
                    <select className="input-field" disabled>
                      <option value="PE">Perú</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Nombre</label>
                    <input
                      type="text"
                      className="input-field"
                      value={shipping.first_name}
                      onChange={(e) =>
                        setShipping({ ...shipping, first_name: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Apellidos</label>
                    <input
                      type="text"
                      className="input-field"
                      value={shipping.last_name}
                      onChange={(e) =>
                        setShipping({ ...shipping, last_name: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      className="input-field"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Teléfono</label>
                    <input
                      type="text"
                      className="input-field"
                      value={shipping.phone}
                      onChange={(e) =>
                        setShipping({ ...shipping, phone: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Dirección 1</label>
                    <input
                      type="text"
                      className="input-field"
                      value={shipping.address1}
                      onChange={(e) =>
                        setShipping({ ...shipping, address1: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Dirección 2 (Opcional)</label>
                    <input
                      type="text"
                      className="input-field"
                      value={shipping.address2}
                      onChange={(e) =>
                        setShipping({ ...shipping, address2: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Distrito / Ciudad</label>
                    <input
                      type="text"
                      className="input-field"
                      value={shipping.city}
                      onChange={(e) =>
                        setShipping({ ...shipping, city: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Código Postal</label>
                    <input
                      type="text"
                      className="input-field"
                      value={shipping.zip}
                      onChange={(e) =>
                        setShipping({ ...shipping, zip: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Departamento</label>
                    <select
                      className="input-field"
                      value={shipping.province_code}
                      onChange={(e) => {
                        const code = e.target.value;
                        const prov = PROVINCIAS_PERU.find(
                          (p) => p.code === code
                        );
                        setShipping({
                          ...shipping,
                          province_code: code,
                          province: prov ? prov.name : "",
                        });
                      }}
                    >
                      <option value="">Seleccionar departamento</option>
                      {PROVINCIAS_PERU.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 30, textAlign: "right" }}>
              <button
                type="button"
                className="btn-discard"
                onClick={onClose}
                style={{ marginRight: 12 }}
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
