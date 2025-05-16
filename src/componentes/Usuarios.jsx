import React, { useEffect, useState } from 'react';
import {
  getUsuarios,
  obtenerRoles,
  crearUsuario,
  editarUsuario,
  eliminarUsuario,
  obtenerDetalleUsuario,
  cambiarEstadoUsuario,

  
} from '../api';
import Swal from 'sweetalert2';
import { Form, Button, Modal } from 'react-bootstrap';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    documento: '',
    email: '',
    estado: true,
    rol_id: '',
  });
  const [rolesDisponibles, setRolesDisponibles] = useState([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const data = await getUsuarios(pagina);
      setUsuarios(data.usuarios);
      setTotal(data.total);
      setTotalPaginas(data.totalPaginas);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      Swal.fire('Error', 'No se pudo cargar la lista de usuarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, [pagina]);

  useEffect(() => {
    async function cargarRoles() {
      try {
        const rolesAPI = await obtenerRoles();
        const rolesValidos = rolesAPI.roles || rolesAPI;
        setRolesDisponibles(rolesValidos);
      } catch (error) {
        console.error('Error al cargar roles:', error);
      }
    }
    cargarRoles();
  }, []);

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el usuario.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await eliminarUsuario(id);
        Swal.fire('Eliminado', 'Usuario eliminado con éxito', 'success');
        cargarUsuarios();
      } catch (error) {
        Swal.fire('Error', error.message || 'No se pudo eliminar el usuario', 'error');
      }
    }
  };

  const handleToggleEstado = async (id, estadoActual) => {
    try {
      await cambiarEstadoUsuario(id, !estadoActual);
      cargarUsuarios();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  const handleVerDetalle = async (id) => {
    try {
      const detalle = await obtenerDetalleUsuario(id);
      const rolNombre = detalle.rol?.nombre || 'Sin rol';

      Swal.fire({
        title: `Detalle del Usuario: ${detalle.nombre} ${detalle.apellido}`,
        html: `
          <p><strong>ID:</strong> ${detalle.id}</p>
          <p><strong>Documento:</strong> ${detalle.documento}</p>
          <p><strong>Email:</strong> ${detalle.email}</p>
          <p><strong>Estado:</strong> ${detalle.estado ? 'Activo' : 'Inactivo'}</p>
          <p><strong>Rol:</strong> ${rolNombre}</p>
        `,
        confirmButtonText: 'Cerrar',
      });
    } catch (error) {
      console.error('Error al obtener detalle usuario:', error);
      Swal.fire('Error', 'No se pudo obtener el detalle del usuario', 'error');
    }
  };

  const abrirModalCrear = () => {
    setUsuarioSeleccionado(null);
    setFormData({
      nombre: '',
      apellido: '',
      documento: '',
      email: '',
      contraseña: '',
      rol_id: '',
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = async (usuario) => {
    try {
      setLoadingDetalle(true);
      const detalle = await obtenerDetalleUsuario(usuario.id);

      setUsuarioSeleccionado(usuario);
      setFormData({
        nombre: detalle.nombre || '',
        apellido: detalle.apellido || '',
        documento: detalle.documento || '',
        email: detalle.email || '',
        contraseña: '',
        rol_id: detalle.rol?.id || '',
      });
      setMostrarModal(true);
    } catch (error) {
      console.error('Error al cargar detalle del usuario:', error);
      Swal.fire('Error', 'No se pudo cargar el detalle del usuario', 'error');
    } finally {
      setLoadingDetalle(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

const handleGuardar = async () => {
  try {
    if (!usuarioSeleccionado) {
      // Crear usuario: campos obligatorios
      if (!formData.nombre || !formData.apellido || !formData.documento || !formData.email || !formData.rol_id) {
        Swal.fire('Error', 'Por favor completa todos los campos requeridos', 'error');
        return;
      }
      if (!formData.contraseña) {
        Swal.fire('Error', 'La contraseña es obligatoria para crear un usuario', 'error');
        return;
      }
    } else {
      // Editar usuario: no validar campos obligatorios
      // Opcional: validar campos mínimos si quieres
    }

    if (usuarioSeleccionado) {
      await editarUsuario(usuarioSeleccionado.id, formData);
      Swal.fire('Actualizado', 'Usuario editado correctamente', 'success');
    } else {
      await crearUsuario(formData);
      Swal.fire('Creado', 'Usuario creado correctamente', 'success');
    }

    setMostrarModal(false);
    cargarUsuarios();
  } catch (error) {
    console.error('Error al guardar usuario:', error);
    Swal.fire('Error', error.message || 'Error al guardar el usuario', 'error');
  }
};


  return (
    <div className="container mt-4">
      <h2>Lista de Usuarios</h2>

      <div className="mb-3">
        <button className="btn btn-success" onClick={abrirModalCrear}>
          + Crear nuevo usuario
        </button>
      </div>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>#</th> 
            <th>Documento</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="8" className="text-center">Cargando...</td>
            </tr>
          ) : (!usuarios || usuarios.length === 0) ? (
            <tr>
              <td colSpan="8" className="text-center">No se encontraron usuarios</td>
            </tr>
          ) : (
            usuarios.map((usuario, index) => (
              <tr key={usuario.id}>
                <td>{(pagina - 1) * 10 + index + 1}</td>
              <td>{usuario.documento}</td> 
               <td>{usuario.nombre}</td>
                <td>{usuario.apellido}</td>
                <td>{usuario.rol?.nombre || 'Sin rol'}</td>
                <td>
                  <Form.Check
                    type="switch"
                    id={`switch-usuario-${usuario.id}`}
                    checked={Boolean(usuario.estado)}
                    onChange={() => handleToggleEstado(usuario.id, usuario.estado)}
                  />
                </td>
                <td>
  <button className="btn btn-info btn-sm me-2" onClick={() => handleVerDetalle(usuario.id)}>Ver detalle</button>
  <button className="btn btn-warning btn-sm me-2" onClick={() => abrirModalEditar(usuario)}>Editar</button>
  {usuario.rol?.id !== 1 && (
    <button className="btn btn-danger btn-sm" onClick={() => handleEliminar(usuario.id)}>Eliminar</button>
  )}
</td>

              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="d-flex justify-content-between align-items-center">
        <span>Total: {total}</span>
        <div>
          <button
            className="btn btn-outline-secondary me-2"
            onClick={() => setPagina(p => Math.max(p - 1, 1))}
            disabled={pagina === 1}
          >
            Anterior
          </button>
          <span>Página {pagina} de {totalPaginas}</span>
          <button
            className="btn btn-outline-secondary ms-2"
            onClick={() => setPagina(p => Math.min(p + 1, totalPaginas))}
            disabled={pagina === totalPaginas}
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* Modal Crear/Editar Usuario */}
      <Modal show={mostrarModal} onHide={() => setMostrarModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{usuarioSeleccionado ? 'Editar Usuario' : 'Crear Usuario'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingDetalle ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-2">Cargando datos...</p>
            </div>
          ) : (
            <Form>
              <Form.Group className="mb-3" controlId="nombre">
                <Form.Label>Nombre</Form.Label>
                <Form.Control type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre" />
              </Form.Group>

              <Form.Group className="mb-3" controlId="apellido">
                <Form.Label>Apellido</Form.Label>
                <Form.Control type="text" name="apellido" value={formData.apellido} onChange={handleChange} placeholder="Apellido" />
              </Form.Group>

              <Form.Group className="mb-3" controlId="documento">
                <Form.Label>Documento</Form.Label>
                <Form.Control
                  type="text"
                  name="documento"
                  value={formData.documento}
                  onChange={handleChange}
                  placeholder="Documento"
                  disabled={!!usuarioSeleccionado}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" />
              </Form.Group>

              <Form.Group className="mb-3" controlId="contraseña">
  <Form.Label>Contraseña</Form.Label>
  <Form.Control
    type="password"
    name="contraseña"
    value={formData.contraseña}
    onChange={handleChange}
    placeholder="Contraseña"
  />
</Form.Group>

              <Form.Group className="mb-3" controlId="rol_id">
                <Form.Label>Rol</Form.Label>
                <Form.Select name="rol_id" value={formData.rol_id} onChange={handleChange}>
                  <option value="">Seleccione un rol</option>
                  {rolesDisponibles.map((rol) => (
                    <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setMostrarModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleGuardar}>Guardar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Usuarios;
