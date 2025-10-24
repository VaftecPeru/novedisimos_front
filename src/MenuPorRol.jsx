import React from "react";

const MenuPorRol = ({
  rol,
  expanded,
  onExpandMenu,
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
      "motorizados",
      "asesores",
    ],
    Vendedor: ["pedidos"],
    Almacen: ["mantenimiento"],
    Delivery: ["motorizados"],
  };

  const seccionesPermitidas = permisosPorRol[rol] || [];

  return (
    <nav>
      <ul className="main-menu">
        {seccionesPermitidas.includes("pedidos") && (
          <li
            className={`main-menu-item ${expanded.pedidos ? "expanded" : ""}`}
          >
            {/* Usamos onMenuItemClick aquí */}
            <div
              className="menu-item-header"
              onClick={() => onExpandMenu("pedidos")}
            >
              <img
                src={gearImages.pedidos}
                alt="Pedidos"
                style={{ width: "22px", height: "22px" }}
              />
              <i className="fas fa-clipboard-list"></i>
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
              <i className={`fas fa-chevron-${expanded.pedidos ? "down" : "right"}`}></i>
              <img
                src={arrowImages.pedidos}
                alt="Pedidos"
                className="menu-icon"
              />
            </div>
            {expanded.pedidos && (
              <ul className="submenu">
                <li
                  onClick={() => onMenuItemClick("ordenDePedido")}
                  className= {activeSection === "ordenDePedido" ? "active" : ""}
                >
                  Orden de Pedido
                </li>
                <li 
                  onClick={() => onMenuItemClick("busquedaInterna")}
                  className= {activeSection === "busquedaInterna" ? "active" : ""}
                >
                  Busqueda Interna
                </li>
                <li 
                  onClick={() => onMenuItemClick("busquedaExterna")}
                  className= {activeSection === "busquedaExterna" ? "active" : ""}
                >
                  Busqueda Externa
                </li>
                {/* <li
                  onClick={() => onMenuItemClick("seguimientoContraentrega")}
                  className={
                    activeSection === "seguimientoContraentrega" ? "active" : ""
                  }
                >
                  Seguimiento Contraentrega
                </li> */}
              </ul>
            )}
          </li>
        )}
        {seccionesPermitidas.includes("mantenimiento") && (
          <li
            className={`main-menu-item ${expanded.mantenimiento ? "expanded" : ""}`}
          >
            <div
              className="menu-item-header"
              onClick={() => onExpandMenu("mantenimiento")}
            >
              <img
                src={gearImages.mantenimiento}
                alt="Mantenimiento"
                style={{ width: "22px", height: "22px" }}
              />
              <i className="fas fa-cogs"></i>
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
              <i className={`fas fa-chevron-${expanded.mantenimiento ? "down" : "right"}`}></i>
              <img
                src={arrowImages.mantenimiento}
                alt="Mantenimiento"
                className="menu-icon"
              />
            </div>
            {expanded.mantenimiento && (
              <ul className="submenu">
                {/* <li
                  onClick={() => onMenuItemClick("productos")}
                  className={activeSection === "productos" ? "active" : ""}
                >
                  Productos
                </li> */}
                {/* <li
                  onClick={() => onMenuItemClick("movimiento")}
                  className={activeSection === "movimiento" ? "active" : ""}
                >
                  Movimiento
                </li> */}
                <li
                  onClick={() => onMenuItemClick("almacenes")}
                  className={activeSection === "almacenes" ? "active" : ""}
                >
                  Almacen
                </li>
                {/* Agregar Control de Usuarios solo para administradores */}
                {rol === 'Administrador' && (
                  <li
                    onClick={() => onMenuItemClick("controlUsuarios")}
                    className={activeSection === "controlUsuarios" ? "active" : ""}
                  >
                    Control de Usuarios
                  </li>
                )}
              </ul>
            )}
          </li>
        )}
        {seccionesPermitidas.includes("integraciones") && (
          <li 
            className={`main-menu-item ${expanded.integraciones ? "expanded" : ""}`}
          >
            {/* Usamos onMenuItemClick aquí */}
            <div
              className="menu-item-header"
              onClick={() => onExpandMenu("integraciones")}
            >
              <img
                src={gearImages.integraciones}
                alt="Integraciones"
                style={{ width: "22px", height: "22px" }}
              />
              <i className="fas fa-plug"></i>
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
              <i className={`fas fa-chevron-${expanded.integraciones ? "down" : "right"}`}></i>
              <img
                src={arrowImages.integraciones}
                alt="Integraciones"
                className="menu-icon"
              />
            </div>
            {expanded.integraciones && (
              <ul className="submenu">
                <li
                  onClick={() => onMenuItemClick("shopify")}
                  className={activeSection === "shopify" ? "active" : ""}
                >
                  Shopify
                </li>
              </ul>
            )}
          </li>
        )}
        {seccionesPermitidas.includes("motorizados") && (
  <li
    className={`main-menu-item ${
      expanded.motorizados ? "expanded" : ""
    }`}
  >
    {/* ✅ HEADER: ABRE SUBMENU */}
    <div
      className="menu-item-header"
      onClick={() => onExpandMenu("motorizados")}
    >
      <img
        src={gearImages.motorizados}
        alt="Motorizados"
        style={{ width: "22px", height: "22px" }}
      />
      <i className="fas fa-motorcycle"></i>
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
      <i className={`fas fa-chevron-${expanded.motorizados ? "down" : "right"}`}></i>
      <img
        src={arrowImages.motorizados}
        alt="Motorizados"
        className="menu-icon"
      />
    </div>
    
    {/* ✅ SUBMENU CON 2 ÍTEMES */}
    {expanded.motorizados && (
      <ul className="submenu">
        {/* 🆕 ÍTEM 1: MOTORIZADOS (DIRECTO A PÁGINA) */}
        <li
          onClick={() => onMenuItemClick("motorizados")}
          className={activeSection === "motorizados" ? "active" : ""}
        >
          Motorizados
        </li>
        
        {/* 🆕 ÍTEM 2: DETALLE MOTORIZADOS */}
        <li
          onClick={() => onMenuItemClick("detallemotorizados")}
          className={
            activeSection === "detallemotorizados" ? "active" : ""
          }
        >
          Detalle Motorizados
        </li>
      </ul>
    )}
  </li>
)}
        
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
              <img
                src={gearImages.asesores}
                alt="Asesores"
                style={{ width: "22px", height: "22px" }}
              />
              <i className="fas fa-user-tie"></i>
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
            </div>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default MenuPorRol;
