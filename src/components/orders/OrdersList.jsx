import React from 'react';

const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible';

  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };

  try {
    return new Date(dateString).toLocaleDateString('es-ES', options);
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return dateString;
  }
};

const getOrderStatus = (order) => {
  if (!order) return 'Desconocido';

  if (order.cancelled_at) return 'Cancelado';
  if (order.closed_at) return 'Cerrado';
  if (order.fulfilled_at) return 'Entregado';
  if (order.processed_at) return 'Procesado';
  return 'Pendiente';
};

const getStatusClass = (status) => {
  switch (status) {
    case 'Cancelado': return 'status-cancelled';
    case 'Cerrado': return 'status-closed';
    case 'Entregado': return 'status-fulfilled';
    case 'Procesado': return 'status-processed';
    case 'Pendiente': return 'status-pending';
    default: return '';
  }
};

const OrdersList = ({ orders, loading, error, onViewOrder }) => {
  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Cargando pedidos...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <h3>Error al cargar pedidos</h3>
      <p>{error.message || 'Ocurrió un error desconocido'}</p>
      <p>Verificar que el servidor backend esté en ejecución y que las credenciales de Shopify sean correctas.</p>
    </div>
  );

  if (!orders || orders.length === 0) return (
    <div className="empty-container">
      <p>No hay pedidos disponibles</p>
    </div>
  );

  return (
    <div className="orders-list">
      <table className="orders-table">
        <thead>
          <tr>
            <th>Nº Pedido</th>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>#{order.name || order.order_number || 'Sin número'}</td>
              <td>{formatDate(order.created_at)}</td>
              <td>
                {order.customer ?
                  `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim() || 'Sin nombre' :
                  'Cliente no registrado'}
              </td>
              <td>
                {new Intl.NumberFormat('es-ES', {
                  style: 'currency',
                  currency: order.currency || 'USD'
                }).format(order.total_price || 0)}
              </td>
              <td>
                <span className={`status-badge ${getStatusClass(getOrderStatus(order))}`}>
                  {getOrderStatus(order)}
                </span>
              </td>
              <td>
                <button
                  className="btn-view"
                  onClick={() => onViewOrder && onViewOrder(order.id)}
                >
                  Ver detalles
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersList;