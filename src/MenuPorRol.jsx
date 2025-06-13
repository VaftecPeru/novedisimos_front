import React from "react";

const MenuPorRol = ({
  rol,
  expanded,
<<<<<<< HEAD
  onMenuItemClick,
  gearImages,
  spanColors,
  arrowImages,
  activeSection,
}) => {
  const permisosPorRol = {
    Administrador: [
      "pedidos",
      "mantenimiento",
      "integraciones",
      "clientes",
      "motorizados",
      "asesores",
    ],
    Vendedor: ["pedidos", "clientes"],
    Almacen: ["pedidos", "mantenimiento"],
    Delivery: ["motorizados"],
=======
  toggleSection,
  handlePedidosClick,
  handleMantenimientoClick,
  handleIntegracionesClick,
  gearImages,
  spanColors,
  arrowImages,
  pedidosSeleccion,
  mantenimientoSeleccion,
  integracionesSeleccion,
  activeSection
}) => {

  const permisosPorRol = {
    Administrador: ['pedidos', 'mantenimiento', 'integraciones', 'clientes', 'motorizados', 'asesores'],
    Vendedor: ['clientes', 'almacenes'],
    Almacen: ['almacenes'], 
    Delivery: ['motorizados'] 
>>>>>>> 56e289f4518ce784252e06dc48369fdeaa51759c
  };

  const seccionesPermitidas = permisosPorRol[rol] || [];

  return (
    <nav>
      <ul className="main-menu">
<<<<<<< HEAD
        {seccionesPermitidas.includes("pedidos") && (
          <li
            className={`main-menu-item ${expanded.pedidos ? "expanded" : ""}`}
          >
            {/* Usamos onMenuItemClick aquí */}
            <div
              className="menu-item-header"
              onClick={() => onMenuItemClick("pedidos")}
            >
=======
        {seccionesPermitidas.includes('pedidos') && (
          <li
            className={`main-menu-item${expanded.pedidos ? ' expanded' : ''}${['ordenDePedido', 'seguimientoContraentrega', 'enviosAgencia'].includes(activeSection) ? ' selected' : ''}`}
          >
            <div className="menu-item-header" onClick={() => toggleSection('pedidos')}>
>>>>>>> 56e289f4518ce784252e06dc48369fdeaa51759c
              <img
                src={gearImages.pedidos}
                alt="Pedidos"
                style={{ width: "22px", height: "22px" }}
              />
              <i className="fas fa-clipboard-list"></i>
<<<<<<< HEAD
              {/* Resaltado del TÍTULO de Pedidos */}
              <span
                style={{
                  fontWeight: 400,
                  fontSize: 18,
                  color:
                    activeSection === "pedidos" ? "white" : spanColors.pedidos,
                }}
              >
                Pedidos
              </span>
              <i
                className={`fas fa-chevron-${
                  expanded.pedidos ? "down" : "right"
                }`}
              ></i>
=======
              <span style={{ fontWeight: 400, fontSize: 18 }}>Pedidos</span>
              <i className={`fas fa-chevron-${expanded.pedidos ? 'down' : 'right'}`}></i>
>>>>>>> 56e289f4518ce784252e06dc48369fdeaa51759c
              <img
                src={arrowImages.pedidos}
                alt="Pedidos"
                className="menu-icon"
              />
            </div>
            {expanded.pedidos && (
              <ul className="submenu">
                <li
<<<<<<< HEAD
                  // Usamos onMenuItemClick y activeSection para el resaltado
                  onClick={() => onMenuItemClick("ordenDePedido")}
                  className={activeSection === "ordenDePedido" ? "active" : ""}
                >
=======
                  onClick={() => handlePedidosClick('ordenDePedido')}
                  className={pedidosSeleccion === 'ordenDePedido' ? 'active' : ''}>
>>>>>>> 56e289f4518ce784252e06dc48369fdeaa51759c
                  Orden de Pedido
                </li>
                <li
                  onClick={() => onMenuItemClick("seguimientoContraentrega")}
                  className={
                    activeSection === "seguimientoContraentrega" ? "active" : ""
                  }
                >
                  Seguimiento Contraentrega
                </li>
                <li
                  onClick={() => onMenuItemClick("enviosAgencia")}
                  className={activeSection === "enviosAgencia" ? "active" : ""}
                >
                  Envíos Agencia
                </li>
              </ul>
            )}
          </li>
        )}

<<<<<<< HEAD
        {seccionesPermitidas.includes("mantenimiento") && (
          <li
            className={`main-menu-item ${
              expanded.mantenimiento ? "expanded" : ""
            }`}
          >
            {/* Usamos onMenuItemClick aquí */}
            <div
              className="menu-item-header"
              onClick={() => onMenuItemClick("mantenimiento")}
            >
=======
        {seccionesPermitidas.includes('mantenimiento') && (
          <li
            className={`main-menu-item${expanded.mantenimiento ? ' expanded' : ''}${['productos', 'usuarios', 'movimiento', 'almacenes'].includes(activeSection) ? ' selected' : ''}`}
          >
            {/* <li className={`main-menu-item ${expanded.mantenimiento ? 'expanded' : ''}`}> */}
            <div className="menu-item-header" onClick={() => toggleSection('mantenimiento')}>
>>>>>>> 56e289f4518ce784252e06dc48369fdeaa51759c
              <img
                src={gearImages.mantenimiento}
                alt="Mantenimiento"
                style={{ width: "22px", height: "22px" }}
              />
              <i className="fas fa-cogs"></i>
<<<<<<< HEAD
              {/* Resaltado del TÍTULO de Mantenimiento */}
              <span
                style={{
                  fontWeight: 400,
                  fontSize: 18,
                  color:
                    activeSection === "mantenimiento"
                      ? "white"
                      : spanColors.mantenimiento,
                }}
              >
                Mantenimiento
              </span>
              <i
                className={`fas fa-chevron-${
                  expanded.mantenimiento ? "down" : "right"
                }`}
              ></i>
=======
              <span style={{ fontWeight: 400, fontSize: 18, }}>Mantenimiento</span>
              <i className={`fas fa-chevron-${expanded.mantenimiento ? 'down' : 'right'}`}></i>
>>>>>>> 56e289f4518ce784252e06dc48369fdeaa51759c
              <img
                src={arrowImages.mantenimiento}
                alt="Mantenimiento"
                className="menu-icon"
              />
            </div>
            {expanded.mantenimiento && (
              <ul className="submenu">
                <li
                  // Usamos onMenuItemClick y activeSection para el resaltado
                  onClick={() => onMenuItemClick("productos")}
                  className={activeSection === "productos" ? "active" : ""}
                >
                  Productos
                </li>
                <li
                  onClick={() => onMenuItemClick("usuarios")}
                  className={activeSection === "usuarios" ? "active" : ""}
                >
                  Usuarios de tienda
                </li>
                <li
                  onClick={() => onMenuItemClick("movimiento")}
                  className={activeSection === "movimiento" ? "active" : ""}
                >
                  Movimiento
                </li>
                <li
                  onClick={() => onMenuItemClick("almacenes")}
                  className={activeSection === "almacenes" ? "active" : ""}
                >
                  Almacen
                </li>
              </ul>
            )}
          </li>
        )}

<<<<<<< HEAD
        {seccionesPermitidas.includes("integraciones") && (
          <li
            className={`main-menu-item ${
              expanded.integraciones ? "expanded" : ""
            }`}
          >
            {/* Usamos onMenuItemClick aquí */}
            <div
              className="menu-item-header"
              onClick={() => onMenuItemClick("integraciones")}
            >
=======
        {seccionesPermitidas.includes('almacenes') && (
          <li className={`main-menu-item ${expanded.almacenes ? 'expanded' : ''}`}>
            {/* <li className="main-menu-item"> */}
            <div className="menu-item-header" onClick={() => handleMantenimientoClick('almacenes')}>
              <img
                src={gearImages.almacenes || gearImages.mantenimiento}
                alt="Almacenes"
                style={{ width: '22px', height: '22px' }}
              />
              <i className="fas fa-warehouse"></i>
              <span style={{ fontWeight: 400, fontSize: 18, }}>Almacenes</span>
            </div>
          </li>
        )}

        {seccionesPermitidas.includes('integraciones') && (
          <li
            className={`main-menu-item${expanded.integraciones ? ' expanded' : ''}${['shopify'].includes(activeSection) ? ' selected' : ''}`}
          >
            {/* <li className={`main-menu-item ${expanded.integraciones ? 'expanded' : ''}`}> */}
            <div className="menu-item-header" onClick={() => toggleSection('integraciones')}>
>>>>>>> 56e289f4518ce784252e06dc48369fdeaa51759c
              <img
                src={gearImages.integraciones}
                alt="Integraciones"
                style={{ width: "22px", height: "22px" }}
              />
              <i className="fas fa-plug"></i>
<<<<<<< HEAD
              {/* Resaltado del TÍTULO de Integraciones */}
              <span
                style={{
                  fontWeight: 400,
                  fontSize: 18,
                  color:
                    activeSection === "integraciones"
                      ? "white"
                      : spanColors.integraciones,
                }}
              >
                Integraciones
              </span>
              <i
                className={`fas fa-chevron-${
                  expanded.integraciones ? "down" : "right"
                }`}
              ></i>
=======
              <span style={{ fontWeight: 400, fontSize: 18, }}>Integraciones</span>
              <i className={`fas fa-chevron-${expanded.integraciones ? 'down' : 'right'}`}></i>
>>>>>>> 56e289f4518ce784252e06dc48369fdeaa51759c
              <img
                src={arrowImages.integraciones}
                alt="Integraciones"
                className="menu-icon"
              />
            </div>
            {expanded.integraciones && (
              <ul className="submenu">
                <li
                  // Usamos onMenuItemClick y activeSection para el resaltado
                  onClick={() => onMenuItemClick("shopify")}
                  className={activeSection === "shopify" ? "active" : ""}
                >
                  Shopify
                </li>
              </ul>
            )}
          </li>
        )}

<<<<<<< HEAD
        {seccionesPermitidas.includes("clientes") && (
          <li
            className={`main-menu-item ${expanded.clientes ? "expanded" : ""} ${
              activeSection === "clientes" ? "active-single-item" : ""
            }`}
          >
            {" "}
            {/* <-- ¡CAMBIO AQUÍ! */}
            {/* Usamos onMenuItemClick aquí */}
            <div
              className="menu-item-header"
              onClick={() => onMenuItemClick("clientes")}
            >
=======
        {seccionesPermitidas.includes('clientes') && (
          <li
            className={`main-menu-item${expanded.clientes ? ' expanded' : ''}${['cliente1', 'cliente2'].includes(activeSection) ? ' selected' : ''}`}
          >
            {/* <li className={`main-menu-item ${expanded.clientes ? 'expanded' : ''}`}> */}
            <div className="menu-item-header" onClick={() => toggleSection('clientes')}>
>>>>>>> 56e289f4518ce784252e06dc48369fdeaa51759c
              <img
                src={gearImages.clientes}
                alt="Clientes"
                style={{ width: "22px", height: "22px" }}
              />
              <i className="fas fa-users"></i>
<<<<<<< HEAD
              {/* Resaltado del TÍTULO de Clientes */}
              <span
                style={{
                  fontWeight: 400,
                  fontSize: 18,
                  color:
                    activeSection === "clientes"
                      ? "white"
                      : spanColors.clientes,
                }}
              >
                Clientes
              </span>
              <i
                className={`fas fa-chevron-${
                  expanded.clientes ? "down" : "right"
                }`}
              ></i>
=======
              <span style={{ fontWeight: 400, fontSize: 18, }}>Clientes</span>
              <i className={`fas fa-chevron-${expanded.clientes ? 'down' : 'right'}`}></i>
>>>>>>> 56e289f4518ce784252e06dc48369fdeaa51759c
              <img
                src={arrowImages.clientes}
                alt="Clientes"
                className="menu-icon"
              />
            </div>
            {expanded.clientes && (
              <ul className="submenu">
                {/* Los ítems del submenu se deben hacer clic y resaltar con activeSection */}
                <li
                  onClick={() => onMenuItemClick("cliente1")}
                  className={activeSection === "cliente1" ? "active" : ""}
                >
                  Cliente 1
                </li>
                <li
                  onClick={() => onMenuItemClick("cliente2")}
                  className={activeSection === "cliente2" ? "active" : ""}
                >
                  Cliente 2
                </li>
              </ul>
            )}
          </li>
        )}
<<<<<<< HEAD
        {seccionesPermitidas.includes("motorizados") && (
          <li
            className={`main-menu-item ${
              activeSection === "motorizados" ? "active" : ""
            }`}
          >
            {" "}
            {/* <-- ¡CAMBIO AQUÍ! */}
            {/* Usamos onMenuItemClick aquí */}
            <div
              className="menu-item-header"
              onClick={() => onMenuItemClick("motorizados")}
            >
=======

        {seccionesPermitidas.includes('motorizados') && (
          <li className={`main-menu-item${expanded.motorizados ? ' expanded' : ''}${['motorizado1', 'motorizado2'].includes(activeSection) ? ' selected' : ''}`}>
          {/* <li className={`main-menu-item ${expanded.motorizados ? 'expanded' : ''}`}> */}
            <div className="menu-item-header" onClick={() => toggleSection('motorizados')}>
>>>>>>> 56e289f4518ce784252e06dc48369fdeaa51759c
              <img
                src={gearImages.motorizados}
                alt="Motorizados"
                style={{ width: "22px", height: "22px" }}
              />
              <i className="fas fa-motorcycle"></i>
<<<<<<< HEAD
              {/* Resaltado del TÍTULO de Motorizados */}
              <span
                style={{
                  fontWeight: 400,
                  fontSize: 18,
                  color:
                    activeSection === "motorizados"
                      ? "white"
                      : spanColors.motorizados,
                }}
              >
                Motorizados
              </span>
              {/* Ya no hay flecha de expansión si no hay submenú real */}
              {/* <i className={`fas fa-chevron-${expanded.motorizados ? 'down' : 'right'}`}></i> */}
              {/* La imagen de la flecha podría ocultarse o no ser necesaria */}
              {/* <img
=======
              <span style={{ fontWeight: 400, fontSize: 18, }}>Motorizados</span>
              <i className={`fas fa-chevron-${expanded.motorizados ? 'down' : 'right'}`}></i>
              <img
>>>>>>> 56e289f4518ce784252e06dc48369fdeaa51759c
                src={arrowImages.motorizados}
                alt="Motorizados"
                className="menu-icon"
            /> */}
            </div>
            {/* Si no hay submenú, esta sección no se renderiza. O puedes poner links directos si los hay. */}
            {/* Si 'motorizados' NO tiene un submenu real (links a otras páginas), puedes eliminar este bloque: */}
            {expanded.motorizados && (
              <ul className="submenu">
                {/* Estos deben ser links reales o usar onMenuItemClick si son secciones */}
                <li
                  onClick={() => onMenuItemClick("motorizado1")}
                  className={activeSection === "motorizado1" ? "active" : ""}
                >
                  Motorizado 1
                </li>
                <li
                  onClick={() => onMenuItemClick("motorizado2")}
                  className={activeSection === "motorizado2" ? "active" : ""}
                >
                  Motorizado 2
                </li>
              </ul>
            )}
          </li>
        )}
<<<<<<< HEAD
        {seccionesPermitidas.includes("asesores") && (
          <li
            className={`main-menu-item ${expanded.asesores ? "expanded" : ""} ${
              activeSection === "asesores" ? "active-single-item" : ""
            }`}
          >
            {" "}
            {/* <-- ¡CAMBIO AQUÍ! */}
            {/* Usamos onMenuItemClick aquí */}
            <div
              className="menu-item-header"
              onClick={() => onMenuItemClick("asesores")}
            >
=======

        {seccionesPermitidas.includes('asesores') && (
          <li className={`main-menu-item${expanded.asesores ? ' expanded' : ''}${['asesor1', 'asesor2'].includes(activeSection) ? ' selected' : ''}`}>
          {/* <li className={`main-menu-item ${expanded.asesores ? 'expanded' : ''}`}> */}
            <div className="menu-item-header" onClick={() => toggleSection('asesores')}>
>>>>>>> 56e289f4518ce784252e06dc48369fdeaa51759c
              <img
                src={gearImages.asesores}
                alt="Asesores"
                style={{ width: "22px", height: "22px" }}
              />
              <i className="fas fa-user-tie"></i>
<<<<<<< HEAD
              {/* Resaltado del TÍTULO de Asesores */}
              <span
                style={{
                  fontWeight: 400,
                  fontSize: 18,
                  color:
                    activeSection === "asesores"
                      ? "white"
                      : spanColors.asesores,
                }}
              >
                Asesores
              </span>
              <i
                className={`fas fa-chevron-${
                  expanded.asesores ? "down" : "right"
                }`}
              ></i>
=======
              <span style={{ fontWeight: 400, fontSize: 18, }}>Asesores</span>
              <i className={`fas fa-chevron-${expanded.asesores ? 'down' : 'right'}`}></i>
>>>>>>> 56e289f4518ce784252e06dc48369fdeaa51759c
              <img
                src={arrowImages.asesores}
                alt="Asesores"
                className="menu-icon"
              />
            </div>
            {expanded.asesores && (
              <ul className="submenu">
                {/* Los ítems del submenu se deben hacer clic y resaltar con activeSection */}
                <li
                  onClick={() => onMenuItemClick("asesor1")}
                  className={activeSection === "asesor1" ? "active" : ""}
                >
                  Asesor 1
                </li>
                <li
                  onClick={() => onMenuItemClick("asesor2")}
                  className={activeSection === "asesor2" ? "active" : ""}
                >
                  Asesor 2
                </li>
              </ul>
            )}
          </li>
        )}
      </ul>
    </nav>
  );
};

export default MenuPorRol;
