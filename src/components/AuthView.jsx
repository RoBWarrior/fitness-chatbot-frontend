import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { Lock, User, ArrowRight, Loader } from 'lucide-react';

export default function AuthView({ onLogin }) {
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            let res;
            if (isRegistering) {
                res = await authAPI.register(username, password);
            } else {
                res = await authAPI.login(username, password);
            }
            onLogin(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || "Authentication failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', textAlign: 'center' }}>
                <h2 style={{ marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                    {isRegistering ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    {isRegistering ? 'Sign up to start chatting with your documents' : 'Enter your credentials to continue'}
                </p>

                {error && (
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Username"
                            style={{ paddingLeft: '2.5rem' }}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="password"
                            className="input-field"
                            placeholder="Password"
                            style={{ paddingLeft: '2.5rem' }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '0.5rem', width: '100%' }}>
                        {loading ? <Loader className="spin" size={20} /> : (
                            <>
                                {isRegistering ? 'Sign Up' : 'Log In'}
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button
                        type="button"
                        style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: '500' }}
                        onClick={() => { setIsRegistering(!isRegistering); setError(null); }}
                    >
                        {isRegistering ? 'Log in' : 'Sign up'}
                    </button>
                </div>
            </div>
        </div>
    );
}
