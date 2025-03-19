import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

function Reparto() {
  const [expanded, setExpanded] = useState({
      panel: true,
      clientes: false,
      motorizados: false,
      asesores: false,
      reportes: false,
  });

  const [arrowImages, setArrowImages] = useState({
      panel: '/images/down arrow.png',
      clientes: '/images/shadow arrow.png',
      motorizados: '/images/shadow arrow.png',
      asesores: '/images/shadow arrow.png',
      reportes: '/images/shadow arrow.png',
  });

  const [gearImages, setGearImages] = useState({
      panel: '/images/gear.png',
      clientes: '/images/shadow folder.png',
      motorizados: '/images/shadow file.png',
      asesores: '/images/shadow tv.png',
      reportes: '/images/shadow report.png',
  });

  const [spanColors, setSpanColors] = useState({
      panel: 'white',
      clientes: '#555d8b',
      motorizados: '#555d8b',
      asesores: '#555d8b',
      reportes: '#555d8b',
  });

  const toggleSection = (section) => {
      setExpanded({
          ...expanded,
          [section]: !expanded[section],
      });

      setArrowImages((prevArrowImages) => ({
          ...prevArrowImages,
          [section]: !expanded[section]
              ? '/images/down arrow.png'
              : '/images/shadow arrow.png',
      }));

      if (section === 'panel') {
          setGearImages((prevGearImages) => ({
              ...prevGearImages,
              panel: !expanded.panel ? '/images/gear.png' : '/images/shadow gear.png',
          }));
      } else {
          setGearImages((prevGearImages) => {
              let newGearImages = { ...prevGearImages };
              switch (section) {
                  case 'clientes':
                      newGearImages.clientes = !expanded.clientes ? '/images/folder.png' : '/images/shadow folder.png';
                      break;
                  case 'motorizados':
                      newGearImages.motorizados = !expanded.motorizados ? '/images/file.png' : '/images/shadow file.png';
                      break;
                  case 'asesores':
                      newGearImages.asesores = !expanded.asesores ? '/images/tv.png' : '/images/shadow tv.png';
                      break;
                  case 'reportes':
                      newGearImages.reportes = !expanded.reportes ? '/images/report.png' : '/images/shadow report.png';
                      break;
                  default:
                      break;
              }
              return newGearImages;
          });
      }

      setSpanColors((prevSpanColors) => ({
          ...prevSpanColors,
          [section]: !expanded[section] ? 'white' : '#555d8b',
      }));
  };
  
return (
    <div className="dashboard-container">
        <header className="dashboard-header">
        <div className="panel-control-header">
          <h2>Panel Control</h2>
          <img src="/images/right arrow.png" alt="Icono Panel Control" className="panel-control-icon" />
          <h3>Reparto</h3>
        </div>
        <img src="/images/bell.png" alt="Reportes" className="header-icon" />
        </header>
        <div className="div-dashboard">
        <h1>Delivery</h1>
        </div>
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
                            <img
                                src={gearImages.panel}
                                alt="Panel Control"
                                style={{ width: '22px', height: '22px' }}
                            />
                            <i className="fas fa-shopping-cart"></i>
                            <span style={{ fontWeight: 400, fontSize: 18, color: spanColors.panel }}>Panel Control</span>
                            <i className={`fas fa-chevron-${expanded.panel ? 'down' : 'right'}`}></i>
                            <img
                                src={arrowImages.panel}
                                alt="Panel Control"
                                className="menu-icon"
                            />
                        </div>
                        {expanded.panel && (
                            <ul className="submenu">
                                <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <li>Pedidos</li>
                                </Link>
                                <Link to="/productos" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <li>Productos</li>
                                </Link>
                                <Link to="/categorias" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <li>Categorias</li>
                                </Link>
                                <Link to="/almacen" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <li>Almacen</li>
                                </Link>
                                <Link to="/devolucion" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <li>Devolución</li>
                                </Link>
                                <Link to="/reparto" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <li className="activo">Reparto</li>
                                </Link>
                                <Link to="/seguimiento" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <li>Seguimiento</li>
                                </Link>
                                <Link to="/calendario" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <li>Calendario</li>
                                </Link>
                            </ul>
                        )}
                    </li>
                    <li className={`main-menu-item ${expanded.clientes ? 'expanded' : ''}`}>
                        <div className="menu-item-header" onClick={() => toggleSection('clientes')}>
                            <img
                                src={gearImages.clientes}
                                alt="Clientes"
                                style={{ width: '22px', height: '22px' }}
                            />
                            <i className="fas fa-users"></i>
                            <span style={{ fontWeight: 400, fontSize: 18, color: spanColors.clientes }}>Clientes</span>
                            <i className={`fas fa-chevron-${expanded.clientes ? 'down' : 'right'}`}></i>
                            <img
                                src={arrowImages.clientes}
                                alt="Clientes"
                                className="menu-icon"
                            />
                        </div>
                        {expanded.clientes && (
                            <ul className="submenu">
                                <li>Cliente 1</li>
                                <li>Cliente 2</li>
                            </ul>
                        )}
                    </li>
                    <li className={`main-menu-item ${expanded.motorizados ? 'expanded' : ''}`}>
                        <div className="menu-item-header" onClick={() => toggleSection('motorizados')}>
                            <img
                                src={gearImages.motorizados}
                                alt="Motorizados"
                                style={{ width: '22px', height: '22px' }}
                            />
                            <i className="fas fa-motorcycle"></i>
                            <span style={{ fontWeight: 400, fontSize: 18, color: spanColors.motorizados }}>Motorizados</span>
                            <i className={`fas fa-chevron-${expanded.motorizados ? 'down' : 'right'}`}></i>
                            <img
                                src={arrowImages.motorizados}
                                alt="Motorizados"
                                className="menu-icon"
                            />
                        </div>
                        {expanded.motorizados && (
                            <ul className="submenu">
                                <li>Motorizado 1</li>
                                <li>Motorizado 2</li>
                            </ul>
                        )}
                    </li>
                    <li className={`main-menu-item ${expanded.asesores ? 'expanded' : ''}`}>
                        <div className="menu-item-header" onClick={() => toggleSection('asesores')}>
                            <img
                                src={gearImages.asesores}
                                alt="Asesores"
                                style={{ width: '22px', height: '22px' }}
                            />
                            <i className="fas fa-user-tie"></i>
                            <span style={{ fontWeight: 400, fontSize: 18, color: spanColors.asesores }}>Asesores</span>
                            <i className={`fas fa-chevron-${expanded.asesores ? 'down' : 'right'}`}></i>
                            <img
                                src={arrowImages.asesores}
                                alt="Asesores"
                                className="menu-icon"
                            />
                        </div>
                        {expanded.asesores && (
                            <ul className="submenu">
                                <li>Asesor 1</li>
                                <li>Asesor 2</li>
                            </ul>
                        )}
                    </li>
                    <li className={`main-menu-item ${expanded.reportes ? 'expanded' : ''}`}>
                        <div className="menu-item-header" onClick={() => toggleSection('reportes')}>
                            <img
                                src={gearImages.reportes}
                                alt="Reportes"
                                style={{ width: '22px', height: '22px' }}
                            />
                            <i className="fas fa-user-tie"></i>
                            <span style={{ fontWeight: 400, fontSize: 18, color: spanColors.reportes }}>Reportes</span>
                            <i className={`fas fa-chevron-${expanded.reportes ? 'down' : 'right'}`}></i>
                            <img
                                src={arrowImages.reportes}
                                alt="Reportes"
                                className="menu-icon"
                            />
                        </div>
                        {expanded.reportes && (
                            <ul className="submenu">
                                <li>Reporte 1</li>
                                <li>Reporte 2</li>
                            </ul>
                        )}
                    </li>
                </ul>
            </nav>
        </div>
    </div>
  );
}

export default Reparto;