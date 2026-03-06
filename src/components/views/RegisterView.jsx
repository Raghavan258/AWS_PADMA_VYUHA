import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export default function RegisterView() {
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRegister = (e) => {
        e.preventDefault();
        localStorage.setItem('isLoggedIn', 'true');
        navigate('/goal-selection');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0f1c] transition-colors duration-500 p-6 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 dark:bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="w-full max-w-md bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 relative z-10 shadow-xl text-center">

                <h1 className="text-3xl font-extrabold mb-2 tracking-tight text-slate-900 dark:text-white">Create Account</h1>
                <p className="text-slate-500 dark:text-gray-400 mb-8 text-sm">Join Lecturai to start generating your custom video lectures.</p>

                <form onSubmit={handleRegister} className="flex flex-col gap-5">

                    <div className="relative text-left">
                        <label className="block text-xs font-bold text-slate-600 dark:text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500" size={18} />
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-500 focus:ring-1 focus:ring-cyan-400 transition-all"
                            />
                        </div>
                    </div>

                    <div className="relative text-left">
                        <label className="block text-xs font-bold text-slate-600 dark:text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500" size={18} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-500 focus:ring-1 focus:ring-cyan-400 transition-all"
                            />
                        </div>
                    </div>

                    <div className="relative text-left">
                        <label className="block text-xs font-bold text-slate-600 dark:text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500" size={18} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-500 focus:ring-1 focus:ring-cyan-400 transition-all"
                            />
                        </div>
                    </div>

                    <div className="relative text-left mb-2">
                        <label className="block text-xs font-bold text-slate-600 dark:text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500" size={18} />
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-500 focus:ring-1 focus:ring-cyan-400 transition-all"
                            />
                        </div>
                    </div>

                    {/* Create Account button */}
                    <button
                        type="submit"
                        className={`w-full relative group overflow-hidden bg-cyan-600 dark:bg-cyan-500 ${isDarkMode ? 'text-white' : 'text-slate-900'} rounded-xl py-3.5 px-4 font-bold tracking-wide transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] border border-transparent`}
                    >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ backgroundSize: '200% 100%', animation: 'gradientMove 3s linear infinite' }}></div>
                        <div className="relative flex items-center justify-center gap-2 transition-colors">
                            Create Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>

                </form>

                <p className="mt-8 text-sm text-slate-500 dark:text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="font-bold hover:opacity-75 transition-opacity" style={{ color: '#a855f7' }}>
                        Sign in.
                    </Link>
                </p>
            </div>
        </div >
    );
}