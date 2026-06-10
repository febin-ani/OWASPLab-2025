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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
      <div className="glass-card" style={{ width: '400px' }}>
        <h2 style={{ textAlign: 'center', margin: '0 0 10px 0', color: 'var(--red-500)' }}>🔴 OWASPLab</h2>
        <h4 style={{ textAlign: 'center', margin: '0 0 30px 0', fontWeight: 'normal' }}>Web App Security Platform</h4>

        {error && <div style={{ color: '#ffaaaa', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <input
            type="text"
            className="glass-input"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            className="glass-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <select
            className="glass-input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ appearance: 'none' }}
          >
            <option value="Student" style={{ color: 'black' }}>Student</option>
            <option value="Trainer" style={{ color: 'black' }}>Trainer</option>
            <option value="Admin" style={{ color: 'black' }}>Admin</option>
          </select>

          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
            Sign In ────────
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
