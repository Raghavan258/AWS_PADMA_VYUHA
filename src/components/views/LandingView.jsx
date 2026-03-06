import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Play, Brain, Mic, Zap, PlayCircle, Layers, Fingerprint, Moon, HelpCircle, Activity, Loader2 } from 'lucide-react';

const MagneticButton = ({ children, onClick, styleClass = "magnetic-btn-primary" }) => {
    const btnRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!btnRef.current) return;
        const rect = btnRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
        btnRef.current.style.transform = `translate(${x}px, ${y}px)`;
    };

    const handleMouseLeave = () => {
        if (!btnRef.current) return;
        btnRef.current.style.transform = `translate(0px, 0px) scale(1)`;
    };

    return (
        <button
            ref={btnRef}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseDown={(e) => e.currentTarget.style.transform += ' scale(0.95)'}
            onMouseUp={handleMouseLeave}
            className={styleClass}
        >
            {children}
        </button>
    );
};

export default function LandingView() {
    const navigate = useNavigate();
    const [dropState, setDropState] = useState('idle');
    const [mojoLang, setMojoLang] = useState('EN');
    const [isSpeaking, setIsSpeaking] = useState(false);

    const mojoTranslations = {
        'EN': { text: "Welcome to Advanced Differential Equations.", langCode: 'en-US' },
        'HI': { text: "उन्नत अवकल समीकरणों में आपका स्वागत है।", langCode: 'hi-IN' },
        'TE': { text: "అధునాతన అవకలన సమీకరణాలకు స్వాగతం.", langCode: 'te-IN' }
    };

    const speakTranslation = (langKey) => {
        setMojoLang(langKey);

        // Check if browser supports speech synthesis
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop anything currently speaking

            const utterance = new SpeechSynthesisUtterance(mojoTranslations[langKey].text);
            utterance.lang = mojoTranslations[langKey].langCode;
            utterance.rate = 0.9;
            utterance.pitch = 1;

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);

            window.speechSynthesis.speak(utterance);
        } else {
            console.warn("Text-to-speech is not supported in this browser.");
        }
    };

    // Scroll reveal observer
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, { threshold: 0.1 });

        const elements = document.querySelectorAll('.scroll-reveal');
        elements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = e.dataTransfer?.files || e.target?.files;
        setDropState('dropping');

        // 1-second delay UI visualization, then router push
        setTimeout(() => {
            navigate('/upload', { state: { uploadedFile: files ? files[0] : null } });
        }, 1000);
    };

    return (
        <div className="nextgen-landing">
            {/* Brand Header */}
            <header className="brand-header">
                <h1 className="brand-logo text-3xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text inline-block">LecturAI</h1>
            </header>

            {/* Central Hero Focus */}
            <section className="hero-focus-section scroll-reveal">
                <div className="hero-text-block">
                    <h2 className="hero-headline text-slate-900 dark:text-white transition-colors duration-500">Binge Your Syllabus.</h2>
                    <p className="hero-subheadline text-slate-600 dark:text-white/60 transition-colors duration-500">
                        Ditch the dry pages. Turn your "eyes-glazing-over" PDFs into high-octane video lectures.
                    </p>
                </div>

                <div
                    className={`hero-sandbox ${dropState === 'hover' ? 'drag-active' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setDropState('hover'); }}
                    onDragLeave={(e) => { e.preventDefault(); setDropState('idle'); }}
                    onDrop={handleDrop}
                    onClick={() => navigate('/upload')}
                >
                    {dropState === 'idle' && (
                        <div className="sandbox-content text-slate-500 dark:text-white/40">
                            <Fingerprint size={64} className="pulse-icon opacity-50" />
                            <h3 className="text-slate-900 dark:text-white">Drop a PDF Here</h3>
                            <p>To initiate the transformation</p>
                        </div>
                    )}

                    {dropState === 'hover' && (
                        <div className="sandbox-content text-yellow">
                            <Zap size={80} className="glow-icon" color="#fbbf24" />
                            <h3 className="glow-text">Release to Begin</h3>
                        </div>
                    )}

                    {dropState === 'dropping' && (
                        <div className="sandbox-content text-cyan">
                            <Loader2 size={80} className="glow-icon animate-spin" color="#22d3ee" />
                            <h3 className="glow-text text-cyan">Analyzing Syllabus...</h3>
                        </div>
                    )}
                </div>

                <div className="mt-20">
                    <MagneticButton onClick={() => navigate('/upload')}>
                        [ GO ADVENTURE — IT'S FREE ]
                    </MagneticButton>
                </div>
            </section>

            {/* Bento Box Layout Section */}
            <section className="bento-section">
                <div className="bento-grid">

                    <div className="bento-tile bento-large scroll-reveal box-glass flex-col">
                        <div className="bento-content flex-1-col">
                            <Mic size={40} className="text-cyan mb-4" />
                            <h3>Multilingual Mojo</h3>
                            <p>Tap a flag icon and watch the video's captions & AI voice flip from English to Hindi or Telugu smoothly.</p>

                            {/* Interactive UI to fill the gap */}
                            <div className="mojo-sandbox">
                                <div className="lang-switcher">
                                    {['EN', 'HI', 'TE'].map(lang => (
                                        <button
                                            key={lang}
                                            className={`lang-btn ${mojoLang === lang ? 'active' : ''}`}
                                            onClick={() => speakTranslation(lang)}
                                        >
                                            {lang === 'EN' ? '🇬🇧 EN' : lang === 'HI' ? '🇮🇳 HI' : '🇮🇳 TE'}
                                        </button>
                                    ))}
                                </div>

                                <div className="subtitle-display">
                                    <div className="audio-wave">
                                        {[...Array(12)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={`wave-bar ${mojoLang === 'EN' ? 'wave-en' : mojoLang === 'HI' ? 'wave-hi' : 'wave-te'}`}
                                                style={{
                                                    animationDelay: `${i * 0.1}s`,
                                                    animationPlayState: isSpeaking ? 'running' : 'paused',
                                                    height: isSpeaking ? undefined : '4px' // Reset to flat if not speaking
                                                }}
                                            ></div>
                                        ))}
                                    </div>
                                    <p key={mojoLang} className="translated-text">{mojoTranslations[mojoLang].text}</p>
                                </div>
                            </div>

                        </div>
                        <div className="bento-decor bg-cyan-glow"></div>
                    </div>

                    <div className="bento-tile bento-small scroll-reveal delay-1 box-glass">
                        <div className="bento-content">
                            <Zap size={40} className="text-pink mb-4" />
                            <h3>Boss-Level Quizzes</h3>
                            <p>Speed Challenges to build your Streak.</p>
                        </div>
                    </div>

                    <div className="bento-tile bento-small scroll-reveal delay-2 box-glass">
                        <div className="bento-content">
                            <Moon size={40} className="text-purple mb-4" />
                            <h3>Night-Owl Mode</h3>
                            <p>Obsidian dark theme for the 2AM grind.</p>
                        </div>
                    </div>

                    <div className="bento-tile bento-wide scroll-reveal delay-3 box-glass">
                        <div className="bento-content horizontal-layout">
                            <div style={{ flex: 1 }}>
                                <Brain size={40} className="text-emerald mb-4" />
                                <h3>AI Synthetic Generation</h3>
                                <p>Our LLM core instantly distills 50 pages of textbook jargon into a perfectly scened, 5-minute animated bite.</p>
                            </div>
                            <div className="tech-stack-visual">
                                {/* Simulated mini UI */}
                                <div className="mini-timeline">
                                    <div className="mini-progress"></div>
                                    <div className="mini-node node-1"></div>
                                    <div className="mini-node node-2"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* Footer */}
            <footer className="nextgen-footer scroll-reveal">
                <h2 className="text-slate-900 dark:text-white transition-colors duration-500">Ready to Level Up?</h2>
                <MagneticButton onClick={() => navigate('/upload')} styleClass="magnetic-btn-secondary">
                    [ START MY TRANSFORMATION ]
                </MagneticButton>
                <p className="micro-copy text-purple-600 dark:text-purple-400/80">Warning: May cause accidental straight A's.</p>
            </footer>

            <style>{`
                .nextgen-landing {
                    padding-top: 2rem;
                    padding-bottom: 10rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                /* Scroll Reveal Animations */
                .scroll-reveal {
                    opacity: 0;
                    transform: translateY(40px) rotateX(10deg);
                    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .scroll-reveal.revealed {
                    opacity: 1;
                    transform: translateY(0) rotateX(0deg);
                }
                .delay-1 { transition-delay: 0.1s; }
                .delay-2 { transition-delay: 0.2s; }
                .delay-3 { transition-delay: 0.3s; }

                /* Brand Header */
                .brand-header {
                    width: 100%;
                    padding: 1rem 2rem;
                    margin-bottom: 4rem;
                }
                .brand-logo {
                    font-size: 3rem;
                    font-weight: 900;
                    letter-spacing: -0.05em;
                    background: linear-gradient(135deg, #22d3ee, #c026d3);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-size: 200% 200%;
                    animation: gradientShift 5s ease infinite alternate;
                    filter: drop-shadow(0 0 15px rgba(192, 38, 211, 0.4));
                    margin: 0;
                    display: inline-block;
                }
                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 100% 50%; }
                }

                /* Hero Focus */
                .hero-focus-section {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                    padding: 0 1rem;
                    margin-bottom: 8rem;
                }
                .hero-text-block {
                    text-align: center;
                    margin-bottom: 4rem;
                }
                .hero-headline {
                    font-size: 5rem;
                    font-weight: 800;
                    letter-spacing: -0.04em;
                    margin-bottom: 1.5rem;
                }
                .hero-subheadline {
                    font-size: 1.25rem;
                    max-width: 600px;
                    margin: 0 auto;
                }

                /* Core Sandbox UI */
                .hero-sandbox {
                    width: 100%;
                    max-width: 800px;
                    aspect-ratio: 16/9;
                    background: rgba(255, 255, 255, 0.6);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    border: 1px solid rgba(0,0,0,0.05);
                    border-radius: 2rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 0 40px rgba(0,0,0,0.05);
                    transition: all 0.3s ease;
                }
                .dark .hero-sandbox {
                    background: rgba(15, 23, 42, 0.5);
                    border-color: rgba(255,255,255,0.05);
                    box-shadow: 0 0 40px rgba(0,0,0,0.5);
                }
                .hero-sandbox::before {
                    content: "";
                    position: absolute;
                    inset: -1px;
                    border-radius: 2rem;
                    padding: 2px;
                    background: linear-gradient(135deg, rgba(34,211,238,0), rgba(192,38,211,0));
                    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                    transition: all 0.5s ease;
                }
                .hero-sandbox:hover::before {
                    background: linear-gradient(135deg, #22d3ee, #c026d3);
                    box-shadow: 0 0 30px rgba(34,211,238,0.5);
                }
                .hero-sandbox.drag-active {
                    border-color: #22d3ee;
                    box-shadow: 0 0 30px rgba(34,211,238,0.3);
                }
                .sandbox-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                }
                .sandbox-content h3 { font-size: 1.5rem; font-weight: 600; }

                /* Bento Box Layout */
                .bento-section {
                    width: 100%;
                    padding: 0 1rem;
                    margin-bottom: 8rem;
                }
                .bento-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    grid-auto-rows: minmax(250px, auto);
                    gap: 1.5rem;
                }
                .box-glass {
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(16px);
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
                    border-radius: 1.5rem;
                    padding: 2.5rem;
                    position: relative;
                    overflow: hidden;
                    transition: transform 0.3s ease, border-color 0.3s ease;
                    color: #0f172a;
                }
                .dark .box-glass {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.1);
                    box-shadow: none;
                    color: white;
                }
                .box-glass:hover {
                    transform: translateY(-5px);
                    border-color: rgba(0,0,0,0.1);
                }
                .dark .box-glass:hover {
                    border-color: rgba(255,255,255,0.15);
                }
                .bento-large { grid-column: span 2; grid-row: span 2; }
                .bento-small { grid-column: span 1; grid-row: span 1; }
                .bento-wide { grid-column: span 3; grid-row: span 1; }
                
                .bento-content h3 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; }
                .bento-content p { color: #475569; line-height: 1.6; }
                .dark .bento-content p { color: rgba(255,255,255,0.5); }
                .horizontal-layout { display: flex; align-items: center; gap: 3rem; height: 100%; }
                
                .bento-decor {
                    position: absolute;
                    bottom: -50px; right: -50px;
                    width: 200px; height: 200px;
                    border-radius: 50%;
                    filter: blur(80px);
                    z-index: -1;
                }
                .bg-cyan-glow { background: rgba(34, 211, 238, 0.2); }

                /* Flex Utilities for Bento Content */
                .flex-col { display: flex; flex-direction: column; }
                .flex-1-col { flex: 1; display: flex; flex-direction: column; }

                /* Mojo Interactive Sandbox */
                .mojo-sandbox {
                    margin-top: auto;
                    padding-top: 2rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .lang-switcher {
                    display: flex;
                    gap: 0.5rem;
                    background: rgba(255,255,255,0.8);
                    padding: 0.5rem;
                    border-radius: 999px;
                    width: max-content;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
                }
                .dark .lang-switcher {
                    background: rgba(255,255,255,0.05);
                    border-color: rgba(255,255,255,0.1);
                    box-shadow: none;
                }
                .lang-btn {
                    padding: 0.5rem 1rem;
                    border-radius: 999px;
                    color: #475569;
                    font-weight: 600;
                    font-size: 0.875rem;
                    transition: all 0.3s ease;
                }
                .dark .lang-btn { color: rgba(255,255,255,0.6); }
                .lang-btn:hover { color: #020617; background: rgba(0,0,0,0.05); }
                .dark .lang-btn:hover { color: white; background: rgba(255,255,255,0.1); }
                .lang-btn.active { background: #22d3ee; color: #020617; box-shadow: 0 0 15px rgba(34,211,238,0.4); }

                .subtitle-display {
                    background: rgba(255, 255, 255, 0.8);
                    border: 1px solid #e2e8f0;
                    border-radius: 1rem;
                    padding: 1.5rem;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
                }
                .dark .subtitle-display {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255,255,255,0.1);
                    box-shadow: none;
                }
                .audio-wave {
                    display: flex;
                    gap: 4px;
                    align-items: center;
                    height: 24px;
                    margin-bottom: 1rem;
                }
                .wave-bar {
                    width: 4px;
                    height: 10px;
                    border-radius: 2px;
                    animation: equalize 1s ease-in-out infinite alternate;
                }
                .wave-en { background: #22d3ee; box-shadow: 0 0 8px #22d3ee; }
                .wave-hi { background: #f43f5e; box-shadow: 0 0 8px #f43f5e; }
                .wave-te { background: #a855f7; box-shadow: 0 0 8px #a855f7; }
                
                @keyframes equalize {
                    0% { height: 4px; }
                    100% { height: 24px; }
                }

                .translated-text {
                    font-family: inherit;
                    font-size: 1.25rem;
                    font-weight: 500;
                    color: #0f172a;
                    line-height: 1.5;
                    animation: typeIn 0.5s ease-out;
                }
                .dark .translated-text { color: white; }
                @keyframes typeIn {
                    0% { opacity: 0; transform: translateY(10px); filter: blur(4px); }
                    100% { opacity: 1; transform: translateY(0); filter: blur(0); }
                }

                /* Mini Visuals */
                .tech-stack-visual {
                    flex: 1;
                    padding: 2rem;
                    background: rgba(255,255,255,0.8);
                    border-radius: 1rem;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
                }
                .dark .tech-stack-visual {
                    background: rgba(255,255,255,0.05);
                    border-color: rgba(255,255,255,0.1);
                    box-shadow: none;
                }
                .mini-timeline {
                    height: 8px; background: #cbd5e1; border-radius: 4px; position: relative;
                }
                .dark .mini-timeline { background: rgba(255,255,255,0.1); }
                .mini-progress {
                    position: absolute; left: 0; top: 0; bottom: 0; width: 60%;
                    background: linear-gradient(90deg, #10b981, #34d399); border-radius: 4px;
                    box-shadow: 0 0 10px rgba(16,185,129,0.5);
                }
                .mini-node {
                    position: absolute; width: 16px; height: 16px; border-radius: 50%;
                    background: white; top: -4px; box-shadow: 0 0 10px white;
                }
                .node-1 { left: 20%; background: #34d399; }
                .node-2 { left: 60%; background: #34d399; }

                /* Footer */
                .nextgen-footer {
                    text-align: center;
                    margin-top: 4rem;
                }
                .nextgen-footer h2 { font-size: 3rem; font-weight: 800; margin-bottom: 3rem; }
                .micro-copy { margin-top: 2rem; font-size: 0.875rem; letter-spacing: 0.05em; }

                @media (max-width: 900px) {
                    .bento-grid { grid-template-columns: 1fr; }
                    .bento-large, .bento-small, .bento-wide { grid-column: span 1; grid-row: auto; }
                    .horizontal-layout { flex-direction: column; }
                    .hero-headline { font-size: 3.5rem; }
                }

                /* Magnetic Buttons CSS */
                .magnetic-btn-primary {
                    background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
                    color: white; font-size: 1.125rem; font-weight: 800; padding: 1.25rem 3rem;
                    border: none; border-radius: 4rem; cursor: pointer;
                    box-shadow: 0 0 30px rgba(139, 92, 246, 0.2); transition: transform 0.1s ease-out, box-shadow 0.3s ease;
                    letter-spacing: 0.1em;
                }
                .magnetic-btn-primary:hover { box-shadow: 0 0 50px rgba(139, 92, 246, 0.5); }
                .magnetic-btn-secondary {
                    background: linear-gradient(135deg, #f43f5e, #c026d3);
                    color: white; font-size: 1.125rem; font-weight: 800; padding: 1.25rem 3rem;
                    border: none; border-radius: 4rem; cursor: pointer;
                    box-shadow: 0 0 30px rgba(244, 63, 94, 0.2); transition: transform 0.1s ease-out, box-shadow 0.3s ease;
                    letter-spacing: 0.1em;
                }
                .magnetic-btn-secondary:hover { box-shadow: 0 0 50px rgba(244, 63, 94, 0.5); }

                .text-cyan { color: #22d3ee; }
                .text-pink { color: #f43f5e; }
                .text-purple { color: #a855f7; }
                .text-emerald { color: #10b981; }
                .mt-20 { margin-top: 5rem; }
            `}</style>
        </div>
    );
}
