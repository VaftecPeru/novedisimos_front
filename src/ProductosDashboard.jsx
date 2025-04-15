import React, { useState, useEffect } from 'react';
import './ProductosDashboard.css';

function ProductosDashboard() {
  const [productos, setProductos] = useState([
    {
      id: 1,
      nombre: "MANTA REFRIGERANTE PARA MASCOTAS - WBX",
      descripcion: "Cuenta con una tecnología de seda difusora de calor. Ayuda a absorber el calor y el sudor rápidament",
      esGlobal: true,
    },
    {
      id: 2,
      nombre: "EJERCITADOR DE ANTEBRAZO - WBX - WBX",
      descripcion: "Los ejercitadores de dedos pueden mejorar la fuerza y la movilidad de los dedos.",
      esGlobal: true,
    },
    {
      id: 3,
      nombre: "CALEFACTOR WBX - WBX",
      descripcion: "Súper portátil y conveniente para usar este calentador para el invierno.",
      esGlobal: true,
    },
    {
      id: 4,
      nombre: "TIRAS LED ADVERTENCIA PARA PUERTAS DE COCHE - TSP1",
      descripcion: "Tiras LED Advertencia para Puertas Set de 2 Piezas de 1.20m",
      esGlobal: true,
    },
    {
      id: 5,
      nombre: "BARRAS LED DECORATIVO PARA PISO INTERIOR DE COCHE - TSP1",
      descripcion: "Led RGB control desde Bluetooth APP - Set 4 Piezas 18LED - 30CM",
      esGlobal: true,
    },
    {
      id: 6,
      nombre: "PACK SILENCIADOR PARA PUERTAS - WBX",
      descripcion: "Amortiguador para puertas de autos",
      esGlobal: true,
    },
    {
      id: 7,
      nombre: "SANI STICKS - TPDP",
      descripcion: "Limpiador de desagüe de descontaminación",
      esGlobal: true,
    },
    {
      id: 8,
      nombre: "PIZARRA MÁGICA - TPDP",
      descripcion: "Pizarra mágica para niños material de plástico AB TAMAÑO 8.5 Pulgadas",
      esGlobal: true,
    },
    {
      id: 9,
      nombre: "CORTINA IMANTADA - TPDP",
      descripcion: "Color negro",
      esGlobal: true,
    },
    {
      id: 10,
      nombre: "MOPA WONDER MULTIFUNCIONAL - WBX - WBX",
      descripcion: "Se utiliza para la limpieza de tu hogar, pero también lo puedes utilizar en tu auto u oficina.",
      esGlobal: true,
    },
    {
      id: 11,
      nombre: "CORTINA IMANTADA - TPDP",
      descripcion: "",
      esGlobal: true,
    },
    {
      id: 12,
      nombre: "CAMARA DOMO - TPPS",
      descripcion: "",
      esGlobal: true,
    },
    {
      id: 13,
      nombre: "CORONA DE BAÑO PARA NIÑOS - INP",
      descripcion: "Gorro ajustable para proteger a los bebes durante el baño",
      esGlobal: true,
    },
    {
      id: 14,
      nombre: "RIZADOR DE PESTAÑAS RECARGABLE - NDM",
      descripcion: "",
      esGlobal: true,
    },
    {
      id: 15,
      nombre: "PIZARRA MÁGICA TAMAÑO 8.5\" - GE",
      descripcion: "",
      esGlobal: true,
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const categorias = ['Todos', 'WBX', 'TPDP', 'TSP1', 'INP', 'NDM', 'GE', 'TPPS'];

  const filteredProductos = productos.filter(producto => {
    const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (producto.descripcion && producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'Todos' || producto.nombre.includes(selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProductos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProductos.length / itemsPerPage);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="productos-dashboard">
      
      <div className="productos-controls">
        <button className="add-producto-btn">+ Nuevo Producto</button>
        
        <div className="search-filters">
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Buscar producto" 
              className="search-input"
              value={searchTerm}
              onChange={handleSearch}
            />
            <button className="search-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>
          
          <div className="category-filter">
            <span>Categorías:</span>
            <select value={selectedCategory} onChange={handleCategoryChange} className="category-select">
              {categorias.map((categoria, index) => (
                <option key={index} value={categoria}>{categoria}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="productos-table-container">
        <table className="productos-table">
          <thead>
            <tr>
              <th style={{ width: '5%' }}></th>
              <th style={{ width: '30%' }}>Nombre</th>
              <th style={{ width: '45%' }}>Descripción</th>
              <th style={{ width: '10%' }}>Es global</th>
              <th style={{ width: '10%' }}>Editar</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((producto) => (
              <tr key={producto.id}>
                <td>
                  <button className="expand-button">+</button>
                </td>
                <td>{producto.nombre}</td>
                <td>{producto.descripcion}</td>
                <td className="text-center">
                  {producto.esGlobal && (
                    <span className="global-checkmark">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e9b6d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                    </span>
                  )}
                </td>
                <td>
                  <button className="edit-button">Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="pagination">
        <button 
          className="pagination-arrow" 
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          &lt;
        </button>
        
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (currentPage <= 3) {
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = currentPage - 2 + i;
          }
          
          return (
            <button 
              key={pageNum} 
              className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
              onClick={() => handlePageChange(pageNum)}
            >
              {pageNum}
            </button>
          );
        })}
        
        {totalPages > 5 && currentPage < totalPages - 2 && (
          <>
            <span className="pagination-ellipsis">...</span>
            <button 
              className="pagination-number"
              onClick={() => handlePageChange(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button 
          className="pagination-arrow" 
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          &gt;
        </button>
        
        <span className="pagination-info">
          {currentPage} / {totalPages} · {filteredProductos.length} productos
        </span>
      </div>
    </div>
  );
}

export default ProductosDashboard;