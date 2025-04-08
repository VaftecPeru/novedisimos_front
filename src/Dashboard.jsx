import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css';
import PedidosDashboard from './PedidosDashboard';

function Dashboard() {
  const [expanded, setExpanded] = useState({
    panel: true, 
    clientes: false,
    motorizados: false,
    asesores: false,
    reportes: false,
  });

  const [activeSection, setActiveSection] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const path = location.pathname.split('/');
    const lastSegment = path[path.length - 1];
    
    if (lastSegment !== 'dashboard') {
      setActiveSection(lastSegment);
    }
  }, [location.pathname]);

  const toggleSection = (section) => {
    setExpanded({
      ...expanded,
      [section]: !expanded[section],
    });
  };

  const handleSectionClick = (section) => {
    setActiveSection(section);
    navigate(`/dashboard/${section}`);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'pedidos':
        return <PedidosDashboard />;
      case 'productos':
        return <div>Contenido de Productos</div>;
      case 'categorias':
        return <div>Contenido de Categorías</div>;
      case 'almacen':
        return <div>Contenido de Almacén</div>;
      case 'devolucion':
        return <div>Contenido de Devolución</div>;
      case 'reparto':
        return <div>Contenido de Reparto</div>;
      case 'seguimiento':
        return <div>Contenido de Seguimiento</div>;
      case 'calendario':
        return <div>Contenido de Calendario</div>;
      default:
        return <div className="welcome-dashboard">Bienvenido al Panel de Control. Selecciona una opción del menú para comenzar.</div>;
    }
  };

  return (
    <div className="dashboard-container">
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
                <img src="/images/gear.png" alt="Panel Control" style={{ width: '22px', height: '22px' }} />
                <span style={{ fontWeight: 400, fontSize: 18 }}>Panel Control</span>
                <i className={`fas fa-chevron-${expanded.panel ? 'down' : 'right'}`}></i>
              </div>
              {expanded.panel && (
                <ul className="submenu">
                  <li onClick={() => handleSectionClick('pedidos')} className={activeSection === 'pedidos' ? 'active' : ''}>Pedidos</li>
                  <li onClick={() => handleSectionClick('productos')} className={activeSection === 'productos' ? 'active' : ''}>Productos</li>
                  <li onClick={() => handleSectionClick('categorias')} className={activeSection === 'categorias' ? 'active' : ''}>Categorias</li>
                  <li onClick={() => handleSectionClick('almacen')} className={activeSection === 'almacen' ? 'active' : ''}>Almacen</li>
                  <li onClick={() => handleSectionClick('devolucion')} className={activeSection === 'devolucion' ? 'active' : ''}>Devolución</li>
                  <li onClick={() => handleSectionClick('reparto')} className={activeSection === 'reparto' ? 'active' : ''}>Reparto</li>
                  <li onClick={() => handleSectionClick('seguimiento')} className={activeSection === 'seguimiento' ? 'active' : ''}>Seguimiento</li>
                  <li onClick={() => handleSectionClick('calendario')} className={activeSection === 'calendario' ? 'active' : ''}>Calendario</li>
                </ul>
              )}
            </li>
            <li className={`main-menu-item ${expanded.clientes ? 'expanded' : ''}`}>
              <div className="menu-item-header" onClick={() => toggleSection('clientes')}>
                <img src="/images/folder.png" alt="Clientes" style={{ width: '22px', height: '22px' }} />
                <span style={{ fontWeight: 400, fontSize: 18 }}>Clientes</span>
                <i className={`fas fa-chevron-${expanded.clientes ? 'down' : 'right'}`}></i>
              </div>
              {expanded.clientes && (
                <ul className="submenu">
                  <li onClick={() => handleSectionClick('cliente1')} className={activeSection === 'cliente1' ? 'active' : ''}>Cliente 1</li>
                  <li onClick={() => handleSectionClick('cliente2')} className={activeSection === 'cliente2' ? 'active' : ''}>Cliente 2</li>
                </ul>
              )}
            </li>
            <li className={`main-menu-item ${expanded.motorizados ? 'expanded' : ''}`}>
              <div className="menu-item-header" onClick={() => toggleSection('motorizados')}>
                <img src="/images/file.png" alt="Motorizados" style={{ width: '22px', height: '22px' }} />
                <span style={{ fontWeight: 400, fontSize: 18 }}>Motorizados</span>
                <i className={`fas fa-chevron-${expanded.motorizados ? 'down' : 'right'}`}></i>
              </div>
              {expanded.motorizados && (
                <ul className="submenu">
                  <li onClick={() => handleSectionClick('motorizado1')} className={activeSection === 'motorizado1' ? 'active' : ''}>Motorizado 1</li>
                  <li onClick={() => handleSectionClick('motorizado2')} className={activeSection === 'motorizado2' ? 'active' : ''}>Motorizado 2</li>
                </ul>
              )}
            </li>
            <li className={`main-menu-item ${expanded.asesores ? 'expanded' : ''}`}>
              <div className="menu-item-header" onClick={() => toggleSection('asesores')}>
                <img src="/images/tv.png" alt="Asesores" style={{ width: '22px', height: '22px' }} />
                <span style={{ fontWeight: 400, fontSize: 18 }}>Asesores</span>
                <i className={`fas fa-chevron-${expanded.asesores ? 'down' : 'right'}`}></i>
              </div>
              {expanded.asesores && (
                <ul className="submenu">
                  <li onClick={() => handleSectionClick('asesor1')} className={activeSection === 'asesor1' ? 'active' : ''}>Asesor 1</li>
                  <li onClick={() => handleSectionClick('asesor2')} className={activeSection === 'asesor2' ? 'active' : ''}>Asesor 2</li>
                </ul>
              )}
            </li>
            <li className={`main-menu-item ${expanded.reportes ? 'expanded' : ''}`}>
              <div className="menu-item-header" onClick={() => toggleSection('reportes')}>
                <img src="/images/report.png" alt="Reportes" style={{ width: '22px', height: '22px' }} />
                <span style={{ fontWeight: 400, fontSize: 18 }}>Reportes</span>
                <i className={`fas fa-chevron-${expanded.reportes ? 'down' : 'right'}`}></i>
              </div>
              {expanded.reportes && (
                <ul className="submenu">
                  <li onClick={() => handleSectionClick('reporte1')} className={activeSection === 'reporte1' ? 'active' : ''}>Reporte 1</li>
                  <li onClick={() => handleSectionClick('reporte2')} className={activeSection === 'reporte2' ? 'active' : ''}>Reporte 2</li>
                </ul>
              )}
            </li>
          </ul>
        </nav>
      </div>
      <div className="dashboard-content">
        {renderContent()}
      </div>
    </div>
  );
}

export default Dashboard;