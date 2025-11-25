
import React, { useState } from 'react';
import axios from 'axios';

export default function Register(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [income, setIncome] = useState('');
  const [riskProfile, setRiskProfile] = useState('medium');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5001/api/auth/register', { 
        name, 
        email, 
        password,
        age: Number(age),
        income: Number(income),
        riskProfile
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userName', res.data.user.name);
      alert('✅ Registration successful! Welcome aboard!');
      window.location.reload();
    } catch(err) { 
      console.error(err); 
      alert('❌ Registration failed. Email might already be registered.'); 
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create Account ✨</h2>
        <p className="auth-subtitle">Start your investment journey today</p>
        
        <form className="auth-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              className="form-input"
              type="text"
              placeholder="John Doe" 
              value={name} 
              onChange={e=>setName(e.target.value)}
              required
            />
          </div>

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
              placeholder="Create a strong password" 
              value={password} 
              onChange={e=>setPassword(e.target.value)}
              required
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Age</label>
            <input 
              className="form-input"
              type="number"
              placeholder="25" 
              value={age} 
              onChange={e=>setAge(e.target.value)}
              required
              min="18"
              max="100"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Annual Income (₹)</label>
            <input 
              className="form-input"
              type="number"
              placeholder="500000" 
              value={income} 
              onChange={e=>setIncome(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Risk Profile</label>
            <select 
              className="form-input"
              value={riskProfile} 
              onChange={e=>setRiskProfile(e.target.value)}
            >
              <option value="low">Conservative (Low Risk)</option>
              <option value="medium">Balanced (Medium Risk)</option>
              <option value="high">Aggressive (High Risk)</option>
            </select>
          </div>

          <button className="form-submit" type="submit" disabled={loading}>
            {loading ? '🔄 Creating account...' : '✨ Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
