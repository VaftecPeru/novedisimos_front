import React, { useState, useEffect } from 'react';
import { useUser } from './UserContext';
import './ControlUsuarios.css';
import apiClient from './config/api';

const ControlUsuarios = () => {
  const { usuario } = useUser();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para modales
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    rol: 'Vendedor',
    estado: true,
  });

  // Verificar permisos de administrador
  useEffect(() => {
    if (usuario?.rol !== 'Administrador') {
      window.location.href = '/dashboard';
      return;
    }
    cargarUsuarios();
  }, [usuario]);

  // Cargar usuarios desde el backend
  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/usuarios');
      setUsuarios(response.data);
    } catch (error) {
      setError('Error al cargar los usuarios');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Guardar cambios
  const guardarCambios = async () => {
    try {
      await apiClient.put(`/usuarios/${usuarioEditando.id}`, formData);
      setUsuarios((prev) =>
        prev.map((user) =>
          user.id === usuarioEditando.id ? { ...user, ...formData } : user
        )
      );
      cerrarModalEdicion();
    } catch (error) {
      setError('Error al actualizar el usuario');
      console.error('Error:', error);
    }
  };

  // Agregar nuevo usuario
  const agregarUsuario = async () => {
    try {
      if (!formData.nombre || !formData.correo) {
        setError('Nombre y correo son obligatorios');
        return;
      }
      const response = await apiClient.post('/usuarios', formData);
      setUsuarios((prev) => [...prev, response.data]);
      cerrarModalAgregar();
    } catch (error) {
      setError('Error al agregar el usuario');
      console.error('Error:', error);
    }
  };

  // Eliminar usuario
  const eliminarUsuario = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await apiClient.delete(`/usuarios/${id}`);
        setUsuarios((prev) => prev.filter((user) => user.id !== id));
      } catch (error) {
        setError('Error al eliminar el usuario');
        console.error('Error:', error);
      }
    }
  };

  // Funciones para cerrar modales
  const cerrarModalEdicion = () => {
    setShowEditModal(false);
    setUsuarioEditando(null);
  };

  const cerrarModalAgregar = () => {
    setShowAddModal(false);
    setFormData({
      nombre: '',
      correo: '',
      rol: 'Vendedor',
      estado: true,
    });
    setError('');
  };

  // Si no es administrador
  if (usuario?.rol !== 'Administrador') {
    return (
      <div className="control-usuarios-container acceso-denegado">
        <h2>Acceso Denegado</h2>
        <p>No tienes permisos para acceder a esta sección</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="control-usuarios-container">
        <div className="loading">Cargando usuarios...</div>
      </div>
    );
  }

  return (
    <div className="control-usuarios-container">
      <header className="control-usuarios-header">
        <h1>Control de Usuarios</h1>
        <button className="btn-agregar" onClick={() => setShowAddModal(true)}>
          + Agregar Usuario
        </button>
      </header>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <section className="tabla-usuarios-container">
        <table className="tabla-usuarios">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuarioItem) => (
              <tr key={usuarioItem.id}>
                <td>{usuarioItem.nombre}</td>
                <td>{usuarioItem.correo}</td>
                <td>
                  <span className={`badge rol-${usuarioItem.rol.toLowerCase()}`}>
                    {usuarioItem.rol}
                  </span>
                </td>
                <td>
                  <span
                    className={`estado ${
                      usuarioItem.estado ? 'activo' : 'inactivo'
                    }`}
                  >
                    {usuarioItem.estado ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="acciones">
                  <button
                    className="btn-restablecer"
                    onClick={() => console.log('Restablecer contraseña')}
                  >
                    Restablecer Contraseña
                  </button>
                  <button
                    className="btn-editar"
                    onClick={() => {
                      setUsuarioEditando(usuarioItem);
                      setFormData(usuarioItem);
                      setShowEditModal(true);
                    }}
                  >
                    Editar
                  </button>
                  <button
                    className="btn-eliminar"
                    onClick={() => eliminarUsuario(usuarioItem.id)}
                    disabled={usuarioItem.id === usuario?.id}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {usuarios.length === 0 && (
          <div className="sin-usuarios">No hay usuarios registrados</div>
        )}
      </section>

      {/* Modal de Edición */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Editar Usuario</h2>
            <div className="modal-content">
              <div className="form-group">
                <label>Nombre:</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Correo:</label>
                <input
                  type="email"
                  value={formData.correo}
                  onChange={(e) =>
                    setFormData({ ...formData, correo: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Rol:</label>
                <select
                  value={formData.rol}
                  onChange={(e) =>
                    setFormData({ ...formData, rol: e.target.value })
                  }
                >
                  <option value="Administrador">Administrador</option>
                  <option value="Vendedor">Vendedor</option>
                  <option value="Almacen">Almacen</option>
                  <option value="Delivery">Delivery</option>
                </select>
              </div>
              <div className="form-group">
                <label>Estado:</label>
                <select
                  value={formData.estado}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estado: e.target.value === 'true',
                    })
                  }
                >
                  <option value={true}>Activo</option>
                  <option value={false}>Inactivo</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-cancelar" onClick={cerrarModalEdicion}>
                Cancelar
              </button>
              <button className="btn-guardar" onClick={guardarCambios}>
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Agregar Usuario */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Agregar Nuevo Usuario</h2>
            <div className="modal-content">
              <div className="form-group">
                <label>Nombre:</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  placeholder="Ingrese el nombre completo"
                />
              </div>
              <div className="form-group">
                <label>Correo:</label>
                <input
                  type="email"
                  value={formData.correo}
                  onChange={(e) =>
                    setFormData({ ...formData, correo: e.target.value })
                  }
                  placeholder="Ingrese el correo electrónico"
                />
              </div>
              <div className="form-group">
                <label>Rol:</label>
                <select
                  value={formData.rol}
                  onChange={(e) =>
                    setFormData({ ...formData, rol: e.target.value })
                  }
                >
                  <option value="Vendedor">Vendedor</option>
                  <option value="Almacen">Almacen</option>
                  <option value="Delivery">Delivery</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-cancelar" onClick={cerrarModalAgregar}>
                Cancelar
              </button>
              <button className="btn-guardar" onClick={agregarUsuario}>
                Agregar Usuario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlUsuarios;