import React, { useContext, useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import FloatingDock from './components/common/FloatingDock';
import { useTheme } from './contexts/ThemeContext';
import { Sun, Moon, UserCircle } from 'lucide-react';

export default function App() {
  const { isDarkMode, toggleTheme } = useTheme();
  const theme = isDarkMode ? 'dark' : 'light';
  const location = useLocation();
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Read auth state on mount and route change
    setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
  }, [location.pathname]);

  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const hideDockRoutes = [];
  const showDock = !hideDockRoutes.includes(location.pathname);
  const hideAuthButtons = ['/login', '/register'].includes(location.pathname);

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="global-dark-bg min-h-screen relative">
        {theme === 'dark' && <div className="aurora-bg" />}
        {theme === 'dark' && (
          <div
            className="spotlight-cursor"
            style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
          />
        )}

        {/* Top-right nav bar — all inline styles, guaranteed visible */}
        <div style={{
          position: 'fixed',
          top: '1.25rem',
          right: '1.5rem',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              width: '2.25rem',
              height: '2.25rem',
              borderRadius: '9999px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : '#64748b',
            }}
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Conditionally Render Auth Buttons vs Profile/Logout */}
          {!hideAuthButtons && (
            isLoggedIn ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.5rem', paddingLeft: '1rem', borderLeft: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0' }}>
                <button
                  style={{
                    width: '2.5rem', height: '2.5rem', borderRadius: '50%',
                    background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: 'none', cursor: 'pointer',
                    color: theme === 'dark' ? '#cbd5e1' : '#475569'
                  }}
                  title="Profile"
                >
                  <UserCircle size={22} />
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('isLoggedIn');
                    setIsLoggedIn(false);
                    navigate('/');
                  }}
                  style={{
                    padding: '0.5rem 1rem', borderRadius: '9999px',
                    background: theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2',
                    border: theme === 'dark' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid #fca5a5',
                    color: '#ef4444', fontWeight: 700, fontSize: '0.875rem',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = '#ef4444'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2'; }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  style={{
                    padding: '0.5rem 1rem', borderRadius: '9999px', border: 'none', background: 'transparent',
                    fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                    color: theme === 'dark' ? 'rgba(255,255,255,0.75)' : '#475569',
                  }}
                >
                  Log in
                </button>

                <button
                  onClick={() => navigate('/register')}
                  style={{
                    padding: '0.5rem 1.25rem', borderRadius: '9999px', border: 'none',
                    background: theme === 'dark' ? 'linear-gradient(135deg, #0891b2, #6d28d9)' : 'linear-gradient(135deg, #6366f1, #7c3aed)',
                    color: theme === 'dark' ? '#0f172a' : '#ffffff',
                    fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(99,102,241,0.35)', transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  Register
                </button>
              </>
            )
          )}
        </div>

        <Outlet />
        {showDock && <FloatingDock />}
      </div>
    </div>
  );
}