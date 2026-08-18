import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import servicioLogin from '../services/login';
import './LoginForm.css';

const LoginForm = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    usuario: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.usuario.trim() || !form.password.trim()) {
      alert('Complete usuario y contraseña');
      return;
    }

    try {
      setLoading(true);

      const response = await servicioLogin.login({
        usuario: form.usuario.trim(),
        password: form.password,
      });

      const user = {
        id: response.id || response.id_usuario || null,
        token: response.token || '',
        nombre: response.nombre || '',
        usuario: response.usuario || form.usuario,
        nivel: response.nivel,
      };

      localStorage.setItem(
        'loggedNoteAppUser',
        JSON.stringify(user)
      );

      // Verificar nivel del usuario
      const nivel = Number(response.nivel);

      if (nivel === 11) {
        navigate('/admintorneos', { replace: true });
      } else {
        alert('No tenés permisos para acceder al 3 x 3');
      }

    } catch (error) {
      console.error(error);
      alert('Usuario o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">

        <h1 className="login-title">
          Administradores del 3 x 3
        </h1>

        <p className="login-subtitle">
          Ingresá con tu usuario y contraseña
        </p>

        <form onSubmit={handleSubmit}>

          <div className="login-field">
            <span className="login-icon">👤</span>

            <input
              type="text"
              name="usuario"
              placeholder="Usuario"
              value={form.usuario}
              onChange={handleChange}
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="login-field">
            <span className="login-icon">🔒</span>

            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={form.password}
              onChange={handleChange}
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <span className="login-loading">
                <span className="spinner"></span>
                Ingresando...
              </span>
            ) : (
              'Ingresar'
            )}
          </button>

        </form>

      </div>
    </div>
  );
};

export default LoginForm;