import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ setAuthUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        setAuthUser(data.user);
        navigate('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h1 className="login-logo">OWASPLab</h1>
        <p className="login-subtitle">Web Application Security Platform</p>

        {error && (
          <div style={{ 
            color: 'var(--rose-500)', 
            backgroundColor: 'rgba(244, 63, 94, 0.1)', 
            border: '1px solid rgba(244, 63, 94, 0.2)', 
            padding: '10px', 
            borderRadius: '6px', 
            marginBottom: '1.5rem',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <input
            type="text"
            className="form-input"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            className="form-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div style={{ position: 'relative' }}>
            <select
              className="form-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="Student">Student</option>
              <option value="Trainer">Trainer</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
