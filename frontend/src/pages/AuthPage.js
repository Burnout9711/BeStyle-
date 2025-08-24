import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic validation
    if (form.email.length < 5) {
      alert('Email must be at least 5 characters.');
      return;
    }
    if (form.password.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    if (!isLogin && form.name.length < 2) {
      alert('Name must be at least 2 characters.');
      return;
    }

    // Handle login or signup logic here
    if (isLogin) {
      // Login logic
      const user = { email: form.email, password: form.password };
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });
      if (response.ok) {
        alert('Logged in!');
      } else {
        alert('Login failed!');
      }
      const data = await response.json();
      console.log(data);
      if (data.token) {
        localStorage.setItem('token', data.token);
        alert('Login successful!');
      }
    } else {
      // Signup logic
      const newUser = { email: form.email, password: form.password, name: form.name };
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });
      if (response.ok) {
        alert('Signed up!');
      } else {
        alert('Signup failed!');
      }
      const data = await response.json();
      console.log(data);
      if (data.token) {
        localStorage.setItem('token', data.token);
        alert('Signup successful!');
      }
    }
  };

  return (
    <div className="quiz-page" style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      {/* Header similar to QuizPage.js */}
      <header className="header-nav">
        <div className="logo">BeStyle.AI</div>
        <div className="nav-actions">
        <button className="btn-secondary" onClick={() => navigate('/')}>
            <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} />
            Back to Home
        </button>
        </div>
      </header>

      {/* Auth Card */}
      <div style={{ paddingTop: '100px', paddingBottom: '2rem' }}>
      <div className="quiz-card" style={{ maxWidth: 400, margin: '3rem auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', padding: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#3b3b3b' }}>
          {isLogin ? 'Login to BeStyle.AI' : 'Sign Up for BeStyle.AI'}
        </h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label htmlFor="name" style={{ fontWeight: 500, color: '#3b3b3b'}}>Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid #3b3b3b', marginTop: '0.5rem', color: '#222'  }}
              />
            </div>
          )}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="email" style={{ fontWeight: 500, color: '#3b3b3b'}}>Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid #3b3b3b', marginTop: '0.5rem', color: '#222'  }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '1.5rem', position: 'relative' }}>
            <label htmlFor="password" style={{ fontWeight: 500, color: '#3b3b3b' }}>Password</label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: 8,
                border: '1px solid #3b3b3b',
                marginTop: '0.5rem',
                color: '#222',
                // background: '#f5f5f5',
                paddingRight: '2.5rem' // space for the icon
              }}
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '2.5rem', // <-- adjust this value for vertical alignment
                cursor: 'pointer',
                color: '#888'
              }}
              tabIndex={0}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 8,
              background: '#3b3b3b',
              color: '#fff',
              fontWeight: 600,
              fontSize: '1rem',
              border: 'none',
              cursor: 'pointer',
              marginBottom: '1rem'
            }}
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
         {/* Social Login Buttons */}
        <div style={{ margin: '1.5rem 0', textAlign: 'center' }}>
          <span style={{ color: '#888', fontWeight: 500 }}>Or continue with</span>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
            <button
              type="button"
              style={{
                border: 'none',
                background: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                borderRadius: 8,
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                fontWeight: 500,
              }}
              onClick={() => alert('Google login')}
            >
              <img src="https://en.wikipedia.org/wiki/Google_logo#/media/File:Google_%22G%22_logo.svg" alt="Google" style={{ width: 20, marginRight: 8 }} />
            </button>
            <button
              type="button"
              style={{
                border: 'none',
                background: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                borderRadius: 8,
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                fontWeight: 500,
              }}
              onClick={() => alert('Apple login')}
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" style={{ width: 20, marginRight: 8 }} />
            </button>
            <button
              type="button"
              style={{
                border: 'none',
                background: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                borderRadius: 8,
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                fontWeight: 500,
              }}
              onClick={() => alert('Facebook login')}
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png" alt="Facebook" style={{ width: 20, marginRight: 8 }} />
            </button>
          </div>
        </div>
        
        {/* Toggle link */}
        <div style={{ textAlign: 'center' }}>
          <span style={{ color: '#888' }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </span>
          <button
            className="btn-link"
            style={{
              background: 'none',
              border: 'none',
              color: '#3b3b3b',
              fontWeight: 500,
              marginLeft: '0.5rem',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default AuthPage;