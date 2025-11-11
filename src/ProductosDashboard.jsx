import React, { useState, useEffect } from 'react';
import { fetchProductos, createProducto, updateProducto } from "./components/services/shopifyService";
import Swal from 'sweetalert2';
import './ProductosDashboard.css';

function ProductosDashboard() {
  const [allProductos, setAllProductos] = useState([]);
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  // Extraemos categorías únicas dinámicamente + las fijas
  const [categorias, setCategorias] = useState(['Todos']);
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Limpiar HTML
  const stripHtml = (html) => {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    return (div.textContent || div.innerText || '').substring(0, 120) + (div.textContent.length > 120 ? '...' : '');
  };

  // Calcular inventario total
  const calcularInventario = (variants) => {
    if (!variants || variants.length === 0) return { total: 0, ilimitado: false };
    let total = 0;
    let ilimitado = false;
    variants.forEach(v => {
      if (v.inventory_quantity === -1) {
        ilimitado = true;
      } else {
        total += v.inventory_quantity;
      }
    });
    return { total, ilimitado };
  };

  // Cargar productos
  const loadProductos = async () => {
    try {
      setLoading(true);
      const { productos } = await fetchProductos();
      setAllProductos(productos);
      // Extraer categorías únicas
      const types = [...new Set(productos.map(p => p.product_type).filter(Boolean))];
      setCategorias(['Todos', ...types.sort()]);
    } catch (err) {
      setError('Error al cargar productos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductos();
  }, []);

  // Filtrar
  useEffect(() => {
    let filtered = allProductos;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(term) ||
        stripHtml(p.body_html).toLowerCase().includes(term) ||
        (p.product_type && p.product_type.toLowerCase().includes(term))
      );
    }
    if (selectedCategory !== 'Todos') {
      filtered = filtered.filter(p => p.product_type === selectedCategory);
    }
    setFilteredProductos(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, allProductos]);

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProductos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProductos.length / itemsPerPage);
  const handlePageChange = (page) => setCurrentPage(page);

  // Abrir modal para nuevo
  const handleNewProduct = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
    setModalError(null);
  };

  // Abrir modal para editar
  const handleEditProduct = (producto) => {
    setSelectedProduct(producto);
    setIsModalOpen(true);
    setModalError(null);
  };

  // Cerrar modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setModalError(null);
  };

  return (
    <div className="productos-dashboard">
      <div className="productos-controls">
        <button className="add-producto-btn" onClick={handleNewProduct}>+ Nuevo Producto</button>
        <div className="search-filters">
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar producto..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="search-button">🔍</button>
          </div>
          <div className="category-filter">
            <span>Categoría:</span>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="category-select">
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {loading && <div className="loading">Cargando productos desde Shopify...</div>}
      {error && <div className="error">{error}</div>}
      <div className="productos-table-container">
        <table className="productos-table">
          <thead>
            <tr>
              <th style={{ width: '5%' }}></th>
              <th style={{ width: '25%' }}>Nombre</th>
              <th style={{ width: '30%' }}>Descripción</th>
              <th style={{ width: '12%' }}>Categoría</th>
              <th style={{ width: '10%' }}>Inventario</th>
              <th style={{ width: '8%' }}>Global</th>
              <th style={{ width: '10%' }}>Editar</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((producto) => {
              const { total, ilimitado } = calcularInventario(producto.variants);
              const stockText = ilimitado ? 'Ilimitado' : total;
              const stockClass = ilimitado ? 'stock-unlimited' : total > 0 ? 'stock-ok' : 'stock-zero';
              return (
                <tr key={producto.id}>
                  <td><button className="expand-button">+</button></td>
                  <td>{producto.title}</td>
                  <td>{stripHtml(producto.body_html)}</td>
                  <td><span className="category-badge">{producto.product_type || 'Sin categoría'}</span></td>
                  <td className={`text-center ${stockClass}`}>
                    {stockText}
                  </td>
                  <td className="text-center">
                    {producto.published_scope === 'global' && '✅'}
                  </td>
                  <td><button className="edit-button" onClick={() => handleEditProduct(producto)}>Editar</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!loading && filteredProductos.length === 0 && (
        <div className="no-results">No se encontraron productos</div>
      )}
      <div className="pagination">
        <button className="pagination-arrow" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>{"<"}</button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum = totalPages <= 5 ? i + 1 :
                       currentPage <= 3 ? i + 1 :
                       currentPage >= totalPages - 2 ? totalPages - 4 + i :
                       currentPage - 2 + i;
          return (
            <button key={pageNum} className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
              onClick={() => handlePageChange(pageNum)}>
              {pageNum}
            </button>
          );
        })}
        {totalPages > 5 && currentPage < totalPages - 2 && (
          <>
            <span className="pagination-ellipsis">...</span>
            <button className="pagination-number" onClick={() => handlePageChange(totalPages)}>{totalPages}</button>
          </>
        )}
        <button className="pagination-arrow" disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>{">"}</button>
        <span className="pagination-info">
          {currentPage} / {totalPages} · {filteredProductos.length} productos
        </span>
      </div>

      {/* Modal para crear/editar */}
      {isModalOpen && (
        <ProductoModal
          selectedProduct={selectedProduct}
          onClose={closeModal}
          onSuccess={loadProductos}
          setModalLoading={setModalLoading}
          setModalError={setModalError}
          modalLoading={modalLoading}
          modalError={modalError}
          calcularInventario={calcularInventario}
        />
      )}
    </div>
  );
}

