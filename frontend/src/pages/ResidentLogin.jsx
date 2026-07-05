// src/pages/ResidentLogin.js

import { useState, useContext } from 'react';
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

const ResidentLogin = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const result = mode === 'login'
        ? await login(username, password)
        : await register({ username, password, fullName, role: 'USER' });

      if (result.success && result.role === 'USER') {
        navigate('/resident-dashboard');
        onClose();
      } else if (result.success) {
        setError('Access denied. This login is for residents only.');
      } else {
        setError(result.error || (mode === 'login' ? 'Invalid credentials for Resident.' : 'Could not create account.'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">{mode === 'login' ? 'Resident Login' : 'Resident Registration'}</h2>
        <button
          type="button"
          className="text-sm font-bold text-indigo-600 hover:text-indigo-500 transition"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        >
          {mode === 'login' ? 'Create account' : 'Back to login'}
        </button>
      </div>
      {error && <p className="text-red-500 text-center mb-4 font-semibold text-sm">{error}</p>}
      {mode === 'register' && (
        <input
          className="w-full p-3 mb-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 shadow-sm"
          type="text"
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          aria-label="Full Name"
        />
      )}
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
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
      </button>
    </Modal>
  );
};

export default ResidentLogin;
