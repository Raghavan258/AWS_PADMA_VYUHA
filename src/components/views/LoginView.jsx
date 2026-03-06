import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Chrome } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export default function LoginView() {
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        localStorage.setItem('isLoggedIn', 'true');
        const hasSelectedStream = localStorage.getItem('hasSelectedStream') === 'true';
        navigate(hasSelectedStream ? '/upload' : '/goal-selection');
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            position: 'relative',
            overflow: 'hidden',
        }}
            className="bg-slate-50 dark:bg-[#0a0f1c] transition-colors duration-500"
        >
            <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%,-50%)',
                width: '600px', height: '600px', borderRadius: '50%',
                filter: 'blur(120px)', pointerEvents: 'none',
                background: 'radial-gradient(circle, rgba(124,58,237,0.12), transparent)',
            }} />

            <div style={{
                width: '100%',
                maxWidth: '28rem',
                borderRadius: '1.5rem',
                padding: '2rem',
                position: 'relative',
                zIndex: 10,
                textAlign: 'center',
                background: 'white',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            }}
                className="dark:!bg-white/5 dark:!border-white/10"
            >
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em', color: '#0f172a' }}
                    className="dark:!text-white">
                    Welcome Back
                </h1>
                <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '0.875rem' }}
                    className="dark:!text-gray-400">
                    Sign in to continue your learning journey with AI.
                </p>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    {/* Email */}
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.375rem', marginLeft: '0.25rem' }}
                            className="dark:!text-gray-400">
                            Email Address
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Mail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                            <input
                                type="email" required value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.875rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                                className="dark:!bg-black/40 dark:!border-white/10 dark:!text-white dark:placeholder-gray-600"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem', marginLeft: '0.25rem', marginRight: '0.25rem' }}>
                            <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                className="dark:!text-gray-400">
                                Password
                            </label>
                            <a href="#" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9333ea', textDecoration: 'none' }}>Forgot?</a>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                            <input
                                type="password" required value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.875rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                                className="dark:!bg-black/40 dark:!border-white/10 dark:!text-white dark:placeholder-gray-600"
                            />
                        </div>
                    </div>

                    {/* ── SIGN IN BUTTON — pure inline, always visible ── */}
                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '0.875rem 1rem',
                            borderRadius: '0.75rem',
                            fontWeight: 700,
                            fontSize: '1rem',
                            letterSpacing: '0.03em',
                            border: 'none',
                            cursor: 'pointer',
                            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                            color: isDarkMode ? '#ffffff' : '#0f172a',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 15px rgba(124,58,237,0.4)',
                            transition: 'opacity 0.2s, box-shadow 0.2s',
                            fontFamily: 'inherit',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.boxShadow = '0 0 25px rgba(168,85,247,0.55)'; }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(124,58,237,0.4)'; }}
                    >
                        Sign In <ArrowRight size={18} />
                    </button>
                </form>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
                    <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} className="dark:!bg-white/10" />
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>or continue with</span>
                    <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} className="dark:!bg-white/10" />
                </div>

                {/* Google */}
                <button
                    style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.75rem',
                        border: '1px solid #e5e7eb', background: 'white', color: '#374151',
                        fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'inherit',
                        transition: 'background 0.2s',
                    }}
                    className="dark:!bg-white/5 dark:!border-white/10 dark:!text-white"
                    onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}
                >
                    <Chrome size={20} style={{ color: '#ef4444' }} />
                    Google
                </button>

                <p style={{ marginTop: '2rem', fontSize: '0.875rem', color: '#64748b' }} className="dark:!text-gray-400">
                    Don't have an account?{' '}
                    <Link to="/register" style={{ fontWeight: 700, color: '#22d3ee', textDecoration: 'none' }}>
                        Register here.
                    </Link>
                </p>
            </div>
        </div>
    );
}