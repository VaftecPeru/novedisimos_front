import React, { useState } from "react";
import "./Motorizados.css"; // Importa el archivo CSS
import PrintIcon from "@mui/icons-material/Print";
import CropSquareIcon from "@mui/icons-material/CropSquare";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import VisibilityIcon from "@mui/icons-material/Visibility";
import IconButton from "@mui/material/IconButton";
import { useNavigate } from "react-router-dom";

const HistorialPedidosMotorizado = () => {
  const navigate = useNavigate();
  // Estado para los filtros (puedes expandir esto según sea necesario)
  const [clienteSearch, setClienteSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [limitePedidosFilter, setLimitePedidosFilter] = useState("");
  const [metodoFilter, setMetodoFilter] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // Datos de ejemplo para la tabla (normalmente vendrían de una API)
  // Se agregaron las propiedades 'motorizado' y 'vendedor' con datos de relleno
  const pedidos = [
    {
      factura: "12068",
      hora: "11 de junio de 2025, 14:23",
      motorizado: "Juan Pérez",
      vendedor: "Ana García",
      cliente: "Taarak Mehta",
      metodo: "Dinero",
      cantidad: "$ 413.00",
      estado: "Pendiente",
    },
    {
      factura: "12067",
      hora: "10 de junio de 2025, 9:22 a. m.",
      motorizado: "María López",
      vendedor: "Carlos Ruiz",
      cliente: "Johnny Doeee",
      metodo: "Dinero",
      cantidad: "$ 139.79",
      estado: "Pendiente",
    },
    {
      factura: "12059",
      hora: "9 de junio de 2025, 18:50",
      motorizado: "Pedro Gómez",
      vendedor: "Laura Torres",
      cliente: "saasas dsdad",
      metodo: "Dinero",
      cantidad: "$ 253.26",
      estado: "Tratamiento",
    },
    {
      factura: "12066",
      hora: "9 de junio de 2025, 13:02",
      motorizado: "Juan Pérez",
      vendedor: "Ana García",
      cliente: "Johnny Doeee",
      metodo: "Dinero",
      cantidad: "$ 213.26",
      estado: "Pendiente",
    },
    {
      factura: "12046",
      hora: "9 de junio de 2025, 1:32 a. m.",
      motorizado: "María López",
      vendedor: "Carlos Ruiz",
      cliente: "Saiful Miqtar",
      metodo: "Tarjeta",
      cantidad: "$ 165.10",
      estado: "Tratamiento",
    },
    {
      factura: "12065",
      hora: "9 de junio de 2025, 1:27 a. m.",
      motorizado: "Pedro Gómez",
      vendedor: "Laura Torres",
      cliente: "Doctor Masuf Ahmed",
      metodo: "Dinero",
      cantidad: "$ 200.78",
      estado: "Pendiente",
    },
    {
      factura: "12064",
      hora: "8 de junio de 2025, 17:51",
      motorizado: "Juan Pérez",
      vendedor: "Ana García",
      cliente: "Tran 4 Chen",
      metodo: "Dinero",
      cantidad: "$ 67.07",
      estado: "Entregado",
    },
    {
      factura: "12058",
      hora: "8 de junio de 2025, 14:49",
      motorizado: "María López",
      vendedor: "Carlos Ruiz",
      cliente: "Jobn Mohan",
      metodo: "Dinero",
      cantidad: "$ 90.00",
      estado: "Pendiente",
    },
    {
      factura: "12063",
      hora: "6 de junio de 2025, 14:28",
      motorizado: "Pedro Gómez",
      vendedor: "Laura Torres",
      cliente: "NUR ALOM",
      metodo: "Tarjeta",
      cantidad: "$ 627.82",
      estado: "Pendiente",
    },
    {
      factura: "11110",
      hora: "6 de junio de 2025, 9:22 a. m.",
      motorizado: "Juan Pérez",
      vendedor: "Ana García",
      cliente: "xx xx",
      metodo: "Dinero",
      cantidad: "$ 207.83",
      estado: "Entregado",
    },
    {
      factura: "12062",
      hora: "5 de junio de 2025, 20:16",
      motorizado: "María López",
      vendedor: "Carlos Ruiz",
      cliente: "añadir sda",
      metodo: "Dinero",
      cantidad: "$ 2010.00",
      estado: "Pendiente",
    },
    {
      factura: "12042",
      hora: "4 de junio de 2025, 9:03 a. m.",
      motorizado: "Pedro Gómez",
      vendedor: "Laura Torres",
      cliente: "Saiful Miqtar",
      metodo: "Dinero",
      cantidad: "$ 420.00",
      estado: "Entregado",
    },
    {
      factura: "12052",
      hora: "4 de junio de 2025, 22:03 a. m.",
      motorizado: "Juan Pérez",
      vendedor: "Ana García",
      cliente: "Jesco Hario",
      metodo: "Dinero",
      cantidad: "$ 80.00",
      estado: "Pendiente",
    },
    // ... puedes añadir más datos
  ];

  // Función de ejemplo para el filtrado (simplificado)
  const filteredPedidos = pedidos.filter((pedido) => {
    return (
      pedido.cliente.toLowerCase().includes(clienteSearch.toLowerCase()) &&
      (estadoFilter === "" || pedido.estado === estadoFilter) &&
      (metodoFilter === "" || pedido.metodo === metodoFilter)
      // Aquí puedes añadir lógica para los filtros de fecha y límite de pedidos
    );
  });

  const handleFilter = () => {
    console.log("Aplicando filtros:", {
      clienteSearch,
      estadoFilter,
      limitePedidosFilter,
      metodoFilter,
      fechaInicio,
      fechaFin,
    });
    // En una aplicación real, aquí harías una llamada a la API para obtener los datos filtrados
  };

  const handleResetFilters = () => {
    setClienteSearch("");
    setEstadoFilter("");
    setLimitePedidosFilter("");
    setMetodoFilter("");
    setFechaInicio("");
    setFechaFin("");
    console.log("Filtros reiniciados.");
    // Opcional: recargar datos originales si es necesario
  };

  return (
    <div className="historial-pedidos-container">
      <h3>Historial de Pedidos Motorizados</h3> {/* Título ajustado */}
      {/* Sección de Filtros */}
      <div className="filters-section">
        <input
          type="text"
          placeholder="Buscar por nombre de cliente"
          value={clienteSearch}
          onChange={(e) => setClienteSearch(e.target.value)}
          className="filter-input"
        />
        <select
          value={estadoFilter}
          onChange={(e) => setEstadoFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">Estado</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Tratamiento">Tratamiento</option>
          <option value="Entregado">Entregado</option>
          <option value="Cancelar">Cancelar</option>
        </select>
        <select
          value={limitePedidosFilter}
          onChange={(e) => setLimitePedidosFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">Límites de pedidos</option>
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
        </select>
        <select
          value={metodoFilter}
          onChange={(e) => setMetodoFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">Método</option>
          <option value="Dinero">Dinero</option>
          <option value="Tarjeta">Tarjeta</option>
        </select>
        <button className="btn-descargar">Descargar todos los pedidos</button>
      </div>
      <div className="date-filters-section">
        <div className="date-input-group">
          <label htmlFor="fechaInicio">Fecha de inicio</label>
          <input
            type="date"
            id="fechaInicio"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="filter-date"
          />
        </div>
        <div className="date-input-group">
          <label htmlFor="fechaFin">Fecha de finalización</label>
          <input
            type="date"
            id="fechaFin"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="filter-date"
          />
        </div>
        <button className="btn-filter" onClick={handleFilter}>
          Filtrar
        </button>
        <button className="btn-reset" onClick={handleResetFilters}>
          Reiniciar
        </button>
      </div>
      {/* Sección de Tabla */}
      <div className="table-wrapper">
        <table className="pedidos-table">
          <thead>
            <tr>
              <th>NÚMERO DE FACTURA</th>
              <th>HORA DEL PEDIDO</th>
              <th>MOTORIZADO</th> {/* Nueva columna */}
              <th>VENDEDOR</th> {/* Nueva columna */}
              <th>NOMBRE DEL CLIENTE</th>
              <th>MÉTODO</th>
              <th>CANTIDAD</th>
              <th>ESTADO</th>
              <th>ACCIÓN</th>
              <th>FACTURA</th>
            </tr>
          </thead>
          <tbody>
            {filteredPedidos.map((pedido, index) => (
              <tr key={index}>
                <td>{pedido.factura}</td>
                <td>{pedido.hora}</td>
                <td>{pedido.motorizado}</td>
                <td>{pedido.vendedor}</td>
                <td>{pedido.cliente}</td>
                <td>{pedido.metodo}</td>
                <td>{pedido.cantidad}</td>
                <td>
                  <span
                    className={`status-badge ${pedido.estado.toLowerCase()}`}
                  >
                    {pedido.estado}
                  </span>
                </td>
                <td>
                  {["Pendiente", "Tratamiento"].includes(pedido.estado) && (
                    <button className="action-button-cancelar">Cancelar</button>
                  )}
                </td>
                {/* Columna FACTURA: solo íconos */}
                <td className="action-icons-cell">
                  <IconButton size="small" title="Imprimir">
                    <PrintIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" title="Maximizar">
                    <ZoomInIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    title="Ver detalle"
                    onClick={() => navigate(`/motorizados/${pedido.factura}`)}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistorialPedidosMotorizado;
