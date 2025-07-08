import { useState, useEffect } from 'react';
import { getProgramas } from '../api';

export const useProgramas = () => {
  const [programas, setProgramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarProgramas();
  }, []);

  const cargarProgramas = async () => {
    try {
      setLoading(true);
      const response = await getProgramas(1, 100); // Cargar todos los programas
      if (response.ok) {
        setProgramas(response.data.programas || response.data);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error al cargar programas:', err);
    } finally {
      setLoading(false);
    }
  };

  const recargarProgramas = () => {
    cargarProgramas();
  };

  return {
    programas,
    loading,
    error,
    recargarProgramas
  };
}; 