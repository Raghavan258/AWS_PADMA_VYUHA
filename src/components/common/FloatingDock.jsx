import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Upload, PlaySquare, HelpCircle } from 'lucide-react';

export default function FloatingDock() {
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/upload', icon: Upload, label: 'Upload' },
        { path: '/dashboard', icon: PlaySquare, label: 'Dashboard' },
        { path: '/quiz', icon: HelpCircle, label: 'Quiz' },
    ];

    return (
        <div style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            transition: 'all 0.3s ease',
            opacity: scrolled ? 0.9 : 1
        }}>
            <nav className="flex items-center gap-2 p-3 bg-white/80 dark:bg-slate-900/65 backdrop-blur-md rounded-full border border-gray-200 dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] transition-colors duration-500">
                {/* eslint-disable-next-line no-unused-vars */}
                {navItems.map(({ path, icon: Icon, label }) => {
                    const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
                    return (
                        <div key={path} className="dock-item-container" style={{ position: 'relative' }}>
                            <button
                                onClick={() => navigate(path)}
                                title={label}
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-cyan-400/15 text-cyan-400 scale-110' : 'bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100 hover:-translate-y-1 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/10'}`}
                            >
                                <Icon size={24} />
                            </button>
                            {/* Stylish Tooltip */}
                            <span className="dock-tooltip">
                                {label}
                            </span>
                        </div>
                    );
                })}
            </nav>

            <style>{`
                .dock-item-container:hover .dock-tooltip {
                    opacity: 1;
                    visibility: visible;
                    transform: translateX(-50%) translateY(-10px);
                }
                .dock-tooltip {
                    position: absolute;
                    bottom: 100%;
                    left: 50%;
                    transform: translateX(-50%) translateY(0px);
                    background: rgba(255, 255, 255, 0.9);
                    color: #0f172a;
                    padding: 0.35rem 0.75rem;
                    border-radius: 0.5rem;
                    font-size: 0.75rem;
                    font-weight: 600;
                    letter-spacing: 0.05em;
                    white-space: nowrap;
                    border: 1px solid rgba(0, 0, 0, 0.1);
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    pointer-events: none;
                    margin-bottom: 0.5rem;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
                }
                .dock-tooltip::after {
                    content: '';
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    border-width: 5px;
                    border-style: solid;
                    border-color: rgba(255, 255, 255, 0.9) transparent transparent transparent;
                }
                .dark .dock-tooltip {
                    background: rgba(15, 23, 42, 0.9);
                    color: white;
                    border-color: rgba(255, 255, 255, 0.1);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
                }
                .dark .dock-tooltip::after {
                    border-color: rgba(15, 23, 42, 0.9) transparent transparent transparent;
                }
            `}</style>
        </div>
    );
}
