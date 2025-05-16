// src/Usuarios.jsx
import React, { useEffect, useState } from 'react';
import { getUsuarios } from '../api';

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    getUsuarios()
      .then(data => setUsuarios(data))
      .catch(err => setError(err.message));
  }, []);

  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Usuarios</h1>
      <ul>
        {usuarios.map(usuario => (
          <li key={usuario.id} style={{ marginBottom: '1rem' }}>
            <strong>ID:</strong> {usuario.id}<br />
            <strong>Nombre:</strong> {usuario.nombre} {usuario.apellido} <br />
            <strong>Documento:</strong> {usuario.documento} <br />
            <strong>Email:</strong> {usuario.email} <br />
            <strong>Estado:</strong> {usuario.estado ? 'Activo' : 'Inactivo'} <br />
            <strong>Rol:</strong> {usuario.rol?.nombre || 'Sin rol'}
             <strong>Rol:</strong> {usuario.rol?.nombre || 'con rol'}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Usuarios;
