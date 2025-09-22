import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, solicitarRecuperacion, restablecerContrasena } from '../api';
import { useAuth } from '../contexts/AuthContext';
import '../css/login.css'; // Estilos del formulario
import logo from '../img/LOGO 1.png'; // Importa tu logo
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';

// Utilidad para extraer el mensaje del backend
function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || 'Ocurrió un error';
}

function Login({ setToken }) {
  const [email, setEmail] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Estados para recuperación
  const [showRecuperar, setShowRecuperar] = useState(false);
  const [showRestablecer, setShowRestablecer] = useState(false);
  const [recEmail, setRecEmail] = useState('');
  const [recLoading, setRecLoading] = useState(false);
  const [recMessage, setRecMessage] = useState('');
  const [recError, setRecError] = useState('');

  // Restablecer
  const [tokenRec, setTokenRec] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [verNewPass, setVerNewPass] = useState(false);
  const [restLoading, setRestLoading] = useState(false);
  const [restMessage, setRestMessage] = useState('');
  const [restError, setRestError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser({ email, contraseña });
      const userData = response.data;
      
      // Usar el método login del contexto
      login(userData.token, userData);
      setToken(userData.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Credenciales inválidas');
    }
  };

  // Agregar funciones de validación
  const validarPassword = (pass) => {
    const minLength = /.{8,}/;
    const mayus = /[A-Z]/;
    const minus = /[a-z]/;
    const numero = /[0-9]/;
    const especial = /[^A-Za-z0-9]/;
    return minLength.test(pass) && mayus.test(pass) && minus.test(pass) && numero.test(pass) && especial.test(pass);
  };
  const passwordValida = validarPassword(newPass);
  const coinciden = newPass === confirmPass && newPass.length > 0;
  const codigoPresente = tokenRec.trim().length > 0;

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <img src={logo} alt="Logo" className="login-logo" />
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type={verPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              required
              style={{ paddingRight: '2.5rem' }}
            />
            <span
              onClick={() => setVerPassword(v => !v)}
              style={{
                position: 'absolute',
                right: '0.8rem',
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                color: '#00b4d8',
                fontSize: '1.2rem',
                zIndex: 2
              }}
              title={verPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            >
              {verPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <button type="submit">Iniciar sesión</button>
        </form>
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <span
            style={{ color: '#0a3871', cursor: 'pointer', textDecoration: 'underline', fontWeight: 500 }}
            onClick={() => { setShowRecuperar(true); setRecEmail(''); setRecMessage(''); setRecError(''); }}
          >
            ¿Olvidaste tu contraseña?
          </span>
        </div>
        {error && <p className="error-message">{error}</p>}
      </div>

      {/* Modal 1: Solicitar código de recuperación */}
      <Modal show={showRecuperar} onHide={() => setShowRecuperar(false)} centered>
        <Modal.Header closeButton style={{ background: '#0a3871', color: 'white' }}>
          <Modal.Title>Recuperar contraseña</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={async (e) => {
            e.preventDefault();
            setRecLoading(true);
            setRecMessage('');
            setRecError('');
            try {
              await solicitarRecuperacion(recEmail);
              setRecMessage('Código enviado a tu correo. Revisa tu bandeja de entrada y spam.');
              setTimeout(() => {
                setShowRecuperar(false);
                setShowRestablecer(true);
              }, 1200);
            } catch (err) {
              setRecError(err.message);
            } finally {
              setRecLoading(false);
            }
          }}>
            <Form.Group className="mb-3">
              <Form.Label>Correo electrónico</Form.Label>
              <Form.Control
                type="email"
                value={recEmail}
                onChange={e => setRecEmail(e.target.value)}
                required
                autoFocus
                placeholder="Ingresa tu correo registrado"
              />
            </Form.Group>
            {recMessage && <div className="alert alert-success">{recMessage}</div>}
            {recError && <div className="alert alert-danger">{recError}</div>}
            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={() => setShowRecuperar(false)} style={{ marginRight: 8 }}>Cancelar</Button>
              <Button variant="primary" type="submit" disabled={recLoading}>
                {recLoading ? <Spinner size="sm" animation="border" /> : 'Solicitar código'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal 2: Restablecer contraseña */}
      <Modal show={showRestablecer} onHide={() => setShowRestablecer(false)} centered>
        <Modal.Header closeButton style={{ background: '#0a3871', color: 'white' }}>
          <Modal.Title>Restablecer contraseña</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={async (e) => {
            e.preventDefault();
            setRestLoading(true);
            setRestMessage('');
            setRestError('');
            if (newPass !== confirmPass) {
              setRestError('Las contraseñas no coinciden');
              setRestLoading(false);
              return;
            }
            try {
              await restablecerContrasena({ email: recEmail, token: tokenRec, nuevaContrasena: newPass });
              setRestMessage('¡Contraseña restablecida con éxito! Ahora puedes iniciar sesión.');
              setTimeout(() => {
                setShowRestablecer(false);
              }, 1500);
            } catch (err) {
              setRestError(err.message);
            } finally {
              setRestLoading(false);
            }
          }}>
            <Form.Group className="mb-3">
              <Form.Label>Correo electrónico</Form.Label>
              <Form.Control type="email" value={recEmail} readOnly />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Código De Recuperación</Form.Label>
              <Form.Control
                type="text"
                value={tokenRec}
                onChange={e => {
                  // Solo permitir hasta 4 dígitos numéricos
                  const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setTokenRec(val);
                }}
                required
                placeholder="Código enviado a tu correo"
                isInvalid={(tokenRec.length > 0 && tokenRec.length !== 4) || (tokenRec.length === 0 && confirmPass.length > 0)}
                maxLength={4}
                inputMode="numeric"
              />
              {tokenRec.length > 0 && tokenRec.length !== 4 && (
                <div className="text-danger mt-1" style={{ fontSize: '0.95em' }}>
                  El código debe tener exactamente 4 dígitos.
                </div>
              )}
              {tokenRec.length === 0 && confirmPass.length > 0 && (
                <div className="text-danger mt-1" style={{ fontSize: '0.95em' }}>
                  Debes ingresar el código recibido.
                </div>
              )}
            </Form.Group>
            <Form.Group className="mb-3" style={{ position: 'relative' }}>
              <Form.Label>Nueva contraseña</Form.Label>
              <Form.Control
                type={verNewPass ? 'text' : 'password'}
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                required
                placeholder="Nueva contraseña"
                style={{ paddingRight: '2.5rem' }}
              />
              <span
                onClick={() => setVerNewPass(v => !v)}
                style={{
                  position: 'absolute',
                  right: '0.3rem',
                  top: '50%',
                  bottom: 'unset',
                  margin: 'unset',
                  height: 'auto',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  color: '#0a3871',
                  fontSize: '1rem',
                  zIndex: 2
                }}
                title={verNewPass ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {verNewPass ? <FaEyeSlash /> : <FaEye />}
              </span>
            </Form.Group>
            {newPass.length > 0 && !passwordValida && (
              <div className="text-danger mt-1" style={{ fontSize: '0.95em' }}>
                La contraseña debe tener mínimo 8 caracteres, incluir mayúscula, minúscula, número y un carácter especial.
              </div>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Confirmar nueva contraseña</Form.Label>
              <Form.Control
                type={verNewPass ? 'text' : 'password'}
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
                required
                placeholder="Confirma la nueva contraseña"
                isInvalid={confirmPass.length > 0 && !coinciden}
              />
              {confirmPass.length > 0 && !coinciden && (
                <div className="text-danger mt-1" style={{ fontSize: '0.95em' }}>
                  Las contraseñas no coinciden.
                </div>
              )}
            </Form.Group>
            {restMessage && <div className="alert alert-success">{restMessage}</div>}
            {restError && <div className="alert alert-danger">{restError}</div>}
            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={() => setShowRestablecer(false)} style={{ marginRight: 8 }}>Cancelar</Button>
              <Button variant="primary" type="submit" disabled={restLoading || !passwordValida || !coinciden || tokenRec.length !== 4}>
                {restLoading ? <Spinner size="sm" animation="border" /> : 'Restablecer'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Login;
