import React, { useState, useEffect } from "react";
import "./AddProduct.css"; // usa el mismo estilo del modal
import Swal from "sweetalert2";
import {
  getLocations,
  getInventoryLocation,
  updateProduct,
  setMediaAsFirstService,
  deleteProductMediaService,
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

function EditProduct({ product, onClose, onUpdate, tiposProducto }) {
  const [titulo, setTitulo] = useState(product?.title || "");
  const [descripcion, setDescripcion] = useState(product?.body_html || "");
  const [productType, setProductType] = useState(product?.product_type || "");
  const [tags, setTags] = useState(
    Array.isArray(product?.tags) ? product.tags.join(", ") : product?.tags || ""
  );
  const [estado, setEstado] = useState(product?.status || "active");

  // Por esta:
  const rawVariants = Array.isArray(product?.variants)
    ? product.variants
    : product?.variants
    ? [product.variants]
    : [];
  const [hasVariants, setHasVariants] = useState(rawVariants.length > 1);
  const [variants, setVariants] = useState([]);
  const [mainMediaPreviewUrl, setMainMediaPreviewUrl] = useState(
    product?.image?.src || ""
  );
  const [mainFile, setMainFile] = useState(null);

  const [location, setLocation] = useState(null);
  const [locations, setLocations] = useState([]);
  const [isCustomType, setIsCustomType] = useState(false);

  const [productMedia, setProductMedia] = useState([]); // <-- NUEVO: todos los medios
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaType, setMediaType] = useState("video"); // video o image

  useEffect(() => {
    if (!product?.media || product.media.length === 0) {
      setProductMedia([]);
      return;
    }

    const loadedMedia = product.media.map((m, index) => {
      let previewUrl = "";
      let type = "image";

      if (m.__typename === "MediaImage" && m.image?.url) {
        previewUrl = m.image.url;
        type = "image";
      } else if (m.__typename === "Video" && m.sources?.[0]?.url) {
        previewUrl = m.sources[0].url;
        type = "video";
      } else {
        previewUrl = "/images/default-image.png";
        type = "image";
      }

      return {
        id: Date.now() + Math.random(),
        shopifyId: m.id, // ID real de Shopify
        previewUrl,
        type,
        file: null,
        originalData: m,
      };
    });

    setProductMedia(loadedMedia);
  }, [product?.media]);

  useEffect(() => {
    const variantsWithImages = rawVariants.map((variant, index) => {
      let image = product?.images?.find((img) =>
        img.variant_ids?.includes(variant.id)
      );

      if (!image && variant.image_id) {
        image = product?.images?.find((img) => img.id === variant.image_id);
      }

      if (
        !image &&
        rawVariants.length === 1 &&
        index === 0 &&
        product?.image?.src
      ) {
        image = product.image;
      }

      return {
        ...variant,
        image_src: image?.src ?? "", // imagen original del backend
        file: null, // archivo nuevo si el usuario carga uno
        temp_url: null, // preview temporal blob:
        image_changed: false, // indica si el usuario cambió la imagen
      };
    });

    setVariants(variantsWithImages);
  }, [product]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await getLocations();
        if (data.success) {
          setLocations(data.locations);
        }
      } catch (error) {
        console.error("Error al cargar ubicaciones:", error);
      }
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        // Tomamos el inventory_item_id de la primera variante (todas están en la misma sucursal)
        const inventoryItemId = product?.variants?.[0]?.inventory_item_id;
        if (!inventoryItemId) return;

        const data = await getInventoryLocation(inventoryItemId);

        if (data.success && Array.isArray(data.inventory_levels)) {
          // Busca la ubicación que tenga stock (o la primera si todas son 0)
          const found =
            data.inventory_levels.find((lvl) => lvl.available > 0) ||
            data.inventory_levels[0];
          setLocation({
            location_id: found.location_id,
            location_name: found.location_name,
          });
        }
      } catch (error) {
        console.error("Error al cargar ubicación del producto:", error);
      }
    };

    fetchLocation();
  }, [product]);

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // 🔹 Maneja cambios en el campo de imagen principal
  const handleMainMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMainMediaPreviewUrl(url);
      setMainFile(file);
    }
  };

  // 🔹 Maneja cambios en variantes
  const handleVariantChange = (index, field, value) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  // 🔹 Guardar cambios
  // Guardar cambios
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    // 1️⃣ Preguntar si está seguro
    const { isConfirmed } = await Swal.fire({
      title: "¿Actualizar producto?",
      text: "¿Está seguro de que desea guardar los cambios?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, actualizar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    });

    if (!isConfirmed) {
      setLoading(false);
      return;
    }

    // 2️⃣ Mostrar modal de espera bloqueante
    Swal.fire({
      title: "Actualizando producto...",
      text: "Por favor, espere mientras se guardan los cambios.",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("titulo", titulo);
      formData.append("descripcion", descripcion);
      formData.append("product_type", productType);
      formData.append("tags", tags);
      formData.append("estado", estado);

      if (location?.location_id) {
        formData.append("location_id", location.location_id);
      }

      productMedia.forEach((media, i) => {
        if (media.file) formData.append(`product_medias[${i}]`, media.file);
        formData.append(`media_order[${i}]`, media.shopifyId || "new");
      });

      const originalOptions = Array.isArray(product?.options)
        ? product.options
        : [];

      const newOptions = Array.isArray(variants[0]?.newOptions)
        ? variants[0].newOptions
        : [];

      const allOptions = [...originalOptions, ...newOptions];

      const optionNames = {};
      allOptions.forEach((opt, index) => {
        optionNames[index + 1] = opt.name || `Opción ${index + 1}`;
      });

      formData.append("option_names", JSON.stringify(optionNames));
      const payloadVariants = variants.map((v) => ({
        id: v.id || null,
        price: v.price ?? "",
        inventory_quantity: v.inventory_quantity ?? 0,
        sku: v.sku ?? "",
        option1: v.option1 ?? null,
        option2: v.option2 ?? null,
        option3: v.option3 ?? null,
      }));
      formData.append("variants", JSON.stringify(payloadVariants));

      variants.forEach((v) => {
        if (v.image_changed && v.file)
          formData.append("variant_images[]", v.file);
      });

      const result = await updateProduct(product.id, formData);

      Swal.close(); // Cerrar modal de carga

      if (result.success) {
        await Swal.fire({
          icon: "success",
          title: "Producto actualizado",
          text: "✅ Los cambios se guardaron correctamente.",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "Aceptar",
        });
        onUpdate(); // Recargar productos
      } else {
        Swal.fire({
          icon: "error",
          title: "Error al actualizar producto",
          text:
            result.errors ||
            result.error ||
            "Ocurrió un error inesperado en el servidor.",
          confirmButtonColor: "#d33",
          confirmButtonText: "Cerrar",
        });
        console.error("Errores del backend:", result.errors || result.error);
      }
    } catch (err) {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "❌ No se pudo conectar al backend.",
        confirmButtonColor: "#d33",
        confirmButtonText: "Cerrar",
      });
      console.error("Error en handleSubmit:", err);
    } finally {
      setLoading(false);
    }
  };
  const addVariant = () => {
    // Obtener las opciones globales actuales de la primera variante (si existen)
    const globalOptions = variants[0]?.newOptions || [];

    setVariants([
      ...variants,
      {
        price: "",
        inventory_quantity: 0,
        sku: "",
        image_src: "",
        file: null,
        newOptions: globalOptions.map((opt) => ({ ...opt })), // copia las opciones globales
      },
    ]);
  };
  // Eliminar variante por índice
  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  // Manejar cambio en valores de opciones por variante
  const handleVariantOptionChange = (variantIndex, optionIndex, value) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[variantIndex][`option${optionIndex + 1}`] = value;
      return updated;
    });
  };

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
    "video/quicktime", // mov
    "video/x-m4v",
  ];

  const handleAddMedia = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isImage = IMAGE_TYPES.includes(file.type);
    const isVideo = VIDEO_TYPES.includes(file.type);

    // ❌ Tipo NO permitido
    if (!isImage && !isVideo) {
      Swal.fire({
        icon: "error",
        title: "Tipo no permitido",
        text: "Solo puedes subir imágenes (jpg, png, webp, heic, heif, gif) o videos (mp4, webm, mov).",
      });
      e.target.value = "";
      return;
    }

    // ❌ Si es VIDEO → permitir máximo 2
    if (isVideo) {
      const videoCount = productMedia.filter((m) => m.type === "video").length;

      if (videoCount >= 2) {
        Swal.fire({
          icon: "warning",
          title: "Máximo 2 videos",
          text: "Ya tienes 2 videos agregados. Elimina uno para añadir otro.",
        });
        e.target.value = "";
        return;
      }
    }

    if (isImage) {
      const imageCount = productMedia.filter((m) => m.type === "image").length;

      if (imageCount >= 5) {
        Swal.fire({
          icon: "warning",
          title: "Máximo 5 imágenes",
          text: "Ya tienes 5 imágenes agregadas. Elimina una para añadir otra.",
        });
        e.target.value = "";
        return;
      }
    }
    // Si todo OK → añadir normalmente
    const previewUrl = URL.createObjectURL(file);

    setProductMedia((prev) => [
      ...prev,
      {
        file,
        previewUrl,
        type: isImage ? "image" : "video",
        id: Date.now() + Math.random(),
        shopifyId: null,
      },
    ]);

    setShowMediaModal(false);
    e.target.value = "";
  };
  const deleteMedia = async (index) => {
    const mediaToDelete = productMedia[index];
    if (!mediaToDelete) return;

    // Si el medio no tiene shopifyId (archivo local, aún no subido)
    if (!mediaToDelete.shopifyId) {
      setProductMedia((prev) => {
        const updated = [...prev];
        if (updated[index].previewUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(updated[index].previewUrl);
        }
        updated.splice(index, 1);
        return updated;
      });
      return; // Salimos sin alertas ni llamadas al backend
    }

    // Para medios ya subidos a Shopify
    const { isConfirmed } = await Swal.fire({
      title: "¿Eliminar medio?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!isConfirmed) return;

    Swal.fire({
      title: "Eliminando...",
      text: "Por favor, espere...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const result = await deleteProductMediaService(
        product.id,
        mediaToDelete.shopifyId
      );
      if (!result.success)
        throw new Error(result.error || "No se pudo eliminar el medio.");

      setProductMedia((prev) => {
        const updated = [...prev];
        if (updated[index].previewUrl?.startsWith("blob:"))
          URL.revokeObjectURL(updated[index].previewUrl);
        updated.splice(index, 1);
        return updated;
      });

      Swal.fire({
        icon: "success",
        title: "Medio eliminado",
        text: "Se eliminó correctamente.",
      });

      onUpdate?.();
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: error.message });
    }
  };

  const setAsFirst = async (index) => {
    const mediaToSet = productMedia[index];
    if (!mediaToSet) return;

    if (!mediaToSet.shopifyId) {
      Swal.fire({
        icon: "info",
        title: "Medio no guardado",
        text: "Primero debes guardar los cambios para establecer como principal.",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    const { isConfirmed } = await Swal.fire({
      title: "¿Establecer como principal?",
      text: "El medio seleccionado se mostrará primero en el producto.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, establecer",
      cancelButtonText: "Cancelar",
    });

    if (!isConfirmed) return;

    Swal.fire({
      title: "Actualizando...",
      text: "Por favor, espere...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const result = await setMediaAsFirstService(
        product.id,
        mediaToSet.shopifyId
      );
      if (!result.success)
        throw new Error(
          result.error || "No se pudo establecer como principal."
        );

      setProductMedia((prev) => {
        const updated = [...prev];
        const [item] = updated.splice(index, 1);
        updated.unshift(item);
        return updated;
      });

      Swal.fire({
        icon: "success",
        title: "Medio principal actualizado",
        text: "El medio seleccionado ahora es el principal.",
      });

      onUpdate?.();
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: error.message });
    }
  };

  // Añadir una nueva opción global con nombre
  const addGlobalOption = () => {
    const currentOptionsCount =
      (product?.options?.length || 0) + (variants[0]?.newOptions?.length || 0);

    if (currentOptionsCount >= 3) return;

    const optionName = prompt("Ingrese el nombre de la nueva opción:");
    if (!optionName || !optionName.trim()) return;

    const trimmedName = optionName.trim();

    setVariants((prev) =>
      prev.map((v) => ({
        ...v,
        newOptions: [...(v.newOptions || []), { name: trimmedName }],
      }))
    );
  };

  return (
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
              <h3>Editar Producto</h3>
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

                        {/* ===== NUEVA SECCIÓN MULTIMEDIA (reemplaza TODO lo de imágenes) ===== */}
                        <div className="form-group image-container">
                          <label>Multimedia del producto:</label>
                          <div className="media-card">
                            <div className="media-grid">
                              {productMedia.length === 0 ? (
                                <div className="no-media">
                                  No hay medios agregados aún.
                                </div>
                              ) : (
                                productMedia.map((media, index) => (
                                  <div
                                    key={media.id || index}
                                    className={`media-item ${
                                      index === 0 ? "first-media" : ""
                                    }`}
                                  >
                                    {media.type === "image" ? (
                                      <img
                                        src={media.previewUrl}
                                        alt="Preview"
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

                {/* Columna Derecha */}
                <div className="right-column-productos">
                  <div className="form-group-border">
                    <div className="form-group">
                      <label>Estado:</label>
                      <select
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
                    <div className="form-group">
                      <label>Sucursal / Ubicación:</label>
                      {locations.length > 0 ? (
                        <select
                          className="input-field"
                          value={location?.location_id || ""}
                          onChange={(e) => {
                            const selected = locations.find(
                              (loc) => loc.id === parseInt(e.target.value)
                            );
                            if (selected) {
                              setLocation({
                                location_id: selected.id,
                                location_name: selected.name,
                              });
                            }
                          }}
                        >
                          {locations.map((loc) => (
                            <option key={loc.id} value={loc.id}>
                              {loc.name}
                            </option>
                          ))}
                        </select>
                      ) : location ? (
                        <input
                          type="text"
                          className="input-field"
                          value={location.location_name}
                          readOnly
                        />
                      ) : (
                        <p>Cargando ubicación...</p>
                      )}
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
                            setProductType(""); // permitir escribir
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
                          placeholder="Escribe el tipo de producto"
                          value={productType}
                          onChange={(e) => setProductType(e.target.value)}
                          style={{ marginTop: "8px" }}
                        />
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="tags">Tags:</label>
                      <input
                        id="tags"
                        type="text"
                        className="input-field"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="form-content-grid">
                <div className="left-column-productos">
                  {/* Siempre mostramos la sección de variantes (incluso con 1 sola) */}
                  <div className="form-group-border">
                    <div className="variant-section">
                      <p>
                        {variants.length === 1
                          ? "Variante"
                          : `Variantes (${variants.length})`}
                      </p>

                      {variants.map((v, i) => (
                        <div key={i} className="variant-card">
                          {/* Renderizar opciones existentes + nuevas globales */}
                          {[
                            ...(product?.options || []),
                            ...(v.newOptions || []),
                          ]
                            .slice(0, 3)
                            .map((opt, idx) => (
                              <div className="form-group" key={idx}>
                                <label>
                                  {opt.name || `Opción ${idx + 1}`}:
                                </label>
                                <input
                                  type="text"
                                  className="input-field"
                                  value={v[`option${idx + 1}`] || ""}
                                  onChange={(e) =>
                                    handleVariantOptionChange(
                                      i,
                                      idx,
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            ))}

                          {/* Precio, Inventario, SKU, Imagen */}
                          <div className="form-group">
                            <label>Precio:</label>
                            <input
                              type="number"
                              className="input-field"
                              value={v.price || ""}
                              onChange={(e) =>
                                handleVariantChange(i, "price", e.target.value)
                              }
                            />
                          </div>

                          <div className="form-group">
                            <label>Inventario:</label>
                            <input
                              type="number"
                              className="input-field"
                              value={v.inventory_quantity || 0}
                              onChange={(e) =>
                                handleVariantChange(
                                  i,
                                  "inventory_quantity",
                                  e.target.value
                                )
                              }
                            />
                          </div>

                          <div className="form-group">
                            <label>SKU:</label>
                            <input
                              type="text"
                              className="input-field"
                              value={v.sku || ""}
                              onChange={(e) =>
                                handleVariantChange(i, "sku", e.target.value)
                              }
                            />
                          </div>

                          <div className="form-group">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files[0];

                                setVariants((prev) => {
                                  const updated = [...prev];
                                  const variant = { ...updated[i] };

                                  if (file) {
                                    // Si selecciona una imagen nueva
                                    if (
                                      variant.temp_url &&
                                      variant.temp_url.startsWith("blob:")
                                    ) {
                                      try {
                                        URL.revokeObjectURL(variant.temp_url);
                                      } catch (err) {}
                                    }

                                    const previewUrl =
                                      URL.createObjectURL(file);
                                    variant.file = file;
                                    variant.temp_url = previewUrl;
                                    variant.image_changed = true;

                                    console.log(
                                      `✅ Variante ${i + 1}: nueva imagen`,
                                      file.name
                                    );
                                  } else {
                                    console.log(
                                      `ℹ️ Variante ${
                                        i + 1
                                      }: sin archivo, mantiene original`
                                    );
                                  }

                                  updated[i] = variant;
                                  return updated;
                                });
                              }}
                            />

                            <div className="variant-image-preview">
                              {v.temp_url ? (
                                <img
                                  src={v.temp_url}
                                  alt={`Preview variante ${i + 1}`}
                                  className="variant-preview"
                                />
                              ) : v.image_src ? (
                                <img
                                  src={v.image_src}
                                  alt={`Imagen original variante ${i + 1}`}
                                  className="variant-preview"
                                />
                              ) : (
                                <span>Vista previa variante {i + 1}</span>
                              )}
                            </div>

                            {v.image_changed && (
                              <button
                                type="button"
                                className="btn-base btn-secondary"
                                onClick={() => {
                                  setVariants((prev) => {
                                    const updated = [...prev];
                                    const variant = { ...updated[i] };

                                    // Liberar URL temporal
                                    if (
                                      variant.temp_url &&
                                      variant.temp_url.startsWith("blob:")
                                    ) {
                                      try {
                                        URL.revokeObjectURL(variant.temp_url);
                                      } catch (e) {}
                                    }

                                    variant.temp_url = null;
                                    variant.file = null;
                                    variant.image_changed = false;

                                    updated[i] = variant;
                                    return updated;
                                  });
                                }}
                              >
                                Revertir imagen
                              </button>
                            )}
                          </div>

                          {/* Solo mostrar eliminar si hay más de 1 variante */}
                          {variants.length > 1 && (
                            <button
                              type="button"
                              className="btn-base btn-danger"
                              onClick={() => removeVariant(i)}
                            >
                              Eliminar Variante
                            </button>
                          )}
                        </div>
                      ))}

                      {/* Botón para añadir nueva opción global (máx 3) */}
                      {(variants[0]?.newOptions?.length || 0) +
                        (product?.options?.length || 0) <
                        3 && (
                        <button
                          type="button"
                          className="btn-base btn-secondary"
                          onClick={addGlobalOption}
                        >
                          Añadir Opción
                        </button>
                      )}

                      {/* Botón para añadir variante (siempre visible) */}
                      <button
                        type="button"
                        className="btn-base btn-primary"
                        onClick={addVariant}
                      >
                        Añadir Variante
                      </button>
                    </div>
                  </div>
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
                    {loading ? "Guardando..." : "Guardar Cambios"}
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
                  backgroundColor: "rgba(0,0,0,0.5)",
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
                    background: "white",
                    padding: "24px",
                    borderRadius: "12px",
                    width: "420px",
                    maxWidth: "90%",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <h2 style={{ margin: 0 }}>Subir Nuevo Medio</h2>
                    <button
                      onClick={() => setShowMediaModal(false)}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: "2rem",
                        cursor: "pointer",
                      }}
                    >
                      ×
                    </button>
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <button
                      onClick={() => setMediaType("video")}
                      style={{
                        padding: "10px 20px",
                        marginRight: "10px",
                        background: mediaType === "video" ? "#007bff" : "white",
                        color: mediaType === "video" ? "white" : "#333",
                        border: "2px solid #007bff",
                        borderRadius: "8px",
                      }}
                    >
                      Video
                    </button>
                    <button
                      onClick={() => setMediaType("image")}
                      style={{
                        padding: "10px 20px",
                        background: mediaType === "image" ? "#007bff" : "white",
                        color: mediaType === "image" ? "white" : "#333",
                        border: "2px solid #007bff",
                        borderRadius: "8px",
                      }}
                    >
                      Imagen
                    </button>
                  </div>

                  <input
                    type="file"
                    accept={
                      mediaType === "video"
                        ? "video/mp4,video/quicktime"
                        : "image/*"
                    }
                    onChange={handleAddMedia}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "2px dashed #007bff",
                      borderRadius: "8px",
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProduct;
