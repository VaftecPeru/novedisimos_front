// AddCollection.js

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { createCollection } from "./components/services/shopifyService";
import ProductSelectorModal from "./ProductSelectorModal";

// --- CONFIGURACIÓN QUILL ---
const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "clean"],
  ],
};

function AddCollection({ onClose, onCollectionCreated }) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagen, setImagen] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Productos seleccionados y control del modal
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  // NUEVO: Estado para el input del buscador principal
  const [mainSearchInput, setMainSearchInput] = useState("");

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagen(file);
      setImagenPreview(URL.createObjectURL(file));
    }
  };

  const handleAddProductsFromSelector = (newProducts) => {
    setSelectedProducts((prev) => [...prev, ...newProducts]);
    setIsSelectorOpen(false);
    setMainSearchInput(""); // Limpiamos el input principal tras agregar
  };

  const handleRemoveProduct = (id) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== id));
  };

  // NUEVO: Manejar tecla Enter en el buscador principal
  const handleMainSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Evitar que se envíe el formulario principal
      setIsSelectorOpen(true); // Abrir modal
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!titulo.trim()) {
      Swal.fire("Error", "El título es obligatorio", "error");
      return;
    }

    // 1) CONFIRMACIÓN
    const confirm = await Swal.fire({
      title: "¿Crear colección?",
      text: "Se añadirá la nueva colección con los productos seleccionados.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Crear",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    // 2) MENSAJE DE PROCESO
    Swal.fire({
      title: "Procesando...",
      text: "Estamos creando la colección, por favor espera.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const formData = new FormData();
    formData.append("titulo", titulo);
    if (descripcion) formData.append("descripcion", descripcion);
    if (imagen) formData.append("image", imagen);

    if (selectedProducts.length > 0) {
      const productIds = selectedProducts.map((p) => p.id);
      formData.append("products", JSON.stringify(productIds));
    }

    try {
      const res = await createCollection(formData);

      if (res.success) {
        // 3) ÉXITO
        Swal.fire({
          icon: "success",
          title: "¡Colección creada!",
          text: `La colección "${titulo}" fue creada correctamente.`,
        });

        onCollectionCreated?.();
        onClose();
      } else {
        throw new Error(res.error || "Error del servidor");
      }
    } catch (err) {
      Swal.fire(
        "Error",
        err.message || "No se pudo crear la colección",
        "error"
      );
    }
  };

  React.useEffect(() => {
    return () => {
      if (imagenPreview) URL.revokeObjectURL(imagenPreview);
    };
  }, [imagenPreview]);

  return (
    <>
      {/* MODAL SELECTOR */}
      <ProductSelectorModal
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        onAddProducts={handleAddProductsFromSelector}
        alreadySelectedIds={selectedProducts.map((p) => p.id)}
        initialQuery={mainSearchInput} // PASAMOS LO QUE ESCRIBIÓ EL USUARIO
      />

      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="app-container">
            <div className="form-card">
              <div className="header-row">
                <h3>Nueva Colección</h3>
                <button className="btn-discard" onClick={onClose}>
                  Descartar
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-content-grid">
                  {/* COLUMNA IZQUIERDA */}
                  <div className="left-column-productos">
                    <div className="form-group-border">
                      <div className="form-group">
                        <label>Título *</label>
                        <input
                          type="text"
                          className="input-field"
                          value={titulo}
                          onChange={(e) => setTitulo(e.target.value)}
                          required
                          style={{ width: "100%", marginTop: "8px" }}
                        />
                      </div>
                    </div>

                    <div className="form-group-border">
                      <div className="form-group">
                        <label>Descripción (opcional)</label>
                        <div style={{ marginTop: "12px" }}>
                          <ReactQuill
                            theme="snow"
                            value={descripcion}
                            onChange={setDescripcion}
                            modules={modules}
                            style={{ height: 180, marginBottom: "50px" }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECCIÓN PRODUCTOS */}
                    <div className="form-group-border">
                      <div className="form-group">
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "10px",
                          }}
                        >
                          <label style={{ margin: 0 }}>Productos</label>
                          {selectedProducts.length > 0 && (
                            <span style={{ fontSize: "0.8rem", color: "#666" }}>
                              {selectedProducts.length} seleccionados
                            </span>
                          )}
                        </div>

                        {/* BUSCADOR PRINCIPAL */}
                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            marginBottom: "15px",
                          }}
                        >
                          <div style={{ position: "relative", width: "100%" }}>
                            <input
                              type="text"
                              className="input-field"
                              placeholder="Buscar productos..."
                              value={mainSearchInput}
                              onChange={(e) =>
                                setMainSearchInput(e.target.value)
                              }
                              onKeyDown={handleMainSearchKeyDown} // Detecta ENTER
                            />
                          </div>
                          <button
                            type="button"
                            className="btn-base btn-secondary"
                            style={{ width: "auto", margin: 0 }}
                            onClick={() => setIsSelectorOpen(true)}
                          >
                            Explorar
                          </button>
                        </div>

                        {/* LISTA DE PRODUCTOS AGREGADOS */}
                        <div
                          className="product-list-simulation"
                          style={{
                            border: "1px solid #e1e1e1",
                            borderRadius: "8px",
                            overflow: "hidden",
                          }}
                        >
                          {selectedProducts.length > 0 ? (
                            selectedProducts.map((prod) => (
                              <div
                                key={prod.id}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  padding: "10px 15px",
                                  borderBottom: "1px solid #f0f0f0",
                                  justifyContent: "space-between",
                                  background: "#fff",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                  }}
                                >
                                  <img
                                    src={prod.image}
                                    alt=""
                                    style={{
                                      width: "40px",
                                      height: "40px",
                                      borderRadius: "4px",
                                      background: "#eee",
                                      objectFit: "cover",
                                    }}
                                  />
                                  <div>
                                    <div
                                      style={{
                                        fontSize: "0.9rem",
                                        fontWeight: 500,
                                      }}
                                    >
                                      {prod.title}
                                    </div>
                                    {prod.status && (
                                      <span
                                        style={{
                                          fontSize: "0.75rem",
                                          color: "#888",
                                          textTransform: "capitalize",
                                        }}
                                      >
                                        {prod.status}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveProduct(prod.id)}
                                  style={{
                                    border: "none",
                                    background: "transparent",
                                    cursor: "pointer",
                                    color: "#999",
                                    fontSize: "1.2rem",
                                  }}
                                >
                                  &times;
                                </button>
                              </div>
                            ))
                          ) : (
                            <div
                              style={{
                                padding: "20px",
                                textAlign: "center",
                                color: "#888",
                                fontSize: "0.9rem",
                              }}
                            >
                              No hay productos en esta colección.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* COLUMNA DERECHA */}
                  <div className="right-column-productos">
                    <div className="form-group-border">
                      <div className="form-group">
                        <label>Imagen de la colección</label>
                        <div
                          style={{
                            marginTop: "12px",
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          {imagenPreview ? (
                            <div
                              style={{
                                position: "relative",
                                display: "inline-block",
                              }}
                            >
                              <img
                                src={imagenPreview}
                                alt="Preview"
                                style={{
                                  width: "100%",
                                  maxWidth: 250,
                                  height: "auto",
                                  aspectRatio: "1/1",
                                  objectFit: "cover",
                                  borderRadius: 12,
                                  border: "1px solid #ddd",
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setImagen(null);
                                  setImagenPreview(null);
                                }}
                                style={{
                                  position: "absolute",
                                  top: 8,
                                  right: 8,
                                  background: "rgba(0,0,0,0.6)",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "50%",
                                  width: 28,
                                  height: 28,
                                  cursor: "pointer",
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <label style={{ width: "100%" }}>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImagenChange}
                                style={{ display: "none" }}
                              />
                              <div
                                style={{
                                  border: "2px dashed #ccc",
                                  borderRadius: 12,
                                  padding: "40px 20px",
                                  textAlign: "center",
                                  cursor: "pointer",
                                  backgroundColor: "#fafafa",
                                }}
                                onMouseOver={(e) =>
                                  (e.currentTarget.style.borderColor = "#999")
                                }
                                onMouseOut={(e) =>
                                  (e.currentTarget.style.borderColor = "#ccc")
                                }
                              >
                                <span
                                  style={{
                                    color: "#666",
                                    display: "block",
                                    fontSize: "2rem",
                                    marginBottom: "10px",
                                  }}
                                >
                                  📷
                                </span>
                                <span
                                  style={{ color: "#666", fontWeight: 500 }}
                                >
                                  Subir imagen
                                </span>
                              </div>
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    borderTop: "1px solid #eee",
                    marginTop: "20px",
                    paddingTop: "20px",
                    textAlign: "right",
                  }}
                >
                  <button
                    type="submit"
                    className="btn-base btn-primary"
                    disabled={loading || !titulo.trim()}
                    style={{ minWidth: 150 }}
                  >
                    {loading ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AddCollection;
