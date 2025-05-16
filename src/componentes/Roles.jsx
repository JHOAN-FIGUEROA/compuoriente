import React, { useEffect, useState } from 'react';
import {
  obtenerRoles,
  buscarRoles,
  eliminarRol,
  cambiarEstadoRol,
  obtenerDetalleRol,
  crearRol,
  editarRol,
  obtenerPermisos
} from '../api';
import Swal from 'sweetalert2';
import { Form, Button, Modal, Badge } from 'react-bootstrap';
import '../css/Roles.css';

const RolesList = () => {
  const [roles, setRoles] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Modal
  const [mostrarModal, setMostrarModal] = useState(false);
  const [rolSeleccionado, setRolSeleccionado] = useState(null);
  const [nombreRol, setNombreRol] = useState('');
  const [permisosDisponibles, setPermisosDisponibles] = useState([]);
  const [permisosSeleccionados, setPermisosSeleccionados] = useState([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const cargarRoles = async () => {
    try {
      setLoading(true);
      const data = busqueda
        ? await buscarRoles(busqueda, pagina)
        : await obtenerRoles(pagina);

      setRoles(data.roles);
      setTotal(data.total);
      setTotalPaginas(data.totalPaginas);
    } catch (error) {
      console.error('Error al cargar roles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarRoles();
  }, [pagina, busqueda]);

  useEffect(() => {
    async function cargarPermisos() {
      try {
        const permisosAPI = await obtenerPermisos();
        const permisosValidos = (permisosAPI.permisos || permisosAPI)
          .filter(permiso => permiso && permiso.id);
        setPermisosDisponibles(permisosValidos);
      } catch (error) {
        console.error('Error al cargar permisos:', error);
      }
    }
    cargarPermisos();
  }, []);

  const handleBuscar = (e) => {
    e.preventDefault();
    setPagina(1);
    cargarRoles();
  };

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el rol.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await eliminarRol(id);
        Swal.fire('Eliminado', 'Rol eliminado con éxito', 'success');
        cargarRoles();
      } catch (error) {
        Swal.fire('Error', error.message || 'No se pudo eliminar el rol', 'error');
      }
    }
  };

  const handleToggleEstado = async (id, estadoActual) => {
    try {
      await cambiarEstadoRol(id, !estadoActual);
      cargarRoles();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  const handleVerDetalle = async (id) => {
    try {
      const detalle = await obtenerDetalleRol(id);
      console.log(detalle);

      Swal.fire({
        title: `Detalle del Rol: ${detalle.nombre}`,
        html: `
          <p><strong>ID:</strong> ${detalle.id}</p>
          <p><strong>Permisos:</strong></p>
          <ul>
            ${
              detalle.permisos && detalle.permisos.length > 0
                ? detalle.permisos
                    .filter(p => p !== null)
                    .map((p) => `<li>${p.nombre}</li>`)
                    .join('')
                : '<li>No hay permisos asignados</li>'
            }
          </ul>
        `,
        confirmButtonText: 'Cerrar',
      });
    } catch (error) {
      console.error('Error al obtener detalle rol:', error);
      Swal.fire('Error', 'No se pudo obtener el detalle del rol', 'error');
    }
  };

  const handleAgregarPermiso = (e) => {
    const permisoId = parseInt(e.target.value);
    console.log('Intentando agregar permiso:', permisoId);
    
    if (!permisoId || isNaN(permisoId)) {
      console.log('Permiso inválido, no se agregará');
      return;
    }
    
    setPermisosSeleccionados(prev => {
      if (prev.includes(permisoId)) {
        console.log('Permiso ya existe, no se agregará');
        return prev;
      }
      const nuevosPermisos = [...prev, permisoId];
      console.log('Nuevos permisos después de agregar:', nuevosPermisos);
      return nuevosPermisos;
    });
    e.target.value = ''; // Limpiar selección para poder elegir otro
  };

  const handleQuitarPermiso = (id) => {
    if (!id || isNaN(id)) return;
    
    setPermisosSeleccionados(prev => {
      const nuevosPermisos = prev.filter(pid => pid !== id);
      console.log('Permisos después de quitar:', nuevosPermisos);
      return nuevosPermisos;
    });
  };

  const abrirModalCrear = () => {
    setRolSeleccionado(null);
    setNombreRol('');
    setPermisosSeleccionados([]);
    setMostrarModal(true);
  };

  const abrirModalEditar = async (rol) => {
    try {
      const detalle = await obtenerDetalleRol(rol.id);
      console.log('Detalle completo del rol:', JSON.stringify(detalle, null, 2));
      setRolSeleccionado(rol);
      setNombreRol(rol.nombre);
      
      // Inicializar con array vacío
      setPermisosSeleccionados([]);
      
      // Si hay permisos válidos, procesarlos
      if (detalle.permisos && Array.isArray(detalle.permisos)) {
        console.log('Permisos recibidos:', detalle.permisos);
        
        // Filtrar los permisos nulos y extraer solo los IDs válidos
        const permisosValidos = detalle.permisos
          .filter(p => {
            console.log('Procesando permiso:', p);
            return p !== null && p !== undefined && typeof p === 'object' && p.id;
          })
          .map(p => {
            console.log('Mapeando permiso:', p);
            return Number(p.id);
          });
        
        console.log('Permisos válidos encontrados:', permisosValidos);
        setPermisosSeleccionados(permisosValidos);
      }
      
      setMostrarModal(true);
    } catch (error) {
      console.error('Error al cargar detalle del rol:', error);
      Swal.fire('Error', 'No se pudo cargar el detalle del rol', 'error');
    }
  };

  const handleGuardar = async () => {
    try {
      // Validar y limpiar los permisos
      const permisosValidos = permisosSeleccionados
        .filter(id => {
          console.log('Validando permiso:', id);
          return id !== null && id !== undefined && !isNaN(id);
        })
        .map(id => {
          console.log('Convirtiendo permiso:', id);
          return Number(id);
        });
      
      console.log('Permisos finales a guardar:', permisosValidos);
      
      if (permisosValidos.length === 0) {
        Swal.fire('Error', 'Debe seleccionar al menos un permiso', 'error');
        return;
      }
      
      if (rolSeleccionado) {
        // Para editar, enviamos permisos (como espera el backend)
        const datosEdicion = {
          nombre: nombreRol,
          permisos: permisosValidos
        };
        console.log('Datos completos para edición:', JSON.stringify(datosEdicion, null, 2));
        await editarRol(rolSeleccionado.id, datosEdicion);
        Swal.fire('Actualizado', 'Rol editado correctamente', 'success');
      } else {
        // Para crear, enviamos permisos_ids (como espera el backend)
        const datosCreacion = {
          nombre: nombreRol,
          permisos_ids: permisosValidos
        };
        console.log('Datos completos para creación:', JSON.stringify(datosCreacion, null, 2));
        await crearRol(datosCreacion);
        Swal.fire('Creado', 'Rol creado correctamente', 'success');
      }

      setMostrarModal(false);
      cargarRoles();
    } catch (error) {
      console.error('Error al guardar:', error);
      Swal.fire('Error', error.message || 'Error al guardar el rol', 'error');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Lista de Roles</h2>

      <form className="mb-3 d-flex" onSubmit={handleBuscar}>
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="form-control me-2"
        />
        <button className="btn btn-primary" type="submit">
          Buscar
        </button>
      </form>

      <div className="mb-3">
        <button className="btn btn-success" onClick={abrirModalCrear}>
          + Crear nuevo rol
        </button>
      </div>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="4">Cargando...</td>
            </tr>
          ) : roles.length === 0 ? (
            <tr>
              <td colSpan="4">No se encontraron roles</td>
            </tr>
          ) : (
            roles.map((rol) => (
              <tr key={rol.id}>
                <td>{rol.id}</td>
                <td>{rol.nombre}</td>
                <td>
                  <Form.Check
                    type="switch"
                    id={`switch-${rol.id}`}
                    checked={Boolean(rol.estado)}
                    onChange={() => handleToggleEstado(rol.id, rol.estado)}
                  />
                </td>
                <td>
                  <button
                    className="btn btn-info btn-sm me-2"
                    onClick={() => handleVerDetalle(rol.id)}
                  >
                    Ver detalle
                  </button>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => abrirModalEditar(rol)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleEliminar(rol.id)}
                  >
                    Eliminar
                  </button>
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
            onClick={() => setPagina((p) => Math.max(p - 1, 1))}
            disabled={pagina === 1}
          >
            Anterior
          </button>
          <span>Página {pagina} de {totalPaginas}</span>
          <button
            className="btn btn-outline-secondary ms-2"
            onClick={() => setPagina((p) => Math.min(p + 1, totalPaginas))}
            disabled={pagina === totalPaginas}
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* Modal Crear/Editar */}
      <Modal show={mostrarModal} onHide={() => setMostrarModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{rolSeleccionado ? 'Editar Rol' : 'Crear Rol'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingDetalle ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-2">Cargando permisos...</p>
            </div>
          ) : (
            <Form>
              <Form.Group controlId="nombreRol">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  value={nombreRol}
                  onChange={(e) => setNombreRol(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId="selectPermiso" className="mt-3">
                <Form.Label>Agregar Permiso</Form.Label>
                <Form.Control
                  as="select"
                  onChange={handleAgregarPermiso}
                  defaultValue=""
                >
                  <option value="" disabled>-- Seleccione un permiso --</option>
                  {permisosDisponibles
                    .filter(permiso => !permisosSeleccionados.includes(permiso.id))
                    .map(permiso => (
                      <option key={permiso.id} value={permiso.id}>
                        {permiso.nombre}
                      </option>
                    ))
                  }
                </Form.Control>
              </Form.Group>

              {/* Mostrar permisos seleccionados como badges con opción para quitar */}
              <div className="mt-3">
                {permisosSeleccionados.length === 0 && <p>No hay permisos agregados.</p>}
                {permisosSeleccionados.map(id => {
                  const permiso = permisosDisponibles.find(p => p.id === id);
                  if (!permiso) return null;
                  return (
                    <Badge
                      key={id}
                      pill
                      bg="primary"
                      className="me-2"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleQuitarPermiso(id)}
                      title="Click para quitar permiso"
                    >
                      {permiso.nombre} &times;
                    </Badge>
                  );
                })}
              </div>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setMostrarModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleGuardar}
            disabled={loadingDetalle}
          >
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RolesList;
