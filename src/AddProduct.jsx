import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./AddProduct.css";
import {
  getLocations,
  createProduct,
} from "./components/services/shopifyService";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ align: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ color: [] }, { background: [] }],
    ["blockquote", "code-block"],
    ["link", "clean"],
  ],
  clipboard: {
    matchVisual: false,
  },
};
const revokeUrls = (variants) => {
  variants.forEach((v) => {
    if (v.media_url) {
      URL.revokeObjectURL(v.media_url);
    }
  });
};

function AddProduct({ onClose, onProductCreated, tiposProducto }) {
  {
    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [productType, setProductType] = useState("");
    const [tags, setTags] = useState("");
    const [estado, setEstado] = useState("active");
    const [sku, setSku] = useState("");
    const [multimedia, setMultimedia] = useState(null);
    const [mainMediaPreviewUrl, setMainMediaPreviewUrl] = useState(null);

    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState("");

    const [hasVariants, setHasVariants] = useState(false);
    const [variants, setVariants] = useState([]);
    const [price, setPrice] = useState("");
    const [quantity, setQuantity] = useState("");

    const [isCustomType, setIsCustomType] = useState(false);

    const [availableOptions] = useState([
      "Color",
      "Talla",
      "Material",
      "Estilo",
      "Tamaño",
    ]);
    const [selectedOptions, setSelectedOptions] = useState([]);

    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [variantLimitError, setVariantLimitError] = useState("");

    const [productMedia, setProductMedia] = useState([]);
    const [showMediaModal, setShowMediaModal] = useState(false);
    const [mediaType, setMediaType] = useState("video"); // Por defecto video

    const IMAGE_TYPES = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
      "image/gif",
    ];

    const VIDEO_TYPES = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-m4v",
    ];

    const ALLOWED_TYPES = [...IMAGE_TYPES, ...VIDEO_TYPES];

    useEffect(() => {
      return () => {
        if (productMedia.length > 0) {
          productMedia.forEach((media) => {
            if (media.previewUrl) {
              URL.revokeObjectURL(media.previewUrl);
            }
          });
        }
        revokeUrls(variants);
      };
    }, [productMedia, variants]);

    useEffect(() => {
      const fetchLocations = async () => {
        try {
          const data = await getLocations();
          if (data.success) {
            setLocations(data.locations);
            if (data.locations.length > 0) {
              setSelectedLocation(data.locations[0].id);
            }
          }
        } catch (err) {
          console.error("Error obteniendo ubicaciones:", err);
        }
      };

      fetchLocations();
    }, []);

    const handleMainMediaChange = (e) => {
      const file = e.target.files[0];

      if (file && !ALLOWED_TYPES.includes(file.type)) {
        Swal.fire({
          icon: "error",
          title: "Archivo no permitido",
          text: "Sube solo imágenes o videos válidos.",
        });
        return;
      }

      setMultimedia(file);

      if (mainMediaPreviewUrl) {
        URL.revokeObjectURL(mainMediaPreviewUrl);
      }

      setMainMediaPreviewUrl(file ? URL.createObjectURL(file) : null);
    };

    const toggleOption = (option) => {
      setVariantLimitError("");

      setSelectedOptions((prev) => {
        if (prev.includes(option)) {
          return prev.filter((o) => o !== option);
        } else if (prev.length < 3) {
          return [...prev, option];
        } else {
          setVariantLimitError(
            "⚠️ Solo puedes seleccionar hasta 3 opciones para las variantes."
          );
          setTimeout(() => setVariantLimitError(""), 3000);
          return prev;
        }
      });
    };

    const addVariant = () => {
      const newVariant = {};
      selectedOptions.forEach((opt) => {
        newVariant[opt] = "";
      });
      newVariant.price = "";
      newVariant.cantidad = "";
      newVariant.multimedia = null;
      newVariant.media_url = null;
      setVariants([...variants, newVariant]);
    };

    const removeVariant = (index) => {
      if (variants[index].media_url) {
        URL.revokeObjectURL(variants[index].media_url);
      }
      setVariants(variants.filter((_, i) => i !== index));
    };

    const handleVariantChange = (index, field, value) => {
      setVariants((prevVariants) => {
        const updated = [...prevVariants];
        const variant = { ...updated[index] };

        if (field === "multimedia") {
          const file = value;

          if (file && !IMAGE_TYPES.includes(file.type)) {
            Swal.fire({
              icon: "error",
              title: "Tipo no permitido",
              text: "Las variantes solo aceptan imágenes.",
            });
            return prevVariants;
          }

          if (variant.media_url) {
            URL.revokeObjectURL(variant.media_url);
          }

          variant.multimedia = file;
          variant.media_url = file ? URL.createObjectURL(file) : null;

          updated[index] = variant;
          return updated;
        } else {
          variant[field] = value;
        }

        updated[index] = variant;
        return updated;
      });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      // 🔵 ALERTA DE PROCESO
      Swal.fire({
        title: "Procesando...",
        text: "Estamos creando el producto. Por favor espera...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      setLoading(true);
      setSuccessMessage("");
      setErrorMessage("");
      setVariantLimitError("");

      try {
        const formData = new FormData();
        formData.append("titulo", titulo);
        formData.append("descripcion", descripcion);
        formData.append("product_type", productType);
        formData.append("tags", tags);
        formData.append("estado", estado);
        formData.append("location_id", selectedLocation);

        productMedia.forEach((media) => {
          formData.append("product_medias[]", media.file);
        });

        if (!hasVariants) {
          formData.append("precio", price);
          formData.append("cantidad", quantity);
          formData.append("sku", sku);
        } else {
          variants.forEach((variant, index) => {
            selectedOptions.forEach((opt, optIndex) => {
              formData.append(
                `variantes[${index}][option${optIndex + 1}]`,
                variant[opt]
              );
            });

            for (let i = selectedOptions.length; i < 3; i++) {
              formData.append(`variantes[${index}][option${i + 1}]`, "");
            }

            formData.append(`variantes[${index}][price]`, variant.price);
            formData.append(`variantes[${index}][cantidad]`, variant.cantidad);
            formData.append(`variantes[${index}][sku]`, variant.sku || "");

            if (variant.multimedia) {
              formData.append(
                `variantes[${index}][multimedia]`,
                variant.multimedia
              );
            }
          });

          selectedOptions.forEach((opt, i) => {
            formData.append(`option_names[${i + 1}]`, opt);
          });
        }

        // 🔥 LLAMADA A LA API
        const response = await createProduct(formData);

        if (response.success) {
          Swal.fire({
            icon: "success",
            title: "Producto creado",
            text: `✅ ${response.product.title} fue creado exitosamente.`,
            confirmButtonColor: "#3085d6",
            confirmButtonText: "Aceptar",
          });

          if (onProductCreated) onProductCreated();

          // 🧹 Limpiar estados
          setTitulo("");
          setDescripcion("");
          setProductType("");
          setTags("");
          setEstado("active");
          setPrice("");
          setQuantity("");
          setSku("");
          revokeUrls(variants);

          if (mainMediaPreviewUrl) URL.revokeObjectURL(mainMediaPreviewUrl);
          productMedia.forEach(
            (m) => m.previewUrl && URL.revokeObjectURL(m.previewUrl)
          );

          setProductMedia([]);
          setVariants([]);
          setSelectedOptions([]);
          setMultimedia(null);
          setMainMediaPreviewUrl(null);

          onClose();
        } else {
          Swal.fire({
            icon: "error",
            title: "Error al crear producto",
            text: response.error
              ? JSON.stringify(response.error)
              : "Ocurrió un error inesperado.",
          });
        }
      } catch (err) {
        console.error("Error al crear producto:", err);
        Swal.fire({
          icon: "error",
          title: "Error de conexión",
          text: "No se pudo crear el producto.",
        });
      } finally {
        setLoading(false);
      }
    };

    const countMediaTypes = (mediaList) => {
      const images = mediaList.filter((m) => m.type === "image").length;
      const videos = mediaList.filter((m) => m.type === "video").length;
      return { images, videos };
    };

    const handleAddMedia = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!ALLOWED_TYPES.includes(file.type)) {
        Swal.fire({
          icon: "error",
          title: "Tipo no permitido",
          text: "Solo puedes subir imágenes o videos válidos.",
        });
        return;
      }

      const isImage = IMAGE_TYPES.includes(file.type);
      const isVideo = VIDEO_TYPES.includes(file.type);

      const currentCounts = countMediaTypes(productMedia);

      // 🔥 Validar límite de imágenes
      if (isImage && currentCounts.images >= 5) {
        Swal.fire({
          icon: "warning",
          title: "Límite alcanzado",
          text: "Solo puedes subir hasta 5 imágenes.",
        });
        return;
      }

      // 🔥 Validar límite de videos
      if (isVideo && currentCounts.videos >= 2) {
        Swal.fire({
          icon: "warning",
          title: "Límite alcanzado",
          text: "Solo puedes subir hasta 2 videos.",
        });
        return;
      }

      // 🔵 Todo OK → agregar el archivo
      const previewUrl = URL.createObjectURL(file);
      const uniqueId = Date.now() + Math.random();

      setProductMedia([
        ...productMedia,
        {
          file,
          previewUrl,
          type: isImage ? "image" : "video",
          id: uniqueId,
        },
      ]);

      setShowMediaModal(false);
    };

    const deleteMedia = (index) => {
      setProductMedia((prev) => {
        const newMedia = [...prev];
        if (newMedia[index].previewUrl) {
          URL.revokeObjectURL(newMedia[index].previewUrl);
        }
        newMedia.splice(index, 1);
        return newMedia;
      });
    };

    const setAsFirst = (index) => {
      setProductMedia((prev) => {
        const newMedia = [...prev];
        const [first] = newMedia.splice(index, 1);
        newMedia.unshift(first);
        return newMedia;
      });
    };

    return (
      <>
        <div
          className="modal-overlay"
          onMouseDown={(e) =>
            e.target === e.currentTarget
              ? (e.currentTarget.dataset.down = "true")
              : null
          }
          onMouseUp={(e) => {
            if (
              e.target === e.currentTarget &&
              e.currentTarget.dataset.down === "true"
            ) {
              onClose();
            }
            e.currentTarget.dataset.down = "false";
          }}
        >
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="app-container">
              <div className="form-card">
                <div className="header-row">
                  <h3>Agregar producto</h3>
                  <button className="btn-discard " onClick={onClose}>
                    Descartar
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="form-content-grid">
                    <div className="left-column-productos">
                      <div className="details-flex">
                        <div className="text-fields">
                          <div className="form-group-border">
                            {/* Título */}
                            <div className="form-group">
                              <label htmlFor="titulo">Título:</label>
                              <input
                                id="titulo"
                                type="text"
                                className="input-field"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                required
                              />
                            </div>

                            {/* Descripción */}
                            <div className="form-group">
                              <label htmlFor="descripcion">Descripción:</label>
                              <div className="editor-container">
                                <ReactQuill
                                  theme="snow"
                                  value={descripcion}
                                  onChange={setDescripcion}
                                  modules={modules}
                                />
                              </div>
                            </div>
                            {/* Imagen principal y Visualizador */}
                            <div className="form-group image-container">
                              <label htmlFor="multimedia">Multimedia:</label>
                              <div className="media-card">
                                <div className="media-grid">
                                  {productMedia.length === 0 ? (
                                    <div className="no-media">
                                      No hay medios agregados aún.
                                    </div>
                                  ) : (
                                    productMedia.map((media, index) => (
                                      <div
                                        key={media.id || index} // 🟢 USAR media.id como clave estable (usa index como fallback si aún no tienes IDs)
                                        className={`media-item ${
                                          index === 0 ? "first-media" : ""
                                        }`}
                                      >
                                        {media.type === "image" ? (
                                          <img
                                            src={media.previewUrl}
                                            alt="Vista previa"
                                          />
                                        ) : (
                                          <video
                                            src={media.previewUrl}
                                            controls
                                            muted
                                            playsInline
                                          />
                                        )}
                                        <div className="media-type">
                                          {media.type.toUpperCase()}
                                        </div>
                                        <div className="media-actions">
                                          <button
                                            type="button"
                                            onClick={() => deleteMedia(index)}
                                          >
                                            Borrar
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setAsFirst(index)}
                                          >
                                            Principal
                                          </button>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>

                                <button
                                  type="button"
                                  className="add-button"
                                  onClick={() => setShowMediaModal(true)}
                                >
                                  + Añadir
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="right-column-productos">
                      <div className="form-group-border">
                        {/* Estado */}
                        <div className="form-group">
                          <label htmlFor="estado">Estado:</label>
                          <select
                            id="estado"
                            className="input-field"
                            value={estado}
                            onChange={(e) => setEstado(e.target.value)}
                          >
                            <option value="active">Activo</option>
                            <option value="draft">Borrador</option>
                            <option value="archived">Archivado</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-group-border">
                        {/* Ubicación */}
                        <div className="form-group">
                          <label htmlFor="location">Ubicación:</label>
                          <select
                            id="location"
                            className="input-field"
                            value={selectedLocation}
                            onChange={(e) =>
                              setSelectedLocation(e.target.value)
                            }
                            required
                          >
                            {locations.length > 0 ? (
                              locations.map((loc) => (
                                <option key={loc.id} value={loc.id}>
                                  {loc.name}
                                </option>
                              ))
                            ) : (
                              <option value="">Cargando ubicaciones...</option>
                            )}
                          </select>
                        </div>
                      </div>
                      <div className="form-group-border">
                        {/* Tipo de producto */}
                        <div className="form-group">
                          <label htmlFor="productType">Tipo de Producto:</label>

                          <select
                            id="productType"
                            className="input-field"
                            value={isCustomType ? "other" : productType}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === "other") {
                                setIsCustomType(true);
                                setProductType("");
                              } else {
                                setIsCustomType(false);
                                setProductType(value);
                              }
                            }}
                          >
                            <option value="">Selecciona un tipo…</option>

                            {tiposProducto.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}

                            <option value="other">Otro…</option>
                          </select>

                          {isCustomType && (
                            <input
                              type="text"
                              className="input-field"
                              placeholder="Escribe un nuevo tipo…"
                              value={productType}
                              onChange={(e) => setProductType(e.target.value)}
                              style={{ marginTop: "8px" }}
                              required
                            />
                          )}
                        </div>

                        {/* Tags */}
                        <div className="form-group">
                          <label htmlFor="tags">
                            Tags (separados por coma):
                          </label>
                          <input
                            id="tags"
                            type="text"
                            className="input-field"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="Ej: verano, oferta, nuevo"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-content-grid">
                    <div className="left-column-productos">
                      {/* Variantes Toggle */}
                      <div className="form-group checkbox-group">
                        <label className="checkbox-group">
                          <input
                            type="checkbox"
                            checked={hasVariants}
                            onChange={() => setHasVariants(!hasVariants)}
                          />
                          Producto con variantes
                        </label>
                      </div>

                      {!hasVariants ? (
                        <>
                          <div className="form-group-border">
                            <div className="form-group">
                              <label>Inventario:</label>
                              <label htmlFor="price">Precio:</label>
                              <input
                                id="price"
                                type="number"
                                className="input-field"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                                min="0"
                                step="0.01"
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor="quantity">Cantidad:</label>
                              <input
                                id="quantity"
                                type="number"
                                className="input-field"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                required
                                min="0"
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor="sku">SKU:</label>
                              <input
                                id="sku"
                                type="text"
                                className="input-field"
                                value={sku}
                                onChange={(e) => setSku(e.target.value)}
                                placeholder="Código SKU del producto"
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="form-group-border">
                          <div className="variant-section">
                            <p>
                              {" "}
                              Selecciona los atributos para tus variantes
                              (máx.3):{" "}
                            </p>

                            <div className="options-container">
                              {availableOptions.map((opt) => (
                                <div className="option-chip" key={opt}>
                                  <input
                                    id={`opt-${opt}`}
                                    type="checkbox"
                                    checked={selectedOptions.includes(opt)}
                                    onChange={() => toggleOption(opt)}
                                    disabled={
                                      selectedOptions.length >= 3 &&
                                      !selectedOptions.includes(opt)
                                    }
                                  />
                                  <label htmlFor={`opt-${opt}`}>{opt}</label>
                                </div>
                              ))}
                            </div>

                            {variantLimitError && (
                              <div className="message-warning">
                                {variantLimitError}
                              </div>
                            )}

                            {selectedOptions.length > 0 && (
                              <>
                                <p style={{ marginTop: "0" }}>
                                  Variantes definidas ({variants.length})
                                </p>

                                <div className="variant-list">
                                  {variants.map((variant, index) => (
                                    <div key={index} className="variant-card">
                                      {/* Opciones (Color, Talla, etc.) */}
                                      {selectedOptions.map((opt) => (
                                        <div className="form-group" key={opt}>
                                          <label>{opt}:</label>
                                          <input
                                            type="text"
                                            className="input-field"
                                            value={variant[opt]}
                                            onChange={(e) =>
                                              handleVariantChange(
                                                index,
                                                opt,
                                                e.target.value
                                              )
                                            }
                                            required
                                          />
                                        </div>
                                      ))}

                                      {/* Precio y Cantidad */}
                                      <div className="form-group">
                                        <label>Precio:</label>
                                        <input
                                          type="number"
                                          className="input-field"
                                          value={variant.price}
                                          onChange={(e) =>
                                            handleVariantChange(
                                              index,
                                              "price",
                                              e.target.value
                                            )
                                          }
                                          required
                                          min="0"
                                          step="0.01"
                                        />
                                      </div>
                                      <div className="form-group">
                                        <label>Cantidad:</label>
                                        <input
                                          type="number"
                                          className="input-field"
                                          value={variant.cantidad}
                                          onChange={(e) =>
                                            handleVariantChange(
                                              index,
                                              "cantidad",
                                              e.target.value
                                            )
                                          }
                                          required
                                          min="0"
                                        />
                                      </div>
                                      <div className="form-group">
                                        <label>SKU (opcional):</label>
                                        <input
                                          type="text"
                                          className="input-field"
                                          value={variant.sku || ""}
                                          onChange={(e) =>
                                            handleVariantChange(
                                              index,
                                              "sku",
                                              e.target.value
                                            )
                                          }
                                          placeholder="Código SKU de la variante"
                                        />
                                      </div>

                                      {/* Imagen de Variante y Visualizador */}
                                      <div
                                        className="form-group"
                                        style={{ gridColumn: "1 / -1" }}
                                      >
                                        <label>
                                          Imagen de Variante (opcional):
                                        </label>
                                        <div className="variant-media-group">
                                          <div className="variant-image-preview">
                                            {variant.media_url ? (
                                              <img
                                                src={variant.media_url}
                                                alt={`Vista previa variante ${
                                                  index + 1
                                                }`}
                                              />
                                            ) : (
                                              <span>Media</span>
                                            )}
                                          </div>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) =>
                                              handleVariantChange(
                                                index,
                                                "multimedia",
                                                e.target.files[0]
                                              )
                                            }
                                            style={{ flexGrow: 1 }}
                                          />
                                        </div>
                                      </div>

                                      <div className="variant-actions">
                                        <button
                                          type="button"
                                          className="btn-base btn-danger"
                                          onClick={() => removeVariant(index)}
                                        >
                                          Eliminar Variante
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <button
                                  type="button"
                                  className="btn-base btn-secondary"
                                  onClick={addVariant}
                                >
                                  Agregar Variante
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="right-column-productos"></div>
                  </div>
                  <div className="form-content-grid">
                    <div className="left-column-productos">
                      <button
                        type="submit"
                        className="btn-base btn-primary"
                        disabled={loading}
                      >
                        {loading ? (
                          <span>Guardando...</span>
                        ) : (
                          <span>Crear Producto</span>
                        )}
                      </button>
                    </div>
                  </div>
                </form>

                {successMessage && (
                  <div className="message-success">{successMessage}</div>
                )}
                {errorMessage && (
                  <div className="message-error">{errorMessage}</div>
                )}

                {showMediaModal && (
                  <div
                    className="upload-modal"
                    style={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: 1000,
                    }}
                    onClick={() => setShowMediaModal(false)}
                  >
                    <div
                      className="modal-content"
                      style={{
                        backgroundColor: "white",
                        padding: "24px",
                        borderRadius: "12px",
                        width: "420px",
                        maxWidth: "90%",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Header: Título + Cerrar en la misma línea */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "8px",
                          paddingBottom: "12px",
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        <h2
                          style={{
                            margin: 0,
                            fontSize: "1.4rem",
                            color: "#333",
                          }}
                        >
                          Subir Nuevo Medio
                        </h2>
                        <button
                          onClick={() => setShowMediaModal(false)}
                          style={{
                            background: "none",
                            border: "none",
                            fontSize: "1.8rem",
                            cursor: "pointer",
                            color: "#999",
                            padding: "0",
                            width: "36px",
                            height: "36px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "50%",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.target.style.backgroundColor = "#f0f0f0")
                          }
                          onMouseLeave={(e) =>
                            (e.target.style.backgroundColor = "transparent")
                          }
                        >
                          ×
                        </button>
                      </div>

                      {/* Selector de tipo: Video / Imagen */}
                      <div
                        className="media-selector"
                        style={{ marginBottom: "8px" }}
                      >
                        <button
                          onClick={() => setMediaType("video")}
                          className={mediaType === "video" ? "active" : ""}
                          style={{
                            padding: "10px 16px",
                            border:
                              mediaType === "video"
                                ? "2px solid #007bff"
                                : "2px solid #ddd",
                            backgroundColor:
                              mediaType === "video" ? "#007bff" : "white",
                            color: mediaType === "video" ? "white" : "#333",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "600",
                            transition: "all 0.2s",
                          }}
                        >
                          Subir Video
                        </button>
                        <button
                          onClick={() => setMediaType("image")}
                          className={mediaType === "image" ? "active" : ""}
                          style={{
                            padding: "10px 16px",
                            border:
                              mediaType === "image"
                                ? "2px solid #007bff"
                                : "2px solid #ddd",
                            backgroundColor:
                              mediaType === "image" ? "#007bff" : "white",
                            color: mediaType === "image" ? "white" : "#333",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "600",
                            transition: "all 0.2s",
                            marginLeft: "10px",
                          }}
                        >
                          Subir Imagen
                        </button>
                      </div>

                      {/* Formulario de subida */}
                      <div>
                        {mediaType === "video" ? (
                          <div>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "4px",
                                fontWeight: "600",
                                color: "#555",
                              }}
                            >
                              Selecciona un video (MP4 o MOV)
                            </label>
                            <input
                              type="file"
                              accept="video/mp4,video/quicktime"
                              onChange={handleAddMedia}
                              style={{
                                width: "100%",
                                padding: "12px",
                                border: "2px dashed #007bff",
                                borderRadius: "8px",
                                backgroundColor: "#f8fbff",
                                cursor: "pointer",
                              }}
                            />
                          </div>
                        ) : (
                          <div>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "8px",
                                fontWeight: "600",
                                color: "#555",
                              }}
                            >
                              Selecciona una imagen (JPG, PNG, etc.)
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleAddMedia}
                              style={{
                                width: "100%",
                                padding: "12px",
                                border: "2px dashed #007bff",
                                borderRadius: "8px",
                                backgroundColor: "#f8fbff",
                                cursor: "pointer",
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default AddProduct;
