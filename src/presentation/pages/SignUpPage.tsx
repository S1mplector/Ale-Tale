import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabaseService } from '@infrastructure/database/SupabaseService';
import { syncService } from '@infrastructure/database/SyncService';

export function SignUpPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const { user, error: signUpError } = await supabaseService.signUp(email, password);
      
      if (signUpError) {
        setError(signUpError.message);
      } else {
        setSuccess(true);
        // If email confirmation is disabled, sign in automatically
        if (user) {
          await syncService.initialize();
          syncService.startAutoSync();
          setTimeout(() => navigate('/'), 1500);
        }
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={{ 
        maxWidth: 450, 
        margin: '4rem auto', 
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ color: '#27ae60', marginBottom: '1rem' }}>Account Created!</h2>
          <p style={{ color: '#7f8c8d', marginBottom: '1.5rem' }}>
            Check your email to verify your account before signing in.
          </p>
          <Link 
            to="/signin"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3498db',
              color: 'white',
              textDecoration: 'none',
              borderRadius: 4,
              fontWeight: 500,
            }}
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

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
        <h1 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>Create Account</h1>
        <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.875rem' }}>
          Sign up to sync your beer journal across devices
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
            minLength={6}
            placeholder="At least 6 characters"
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
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Re-enter password"
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
            backgroundColor: isSubmitting ? '#95a5a6' : '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            fontSize: '0.9375rem',
            fontWeight: 600,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            marginTop: '0.5rem',
          }}
        >
          {isSubmitting ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <div style={{ 
        marginTop: '1.5rem', 
        paddingTop: '1.5rem', 
        borderTop: '1px solid #ecf0f1',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <Link 
            to="/signin"
            style={{
              color: '#3498db',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            Sign In
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