// Componente Modal separado para mejor organización
function ProductoModal({ selectedProduct, onClose, onSuccess, modalLoading, modalError, setModalLoading, setModalError, calcularInventario }) {
  const isEdit = !!selectedProduct;
  const { total, ilimitado } = selectedProduct ? calcularInventario(selectedProduct.variants) : { total: 0, ilimitado: false };
  const initialEstado = selectedProduct
    ? (selectedProduct.status === 'active'
        ? (!ilimitado && total === 0 ? 'agotado' : 'activo')
        : 'inactivo')
    : 'activo';

  const [formData, setFormData] = useState({
    titulo: selectedProduct?.title || '',
    descripcion: selectedProduct?.body_html || '',
    categoria: selectedProduct?.product_type || '',
    precio: selectedProduct?.variants?.[0]?.price || 0,
    cantidad: selectedProduct?.variants?.[0]?.inventory_quantity || 0,
    estado: initialEstado,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const actionText = isEdit ? 'actualizar' : 'crear';
    const confirmResult = await Swal.fire({
      title: 'Confirmar',
      text: `¿Estás seguro de que quieres ${actionText} este producto?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No'
    });
    if (!confirmResult.isConfirmed) {
      return;
    }
    setModalError(null);
    setModalLoading(true);
    try {
      const dataToSend = {
        ...formData,
      };
      if (isEdit) {
        await updateProducto(selectedProduct.id, dataToSend);
      } else {
        await createProducto(dataToSend);
      }
      await Swal.fire({
        title: 'Éxito',
        text: `Producto ${actionText}do correctamente`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      onSuccess();
      onClose();
    } catch (err) {
      setModalError(err.message || 'Error al procesar el producto');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{isEdit ? 'Editar Producto' : 'Nuevo Producto'}</h2>
        {modalError && <div className="error">{modalError}</div>}
        <form onSubmit={handleSubmit}>
          <label>Título:</label>
          <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} required maxLength={255} />

          <label>Descripción:</label>
          <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} />

          <label>Categoría:</label>
          <input type="text" name="categoria" value={formData.categoria} onChange={handleChange} maxLength={255} />

          <label>Precio:</label>
          <input type="number" name="precio" value={formData.precio} onChange={handleChange} required min={0} step="0.01" />

          <label>Cantidad:</label>
          <input type="number" name="cantidad" value={formData.cantidad} onChange={handleChange} required min={0} />

          <label>Estado:</label>
          <select name="estado" value={formData.estado} onChange={handleChange} required>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="agotado">Agotado</option>
          </select>

          <div className="modal-buttons">
            <button type="submit" disabled={modalLoading}>
              {modalLoading ? 'Procesando...' : (isEdit ? 'Actualizar' : 'Crear')}
            </button>
            <button type="button" onClick={onClose} disabled={modalLoading}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductosDashboard;