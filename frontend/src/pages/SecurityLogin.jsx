// src/pages/SecurityLogin.js

import { useState, useContext } from 'react';
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

const SecurityLogin = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await login(username, password);
      if (result.success && result.role === 'ADMIN') {
        navigate('/security-dashboard');
        onClose();
      } else if (result.success) {
        setError('Access denied. This login is for security personnel only.');
      } else {
        setError(result.error || 'Invalid credentials for Security.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-2xl font-bold text-center text-slate-900 mb-6">Security Login</h2>
      {error && <p className="text-red-500 text-center mb-4 font-semibold text-sm">{error}</p>}
      <input
        className="w-full p-3 mb-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 shadow-sm"
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        aria-label="Username"
      />
      <input
        className="w-full p-3 mb-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 shadow-sm"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        aria-label="Password"
      />
      <button
        className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-500 transition shadow-md shadow-indigo-600/10 font-bold disabled:opacity-50 active:scale-95"
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </Modal>
  );
};

export default SecurityLogin;
