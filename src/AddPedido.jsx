import React, { useState } from "react";
import ProductPedidoSelectModal from "./ProductPedidoSelectModal";
import Swal from "sweetalert2";
import {
  crearPedido,
  fetchVariantesMediaSelect,
} from "./components/services/shopifyService";

const PAIS_UNICO = {
  name: "Perú",
  code: "PE",
};

const PROVINCIAS_PERU = [
  { name: "Amazonas", code: "AMA" },
  { name: "Áncash", code: "ANC" },
  { name: "Apurímac", code: "APU" },
  { name: "Arequipa", code: "ARE" },
  { name: "Ayacucho", code: "AYA" },
  { name: "Cajamarca", code: "CAJ" },
  { name: "Callao", code: "CAL" },
  { name: "Cusco", code: "CUS" },
  { name: "Huancavelica", code: "HUV" },
  { name: "Huánuco", code: "HUC" },
  { name: "Ica", code: "ICA" },
  { name: "Junín", code: "JUN" },
  { name: "La Libertad", code: "LAL" },
  { name: "Lambayeque", code: "LAM" },
  { name: "Lima", code: "LIM" },
  { name: "Loreto", code: "LOR" },
  { name: "Madre de Dios", code: "MDD" },
  { name: "Moquegua", code: "MOQ" },
  { name: "Pasco", code: "PAS" },
  { name: "Piura", code: "PIU" },
  { name: "Puno", code: "PUN" },
  { name: "San Martín", code: "SAM" },
  { name: "Tacna", code: "TAC" },
  { name: "Tumbes", code: "TUM" },
  { name: "Ucayali", code: "UCA" },
];

