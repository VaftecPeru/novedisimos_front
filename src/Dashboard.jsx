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
    setExpanded(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
      </header>
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="imagen-header">
            <img className="img-logo" src="../images/ovedisimos-dashboard.png" alt="Imagen de login" />
          </div>
        </div>
        <nav>
          <ul className="main-menu">
            <li className={`main-menu-item ${expanded.panel ? 'expanded' : ''}`}>
              <div className="menu-item-header" onClick={() => toggleSection('panel')}>
              <img src="/images/gear.png" alt="Reportes" style={{ width: '22px', height: '22px' }} />
                <i className="fas fa-shopping-cart"></i>
                <span style={{ fontWeight: 400, fontSize: 18 }}>Panel Control</span>
                <i className={`fas fa-chevron-${expanded.panel ? 'down' : 'right'}`}></i>
              </div>
              {expanded.panel && (
                <ul className="submenu">
                  <li>Pedidos</li>
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
            <li className={`main-menu-item ${expanded.clientes ? 'expanded' : ''}`}>
              <div className="menu-item-header" onClick={() => toggleSection('clientes')}>
              <img src="/images/folder.png" alt="Reportes" style={{ width: '22px', height: '22px' }} />
                <i className="fas fa-users"></i> 
                <span style={{ fontWeight: 400, fontSize: 18 }}>Clientes</span>
                <i className={`fas fa-chevron-${expanded.clientes ? 'down' : 'right'}`}></i>
              </div>
              {expanded.clientes && <ul className="submenu">
                <li>Cliente 1</li>
                <li>Cliente 2</li>
                </ul>}
            </li>
            <li className={`main-menu-item ${expanded.motorizados ? 'expanded' : ''}`}>
              <div className="menu-item-header" onClick={() => toggleSection('motorizados')}>
              <img src="/images/file.png" alt="Reportes" style={{ width: '22px', height: '22px' }} />
                <i className="fas fa-motorcycle"></i> 
                <span style={{ fontWeight: 400, fontSize: 18 }}>Motorizados</span>
                <i className={`fas fa-chevron-${expanded.motorizados ? 'down' : 'right'}`}></i>
              </div>
              {expanded.motorizados && <ul className="submenu">
                <li>Motorizado 1</li>
                <li>Motorizado 2</li>
                </ul>}
            </li>
            <li className={`main-menu-item ${expanded.asesores ? 'expanded' : ''}`}>
              <div className="menu-item-header" onClick={() => toggleSection('asesores')}>
              <img src="/images/tv.png" alt="Asesores" style={{ width: '22px', height: '22px' }} />
                <i className="fas fa-user-tie"></i> 
                <span style={{ fontWeight: 400, fontSize: 18 }}>Asesores</span>
                <i className={`fas fa-chevron-${expanded.asesores ? 'down' : 'right'}`}></i>
              </div>
              {expanded.asesores && <ul className="submenu">
                <li>Asesor 1</li>
                <li>Asesor 2</li>
                </ul>}
            </li>
            <li className={`main-menu-item ${expanded.reportes ? 'expanded' : ''}`}>
            <div className="menu-item-header" onClick={() => toggleSection('reportes')}>
            <img src="/images/report.png" alt="Reportes" style={{ width: '22px', height: '22px' }} />
            <i className="fas fa-user-tie"></i> 
              <span style={{ fontWeight: 400, fontSize: 18 }}>Reportes</span>
              <i className={`fas fa-chevron-${expanded.reportes ? 'down' : 'right'}`}></i>
              </div>
              {expanded.reportes && <ul className="submenu">
                <li>Reporte 1</li>
                <li>Reporte 2</li>
                </ul>}
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default Dashboard;