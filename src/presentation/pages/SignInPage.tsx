import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabaseService } from '@infrastructure/database/SupabaseService';
import { syncService } from '@infrastructure/database/SyncService';

export function SignInPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get the page user was trying to access
  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { user, error: signInError } = await supabaseService.signIn(email, password);
      
      if (signInError) {
        setError(signInError.message);
      } else if (user) {
        // Start auto-sync
        await syncService.initialize();
        syncService.startAutoSync();
        
        // Trigger initial sync
        await syncService.sync();
        
        // Redirect to the page user was trying to access
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: 450, 
      margin: '4rem auto', 
      padding: '2rem',
      backgroundColor: 'white',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🍺</div>
        <h1 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>Welcome Back</h1>
        <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.875rem' }}>
          Sign in to sync your beer journal
        </p>
      </div>

      {error && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#fee', 
          color: '#c00', 
          borderRadius: 4, 
          marginBottom: '1.5rem',
          fontSize: '0.875rem'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2c3e50', fontSize: '0.875rem', fontWeight: 500 }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: 4,
              fontSize: '0.9375rem',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2c3e50', fontSize: '0.875rem', fontWeight: 500 }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Your password"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: 4,
              fontSize: '0.9375rem',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: '100%',
            padding: '0.875rem',
            backgroundColor: isSubmitting ? '#95a5a6' : '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            fontSize: '0.9375rem',
            fontWeight: 600,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            marginTop: '0.5rem',
          }}
        >
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div style={{ 
        marginTop: '1.5rem', 
        paddingTop: '1.5rem', 
        borderTop: '1px solid #ecf0f1',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.875rem' }}>
          Don't have an account?{' '}
          <Link 
            to="/signup"
            style={{
              color: '#27ae60',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            Sign Up
          </Link>
        </p>
      </div>

      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <Link 
          to="/"
          style={{
            color: '#95a5a6',
            textDecoration: 'none',
            fontSize: '0.875rem',
          }}
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
