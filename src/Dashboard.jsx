import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Modal from 'react-modal';
import './Dashboard.css';
import './Modal.css';
import closeIcon from '/images/close.png';
import PedidosDashboard from './PedidosDashboard';
import ProductosDashboard from './ProductosDashboard';
import SeguimientoContraentrega from './SeguimientoContraentrega';
import ShopifyDashboard from './ShopifyDashboard';
import MovimientoDashboard from './MovimientoDashboard';
import InformeDashboard from './InformeDashboard';

Modal.setAppElement('#root');

function Dashboard() {
    const [expanded, setExpanded] = useState({
        mantenimiento: false,
        clientes: false,
        pedidos: false,
        motorizados: false,
        asesores: false,
        informes: false,
        integraciones: false,
        configuracion: false,
    });

    const [mantenimientoSeleccion, setMantenimientoSeleccion] = useState('productos');

    const [pedidosSeleccion, setPedidosSeleccion] = useState('ordenDePedido');
    
    const [integracionesSeleccion, setIntegracionesSeleccion] = useState('shopify');

    const [configuracionSeleccion, setConfiguracionSeleccion] = useState('cobertura');

    const [informesSeleccion, setInformesSeleccion] = useState('vista');

    const [arrowImages, setArrowImages] = useState({
        mantenimiento: '/images/shadow arrow.png',
        clientes: '/images/shadow arrow.png',
        pedidos: '/images/shadow arrow.png',
        motorizados: '/images/shadow arrow.png',
        asesores: '/images/shadow arrow.png',
        informes: '/images/shadow arrow.png',
        integraciones: '/images/shadow arrow.png',
        configuracion: '/images/shadow arrow.png',
    });

    const [gearImages, setGearImages] = useState({
        mantenimiento: '/images/shadow file.png',
        pedidos: '/images/shadow file.png',
        clientes: '/images/shadow folder.png',
        motorizados: '/images/shadow file.png',
        asesores: '/images/shadow tv.png',
        informes: '/images/shadow report.png',
        integraciones: '/images/shadow file.png',
        configuracion: '/images/shadow file.png',
    });

    const [spanColors, setSpanColors] = useState({
        mantenimiento: '#555d8b',
        pedidos: '#555d8b',
        clientes: '#555d8b',
        motorizados: '#555d8b',
        asesores: '#555d8b',
        informes: '#555d8b',
        integraciones: '#555d8b',
        configuracion: '#555d8b',
    });

    const [activeSection, setActiveSection] = useState('');

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

    const navigate = useNavigate();
    const location = useLocation();
    
    const [sidebarCollapsed, setSidebarCollapsed] = useState(
        window.innerWidth <= 768 
    );
    
    useEffect(() => {
        const path = location.pathname.split('/');
        const lastSegment = path[path.length - 1];
        
        if (lastSegment !== 'dashboard') {
            setActiveSection(lastSegment);
            
            const initialExpandedState = {
                mantenimiento: false,
                clientes: false,
                pedidos: false,
                motorizados: false,
                asesores: false,
                informes: false,
                integraciones: false,
                configuracion: false
            };
            
            setArrowImages({
                mantenimiento: '/images/shadow arrow.png',
                clientes: '/images/shadow arrow.png',
                pedidos: '/images/shadow arrow.png',
                motorizados: '/images/shadow arrow.png',
                asesores: '/images/shadow arrow.png',
                informes: '/images/shadow arrow.png',
                integraciones: '/images/shadow arrow.png',
                configuracion: '/images/shadow arrow.png',
            });
            
            setGearImages({
                mantenimiento: '/images/shadow file.png',
                pedidos: '/images/shadow file.png',
                clientes: '/images/shadow folder.png',
                motorizados: '/images/shadow file.png',
                asesores: '/images/shadow tv.png',
                informes: '/images/shadow report.png',
                integraciones: '/images/shadow file.png',
                configuracion: '/images/shadow file.png',
            });
            
            setSpanColors({
                mantenimiento: '#555d8b',
                pedidos: '#555d8b',
                clientes: '#555d8b',
                motorizados: '#555d8b',
                asesores: '#555d8b',
                informes: '#555d8b',
                integraciones: '#555d8b',
                configuracion: '#555d8b',
            });
            
            if (lastSegment === 'productos' || lastSegment === 'usuarios') {
                initialExpandedState.mantenimiento = true;
                setMantenimientoSeleccion(lastSegment);
                
                setArrowImages(prev => ({
                    ...prev,
                    mantenimiento: '/images/down arrow.png'
                }));
                
                setGearImages(prev => ({
                    ...prev,
                    mantenimiento: '/images/file.png'
                }));
                
                setSpanColors(prev => ({
                    ...prev,
                    mantenimiento: 'white'
                }));
            }

            if (lastSegment === 'productos' || lastSegment === 'movimiento') {
                initialExpandedState.mantenimiento = true;
                setMantenimientoSeleccion(lastSegment);
                
                setArrowImages(prev => ({
                    ...prev,
                    mantenimiento: '/images/down arrow.png'
                }));
                
                setGearImages(prev => ({
                    ...prev,
                    mantenimiento: '/images/file.png'
                }));
                
                setSpanColors(prev => ({
                    ...prev,
                    mantenimiento: 'white'
                }));
            }

            if (lastSegment === 'ordenDePedido' || lastSegment === 'seguimientoContraentrega' || lastSegment === 'enviosAgencia') {
                initialExpandedState.pedidos = true;
                setPedidosSeleccion(lastSegment);
                
                setArrowImages(prev => ({
                    ...prev,
                    pedidos: '/images/down arrow.png'
                }));
                
                setGearImages(prev => ({
                    ...prev,
                    pedidos: '/images/file.png'
                }));
                
                setSpanColors(prev => ({
                    ...prev,
                    pedidos: 'white'
                }));
            }
            
            if (lastSegment === 'shopify') {
                initialExpandedState.integraciones = true;
                setIntegracionesSeleccion(lastSegment);
                
                setArrowImages(prev => ({
                    ...prev,
                    integraciones: '/images/down arrow.png'
                }));
                
                setGearImages(prev => ({
                    ...prev,
                    integraciones: '/images/file.png'
                }));
                
                setSpanColors(prev => ({
                    ...prev,
                    integraciones: 'white'
                }));
            }

            if (lastSegment === 'vista') {
                initialExpandedState.informes = true;
                setInformesSeleccion(lastSegment);
                
                setArrowImages(prev => ({
                    ...prev,
                    informes: '/images/down arrow.png'
                }));
                
                setGearImages(prev => ({
                    ...prev,
                    informes: '/images/file.png'
                }));
                
                setSpanColors(prev => ({
                    ...prev,
                    informes: 'white'
                }));
            }

            if (lastSegment === 'cobertura') {
                initialExpandedState.configuracion = true;
                setConfiguracionSeleccion(lastSegment);
                
                setArrowImages(prev => ({
                    ...prev,
                    configuracion: '/images/down arrow.png'
                }));
                
                setGearImages(prev => ({
                    ...prev,
                    configuracion: '/images/file.png'
                }));
                
                setSpanColors(prev => ({
                    ...prev,
                    configuracion: 'white'
                }));
            }

            if (lastSegment === 'curier') {
                initialExpandedState.configuracion = true;
                setConfiguracionSeleccion(lastSegment);
                
                setArrowImages(prev => ({
                    ...prev,
                    configuracion: '/images/down arrow.png'
                }));
                
                setGearImages(prev => ({
                    ...prev,
                    configuracion: '/images/file.png'
                }));
                
                setSpanColors(prev => ({
                    ...prev,
                    configuracion: 'white'
                }));
            }
            
            setExpanded(initialExpandedState);
        }
        
        if (window.innerWidth <= 768) {
            setSidebarCollapsed(true);
            document.body.classList.remove('sidebar-open');
        }
        
        const handleResize = () => {
            if (window.innerWidth <= 768) {
                document.body.classList.remove('sidebar-open');
            }
        };
        
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [location.pathname]);

    const toggleSidebar = () => {
        const newCollapsedState = !sidebarCollapsed;
        setSidebarCollapsed(newCollapsedState);
        
        if (window.innerWidth <= 768) {
            if (newCollapsedState) {
                document.body.classList.remove('sidebar-open');
            } else {
                document.body.classList.add('sidebar-open');
            }
        }
    };
    
    const handleOverlayClick = () => {
        if (window.innerWidth <= 768 && !sidebarCollapsed) {
            toggleSidebar();
        }
    };

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
        const newExpandedState = { ...expanded };
        
        if (!newExpandedState[section]) {
            Object.keys(newExpandedState).forEach(key => {
                newExpandedState[key] = false;
            });
        }
        
        newExpandedState[section] = !newExpandedState[section];
        
        setExpanded(newExpandedState);

        const newArrowImages = {
            mantenimiento: '/images/shadow arrow.png',
            clientes: '/images/shadow arrow.png',
            pedidos: '/images/shadow arrow.png',
            motorizados: '/images/shadow arrow.png',
            asesores: '/images/shadow arrow.png',
            informes: '/images/shadow arrow.png',
            integraciones: '/images/shadow arrow.png',
            configuracion: '/images/shadow arrow.png',
        };
        
        const newGearImages = {
            mantenimiento: '/images/shadow file.png',
            pedidos: '/images/shadow file.png',
            clientes: '/images/shadow folder.png',
            motorizados: '/images/shadow file.png',
            asesores: '/images/shadow tv.png',
            informes: '/images/shadow report.png',
            integraciones: '/images/shadow file.png',
            configuracion: '/images/shadow file.png',
        };
        
        const newSpanColors = {
            mantenimiento: '#555d8b',
            pedidos: '#555d8b',
            clientes: '#555d8b',
            motorizados: '#555d8b',
            asesores: '#555d8b',
            informes: '#555d8b',
            integraciones: '#555d8b',
            configuracion: '#555d8b',
        };
        
        if (newExpandedState[section]) {
            newArrowImages[section] = '/images/down arrow.png';
            
            switch (section) {
                case 'mantenimiento':
                    newGearImages.mantenimiento = '/images/file.png';
                    break;
                case 'clientes':
                    newGearImages.clientes = '/images/folder.png';
                    break;
                case 'pedidos':
                    newGearImages.pedidos = '/images/file.png';
                    break;
                case 'motorizados':
                    newGearImages.motorizados = '/images/file.png';
                    break;
                case 'asesores':
                    newGearImages.asesores = '/images/tv.png';
                    break;
                case 'informes':
                    newGearImages.informes = '/images/report.png';
                    break;
                case 'integraciones':
                    newGearImages.integraciones = '/images/file.png';
                    break;
                default:
                    break;
            }
            
            newSpanColors[section] = 'white';
        }
        
        setArrowImages(newArrowImages);
        setGearImages(newGearImages);
        setSpanColors(newSpanColors);
    };

    const handleSectionClick = (section) => {
        setActiveSection(section);
        navigate(`/dashboard/${section}`);
        
        if (window.innerWidth <= 768 && !sidebarCollapsed) {
            toggleSidebar();
        }
    };

    const handleMantenimientoClick = (option) => {
        setMantenimientoSeleccion(option);
        setActiveSection(option);
        navigate(`/dashboard/${option}`);
        
        if (window.innerWidth <= 768 && !sidebarCollapsed) {
            toggleSidebar();
        }
    };

    const handlePedidosClick = (option) => {
        setPedidosSeleccion(option);
        setActiveSection(option);
        navigate(`/dashboard/${option}`);
        
        if (window.innerWidth <= 768 && !sidebarCollapsed) {
            toggleSidebar();
        }
    };
    
    const handleIntegracionesClick = (option) => {
        setIntegracionesSeleccion(option);
        setActiveSection(option);
        navigate(`/dashboard/${option}`);
        
        if (window.innerWidth <= 768 && !sidebarCollapsed) {
            toggleSidebar();
        }
    };

    const handleInformesClick = (option) => {
        setInformesSeleccion(option);
        setActiveSection(option);
        navigate(`/dashboard/${option}`);
        
        if (window.innerWidth <= 768 && !sidebarCollapsed) {
            toggleSidebar();
        }
    };

    const handleConfiguracionClick = (option) => {
        setConfiguracionSeleccion(option);
        setActiveSection(option);
        navigate(`/dashboard/${option}`);
        
        if (window.innerWidth <= 768 && !sidebarCollapsed) {
            toggleSidebar();
        }
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

    const openCloseIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-panel-left-close h-5 w-5"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M9 3v18"></path><path d="m16 15-3-3 3-3"></path></svg>
    );

    const openIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-panel-left-open h-5 w-5"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M9 3v18"></path><path d="m14 9 3 3-3 3"></path></svg>
    );

    const renderHeaderTitle = () => {
        if (activeSection === '') return null;
        
        let parentSection = '';
        
        if (['ordenDePedido', 'seguimientoContraentrega', 'enviosAgencia'].includes(activeSection)) {
            parentSection = 'Pedidos';
        } else if (['productos', 'usuarios', 'movimiento'].includes(activeSection)) {
            parentSection = 'Mantenimiento';
        } else if (['shopify'].includes(activeSection)) {
            parentSection = 'Integraciones';
        } else if (['vista'].includes(activeSection)) {
            parentSection = 'Informes';  
        } else if (['cobertura'].includes(activeSection)) {
            parentSection = 'Configuracion';  
        } else if (['curier'].includes(activeSection)) {
            parentSection = 'Configuracion';  
        }

        const sectionDisplayNames = {
            'productos': 'Productos',
            'usuarios': 'Usuarios de Tienda', 
            'movimiento': 'Movimiento', 
            'ordenDePedido': 'Orden de Pedido',
            'seguimientoContraentrega': 'Seguimiento Contraentrega',
            'enviosAgencia': 'Envíos Agencia',
            'shopify': 'Shopify',
            'vista': 'Vista Informes',
            'cobertura': 'Registrar Cobertura',
            'curier': 'Registrar Currier Nuevos'
        };
        
        const activeSectionName = sectionDisplayNames[activeSection] || activeSection;
        
        if (parentSection) {
            return (
                <>
                    <h2>{parentSection}</h2>
                    <img src="/images/right arrow.png" alt="Icono Panel Control" className="panel-control-icon" />
                    <h3>{activeSectionName}</h3>
                </>
            );
        }
        
        return <h2>{activeSectionName}</h2>;
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'ordenDePedido':
                return <PedidosDashboard />;
            case 'seguimientoContraentrega':  
                return <SeguimientoContraentrega />;
            case 'enviosAgencia': 
                return <div className="div-dashboard"><h1>Envíos Agencia</h1></div>;
            case 'productos':
                return <ProductosDashboard />;
            case 'usuarios':
                return <div className="div-dashboard"><h1>Gestión de Usuarios de Tienda</h1></div>;
            case 'movimiento':
                return <MovimientoDashboard />;
            case 'shopify':
                return <ShopifyDashboard />;
            case 'vista':
                return <InformeDashboard />;
            case 'cobertura':
                return <div className="div-dashboard"><h1>Cobertura</h1></div>;
            case 'curier':
                return <div className="div-dashboard"><h1>Curiers Nuevos</h1></div>;
            default:
                return <div className="welcome-dashboard">Bienvenido al Panel de Control. Selecciona una opción del menú para comenzar.</div>;
        }
    };

    return (
        <div className="dashboard-container">
            <div 
                className={`sidebar-overlay ${!sidebarCollapsed && window.innerWidth <= 768 ? 'active' : ''}`} 
                onClick={handleOverlayClick}
            />
            
            <header className={`dashboard-header ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                <div className={`panel-control-header ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                    <button onClick={toggleSidebar} className="sidebar-toggle-button">
                        {sidebarCollapsed ? openIcon : openCloseIcon}
                    </button>
                    {renderHeaderTitle()}
                </div>
                <button className="bell-button">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="header-icon notificaciones-icon"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                </button>
            </header>
            
            <div className={`dashboard-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                {renderContent()}
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
                        <input type="text" name="notas" value={newClient.notas || ''} onChange={handleInputChange} />

                        <label>Canal:</label>
                        <select name="canal" value={newClient.canal || ''} onChange={handleInputChange}>
                            <option value="Shopify">Shopify</option>
                        </select>

                        <h2>Cliente</h2>
                        <label>Nombres y Apellidos:</label>
                        <input type="text" name="nombre" value={newClient.nombre || ''} onChange={handleInputChange} />

                        <label>Móvil:</label>
                        <input type="text" name="celular" value={newClient.celular || ''} onChange={handleInputChange} />

                        <h2>Entrega</h2>
                        <label>Departamento:</label>
                        <select name="departamento" value={newClient.departamento || ''} onChange={handleInputChange}>
                            <option value="">Seleccionar</option>
                            <option value="Lima">Lima</option>
                        </select>

                        <label>Provincia:</label>
                        <select name="provincia" value={newClient.provincia || ''} onChange={handleInputChange}>
                            <option value="">Seleccionar</option>
                            <option value="Lima">Lima</option>
                        </select>

                        <label>Distrito:</label>
                        <select name="distrito" value={newClient.distrito || ''} onChange={handleInputChange}>
                            <option value="">Seleccionar</option>
                            <option value="Miraflores">Miraflores</option>
                            <option value="San Isidro">San Isidro</option>
                            <option value="Barranco">Barranco</option>
                        </select>

                        <label>Dirección:</label>
                        <input type="text" name="direccion" value={newClient.direccion || ''} onChange={handleInputChange} />

                        <label>Referencia:</label>
                        <input type="text" name="referencia" value={newClient.referencia || ''} onChange={handleInputChange} />

                        <label>Producto:</label>
                        <input type="text" name="producto" value={newClient.producto || ''} onChange={handleInputChange} />

                        <label>GPS: Latitud, Longitud</label>
                        <input type="text" name="gps" value={newClient.gps || ''} onChange={handleInputChange} />

                        <p>GPS: Solicítalo al cliente por WhatsApp o ver TUTORIAL</p>
                    </div>
                    <div className="modal-buttons">
                        <button type="submit">Guardar</button>
                        <button type="button" onClick={closeModal}>Cancelar</button>
                    </div>
                </form>
            </Modal>

            <div className={`dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    <div className="imagen-header">
                        <img className="img-logo" src="../images/ovedisimos-dashboard.png" alt="Imagen de login" />
                    </div>
                </div>
                <nav>
                    <ul className="main-menu">
                        <li className={`main-menu-item ${expanded.pedidos ? 'expanded' : ''}`}>
                            <div className="menu-item-header" onClick={() => toggleSection('pedidos')}>
                                <img
                                    src={gearImages.pedidos}
                                    alt="Pedidos"
                                    style={{ width: '22px', height: '22px' }}
                                />
                                <i className="fas fa-clipboard-list"></i>
                                <span style={{ fontWeight: 400, fontSize: 18, color: spanColors.pedidos }}>Pedidos</span>
                                <i className={`fas fa-chevron-${expanded.pedidos ? 'down' : 'right'}`}></i>
                                <img
                                    src={arrowImages.pedidos}
                                    alt="Pedidos"
                                    className="menu-icon"
                                />
                            </div>
                            {expanded.pedidos && (
                                <ul className="submenu">
                                    <li 
                                        onClick={() => handlePedidosClick('ordenDePedido')}
                                        className={pedidosSeleccion === 'ordenDePedido' ? 'active' : ''}
                                    >
                                        Orden de Pedido
                                    </li>
                                    <li 
                                        onClick={() => handlePedidosClick('seguimientoContraentrega')}
                                        className={pedidosSeleccion === 'seguimientoContraentrega' ? 'active' : ''}
                                    >
                                        Seguimiento Contraentrega
                                    </li>
                                    <li 
                                        onClick={() => handlePedidosClick('enviosAgencia')}
                                        className={pedidosSeleccion === 'enviosAgencia' ? 'active' : ''}
                                    >
                                        Envíos Agencia
                                    </li>
                                </ul>
                            )}
                        </li>
                        <li className={`main-menu-item ${expanded.mantenimiento ? 'expanded' : ''}`}>
                            <div className="menu-item-header" onClick={() => toggleSection('mantenimiento')}>
                                <img
                                    src={gearImages.mantenimiento}
                                    alt="Mantenimiento"
                                    style={{ width: '22px', height: '22px' }}
                                />
                                <i className="fas fa-cogs"></i>
                                <span style={{ fontWeight: 400, fontSize: 18, color: spanColors.mantenimiento }}>Mantenimiento</span>
                                <i className={`fas fa-chevron-${expanded.mantenimiento ? 'down' : 'right'}`}></i>
                                <img
                                    src={arrowImages.mantenimiento}
                                    alt="Mantenimiento"
                                    className="menu-icon"
                                />
                            </div>
                            {expanded.mantenimiento && (
                                <ul className="submenu">
                                    <li 
                                        onClick={() => handleMantenimientoClick('productos')}
                                        className={mantenimientoSeleccion === 'productos' ? 'active' : ''}
                                    >
                                        Productos
                                    </li>
                                    <li 
                                        onClick={() => handleMantenimientoClick('usuarios')}
                                        className={mantenimientoSeleccion === 'usuarios' ? 'active' : ''}
                                    >
                                        Usuarios de tienda
                                    </li>
                                    <li 
                                        onClick={() => handleMantenimientoClick('movimiento')}
                                        className={mantenimientoSeleccion === 'movimiento' ? 'active' : ''}
                                    >
                                        Movimiento
                                    </li>
                                </ul>
                            )}
                        </li>
                        <li className={`main-menu-item ${expanded.integraciones ? 'expanded' : ''}`}>
                            <div className="menu-item-header" onClick={() => toggleSection('integraciones')}>
                                <img
                                    src={gearImages.integraciones}
                                    alt="Integraciones"
                                    style={{ width: '22px', height: '22px' }}
                                />
                                <i className="fas fa-plug"></i>
                                <span style={{ fontWeight: 400, fontSize: 18, color: spanColors.integraciones }}>Integraciones</span>
                                <i className={`fas fa-chevron-${expanded.integraciones ? 'down' : 'right'}`}></i>
                                <img
                                    src={arrowImages.integraciones}
                                    alt="Integraciones"
                                    className="menu-icon"
                                />
                            </div>
                            {expanded.integraciones && (
                                <ul className="submenu">
                                    <li 
                                        onClick={() => handleIntegracionesClick('shopify')}
                                        className={integracionesSeleccion === 'shopify' ? 'active' : ''}
                                    >
                                        Shopify
                                    </li>
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
                        <li className={`main-menu-item ${expanded.informes ? 'expanded' : ''}`}>
                            <div className="menu-item-header" onClick={() => toggleSection('informes')}>
                                <img
                                    src={gearImages.informes}
                                    alt="Informes"
                                    style={{ width: '22px', height: '22px' }}
                                />
                                <i className="fas fa-user-tie"></i>
                                <span style={{ fontWeight: 400, fontSize: 18, color: spanColors.informes }}>Informes</span>
                                <i className={`fas fa-chevron-${expanded.informes ? 'down' : 'right'}`}></i>
                                <img
                                    src={arrowImages.informes}
                                    alt="Informes"
                                    className="menu-icon"
                                />
                            </div>
                            {expanded.informes && <ul className="submenu">
                                <li 
                                        onClick={() => handleInformesClick('vista')}
                                        className={informesSeleccion === 'vista' ? 'active' : ''}
                                    >
                                        Vista Informes
                                    </li>
                            </ul>}
                        </li>
                        <li className={`main-menu-item ${expanded.configuracion ? 'expanded' : ''}`}>
                            <div className="menu-item-header" onClick={() => toggleSection('configuracion')}>
                                <img
                                    src={gearImages.configuracion}
                                    alt="Configuracion"
                                    style={{ width: '22px', height: '22px' }}
                                />
                                <i className="fas fa-clipboard-list"></i>
                                <span style={{ fontWeight: 400, fontSize: 18, color: spanColors.configuracion }}>Configuracion</span>
                                <i className={`fas fa-chevron-${expanded.configuracion ? 'down' : 'right'}`}></i>
                                <img
                                    src={arrowImages.configuracion}
                                    alt="Configuracion"
                                    className="menu-icon"
                                />
                            </div>
                            {expanded.configuracion && (
                                <ul className="submenu">
                                    <li 
                                        onClick={() => handleConfiguracionClick('cobertura')}
                                        className={configuracionSeleccion === 'cobertura' ? 'active' : ''}
                                    >
                                        Cobertura
                                    </li>
                                    <li 
                                        onClick={() => handleConfiguracionClick('curier')}
                                        className={configuracionSeleccion === 'curier' ? 'active' : ''}
                                    >
                                        Currier Nuevos
                                    </li>
                                </ul>
                            )}
                        </li>
                    </ul>
                </nav>
                <img src="/images/idea.png" alt="Idea" className="floating-idea-icon" />
            </div>
        </div>
    );
}

export default Dashboard;