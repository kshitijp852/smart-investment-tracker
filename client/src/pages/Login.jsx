
import React, { useState } from 'react';
import axios from 'axios';

export default function Login(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5001/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userName', res.data.user.name);
      alert('✅ Login successful!');
      window.location.reload();
    } catch(err) { 
      console.error(err); 
      alert('❌ Login failed. Please check your credentials.'); 
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back! 👋</h2>
        <p className="auth-subtitle">Login to access your investment portfolio</p>
        
        <form className="auth-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              className="form-input"
              type="email"
              placeholder="your@email.com" 
              value={email} 
              onChange={e=>setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              className="form-input"
              type="password"
              placeholder="Enter your password" 
              value={password} 
              onChange={e=>setPassword(e.target.value)}
              required
            />
          </div>

          <button className="form-submit" type="submit" disabled={loading}>
            {loading ? '🔄 Logging in...' : '🔐 Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
