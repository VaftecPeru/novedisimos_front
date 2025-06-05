import React from 'react';

const MenuPorRol = ({ rol, expanded, toggleSection, handlePedidosClick, handleMantenimientoClick, handleIntegracionesClick, gearImages, spanColors, arrowImages, pedidosSeleccion, mantenimientoSeleccion, integracionesSeleccion }) => {
  
  const permisosPorRol = {
    Administrador: ['pedidos', 'mantenimiento', 'integraciones', 'clientes', 'motorizados', 'asesores'],
    Vendedor: ['clientes', 'almacenes'],
    Almacen: ['pedidos', 'mantenimiento'], 
    Delivery: ['motorizados'] 
  };

  const seccionesPermitidas = permisosPorRol[rol] || [];

  return (
    <nav>
      <ul className="main-menu">
        {seccionesPermitidas.includes('pedidos') && (
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
        )}

        {seccionesPermitidas.includes('mantenimiento') && (
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
                <li
                  onClick={() => handleMantenimientoClick('almacenes')}
                  className={mantenimientoSeleccion === 'almacenes' ? 'active' : ''}
                >
                  Almacen
                </li>
              </ul>
            )}
          </li>
        )}

        {seccionesPermitidas.includes('almacenes') && (
          <li className="main-menu-item">
            <div className="menu-item-header" onClick={() => handleMantenimientoClick('almacenes')}>
              <img
                src={gearImages.almacenes || gearImages.mantenimiento}
                alt="Almacenes"
                style={{ width: '22px', height: '22px' }}
              />
              <i className="fas fa-warehouse"></i>
              <span style={{ fontWeight: 400, fontSize: 18, color: spanColors.almacenes || spanColors.mantenimiento }}>Almacenes</span>
            </div>
          </li>
        )}

        {seccionesPermitidas.includes('integraciones') && (
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
        )}

        {seccionesPermitidas.includes('clientes') && (
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
        )}

        {seccionesPermitidas.includes('motorizados') && (
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
        )}

        {seccionesPermitidas.includes('asesores') && (
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
        )}
      </ul>
    </nav>
  );
};

export default MenuPorRol;