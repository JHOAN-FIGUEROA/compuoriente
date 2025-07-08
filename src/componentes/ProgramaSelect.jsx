import React from 'react';
import { useProgramas } from '../hooks/useProgramas';

const ProgramaSelect = ({ 
  value, 
  onChange, 
  required = false, 
  placeholder = "Seleccionar programa...",
  className = "form-select",
  disabled = false,
  showLoading = true
}) => {
  const { programas, loading, error } = useProgramas();

  if (loading && showLoading) {
    return (
      <select className={className} disabled>
        <option>Cargando programas...</option>
      </select>
    );
  }

  if (error) {
    return (
      <select className={className} disabled>
        <option>Error al cargar programas</option>
      </select>
    );
  }

  return (
    <select
      className={className}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
    >
      <option value="">{placeholder}</option>
      {programas.map((programa) => (
        <option key={programa.id} value={programa.id}>
          {programa.nombre}
        </option>
      ))}
    </select>
  );
};

export default ProgramaSelect; 