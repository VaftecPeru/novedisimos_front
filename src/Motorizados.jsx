import React from "react";
import "./motorizados.css";

const Motorizados = () => {
  return (
    <div className="container">
      {/* El título "PASO 3 Asignación al Motorizado" está en la imagen,
          pero no en el JSX que me pasaste. Si lo necesitas, agrégalo aquí:
          <h2>PASO 3</h2>
          <h3>Asignación al Motorizado</h3>
          <p className="subtitulo">Asigna un motorizado según zona y disponibilidad</p>
      */}
      <h3>Motorizados según zona y disponibilidad</h3>{" "}
      {/* Si no es el título completo */}
      <div className="box">
        <p>
          <strong>Detalles del Pedido</strong>
        </p>
        <p>#PED12345</p>
        <p>
          Cliente: <span className="bold">Juan Pérez</span>
        </p>
        <p>
          Dirección: Av. Los Alas 123, <span className="bold">Surco</span>
        </p>
        <p>
          Monto a cobrar: <span className="bold">S/ 145.00</span>
        </p>
      </div>
      <div className="box">
        <label htmlFor="zona">Motorizado</label>
        <br />
        <select id="zona" className="dropdown">
          <option>Zona</option>
        </select>
        {/* Nuevo contenedor para los motoristas individuales */}
        <div className="motorista-list">
          <div className="motorista">
            <div className="motorista-info">
              <img
                src="https://randomuser.me/api/portraits/men/32.jpg"
                alt="Luis"
              />
              <div>
                <div className="bold">Luis Martínez</div>
                <div className="status disponible">Disponible</div>
                <div>Pedidos asignados: 1</div>
              </div>
            </div>
            <button className="btn">Asignar a motorizado</button>
          </div>

          <div className="motorista">
            <div className="motorista-info">
              <img
                src="https://randomuser.me/api/portraits/men/75.jpg"
                alt="Carlos"
              />
              <div>
                <div className="bold">Carlos Gómez</div>
                <div className="status ocupado">Ocupado</div>
                <div>Pedidos asignados: 3</div>
              </div>
            </div>
            <button className="btn">Asignar a este motorizado</button>
          </div>
        </div>{" "}
        {/* Fin de motorista-list */}
        {/* Nuevo contenedor para el código de confirmación y el botón final */}
        <div className="bottom-row-desktop">
          <div className="confirmation">
            <label className="bold">Código de Confirmación</label>
            <input type="text" value="1946" readOnly />
          </div>

          <button className="btn full-width">
            Asignar y Enviar Pedido al Motorizado
          </button>
        </div>{" "}
        {/* Fin de bottom-row-desktop */}
      </div>
    </div>
  );
};

export default Motorizados;
