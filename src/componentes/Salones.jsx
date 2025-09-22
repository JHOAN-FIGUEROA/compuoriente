import React, { useEffect, useState } from 'react';
import { getSalones, crearSalon, editarSalon, eliminarSalon, cambiarEstadoSalon } from '../api';
import Swal from 'sweetalert2';
import { Form, Button, Modal } from 'react-bootstrap';

const Salones = () => {
  const [salones, setSalones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [salonSeleccionado, setSalonSeleccionado] = useState(null);
  const [formData, setFormData] = useState({ nombre: '' });
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const limite = 5;

  const cargarSalones = async (paginaActual = 1) => {
    setLoading(true);
    try {
      const res = await getSalones(paginaActual, limite);
      const data = res.data || res;
      setSalones(data.salones || []);
      setTotalPaginas(data.totalPaginas || 1);
      setPagina(data.paginaActual || paginaActual);
    } catch (error) {
      Swal.fire('Error', 'No se pudieron cargar los salones', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSalones(pagina);
    // eslint-disable-next-line
  }, [pagina]);

  const abrirModalCrear = () => {
    setSalonSeleccionado(null);
    setFormData({ nombre: '' });
    setMostrarModal(true);
  };

  const abrirModalEditar = (salon) => {
    setSalonSeleccionado(salon);
    setFormData({ nombre: salon.nombre });
    setMostrarModal(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      if (!formData.nombre.trim()) {
        Swal.fire('Error', 'El nombre es obligatorio', 'error');
        return;
      }
      if (salonSeleccionado) {
        await editarSalon(salonSeleccionado.id, { nombre: formData.nombre });
        Swal.fire('Actualizado', 'Salón editado correctamente', 'success');
      } else {
        await crearSalon({ nombre: formData.nombre });
        Swal.fire('Creado', 'Salón creado correctamente', 'success');
      }
      setMostrarModal(false);
      cargarSalones();
    } catch (error) {
      Swal.fire('Error', error.message || 'No se pudo guardar el salón', 'error');
    }
  };

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el salón.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (result.isConfirmed) {
      try {
        await eliminarSalon(id);
        Swal.fire('Eliminado', 'Salón eliminado con éxito', 'success');
        cargarSalones();
      } catch (error) {
        Swal.fire('Error', error.message || 'No se pudo eliminar el salón', 'error');
      }
    }
  };

  const handleToggleEstado = async (id) => {
    try {
      await cambiarEstadoSalon(id);
      cargarSalones();
    } catch (error) {
      Swal.fire('Error', error.message || 'No se pudo cambiar el estado', 'error');
    }
  };

  return (
    <div className="institucional-container" style={{ paddingTop: 0, marginTop: 0 }}>
      <div className="container-fluid">
        <div className="row mb-4">
          <div className="col-12 d-flex justify-content-between align-items-center">
            <h2 className="mb-0"><i className="fas fa-door-open me-2"></i>Gestión de Salones</h2>
            <button className="btn btn-primary btn-lg" onClick={abrirModalCrear}>
              <i className="fas fa-plus me-2"></i>Nuevo Salón
            </button>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Nombre</th>
                        <th>Estado</th>
                        <th className="text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="4" className="text-center py-4 text-muted">
                            <i className="fas fa-spinner fa-spin"></i> Cargando...
                          </td>
                        </tr>
                      ) : salones.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center py-4 text-muted">
                            <i className="fas fa-inbox fa-2x mb-2"></i>
                            <p>No se encontraron salones</p>
                          </td>
                        </tr>
                      ) : (
                        salones.map((salon, idx) => (
                          <tr key={salon.id}>
                            <td>{idx + 1}</td>
                            <td>{salon.nombre}</td>
                            <td className="text-center align-middle">
                              <div className="form-check form-switch m-0 d-flex justify-content-center">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={`switch-salon-${salon.id}`}
                                  checked={Boolean(salon.estado)}
                                  onChange={() => handleToggleEstado(salon.id)}
                                />
                                <label className="form-check-label" htmlFor={`switch-salon-${salon.id}`}></label>
                              </div>
                              {salon.estado ? (
                                <span className="badge bg-success ms-2">Activo</span>
                              ) : (
                                <span className="badge bg-secondary ms-2">Inactivo</span>
                              )}
                            </td>
                            <td className="text-center">
                              <div className="btn-group" role="group">
                                <button className="btn btn-sm btn-outline-primary" onClick={() => abrirModalEditar(salon)} title="Editar"><i className="fas fa-pen"></i></button>
                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleEliminar(salon.id)} title="Eliminar"><i className="fas fa-trash"></i></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="row mt-4">
            <div className="col-12">
              <nav aria-label="Navegación de páginas">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${pagina === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setPagina(pagina - 1)}
                      disabled={pagina === 1}
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                  </li>
                  {[...Array(totalPaginas)].map((_, index) => (
                    <li key={index} className={`page-item ${pagina === index + 1 ? 'active' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => setPagina(index + 1)}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${pagina === totalPaginas ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setPagina(pagina + 1)}
                      disabled={pagina === totalPaginas}
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}
        {/* Modal Crear/Editar Salón */}
        <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} centered>
          <div style={{ background: '#0a3871', color: 'white', padding: '1.2rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="d-flex align-items-center">
              <i className="fas fa-door-open fa-lg me-2"></i>
              <span style={{ fontWeight: 700, fontSize: '1.3rem', letterSpacing: '0.5px' }}>{salonSeleccionado ? 'Editar Salón' : 'Nuevo Salón'}</span>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={() => setMostrarModal(false)}></button>
          </div>
          <Form onSubmit={handleGuardar}>
            <Modal.Body style={{ paddingTop: 0 }}>
              <div className="mb-4 mt-3">
                <Form.Label>Nombre del salón</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Nombre del salón"
                  size="lg"
                  autoComplete="off"
                  required
                />
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" size="lg" onClick={() => setMostrarModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" size="lg" type="submit">
                Guardar
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default Salones; 