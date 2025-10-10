// ControlUsuarios.jsx
import React, { useState, useEffect } from 'react';
import { useUser } from './UserContext';
import './ControlUsuarios.css';

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
    estado: true
  });

  // Verificar permisos de administrador
  useEffect(() => {
    if (usuario?.rol !== 'Administrador') {
      window.location.href = '/dashboard';
      return;
    }
    cargarUsuarios();
  }, [usuario]);

  // Simular carga de usuarios desde API
  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      // En producción, esto sería una llamada a tu API
      const usuariosMock = [
        { 
          id: 1, 
          nombre: 'Juan Pérez', 
          correo: 'juan@novedadeswow.com', 
          rol: 'Administrador', 
          estado: true 
        },
        { 
          id: 2, 
          nombre: 'María García', 
          correo: 'maria@novedadeswow.com', 
          rol: 'Vendedor', 
          estado: true 
        },
        { 
          id: 3, 
          nombre: 'Carlos López', 
          correo: 'carlos@novedadeswow.com', 
          rol: 'Almacen', 
          estado: false 
        },
        { 
          id: 4, 
          nombre: 'Ana Martínez', 
          correo: 'ana@novedadeswow.com', 
          rol: 'Delivery', 
          estado: true 
        },
      ];
      setUsuarios(usuariosMock);
    } catch (error) {
      setError('Error al cargar los usuarios');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal de edición
  const abrirModalEdicion = (usuario) => {
    setUsuarioEditando(usuario);
    setFormData({
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      estado: usuario.estado
    });
    setShowEditModal(true);
  };

  // Guardar cambios
  const guardarCambios = async () => {
    try {
      const usuariosActualizados = usuarios.map(user =>
        user.id === usuarioEditando.id
          ? { ...user, ...formData }
          : user
      );
      setUsuarios(usuariosActualizados);
      setShowEditModal(false);
      setUsuarioEditando(null);
    } catch (error) {
      setError('Error al actualizar el usuario');
    }
  };

  // Agregar nuevo usuario
  const agregarUsuario = async () => {
    try {
      if (!formData.nombre || !formData.correo) {
        setError('Nombre y correo son obligatorios');
        return;
      }

      const nuevoUsuario = {
        ...formData,
        id: Math.max(...usuarios.map(u => u.id), 0) + 1
      };
      
      setUsuarios([...usuarios, nuevoUsuario]);
      setShowAddModal(false);
      setFormData({
        nombre: '',
        correo: '',
        rol: 'Vendedor',
        estado: true
      });
      setError('');
    } catch (error) {
      setError('Error al agregar el usuario');
    }
  };

  // Eliminar usuario
  const eliminarUsuario = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        const usuariosFiltrados = usuarios.filter(user => user.id !== id);
        setUsuarios(usuariosFiltrados);
      } catch (error) {
        setError('Error al eliminar el usuario');
      }
    }
  };

  // Si no es administrador
  if (usuario?.rol !== 'Administrador') {
    return (
      <div className="control-usuarios-container">
        <div className="acceso-denegado">
          <h2>Acceso Denegado</h2>
          <p>No tienes permisos para acceder a esta sección</p>
        </div>
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
      <div className="control-usuarios-header">
        <h1>Control de Usuarios</h1>
        <button 
          className="btn-agregar"
          onClick={() => setShowAddModal(true)}
        >
          + Agregar Usuario
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <div className="tabla-usuarios-container">
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
            {usuarios.map(usuarioItem => (
              <tr key={usuarioItem.id}>
                <td>{usuarioItem.nombre}</td>
                <td>{usuarioItem.correo}</td>
                <td>
                  <span className={`badge rol-${usuarioItem.rol.toLowerCase()}`}>
                    {usuarioItem.rol}
                  </span>
                </td>
                <td>
                  <span className={`estado ${usuarioItem.estado ? 'activo' : 'inactivo'}`}>
                    {usuarioItem.estado ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="acciones">
                  <button
                    className="btn-restablecer"
                    onclick={() => restablcerContraseña(usuarioItem.correo)}
                  >
                    Restablecer Contraseña
                  </button>  
                  <button 
                    className="btn-editar"
                    onClick={() => abrirModalEdicion(usuarioItem)}
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
          <div className="sin-usuarios">
            No hay usuarios registrados
          </div>
        )}
      </div>

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
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Correo:</label>
                <input 
                  type="email" 
                  value={formData.correo}
                  onChange={(e) => setFormData({...formData, correo: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Rol:</label>
                <select 
                  value={formData.rol}
                  onChange={(e) => setFormData({...formData, rol: e.target.value})}
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
                  onChange={(e) => setFormData({...formData, estado: e.target.value === 'true'})}
                >
                  <option value={true}>Activo</option>
                  <option value={false}>Inactivo</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-cancelar" onClick={() => setShowEditModal(false)}>
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
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  placeholder="Ingrese el nombre completo"
                />
              </div>
              <div className="form-group">
                <label>Correo:</label>
                <input 
                  type="email" 
                  value={formData.correo}
                  onChange={(e) => setFormData({...formData, correo: e.target.value})}
                  placeholder="Ingrese el correo electrónico"
                />
              </div>
              <div className="form-group">
                <label>Rol:</label>
                <select 
                  value={formData.rol}
                  onChange={(e) => setFormData({...formData, rol: e.target.value})}
                >
                  <option value="Vendedor">Vendedor</option>
                  <option value="Almacen">Almacen</option>
                  <option value="Delivery">Delivery</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-cancelar" onClick={() => setShowAddModal(false)}>
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