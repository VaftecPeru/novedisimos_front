import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import './Dashboard.css';
import './Modal.css';
import closeIcon from '/images/close.png';

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
    const [filterOptions, setFilterOptions] = useState({
        orden: '',
        delivery: '',
        tranzabilidad: '',
        importes: '',
        pagos: '',
        productos: '',
        fechaInicio: '',
        fechaFin: '',
    });

    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [processingModalIsOpen, setProcessingModalIsOpen] = useState(false);
    const [completedModalIsOpen, setCompletedModalIsOpen] = useState(false);

    const [clients, setClients] = useState(() => {
        const storedClients = localStorage.getItem('clientsData');
        return storedClients ? JSON.parse(storedClients) : [];
    });
    const [newClient, setNewClient] = useState({
        nombre: '',
        asesor: '',
        estado: '',
        correo: '',
        celular: '',
        direccion: '',
        producto: '',
        diaIngreso: '',
        diaAtencion: '',
        diaProgramado: '',
        distrito: '',
        referencia: '',
        rangoHora: '',
        notas: '',
    });
    const [editIndex, setEditIndex] = useState(-1);

    const openModal = () => {
        setModalIsOpen(true);
        document.body.classList.add('modal-open');
        setEditIndex(-1);
        setNewClient({
            nombre: '',
            asesor: '',
            estado: '',
            correo: '',
            celular: '',
            direccion: '',
            producto: '',
            diaIngreso: '',
            diaAtencion: '',
            diaProgramado: '',
            distrito: '',
            referencia: '',
            rangoHora: '',
            notas: '',
        });
    };

    const closeModal = () => {
        setModalIsOpen(false);
        document.body.classList.remove('modal-open');
        setProcessingModalIsOpen(false);
        setCompletedModalIsOpen(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewClient({ ...newClient, [name]: value });
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
                let updatedClients;
                if (editIndex === -1) {
                    updatedClients = [...clients, newClient];
                } else {
                    updatedClients = [...clients];
                    updatedClients[editIndex] = newClient;
                }
                setClients(updatedClients);
                localStorage.setItem('clientsData', JSON.stringify(updatedClients));
                console.log('Registro completado y proceso continuado.');
            }, 1000);
        }, 1000);
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

    const handleEdit = (index) => {
        setEditIndex(index);
        setNewClient(clients[index]);
        setModalIsOpen(true);
    };

    const handleDelete = (index) => {
        const updatedClients = clients.filter((_, i) => i !== index);
        setClients(updatedClients);
        localStorage.setItem('clientsData', JSON.stringify(updatedClients));
    };

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const openCloseIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-panel-left-close h-5 w-5"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M9 3v18"></path><path d="m16 15-3-3 3-3"></path></svg>
    );

    const openIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-panel-left-open h-5 w-5"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M9 3v18"></path><path d="m14 9 3 3-3 3"></path></svg>
    );

    return (
      <div className="dashboard-container">
          <header className="dashboard-header">
    <div className={`panel-control-header ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <button onClick={toggleSidebar} className="sidebar-toggle-button">
            {sidebarCollapsed ? openIcon : openCloseIcon}
        </button>
        <h2>Panel Control</h2>
        <img src="/images/right arrow.png" alt="Icono Panel Control" className="panel-control-icon" />
        <h3>Orden de Pedido</h3>
    </div>
    <button className="bell-button">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="header-icon notificaciones-icon"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
        </button>
          </header>
          <div className={`div-dashboard ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <h1>Listado de Pedidos (FORMULARIO COD)</h1>
              <div className="search-button-container">
                  <button className="my-button" onClick={openModal}>+ Nuevo Pedido</button>
                  <div className="search-input-container">
                      <input
                          type="text"
                          placeholder="Busca tu orden"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="search-input"
                      />
                      <img src="/images/search.png" alt="Buscar" className="search-icon" />
                      <select className="filter-select" value={filterOptions.orden} onChange={(e) => setFilterOptions({ ...filterOptions, orden: e.target.value })}>
                          <option value="">Confirmado</option>
                          <option value="">Seguimiento</option>
                          <option value="">Importado</option>
                          <option value="">Anulado</option>
                          <option value="">No contesta</option>
                          <option value="">Contactado</option>
                          <option value="">Repetido</option>
                          <option value="">Sin stock</option>
                      </select>
                      <select className="filter-select" value={filterOptions.delivery} onChange={(e) => setFilterOptions({ ...filterOptions, delivery: e.target.value })}>
                          <option value="Pendiente">Pendiente</option>
                          <option value="En proceso">En proceso</option>
                          <option value="Listo para envío">Listo para envío</option>
                          <option value="En tránsito">En tránsito</option>
                          <option value="En reparto">En reparto</option>
                          <option value="Entregado">Entregado</option>
                          <option value="Intento de entrega fallido">Intento de entrega fallido</option>
                          <option value="Devuelto">Devuelto</option>
                          <option value="Cancelado">Cancelado</option>
                      </select>
                      <select className="filter-select" value={filterOptions.tranzabilidad} onChange={(e) => setFilterOptions({ ...filterOptions, tranzabilidad: e.target.value })}>
                          <option value="">Tranzabilidad</option>

                      </select>
                      <select className="filter-select" value={filterOptions.importes} onChange={(e) => setFilterOptions({ ...filterOptions, importes: e.target.value })}>
                          <option value="">Importes</option>

                      </select>
                      <input
                          type="date"
                          className="filter-date"
                          value={filterOptions.fechaInicio}
                          onChange={(e) => setFilterOptions({ ...filterOptions, fechaInicio: e.target.value })}
                      />
                      <input
                          type="date"
                          className="filter-date"
                          value={filterOptions.fechaFin}
                          onChange={(e) => setFilterOptions({ ...filterOptions, fechaFin: e.target.value })}
                      />
                  </div>
              </div>
              <Modal
                  isOpen={modalIsOpen}
                  onRequestClose={closeModal}
                  contentLabel="Nueva Orden"
                  className="modal"
                  overlayClassName="overlay"
              >
                  <div className="modal-header">
                      <div className="modal-close" onClick={closeModal}><img src={closeIcon} alt="Cerrar" /></div>
                      <div className="modal-title">Agregar orden</div>
                  </div>
                  <h2>Nueva orden</h2>
                  <form onSubmit={handleRegister}>
                      <div className="modal-content">
                          <label>Nota:</label>
                          <input type="text" name="nota" value={newClient.nota} onChange={handleInputChange} />

                          <label>Canal:</label>
                          <select name="canal" value={newClient.canal} onChange={handleInputChange}>
                              <option value="Shopify">Shopify</option>
                              {/* Agrega más opciones si es necesario */}
                          </select>

                          <h2>Cliente</h2>
                          <label>Nombres y Apellidos:</label>
                          <input type="text" name="nombresApellidos" value={newClient.nombresApellidos} onChange={handleInputChange} />

                          <label>Móvil:</label>
                          <input type="text" name="movil" value={newClient.movil} onChange={handleInputChange} />

                          <h2>Entrega</h2>
                          <label>Departamento:</label>
                          <select name="departamento" value={newClient.departamento} onChange={handleInputChange}>
                              {/* Agrega opciones de departamentos */}
                          </select>

                          <label>Provincia:</label>
                          <select name="provincia" value={newClient.provincia} onChange={handleInputChange}>
                              {/* Agrega opciones de provincias */}
                          </select>

                          <label>Distrito:</label>
                          <select name="distrito" value={newClient.distrito} onChange={handleInputChange}>
                              {/* Agrega opciones de distritos */}
                          </select>

                          <label>Dirección:</label>
                          <input type="text" name="direccion" value={newClient.direccion} onChange={handleInputChange} />

                          <label>Referencia:</label>
                          <input type="text" name="referencia" value={newClient.referencia} onChange={handleInputChange} />

                          <label>GPS: Latitud, Longitud</label>
                          <input type="text" name="gps" value={newClient.gps} onChange={handleInputChange} />

                          <p>GPS: Solicítalo al cliente por WhatsApp o ver TUTORIAL</p>
                      </div>
                      <div className="modal-buttons">
                          <button type="submit">Guardar</button>
                          <button onClick={closeModal}>Cancelar</button>
                      </div>
                  </form>
              </Modal>
              <div className="lista-clientes">
                  <table>
                      <thead>
                          <tr>
                              <th className="text-center">Orden</th>
                              <th className="text-center">Acciones</th>
                              <th className="text-center">Delivery</th>
                              <th className="text-center">Tranzabilidad</th>
                              <th className="text-center">Importes</th>
                              <th className="text-center">Pagos</th>
                              <th className="text-center">Productos</th>
                              <th className="text-center">Nota</th>
                              <th className="text-center">Cliente</th>
                              <th className="text-center">Ubicación</th>
                              <th className="text-center">Fechas</th>
                          </tr>
                      </thead>
                      <tbody>
                          {clients.map((client, index) => (
                              <tr key={index}>
                                  <td className="text-center"></td>
                                  <td className="text-center">
                                      <button className="btn-editar" onClick={() => handleEdit(index)}>Editar</button>
                                      <button className="btn-eliminar" onClick={() => handleDelete(index)}>Eliminar</button>
                                  </td>
                                  <td className="text-center"></td>
                                  <td className="text-center"></td>
                                  <td className="text-center"></td>
                                  <td className="text-center"></td>
                                  <td className="text-center">{client.producto}</td>
                                  <td className="text-center">{client.notas}</td>
                                  <td className="text-center">{client.nombre}</td>
                                  <td className="text-center">{client.distrito?.texto}</td>
                                  <td className="text-center">
                                      <div>
                                          Ingreso: {client.diaIngreso}<br />
                                          Atención: {client.diaAtencion}<br />
                                          Programado: {client.diaProgramado}
                                      </div>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
              <div className={`dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
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
                                          <li className="activo">Pedidos</li></Link>
                                      <Link to="/productos" style={{ textDecoration: 'none', color: 'inherit' }}>
                                          <li>Productos</li></Link>
                                      <Link to="/categorias" style={{ textDecoration: 'none', color: 'inherit' }}>
                                          <li>Categorias</li></Link>
                                      <Link to="/almacen" style={{ textDecoration: 'none', color: 'inherit' }}>
                                          <li>Almacen</li></Link>
                                      <Link to="/devolucion" style={{ textDecoration: 'none', color: 'inherit' }}>
                                          <li>Devolución</li></Link>
                                      <Link to="/reparto" style={{ textDecoration: 'none', color: 'inherit' }}>
                                          <li>Reparto</li></Link>
                                      <Link to="/seguimiento" style={{ textDecoration: 'none', color: 'inherit' }}>
                                          <li>Seguimiento</li></Link>
                                      <Link to="/calendario" style={{ textDecoration: 'none', color: 'inherit' }}>
                                          <li>Calendario</li></Link>
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
                  <img src="/images/idea.png" alt="Idea" className="floating-idea-icon" />
              </div>
          </div>
      </div>

  );
}

export default Dashboard;