function AddPedido({ onClose, onPedidoCreated }) {
  const [selectedVariants, setSelectedVariants] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);

  // Datos del cliente
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Dirección
  const [address1, setAddress1] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [provinceCode, setProvinceCode] = useState("");
  const [zip, setZip] = useState("");

  const [country] = useState(PAIS_UNICO.name);
  const [countryCode] = useState(PAIS_UNICO.code);

  // Envío
  const [shippingTitle, setShippingTitle] = useState("");
  const [shippingPrice, setShippingPrice] = useState("");
  const [shippingCode, setShippingCode] = useState("");

  // Tags / notes
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");

  // Manejo variantes
  const handleRemoveVariant = (variantId) => {
    setSelectedVariants((prev) => prev.filter((v) => v.id !== variantId));
  };

  const handleQuantityChange = (id, value) => {
    setSelectedVariants((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, quantity: parseInt(value) || 1 } : v
      )
    );
  };

  const handleSelectVariants = async (variantsFromModal) => {
    const currentIds = selectedVariants.map((v) => v.id);
    const newOnes = variantsFromModal.filter((v) => !currentIds.includes(v.id));

    if (newOnes.length === 0) {
      setIsModalOpen(false);
      return;
    }

    const variantIds = newOnes.map((v) => v.id);
    setLoadingImages(true); // 🔵 Comenzamos carga

    try {
      const images = await fetchVariantesMediaSelect(variantIds);

      const formatted = newOnes.map((v) => {
        const imgObj = images.find((img) => img.id === v.id);
        return {
          ...v,
          quantity: 1,
          image: imgObj?.image || "/images/default-image.png",
        };
      });

      setSelectedVariants((prev) => [...prev, ...formatted]);
    } catch (err) {
      console.error("Error cargando imágenes:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar las imágenes de los productos.",
      });
    } finally {
      setLoadingImages(false); // 🔵 Fin carga
      setIsModalOpen(false);
    }
  };

  const handleProvinceChange = (e) => {
    const selectedValue = e.target.value; // Formato: "LMA|Lima Metropolitana"
    if (selectedValue) {
      const [code, name] = selectedValue.split("|");
      setProvinceCode(code);
      setProvince(name);
    } else {
      setProvinceCode("");
      setProvince("");
    }
  };

  const totalCost = selectedVariants.reduce(
    (sum, v) => sum + (v.price || 0) * v.quantity,
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    // VALIDACIÓN
    if (!countryCode || !provinceCode || !address1 || !city) {
      Swal.fire({
        icon: "warning",
        title: "Datos incompletos",
        text: "Debe seleccionar País, Provincia, y llenar Dirección y Ciudad.",
      });
      return;
    }

    if (selectedVariants.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Sin productos",
        text: "Debes seleccionar al menos un producto.",
      });
      return;
    }

    // 🔵 LOADING
    Swal.fire({
      title: "Procesando...",
      text: "Creando el pedido. Por favor espera...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
    });

    // ARMAR PAYLOAD
    const payload = {
      items: selectedVariants.map((v) => ({
        variant_id: v.id,
        cantidad: v.quantity,
      })),

      first_name: firstName,
      last_name: lastName,
      email,
      phone,

      address1,
      city,
      province,
      province_code: provinceCode,
      zip,
      country,
      country_code: countryCode,

      shipping_title: shippingTitle,
      shipping_price: shippingPrice,
      shipping_code: shippingCode,

      tags,
      note: notes,
    };

    console.log("DATA ENVIADA A BACKEND:", payload);

    try {
      // 🔥 LLAMADA REAL A LA API
      const result = await crearPedido(payload);

      // ✖ ERROR DESDE EL SERVICIO
      if (!result || result.ok === false) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: result.error || "Error creando el pedido.",
        });
        return;
      }

      // ✔ TODO OK
      Swal.fire({
        icon: "success",
        title: "Pedido creado",
        text: "El pedido fue creado exitosamente.",
        confirmButtonColor: "#3085d6",
      });

      // Notificar al padre
      onPedidoCreated?.(result);

      // Cerrar modal
      onClose();
    } catch (err) {
      console.error("Error inesperado:", err);

      Swal.fire({
        icon: "error",
        title: "Error inesperado",
        text: err.message || "No se pudo crear el pedido.",
      });
    }
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
                {/* COLUMNA IZQUIERDA */}
                <div className="left-column-productos">
                  <div className="form-group-border">
                    <div className="form-group">
                      <label>Buscar y Agregar Producto</label>

                      <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="btn-base btn-secondary"
                        style={{ width: "100%", marginTop: 10 }}
                      >
                        Seleccionar Productos del Catálogo
                      </button>
                    </div>
                  </div>

                  {/* LISTA PRODUCTOS */}
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
                        {loadingImages ? (
                          <div style={{ textAlign: "center", padding: 20 }}>
                            <span className="spinner"></span>{" "}
                            {/* Aquí puedes poner tu spinner */}
                            Cargando imágenes...
                          </div>
                        ) : selectedVariants.length === 0 ? (
                          <div
                            style={{
                              padding: "10px",
                              textAlign: "center",
                              color: "#888",
                              fontStyle: "italic",
                            }}
                          >
                            No hay productos seleccionados
                          </div>
                        ) : (
                          selectedVariants.map((v) => (
                            <div
                              key={v.id}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "5px 0",
                                borderBottom: "1px solid #f0f0f0",
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
                                  src={v.image}
                                  alt={v.title}
                                  style={{
                                    width: 40,
                                    height: 40,
                                    objectFit: "cover",
                                    marginRight: 10,
                                  }}
                                />
                                <span>
                                  {v.title} — ${v.price}
                                </span>
                              </div>

                              <div>
                                <input
                                  type="number"
                                  min={1}
                                  value={v.quantity}
                                  onChange={(e) =>
                                    handleQuantityChange(v.id, e.target.value)
                                  }
                                  style={{ width: 50, marginRight: 8 }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveVariant(v.id)}
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div
                        style={{
                          marginTop: 10,
                          fontWeight: 600,
                          textAlign: "right",
                        }}
                      >
                        Total: {totalCost.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* SHIPPING */}
                  <div className="form-group-border">
                    <div className="form-group">
                      <label>Metodo de envio</label>
                      <input
                        className="input-field"
                        value={shippingTitle}
                        onChange={(e) => setShippingTitle(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Precio Envío</label>
                      <input
                        className="input-field"
                        value={shippingPrice}
                        onChange={(e) => setShippingPrice(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Código Shipping</label>
                      <input
                        className="input-field"
                        value={shippingCode}
                        onChange={(e) => setShippingCode(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* COLUMNA DERECHA */}
                <div className="right-column-productos">
                  {/* DATOS CLIENTE */}
                  <div className="form-group-border">
                    <div className="form-group">
                      <label>Nombre</label>
                      <input
                        className="input-field"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Apellido</label>
                      <input
                        className="input-field"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Email</label>
                      <input
                        className="input-field"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Teléfono</label>
                      <input
                        className="input-field"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* DIRECCIÓN */}
                  <div className="form-group-border">
                    {/* País (solo lectura) */}
                    <div className="form-group">
                      <label>País</label>
                      <input className="input-field" value={country} readOnly />
                    </div>

                    {/* Province SELECT */}
                    <div className="form-group">
                      <label>Provincia / Departamento</label>
                      <select
                        className="input-field"
                        value={
                          provinceCode ? `${provinceCode}|${province}` : ""
                        }
                        onChange={handleProvinceChange}
                      >
                        <option value="">Seleccione provincia</option>

                        {PROVINCIAS_PERU.map((p) => (
                          <option key={p.code} value={`${p.code}|${p.name}`}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Dirección */}
                    <div className="form-group">
                      <label>Dirección</label>
                      <input
                        className="input-field"
                        value={address1}
                        onChange={(e) => setAddress1(e.target.value)}
                      />
                    </div>

                    {/* Ciudad */}
                    <div className="form-group">
                      <label>Ciudad</label>
                      <input
                        className="input-field"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>

                    {/* ZIP */}
                    <div className="form-group">
                      <label>ZIP</label>
                      <input
                        className="input-field"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* OTROS */}
                  <div className="form-group-border">
                    <div className="form-group">
                      <label>Tags</label>
                      <input
                        className="input-field"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Notas</label>
                      <textarea
                        className="input-field"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        style={{ width: "100%", height: 60 }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn-base btn-primary"
                style={{ marginTop: 20 }}
              >
                Crear Pedido
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* MODAL */}
      <ProductPedidoSelectModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddProducts={handleSelectVariants}
        selectedVariants={selectedVariants}
      />
    </>
  );
}

export default AddPedido;
