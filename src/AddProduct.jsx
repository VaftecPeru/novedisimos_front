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

function AddProduct({ onClose, onProductCreated }) {
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

    useEffect(() => {
      return () => {
        if (mainMediaPreviewUrl) {
          URL.revokeObjectURL(mainMediaPreviewUrl);
        }
        revokeUrls(variants);
      };
    }, [mainMediaPreviewUrl, variants]);

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
      setMultimedia(file);
      if (file) {
        if (mainMediaPreviewUrl) {
          URL.revokeObjectURL(mainMediaPreviewUrl);
        }
        setMainMediaPreviewUrl(URL.createObjectURL(file));
      } else {
        if (mainMediaPreviewUrl) {
          URL.revokeObjectURL(mainMediaPreviewUrl);
        }
        setMainMediaPreviewUrl(null);
      }
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
          if (variant.media_url) {
            URL.revokeObjectURL(variant.media_url);
          }

          variant.multimedia = file;
          variant.media_url = file ? URL.createObjectURL(file) : null;

          console.log("✅ Imagen cargada:", variant.media_url);
        } else {
          variant[field] = value;
        }

        updated[index] = variant;
        return updated;
      });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
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

        if (multimedia) {
          formData.append("multimedia", multimedia);
        }

        if (!hasVariants) {
          formData.append("precio", price);
          formData.append("cantidad", quantity);
          formData.append("sku", sku);
        } else {
          variants.forEach((variant, index) => {
            // Asegura que siempre se envíen option1, option2, option3 (aunque estén vacíos)
            selectedOptions.forEach((opt, optIndex) => {
              formData.append(
                `variantes[${index}][option${optIndex + 1}]`,
                variant[opt]
              );
            });
            for (let i = selectedOptions.length; i < 3; i++) {
              formData.append(`variantes[${index}][option${i + 1}]`, ""); // Evita errores en el backend
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

          // 🟢 Enviar los nombres de las opciones seleccionadas
          selectedOptions.forEach((opt, i) => {
            formData.append(`option_names[${i + 1}]`, opt);
          });
        }

        const response = await createProduct(formData);

        if (response.success) {
          Swal.fire({
            icon: "success",
            title: "Producto creado",
            text: `✅ ${response.product.title} fue creado exitosamente.`,
            confirmButtonColor: "#3085d6",
            confirmButtonText: "Aceptar",
          });

          // 🔄 Llama a la función del padre para actualizar la tabla
          if (onProductCreated) {
            onProductCreated();
          }

          // Limpieza de estados
          setTitulo("");
          setDescripcion("");
          setProductType("");
          setTags("");
          setEstado("active");
          setPrice("");
          setQuantity("");
          setSku("");
          revokeUrls(variants);
          if (mainMediaPreviewUrl) {
            URL.revokeObjectURL(mainMediaPreviewUrl);
          }
          setVariants([]);
          setSelectedOptions([]);
          setMultimedia(null);
          setMainMediaPreviewUrl(null);

          // 🔚 Cierra el modal
          onClose();
        } else {
          Swal.fire({
            icon: "error",
            title: "Error al crear producto",
            text: response.error
              ? JSON.stringify(response.error)
              : "Ocurrió un error inesperado.",
            confirmButtonColor: "#d33",
            confirmButtonText: "Cerrar",
          });
        }
      } catch (err) {
        console.error("Error al crear producto:", err);
        Swal.fire({
          icon: "error",
          title: "Error de conexión",
          text: "No se pudo crear el producto. Ver consola para más detalles.",
          confirmButtonColor: "#d33",
          confirmButtonText: "Cerrar",
        });
      } finally {
        setLoading(false);
      }
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
                              <label htmlFor="multimedia">
                                Imagen principal:
                              </label>
                              <div className="image-preview-container main-product-image">
                                {mainMediaPreviewUrl ? (
                                  <img
                                    src={mainMediaPreviewUrl}
                                    alt="Vista previa de la imagen principal"
                                  />
                                ) : (
                                  <span>Sin imagen</span>
                                )}
                              </div>
                              <input
                                id="multimedia"
                                type="file"
                                accept="image/*"
                                onChange={handleMainMediaChange}
                              />
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
                          <input
                            id="productType"
                            type="text"
                            className="input-field"
                            value={productType}
                            onChange={(e) => setProductType(e.target.value)}
                            placeholder="Ej: Camiseta, Zapato"
                          />
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
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default AddProduct;
