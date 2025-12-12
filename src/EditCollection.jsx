import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import ProductSelectorModal from "./ProductSelectorModal";
import {
  obtenerColeccionDetalles,
  actualizarColeccion,
  agregarProductoAcoleccion,
  eliminarProductoDeColeccion,
} from "./components/services/shopifyService";

// --- CONFIGURACIÓN QUILL ---
const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "clean"],
  ],
};

// Se recibe el ID de la colección a editar
function EditCollection({
  collectionId = "col_123",
  onClose,
  onCollectionUpdated,
}) {
  // ID por defecto para la simulación
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagen, setImagen] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [imagenOriginalUrl, setImagenOriginalUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false); // Nuevo estado para recargar solo la lista

  // Productos seleccionados y control del modal
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [mainSearchInput, setMainSearchInput] = useState("");

  // FUNCIÓN PARA CARGAR SOLO LA LISTA DE PRODUCTOS (se puede llamar después de cada acción)
  useEffect(() => {
    let cancelled = false;

    const loadCollectionData = async () => {
      setLoading(true);
      try {
        const data = await obtenerColeccionDetalles(collectionId);
        if (!data.success) throw new Error("Error al obtener la colección");
        if (cancelled) return;

        const collection = data.collection;

        setTitulo(collection.title || "");
        setDescripcion(collection.descriptionHtml || "");

        if (collection.image?.url) {
          setImagenOriginalUrl(collection.image.url);
          setImagenPreview(collection.image.url);
        }

        setSelectedProducts(data.products || []);
      } catch (err) {
        if (!cancelled) {
          Swal.fire(
            "Error de carga",
            err.message || "No se pudo cargar la colección",
            "error"
          );
          onClose();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadCollectionData();

    return () => {
      cancelled = true;
      if (imagenPreview && imagenPreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagenPreview);
      }
    };
  }, [collectionId]); // ❗ QUITAMOS onClose → es lo que provocaba recarga doble

  // --- MANEJO DE IMAGEN ---
  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagen(file);
      setImagenOriginalUrl(null);
      if (imagenPreview && imagenPreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagenPreview);
      }
      setImagenPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImagen(null);
    setImagenOriginalUrl(null);
    if (imagenPreview && imagenPreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagenPreview);
    }
    setImagenPreview(null);
  };

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);

    try {
      const data = await obtenerColeccionDetalles(collectionId);
      if (!data.success)
        throw new Error("No se pudieron recargar los productos");

      setSelectedProducts(data.products || []);
    } catch (err) {
      console.error("Error recargando productos:", err);
    } finally {
      setLoadingProducts(false);
    }
  }, [collectionId]);

  // --- MANEJO DE PRODUCTOS (MODIFICADO para acciones individuales y console.log) ---

  // Función llamada al agregar productos desde el modal
  // Función llamada al agregar productos desde el modal
  // --- MANEJO DE PRODUCTOS (MODIFICADO para garantizar el cierre) ---

  // Función llamada al agregar productos desde el modal
  const handleAddProductsFromSelector = async (productsArray) => {
    // 🛑 SOLUCIÓN: Cierra el modal selector y limpia el input de búsqueda INMEDIATAMENTE.
    setMainSearchInput("");
    setIsSelectorOpen(false);

    // 1. Mostrar Swal bloqueante mientras agrega
    Swal.fire({
      title: "Agregando productos...",
      text: "Por favor, espera mientras se procesan los productos seleccionados.",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      // Convertir IDs al formato GID
      const newProductGIDs = productsArray
        .map((p) => {
          if (!p) return null;

          if (typeof p === "object" && p.id) return p.id;

          // Si viene como string y ya es GID (esto es poco común si viene del selector)
          if (typeof p === "string" && p.startsWith("gid://")) return p;

          // La conversión de ID numérico a GID de Shopify
          if (typeof p === "number") return `gid://shopify/Product/${p}`;

          return null;
        })
        .filter(Boolean);

      // Filtrar SOLO los que no existen ya en la colección
      // Nota: asume que 'selectedProducts' está disponible en el scope y tiene 'id' como GID
      const existing = new Set(selectedProducts.map((p) => p.id));
      const productsToAdd = newProductGIDs.filter((gid) => !existing.has(gid));

      // Si no hay nada que agregar → mostrar aviso y salir
      if (productsToAdd.length === 0) {
        Swal.close(); // Cerrar el Swal de 'Agregando...'
        Swal.fire({
          title: "Sin cambios",
          text: "Todos los productos ya estaban en esta colección.",
          icon: "info",
          timer: 1500,
          showConfirmButton: false,
        });
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      // Agregar uno por uno
      for (const gid of productsToAdd) {
        try {
          // **IMPORTANTE**: Asegúrate de que 'agregarProductoAcoleccion' y 'collectionId'
          // están definidos y disponibles en este scope.
          await agregarProductoAcoleccion(collectionId, gid);
          successCount++;
        } catch (err) {
          errorCount++;
          console.error("Error agregando producto:", gid, err);
        }
      }

      // 2. Recargar productos desde backend y mostrar resultados
      // **IMPORTANTE**: Asegúrate de que 'loadProducts' está definido y disponible.
      await loadProducts();

      // Cerrar el Swal de "Agregando..."
      Swal.close();

      if (successCount > 0) {
        // Mostrar éxito si se agregó al menos uno
        Swal.fire({
          title: "¡Productos agregados!",
          text: `${successCount} producto(s) añadido(s). ${
            errorCount > 0 ? `(${errorCount} con errores)` : ""
          }`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } else if (errorCount > 0) {
        // Mostrar error si todos fallaron
        Swal.fire(
          "Error",
          "No se pudo agregar ninguno de los productos seleccionados.",
          "error"
        );
      }
    } catch (err) {
      // Manejo de errores fatales
      console.error("Error fatal en handleAddProductsFromSelector:", err);
      Swal.close(); // Asegurarse de que el modal de carga se cierre
      Swal.fire(
        "Error crítico",
        "Ocurrió un error inesperado al procesar los productos.",
        "error"
      );
    }
    // NOTA: Eliminamos el bloque 'finally' ya que la lógica de limpieza
    // y cierre del modal fue movida al inicio.
  };
  // Función para eliminar producto de la lista
  const handleRemoveProduct = async (id) => {
    // Confirmación antes de eliminar
    const { isConfirmed } = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará el producto de la colección.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!isConfirmed) return; // Salir si cancela

    try {
      // Mostrar Swal bloqueante mientras elimina
      Swal.fire({
        title: "Eliminando producto...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });

      await eliminarProductoDeColeccion(collectionId, id);

      // Recargar productos
      await loadProducts();

      // Cerrar Swal de carga
      Swal.close();

      // Mostrar éxito
      Swal.fire({
        title: "¡Producto eliminado!",
        text: `Producto eliminado correctamente de la colección.`,
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.close();
      Swal.fire(
        "Error",
        `No se pudo eliminar el producto: ${
          err.message || "Error desconocido"
        }`,
        "error"
      );
    }
  };

  const handleMainSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setIsSelectorOpen(true);
    }
  };

 
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!titulo.trim()) {
      return Swal.fire("Error", "El título es obligatorio", "error");
    }

    const { isConfirmed } = await Swal.fire({
      title: "¿Guardar cambios?",
      text: "Se actualizará la colección.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
    });

    if (!isConfirmed) return;

    Swal.fire({
      title: "Guardando cambios...",
      text: "Por favor espera",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
    });

    setSaving(true);

    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("descripcion", descripcion);

    if (imagen) {
      formData.append("image", imagen);
    }

    if (imagenOriginalUrl && !imagenPreview) {
      formData.append("remove_image", "1");
    }

    try {
      const res = await actualizarColeccion(collectionId, formData);

      Swal.close();

      await Swal.fire({
        title: "¡Guardado!",
        text: `La colección "${titulo}" fue actualizada correctamente.`,
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });

      onCollectionUpdated?.();
      onClose();
    } catch (err) {
      Swal.close();
      Swal.fire(
        "Error",
        err.message || "No se pudo actualizar la colección",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          <div style={{ padding: "40px", textAlign: "center" }}>
            Cargando datos de la colección...
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* MODAL SELECTOR */}
      <ProductSelectorModal
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        onAddProducts={handleAddProductsFromSelector}
        // Usamos los IDs actuales de los productos seleccionados
        alreadySelectedIds={selectedProducts.map((p) => p.id)}
        initialQuery={mainSearchInput}
        // Recibe collectionId si el modal necesita hacer fetch por su cuenta
        collectionId={collectionId}
        // PASAMOS LA FUNCIÓN PARA FORZAR LA RECARGA DE PRODUCTOS EN EL MODAL DE SELECCIÓN
        // para que la lista en el componente principal se refresque después de agregar
        // onProductActionCompleted={loadProducts} // OPCIONAL si el modal gestiona la API directamente
      />

      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="app-container">
            <div className="form-card">
              <div className="header-row">
                <h3>Editar Colección: {titulo}</h3>
                <button className="btn-discard" onClick={onClose}>
                  Descartar
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-content-grid">
                  {/* COLUMNA IZQUIERDA (Contenido y Productos) */}
                  <div className="left-column-productos">
                    {/* TÍTULO & DESCRIPCIÓN... (Sin cambios) */}
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

                    {/* SECCIÓN PRODUCTOS - Ahora con indicador de carga */}
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

                        {/* BUSCADOR PRINCIPAL (Sin cambios) */}
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
                              onKeyDown={handleMainSearchKeyDown}
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
                          {loadingProducts ? (
                            <div
                              style={{
                                padding: "20px",
                                textAlign: "center",
                                color: "#637381",
                              }}
                            >
                              Recargando lista de productos...
                            </div>
                          ) : selectedProducts.length > 0 ? (
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

                  {/* COLUMNA DERECHA (Imagen)... (Sin cambios) */}
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
                                onClick={handleRemoveImage}
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
                    disabled={saving || !titulo.trim()}
                    style={{ minWidth: 150 }}
                  >
                    {saving ? "Actualizando..." : "Guardar cambios"}
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

export default EditCollection;
