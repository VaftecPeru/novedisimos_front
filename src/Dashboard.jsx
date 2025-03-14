import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import './Dashboard.css';
import MiSelect from './MiSelect'; 

Modal.setAppElement('#root');

function Dashboard() {
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

    const [searchTerm, setSearchTerm] = useState('');

    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [processingModalIsOpen, setProcessingModalIsOpen] = useState(false);
    const [completedModalIsOpen, setCompletedModalIsOpen] = useState(false);

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
      setModalIsOpen(false);
      setProcessingModalIsOpen(false);
      setCompletedModalIsOpen(false);
    };

    const handleRegister = (e) => {
      e.preventDefault(); 
      setModalIsOpen(false); 
      setProcessingModalIsOpen(true); 

      setTimeout(() => {
          setProcessingModalIsOpen(false); 
          setCompletedModalIsOpen(true); 

          setTimeout(() => {
              setCompletedModalIsOpen(false); 
              console.log("Registro completado y proceso continuado.");
          }, 1000);
      }, 3000); 
  };

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

    const distritos = [
      { value: 'distrito1', texto: 'Ancón' },
      { value: 'distrito2', texto: 'Ate' },
      { value: 'distrito3', texto: 'Barranco' },
      { value: 'distrito4', texto: 'Breña' },
      { value: 'distrito5', texto: 'Carabayllo' },
      { value: 'distrito6', texto: 'Cercado de Lima' },
      { value: 'distrito7', texto: 'Chaclacayo' },
      { value: 'distrito8', texto: 'Chorrillos' },
      { value: 'distrito9', texto: 'Cieneguilla' },
      { value: 'distrito10', texto: 'Comas' },
      { value: 'distrito11', texto: 'El Agustino' },
      { value: 'distrito12', texto: 'Independencia' },
      { value: 'distrito13', texto: 'Jesús María' },
      { value: 'distrito14', texto: 'La Molina' },
      { value: 'distrito15', texto: 'La Victoria' },
      { value: 'distrito16', texto: 'Lince' },
      { value: 'distrito17', texto: 'Los Olivos' },
      { value: 'distrito18', texto: 'Lurigancho-Chosica' },
      { value: 'distrito19', texto: 'Lurín' },
      { value: 'distrito20', texto: 'Magdalena del Mar' },
      { value: 'distrito21', texto: 'Miraflores' },
      { value: 'distrito22', texto: 'Pachacámac' },
      { value: 'distrito23', texto: 'Pucusana' },
      { value: 'distrito24', texto: 'Pueblo Libre' },
      { value: 'distrito25', texto: 'Puente Piedra' },
      { value: 'distrito26', texto: 'Punta Hermosa' },
      { value: 'distrito27', texto: 'Punta Negra' },
      { value: 'distrito28', texto: 'Rímac' },
      { value: 'distrito29', texto: 'San Bartolo' },
      { value: 'distrito30', texto: 'San Borja' },
      { value: 'distrito31', texto: 'San Isidro' },
      { value: 'distrito32', texto: 'San Juan de Lurigancho' },
      { value: 'distrito33', texto: 'San Juan de Miraflores' },
      { value: 'distrito34', texto: 'San Luis' },
      { value: 'distrito35', texto: 'San Martín de Porres' },
      { value: 'distrito36', texto: 'San Miguel' },
      { value: 'distrito37', texto: 'Santa Anita' },
      { value: 'distrito38', texto: 'Santa María del Mar' },
      { value: 'distrito39', texto: 'Santa Rosa' },
      { value: 'distrito40', texto: 'Santiago de Surco' },
      { value: 'distrito41', texto: 'Surquillo' },
      { value: 'distrito42', texto: 'Villa El Salvador' },
      { value: 'distrito43', texto: 'Villa María del Triunfo' },
  ]

  const asesor = [
    { value: 'asesor1', texto: 'Rocio' },
  ]


  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="panel-control-header">
          <h2>Panel Control</h2>
          <img src="/images/right arrow.png" alt="Icono Panel Control" className="panel-control-icon" />
          <h3>Orden de Pedido</h3>
        </div>
        <img src="/images/bell.png" alt="Reportes" className="header-icon" />
      </header>
      <div className="div-dashboard">
        <h1>Listado de Pedidos (FORMULARIO COD)</h1>
        <div className="search-input-container">
        <input
          type="text"
          placeholder="¿Qué usuarios estás buscando?"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      <img src="/images/search.png" alt="Buscar" className="search-icon" />
      </div>
      <button className="my-button" onClick={openModal}>Agregar un Cliente +</button>
      <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Registro de Cliente"
                className="modal"
                overlayClassName="overlay"
            >
    <h2>Registro de clientes que se tiene cobertura</h2>
    <form onSubmit={handleRegister}> 
        <div className="modal-content"> 
            <div className="modal-left">
                <label>Buscar</label>
                <input type="text" />
                <label>Asesor</label>
                <MiSelect opciones={asesor} />
                <label>Estado</label>
                <input type="text" />
                <label>Nombre de Cliente</label>
                <input type="text" />
                <label>Numero Celular</label>
                <input type="text" />
                <label>Direccion</label>
                <input type="text" />
                <label>Producto</label>
                <input type="text" />
            </div>
            <div className="modal-right">
                <label>Los usuarios que permite ese cambio de asesor para las comisiones son: Asesoras de 1era Linea y Asesoras de Recontacto(Las administrativas y supervisores son de apoyo, que pueden realizar cambios en el pedido por so r solicitud del cliente(añadir productos, cambio de dirección, entre otros, pero no comisionan))</label>
                <input type="text" />
                <div className="labels-row">
                    <label>Dia de ingreso</label>
                    <label>Dia de atencion</label>
                </div>
                <div className="inputs-row">
                  <div className="input-with-icon">
                    <input type="text" />
                    <img src="/images/calendar.png" alt="Buscar" className="calendar-icon" />
                </div>
                    <input type="text" />
                    <img src="/images/calendar.png" alt="Buscar" className="calendar-icon2" />
                </div>
                <div className="inputs-row2">
                <label>Dia de programado</label>
                <div className="input-with-icon">
                    <input type="text" />
                    <img src="/images/calendar.png" alt="Buscar" className="calendar-icon3" />
                </div></div>
                <label>Distrito</label>
                <MiSelect opciones={distritos} />
                <label>Referencia</label>
                <input type="text" />
                <label>Rango de Hora</label>
                <input type="text" />
                <label>Notas de Asesor</label>
                <input type="text" />
            </div>
        </div>
        <div className="modal-buttons">
                        <button type="submit">Registrar</button>
                        <button onClick={closeModal}>Cancelar</button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={processingModalIsOpen}
                contentLabel="Procesando..."
                className="modal"
                overlayClassName="overlay"
            >
                <h2>Procesando...</h2>
            </Modal>

            <Modal
                isOpen={completedModalIsOpen}
                contentLabel="Registro completado"
                className="modal"
                overlayClassName="overlay"
            >
                <h2>Registro completado</h2>
            </Modal>
        <div className="lista-clientes">
                    <ul className="lista-clientes-header">
                        <li>Nombre de Cliente</li>
                        <li>Asesor</li>
                        <li>Fecha ingreso</li>
                        <li>Correos electrónicos</li>
                        <li>Celular</li>
                        <li>Estado</li>
                        <li>Acción</li>
                    </ul>
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
                  <li className="pedidos">Pedidos</li></Link>
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
              {expanded.clientes && <ul className="submenu">
                <li>Cliente 1</li>
                <li>Cliente 2</li>
                </ul>}
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
              {expanded.motorizados && <ul className="submenu">
                <li>Motorizado 1</li>
                <li>Motorizado 2</li>
                </ul>}
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
              {expanded.asesores && <ul className="submenu">
                <li>Asesor 1</li>
                <li>Asesor 2</li>
                </ul>}
            </li>
            <li className={`main-menu-item ${expanded.reportes ? 'expanded' : ''}`}>
            <div className="menu-item-header" onClick={() => toggleSection('reportes')}>
            <img
                src={gearImages.reportes}
                alt="Reporte"
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
              {expanded.reportes && <ul className="submenu">
                <li>Reporte 1</li>
                <li>Reporte 2</li>
                </ul>}
            </li>
          </ul>
        </nav>
      </div>
      </div>
    </div>
  );
}

export default Dashboard;