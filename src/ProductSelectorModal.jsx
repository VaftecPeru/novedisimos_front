// ProductSelectorModal.js
import React, { useState, useEffect } from "react";
import { fetchProductsMedia } from "./components/services/shopifyService";

function ProductSelectorModal({ isOpen, onClose, onAddProducts, alreadySelectedIds = [], initialQuery = "" }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]); // ids numéricos
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);

  // Cuando se abre el modal inicializamos
  useEffect(() => {
    if (isOpen) {
      setSearchTerm(initialQuery || "");
      // Normalizamos tipos: si alreadySelectedIds viene como strings, convertir a number cuando sea posible
      const normalized = (alreadySelectedIds || []).map(id => {
        const n = Number(id);
        return Number.isNaN(n) ? id : n;
      });
      setSelectedIds(normalized);

      setLoading(true);
      fetchProductsMedia()
        .then(fetchedProducts => {
          setProducts(Array.isArray(fetchedProducts) ? fetchedProducts : []);
        })
        .catch(err => {
          console.error("fetchProductsMedia error:", err);
          setProducts([]);
        })
        .finally(() => setLoading(false));
    } else {
      // opcional: limpiar cuando se cierra
      // setProducts([]);
      // setSelectedIds([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialQuery, JSON.stringify(alreadySelectedIds)]); // stringify para detectar cambios en array prop

  // Computar categorías únicas una vez que products se carga
  useEffect(() => {
    if (products.length > 0) {
      const uniqueCategories = [...new Set(products.map(p => p.productType).filter(Boolean))].sort();
      setCategories(uniqueCategories);
    }
  }, [products]);

  // Filtrado (case-insensitive) por título y categoría
  const filteredProducts = products.filter(p =>
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!selectedCategory || p.productType === selectedCategory)
  );

  const toggleProduct = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 2000, alignItems: 'flex-start', paddingTop: '50px' }}>
      <div className="modal-container" style={{ width: "650px", maxHeight: "85vh", display: 'flex', flexDirection: "column" }}>
        <div style={{ padding: "15px 20px", borderBottom: "1px solid #dfe3e8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>Agregar productos</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#5c5f62" }}>&times;</button>
        </div>

        <div style={{ padding: "15px 20px", borderBottom: "1px solid #dfe3e8", background: "#f9fafb" }}>
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ position: "relative", width: "600px" }}>
              <input
                type="text"
                placeholder="Buscar productos"
                className="input-field"
                style={{ paddingLeft: "30px", borderRadius: "4px", borderColor: "#c4cdd5" }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="btn-base"
              style={{ appearance: "none", WebkitAppearance: "none", MozAppearance: "none", backgroundImage: "none", background: "white", border: "1px solid #c4cdd5", color: "#212b36", margin: 0, padding: "8px 12px", cursor: "pointer", width: "250px" }}
            >
              <option value="">Categorías</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 0 }}>
          {loading && (
            <div style={{ padding: "20px", textAlign: "center", color: "#637381" }}>Cargando productos...</div>
          )}

          {!loading && filteredProducts.map(product => {
            // normalize tipos para comparar
            const productId = typeof product.id === "string" ? Number(product.id) : product.id;
            const isAlreadyAdded = (alreadySelectedIds || []).some(a => {
              const an = Number(a);
              return !Number.isNaN(an) ? an === productId : a === productId;
            });
            const isChecked = selectedIds.includes(productId);

            return (
              <div
                key={productId}
                onClick={() => !isAlreadyAdded && toggleProduct(productId)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 20px",
                  borderBottom: "1px solid #f4f6f8",
                  cursor: isAlreadyAdded ? "default" : "pointer",
                  background: isChecked ? "#f4f6f8" : "white",
                  opacity: isAlreadyAdded ? 0.5 : 1
                }}
              >
                <div style={{ marginRight: "15px" }}>
                  <input
                    type="checkbox"
                    checked={isChecked || isAlreadyAdded}
                    disabled={isAlreadyAdded}
                    onChange={(e) => {
                      e.stopPropagation();
                      if (!isAlreadyAdded) toggleProduct(productId);
                    }}
                    style={{ transform: "scale(1.2)", cursor: isAlreadyAdded ? "not-allowed" : "pointer" }}
                  />
                </div>

                <img
                  src={product.image || "/images/default-image.png"}
                  alt={product.title || ""}
                  style={{ width: "40px", height: "40px", borderRadius: "4px", border: "1px solid #dfe3e8", marginRight: "15px", objectFit: "cover" }}
                />

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#212b36" }}>{product.title}</div>
                </div>

              </div>
            );
          })}

          {!loading && filteredProducts.length === 0 && (
            <div style={{ padding: "40px", textAlign: "center", color: "#637381" }}>
              No se encontraron productos que coincidan con "{searchTerm}".
            </div>
          )}
        </div>

        <div style={{ padding: "15px 20px", borderTop: "1px solid #dfe3e8", display: "flex", justifyContent: "space-between", alignItems: "center", background: "white" }}>
          <div style={{ fontSize: "0.9rem", color: "#637381" }}>
            {selectedIds.length} seleccionados
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={onClose} className="btn-base" style={{ background: "white", border: "1px solid #c4cdd5", color: "#212b36", margin: 0 }}>
              Cancelar
            </button>
            <button
              onClick={() => {
                const productsToAdd = products.filter(p => {
                  const pid = typeof p.id === "string" ? Number(p.id) : p.id;
                  return selectedIds.includes(pid);
                });
                onAddProducts(productsToAdd);
              }}
              className="btn-base btn-primary"
              style={{ margin: 0, width: "auto", padding: "8px 20px" }}
              disabled={selectedIds.length === 0}
            >
              Agregar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductSelectorModal;