import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import './Dashboard.css';
import MiSelect from './MiSelect';
import { distritos, asesor, estados, getEstadoColor } from './data';

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
        setProcessingModalIsOpen(false);
        setCompletedModalIsOpen(false);
    };

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setNewClient({ ...newClient, [name]: value });
      setCamposVacios({ ...camposVacios, [name]: false }); 
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!validarCampos()) {
        return;
    }
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

  const getEstadoClass = (estado) => {
    switch (estado) {
        case 'enCamino':
            return 'estado-enCamino';
        case 'completado':
            return 'estado-completado';
        case 'cancelado':
            return 'estado-cancelado';
        default:
            return '';
    }
};

const [camposVacios, setCamposVacios] = useState({});

const validarCampos = () => {
  const nuevosCamposVacios = {};
  let hayCamposVacios = false;

  if (!newClient.producto) {
      nuevosCamposVacios.producto = true;
      hayCamposVacios = true;
  }
  if (!newClient.nombre) {
      nuevosCamposVacios.nombre = true;
      hayCamposVacios = true;
  }
  if (!newClient.asesor) {
      nuevosCamposVacios.asesor = true;
      hayCamposVacios = true;
  }
  if (!newClient.diaIngreso) {
      nuevosCamposVacios.diaIngreso = true;
      hayCamposVacios = true;
  }
  if (!newClient.correo) {
      nuevosCamposVacios.correo = true;
      hayCamposVacios = true;
  }
  if (!newClient.celular) {
      nuevosCamposVacios.celular = true;
      hayCamposVacios = true;
  }
  if (!newClient.estado) {
      nuevosCamposVacios.estado = true;
      hayCamposVacios = true;
  }

  setCamposVacios(nuevosCamposVacios);

  if (hayCamposVacios) {
      alert('Por favor, completa todos los campos obligatorios.');
      return false;
  }

  return true;
};

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
                <h2>{editIndex === -1 ? 'Registro de clientes que se tiene cobertura' : 'Editar Cliente'}</h2>
                <form onSubmit={handleRegister}>
                    <div className="modal-content">
                        <div className="modal-left">
                            <label>Buscar</label>
                            <input type="text" name="buscar" value={newClient.buscar} onChange={handleInputChange}/>
                            <label>Asesor</label>
                            <MiSelect opciones={asesor} value={newClient.asesor} onChange={(selectedOption) => handleInputChange({ target: { name: 'asesor', value: selectedOption} })}/>
                            <label>Estado</label>
                            <MiSelect opciones={estados} value={newClient.estado} onChange={(selectedOption)=> handleInputChange({ target: { name: 'estado', value: selectedOption.value } })}/>
                            <label>Nombre de Cliente</label>
                            <input type="text" name="nombre" value={newClient.nombre} onChange={handleInputChange} />
                            <label>Correo Electrónico</label>
                            <input type="email" name="correo" value={newClient.correo} onChange={handleInputChange} />
                            <label>Numero Celular</label>
                            <input type="tel" name="celular" value={newClient.celular} onChange={handleInputChange} />
                            <label>Direccion</label>
                            <input type="text" name="direccion" value={newClient.direccion} onChange={handleInputChange} />
                            <label>Producto</label>
                            <input type="text" name="producto" value={newClient.producto} onChange={handleInputChange} />
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
                                    <input type="date" name="diaIngreso" value={newClient.diaIngreso} onChange={handleInputChange} />
                                    <img src="/images/calendar.png" alt="Buscar" className="calendar-icon" />
                                </div>
                                <div className="input-with-icon">
                                    <input type="date" name="diaAtencion" value={newClient.diaAtencion} onChange={handleInputChange} />
                                    <img src="/images/calendar.png" alt="Buscar" className="calendar-icon2" />
                                </div>
                            </div>
                            <div className="inputs-row2">
                                <label>Dia de programado</label>
                                <div className="input-with-icon">
                                    <input type="date" name="diaProgramado" value={newClient.diaProgramado} onChange={handleInputChange} style={{ paddingLeft: '37px', width: '595px'}} />
                                    <img src="/images/calendar.png" alt="Buscar" className="calendar-icon3" />
                                </div>
                            </div>
                            <label>Distrito</label>
                            <MiSelect opciones={distritos} value={newClient.distrito} onChange={(e) => handleInputChange({ target: { name: 'distrito', value: e } })}/>
                            <label>Referencia</label>
                            <input type="text" name="referencia" value={newClient.referencia} onChange={handleInputChange} />
                            <label>Rango de Hora</label>
                            <input type="text" name="rangoHora" value={newClient.rangoHora} onChange={handleInputChange} />
                            <label>Notas de Asesor</label>
                            <input type="text" name="notas" value={newClient.notas} onChange={handleInputChange} />
                        </div>
                    </div>
                    <div className="modal-buttons">
                        <button type="submit">{editIndex === -1 ? 'Registrar' : 'Guardar Cambios'}</button>
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
              <table>
                <thead>
                  <tr>
                  <th>Producto</th>
                  <th>Nombre de Cliente</th>
                  <th>Asesor</th>
                  <th>Fecha ingreso</th>
                  <th>Correos electrónicos</th>
                  <th>Celular</th>
                  <th>Estado</th>
                  <th>Accion</th>
                  </tr>
                </thead>
    <tbody>
      {clients.map((client, index) => (
        <tr key={index}>
          <td>{client.producto}</td>
          <td>{client.nombre}</td>
          <td>{client.asesor?.texto}</td>
          <td>{client.diaIngreso}</td>
          <td>{client.correo}</td>
          <td>{client.celular}</td>
          <td className={getEstadoClass(client.estado)}>
          <div className={`estado-div ${getEstadoClass(client.estado)}`}>
            {estados.find(estado => estado.value === client.estado)?.texto}
            </div></td>
          <td>
          <td className="lista-clientes-acciones">
  <button className="btn-editar" onClick={() => handleEdit(index)}>Editar</button>
  <button className="btn-eliminar" onClick={() => handleDelete(index)}>Eliminar</button>
</td>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
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
      </div>
      </div>
    </div>
  );
}

export default Dashboard;