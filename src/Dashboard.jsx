import React, { useState } from 'react';
import './Dashboard.css';

function Dashboard() {
  const [expanded, setExpanded] = useState({
    panel: true, 
    clientes: false,
    motorizados: false,
    asesores: false,
    reportes: false,
  });

  const toggleSection = (section) => {
    setExpanded({
      ...expanded,
      [section]: !expanded[section],
    });
  };

  return (
    <div className="dashboard-container">
        <header className="dashboard-header">
      </header>
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
        <div className="imagen-header">
        <img clasName="img-logo" src="../images/ovedisimos-dashboard.png" alt="Imagen de login" /></div>
        </div>
        <nav>
          <ul className="main-menu">
            <li className={`main-menu-item ${expanded.panel ? 'expanded' : ''}`}>
              <div className="menu-item-header" onClick={() => toggleSection('panel')}>
                <i className="fas fa-shopping-cart"></i>
                <span style={{ fontWeight: 'bold' }}>Panel Control</span>
                <i className={`fas fa-chevron-${expanded.panel ? 'down' : 'right'}`}></i>
              </div>
              {expanded.panel && (
                <ul className="submenu">
                  <li>Productos</li>
                  <li>Categorias</li>
                  <li>Almacen</li>
                  <li>Devolución</li>
                  <li>Reparto</li>
                  <li>Seguimiento</li>
                  <li>Calendario</li>
                </ul>
              )}
            </li>
            <li className="main-menu-item">
              <div className="menu-item-header" onClick={() => toggleSection('clientes')}>
                <span style={{ fontWeight: 'bold' }}>Clientes</span>
                <i className={`fas fa-chevron-${expanded.clientes ? 'down' : 'right'}`}></i>
              </div>
              {expanded.clientes && <ul className="submenu"></ul>}
            </li>
            <li className="main-menu-item">
              <div className="menu-item-header" onClick={() => toggleSection('motorizados')}>
              <span style={{ fontWeight: 'bold' }}>Motorizados</span>
                <i className={`fas fa-chevron-${expanded.motorizados ? 'down' : 'right'}`}></i>
              </div>
              {expanded.motorizados && <ul className="submenu"></ul>}
            </li>
          </ul>
        </nav>
      </div>
      
       
    </div>
  );
}

export default Dashboard;