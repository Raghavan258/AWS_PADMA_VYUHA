import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Play, Pause, Volume2, Maximize, BrainCircuit, Download, Share2,
    Zap, Send, Sparkles, Headphones, Activity, Menu, X, Subtitles
} from 'lucide-react';
import { mockChapters, mockTakeaways } from '../../lib/mockData';
import { useTheme } from '../../contexts/ThemeContext';

export default function DashboardView() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isDarkMode } = useTheme();
    const dark = isDarkMode;

    const videoData = location.state || {
        title: mockChapters[0].title,
        duration: mockChapters[0].duration,
        chapter: 'Chapter 1',
        id: mockChapters[0].id
    };

    const [isPlaying, setIsPlaying] = useState(false);
    const [activeVideoId, setActiveVideoId] = useState(videoData.activeVideoId || mockChapters[0].id);
    const [activeChapterId] = useState(videoData.activeVideoId || mockChapters[0].id);
    const [isLowBandwidth, setIsLowBandwidth] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isCCEnabled, setIsCCEnabled] = useState(false);
    const [activeLanguage, setActiveLanguage] = useState('EN');
    const [activeTab, setActiveTab] = useState('curriculum');
    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState([
        { role: 'ai', content: `Hi! I'm your AI companion. Do you have any questions about "${videoData.title || 'this lecture'}"?` }
    ]);
    const [isSynthesizingAudio, setIsSynthesizingAudio] = useState(false);
    const [currentTimeRaw, setCurrentTimeRaw] = useState(135);

    useEffect(() => {
        let interval;
        if (isPlaying && !isSynthesizingAudio) {
            interval = setInterval(() => setCurrentTimeRaw(prev => prev + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, isSynthesizingAudio]);

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        if (newLang !== activeLanguage) {
            setActiveLanguage(newLang);
            setIsSynthesizingAudio(true);
            const wasPlaying = isPlaying;
            setIsPlaying(false);
            setTimeout(() => {
                setIsSynthesizingAudio(false);
                if (wasPlaying) setIsPlaying(true);
            }, 1500);
        }
    };

    const formatCurrentTime = (totalSeconds) => {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const togglePlay = () => setIsPlaying(!isPlaying);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        setChatMessages(prev => [...prev, { role: 'user', content: chatInput }]);
        setChatInput('');
        setTimeout(() => {
            setChatMessages(prev => [...prev, { role: 'ai', content: 'Great question! Based on this lecture, the key factor in energy transfer is...' }]);
        }, 1000);
    };

    const currentVideo = videoData.playlist
        ? videoData.playlist.find(v => v.id === activeVideoId)
        : mockChapters.find(c => c.id === activeVideoId);

    const displayTitle = currentVideo?.title || videoData.title;
    const displayDuration = currentVideo?.duration || videoData.duration;
    const displayChapterTitle = videoData.chapterTitle || videoData.chapter;
    const displayChapters = videoData.playlist || mockChapters;

    // ── Theme-aware color tokens ──────────────────────────────
    const panel = dark ? '#0f1623' : '#ffffff';
    const panelBorder = dark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';
    const panelSub = dark ? '#0d1420' : '#fafafa';
    const textPri = dark ? '#f1f5f9' : '#0f172a';
    const textSec = dark ? 'rgba(255,255,255,0.45)' : '#94a3b8';
    const textMid = dark ? 'rgba(255,255,255,0.7)' : '#374151';
    const rowHover = dark ? 'rgba(255,255,255,0.04)' : '#f8fafc';
    const inputBg = dark ? 'rgba(255,255,255,0.06)' : 'white';
    const inputBorder = dark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
    const inputColor = dark ? '#f1f5f9' : '#1e293b';
    const msgUserBg = dark ? 'rgba(255,255,255,0.08)' : '#f1f5f9';
    const msgAiBg = dark ? 'rgba(168,85,247,0.12)' : 'rgba(168,85,247,0.08)';
    // ──────────────────────────────────────────────────────────

    return (
        <div
            className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] transition-colors duration-500 pb-32 overflow-hidden relative"
            style={{ fontFamily: "'Inter', system-ui, sans-serif", color: textPri }}
        >
            {/* Background glows */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 800px 500px at 20% 30%, rgba(34,211,238,0.04), transparent)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 800px 500px at 80% 70%, rgba(168,85,247,0.04), transparent)' }} />
            </div>

            <div className="relative z-10 p-4 md:p-8 md:pt-10 flex flex-col md:grid md:grid-cols-[minmax(0,7fr)_3fr] gap-6 md:gap-8 max-w-[1600px] mx-auto">

                {/* Low Bandwidth Toggle */}
                <div className="flex justify-end md:col-span-2 mb-[-1rem] md:mb-[-2rem] z-20">
                    <button
                        onClick={() => setIsLowBandwidth(!isLowBandwidth)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 14px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700,
                            border: '1px solid', cursor: 'pointer', transition: 'all 0.2s',
                            background: isLowBandwidth ? 'rgba(52,211,153,0.1)' : (dark ? 'rgba(255,255,255,0.06)' : 'white'),
                            borderColor: isLowBandwidth ? 'rgba(52,211,153,0.4)' : panelBorder,
                            color: isLowBandwidth ? '#34d399' : textMid,
                        }}
                    >
                        {isLowBandwidth ? <Headphones size={14} /> : <Activity size={14} />}
                        {isLowBandwidth ? 'Audio Only Mode' : 'Low Bandwidth Mode'}
                    </button>
                </div>

                {/* ── LEFT COLUMN ── */}
                <div className="flex flex-col gap-4 md:gap-6 w-full">

                    <div className="mb-[-8px]">
                        <div style={{ color: '#22d3ee', fontSize: '11px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px', marginLeft: '4px' }}>
                            {displayChapterTitle}
                        </div>
                        <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, color: textPri }}>
                            {displayTitle}
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', marginLeft: '4px' }}>
                            <span style={{ padding: '4px 10px', borderRadius: '6px', background: dark ? 'rgba(255,255,255,0.08)' : 'white', border: `1px solid ${panelBorder}`, fontSize: '12px', fontFamily: 'monospace', color: textMid }}>
                                {displayDuration}
                            </span>
                            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#cbd5e1' }} />
                            <span style={{ fontSize: '13px', fontWeight: 500, color: textSec }}>AI Generated Lecture</span>
                        </div>
                    </div>

                    {/* Video Card */}
                    <div style={{ background: panel, border: `1px solid ${panelBorder}`, borderRadius: '16px', overflow: 'hidden', boxShadow: dark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.04)' }}>

                        {isLowBandwidth ? (
                            <div style={{ aspectRatio: '21/9', background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(52,211,153,0.2)', border: '1px solid rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                    <Headphones size={30} style={{ color: '#34d399' }} />
                                </div>
                                <div style={{ color: 'white', fontWeight: 600 }}>Audio Mode Active</div>
                                <div style={{ color: '#34d399', fontSize: '11px', marginTop: '4px', fontFamily: 'monospace' }}>SAVING DATA</div>
                                <div style={{ width: '100%', maxWidth: '360px', marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <button onClick={togglePlay} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}>
                                        {isPlaying ? <Pause size={22} /> : <Play size={22} />}
                                    </button>
                                    <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '9999px', position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '35%', background: '#34d399', borderRadius: '9999px' }} />
                                    </div>
                                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontFamily: 'monospace' }}>{formatCurrentTime(currentTimeRaw)} / {displayDuration}</span>
                                </div>
                            </div>
                        ) : (
                            <div style={{ aspectRatio: '16/9', background: '#0a0a0a', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="group">
                                <button onClick={togglePlay} style={{ background: 'none', border: 'none', cursor: 'pointer', zIndex: 10 }}>
                                    <Play size={64} style={{ color: 'rgba(255,255,255,0.85)', filter: 'drop-shadow(0 0 15px rgba(34,211,238,0.5))' }} />
                                </button>
                                {isCCEnabled && (
                                    <div style={{ position: 'absolute', bottom: '80px', left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 20, padding: '0 1rem' }}>
                                        <div style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', padding: '8px 16px', borderRadius: '8px', color: 'white', fontWeight: 500, border: '1px solid rgba(255,255,255,0.1)', maxWidth: '600px', textAlign: 'center' }}>
                                            The key factor in energy transfer across these synthetic membranes is...
                                        </div>
                                    </div>
                                )}
                                {isSynthesizingAudio && (
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', zIndex: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                            <BrainCircuit size={28} style={{ color: '#22d3ee' }} />
                                        </div>
                                        <div style={{ color: 'white', fontWeight: 700, fontSize: '13px', padding: '4px 12px', borderRadius: '6px', background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.3)' }}>
                                            Synthesizing Audio
                                        </div>
                                    </div>
                                )}
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1rem', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', zIndex: 40 }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                >
                                    <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '9999px', marginBottom: '12px', position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '35%', background: '#22d3ee', borderRadius: '9999px' }} />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                            <button onClick={togglePlay} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}>
                                                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                                            </button>
                                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)' }}><Volume2 size={18} /></button>
                                            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', fontFamily: 'monospace' }}>{formatCurrentTime(currentTimeRaw)} / {displayDuration}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <button onClick={() => setIsCCEnabled(!isCCEnabled)} style={{ background: isCCEnabled ? 'rgba(34,211,238,0.2)' : 'transparent', border: isCCEnabled ? '1px solid rgba(34,211,238,0.5)' : '1px solid transparent', borderRadius: '6px', padding: '4px 6px', cursor: 'pointer', color: isCCEnabled ? '#22d3ee' : 'rgba(255,255,255,0.7)' }}>
                                                <Subtitles size={18} />
                                            </button>
                                            <select value={activeLanguage} onChange={handleLanguageChange} style={{ background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}>
                                                <option value="EN">English</option>
                                                <option value="HI">हिंदी (Hindi)</option>
                                                <option value="TE">తెలుగు (Telugu)</option>
                                            </select>
                                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)' }}><Maximize size={18} /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Bar */}
                        <div style={{ padding: '14px 16px', borderTop: `1px solid ${panelBorder}`, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', background: panelSub }}>
                            <button onClick={() => navigate('/quiz')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', borderRadius: '9999px', border: '1px solid rgba(168,85,247,0.4)', background: 'rgba(168,85,247,0.08)', color: '#a855f7', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                                <BrainCircuit size={17} /> Generate Quiz
                            </button>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {[{ icon: <Download size={15} />, label: 'Notes' }, { icon: <Share2 size={15} />, label: 'Share' }].map(btn => (
                                    <button key={btn.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: `1px solid ${panelBorder}`, background: dark ? 'rgba(255,255,255,0.06)' : 'white', color: textMid, fontWeight: 500, fontSize: '13px', cursor: 'pointer' }}>
                                        {btn.icon} {btn.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Smart Notes */}
                    <div style={{ background: panel, border: `1px solid ${panelBorder}`, borderRadius: '14px', padding: '1.5rem', boxShadow: dark ? '0 4px 20px rgba(0,0,0,0.25)' : '0 1px 4px rgba(0,0,0,0.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: `1px solid ${panelBorder}` }}>
                            <div style={{ padding: '8px', background: 'rgba(34,211,238,0.1)', borderRadius: '8px', border: '1px solid rgba(34,211,238,0.2)' }}>
                                <Sparkles size={18} style={{ color: '#22d3ee' }} />
                            </div>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: textPri }}>
                                Smart Notes
                                <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '9999px', background: dark ? 'rgba(255,255,255,0.08)' : '#f1f5f9', color: textSec, fontWeight: 600, textTransform: 'uppercase', marginLeft: '8px', border: `1px solid ${panelBorder}` }}>Auto-Generated</span>
                            </h3>
                        </div>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '280px', overflowY: 'auto', paddingRight: '8px' }}>
                            {mockTakeaways[activeChapterId] ? mockTakeaways[activeChapterId].map((takeaway, idx) => {
                                const t = idx * 15;
                                const isActive = currentTimeRaw >= t && currentTimeRaw < t + 15;
                                return (
                                    <li key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '10px 12px', borderRadius: '10px', border: isActive ? '1px solid rgba(34,211,238,0.3)' : '1px solid transparent', background: isActive ? 'rgba(34,211,238,0.06)' : 'transparent', cursor: 'pointer', transition: 'all 0.3s' }}
                                        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = rowHover; }}
                                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0, marginTop: '2px' }}>
                                            <Zap size={13} style={{ color: isActive ? '#22d3ee' : '#94a3b8' }} />
                                            <span style={{ fontSize: '9px', fontFamily: 'monospace', fontWeight: 700, padding: '2px 4px', borderRadius: '4px', background: isActive ? 'rgba(34,211,238,0.15)' : (dark ? 'rgba(255,255,255,0.08)' : '#f1f5f9'), color: isActive ? '#22d3ee' : textSec }}>
                                                {formatCurrentTime(t)}
                                            </span>
                                        </div>
                                        <span style={{ fontSize: '14px', lineHeight: 1.55, color: isActive ? textPri : (dark ? 'rgba(255,255,255,0.6)' : '#475569'), fontWeight: isActive ? 500 : 400 }}>
                                            {takeaway}
                                        </span>
                                    </li>
                                );
                            }) : (
                                <li style={{ color: textSec, fontStyle: 'italic', padding: '8px' }}>Notes are being generated for this video...</li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Mobile Backdrop */}
                <div className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity ${isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsDrawerOpen(false)} />

                {/* ── RIGHT PANEL — fully theme-aware ── */}
                <div
                    className={`fixed md:relative top-0 right-0 h-full md:h-[calc(100vh-10rem)] w-[85%] sm:w-[350px] md:w-auto flex flex-col shadow-2xl transition-transform duration-500 z-50 md:z-auto ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}
                    style={{ background: panel, border: `1px solid ${panelBorder}`, borderRadius: '14px', overflow: 'hidden' }}
                >
                    {/* Mobile close */}
                    <div style={{ display: 'none', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderBottom: `1px solid ${panelBorder}`, background: panelSub }}
                        className="!flex md:!hidden">
                        <span style={{ fontWeight: 700, color: textPri, fontSize: '15px' }}>Course Materials</span>
                        <button onClick={() => setIsDrawerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: textSec, padding: '4px' }}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', borderBottom: `1px solid ${panelBorder}`, background: panelSub }}>
                        {['curriculum', 'ask_ai'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} style={{
                                flex: 1, padding: '14px', fontSize: '12px', fontWeight: 700,
                                letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none',
                                cursor: 'pointer', background: 'transparent', position: 'relative',
                                color: activeTab === tab ? (tab === 'curriculum' ? '#22d3ee' : '#a855f7') : textSec,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                transition: 'color 0.2s',
                            }}>
                                {tab === 'ask_ai' && <BrainCircuit size={14} />}
                                {tab === 'curriculum' ? 'Curriculum' : 'Ask AI'}
                                {activeTab === tab && (
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: tab === 'curriculum' ? '#22d3ee' : '#a855f7', boxShadow: tab === 'curriculum' ? '0 0 8px rgba(34,211,238,0.5)' : '0 0 8px rgba(168,85,247,0.5)' }} />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div style={{ flex: 1, overflowY: 'auto', background: panel }}>

                        {activeTab === 'curriculum' && (
                            <div>
                                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${panelBorder}`, background: panelSub }}>
                                    <h4 style={{ fontWeight: 600, color: textPri, marginBottom: '4px', fontSize: '14px' }}>Course Content</h4>
                                    <p style={{ fontSize: '11px', color: textSec, fontFamily: 'monospace' }}>{mockChapters.length} Chapters • 51 min total</p>
                                </div>
                                {displayChapters.map((chapter, idx) => {
                                    const isActive = activeVideoId === chapter.id;
                                    return (
                                        <div key={idx} onClick={() => setActiveVideoId(chapter.id)} style={{
                                            padding: '14px 16px', borderBottom: `1px solid ${panelBorder}`, cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            borderLeft: isActive ? '3px solid #22d3ee' : '3px solid transparent',
                                            background: isActive ? 'rgba(34,211,238,0.06)' : 'transparent',
                                            transition: 'all 0.15s',
                                        }}
                                            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = rowHover; }}
                                            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                                                <div style={{ width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0, marginTop: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, border: isActive ? '1px solid rgba(34,211,238,0.4)' : `1px solid ${panelBorder}`, background: isActive ? 'rgba(34,211,238,0.1)' : (dark ? 'rgba(255,255,255,0.05)' : '#f8fafc'), color: isActive ? '#22d3ee' : textSec }}>
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '13px', fontWeight: isActive ? 600 : 500, color: isActive ? '#22d3ee' : textMid, marginBottom: '2px' }}>{chapter.title}</div>
                                                    <div style={{ fontSize: '11px', color: textSec, fontFamily: 'monospace' }}>{chapter.duration}</div>
                                                </div>
                                            </div>
                                            {isActive ? (
                                                <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '14px', marginLeft: '8px' }}>
                                                    {[0, 200, 400].map(delay => (
                                                        <div key={delay} style={{ width: '3px', background: '#22d3ee', borderRadius: '2px', animation: `bounce 1s infinite ${delay}ms` }} />
                                                    ))}
                                                </div>
                                            ) : (
                                                <Play size={13} style={{ color: textSec, marginLeft: '8px', flexShrink: 0 }} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {activeTab === 'ask_ai' && (
                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {chatMessages.map((msg, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                            <div style={{
                                                maxWidth: '85%', borderRadius: '14px', padding: '10px 14px', fontSize: '13px', lineHeight: 1.55,
                                                background: msg.role === 'user' ? msgUserBg : msgAiBg,
                                                border: msg.role === 'user' ? `1px solid ${panelBorder}` : '1px solid rgba(168,85,247,0.25)',
                                                color: inputColor,
                                                borderTopRightRadius: msg.role === 'user' ? '4px' : '14px',
                                                borderTopLeftRadius: msg.role === 'ai' ? '4px' : '14px',
                                            }}>
                                                {msg.role === 'ai' && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', paddingBottom: '6px', borderBottom: '1px solid rgba(168,85,247,0.2)' }}>
                                                        <BrainCircuit size={12} style={{ color: '#a855f7' }} />
                                                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#a855f7', letterSpacing: '0.08em', textTransform: 'uppercase' }}>LecturAI</span>
                                                    </div>
                                                )}
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ padding: '12px 14px', borderTop: `1px solid ${panelBorder}`, background: panelSub }}>
                                    <form onSubmit={handleSendMessage} style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                                        <input
                                            type="text" value={chatInput}
                                            onChange={e => setChatInput(e.target.value)}
                                            placeholder="Ask a doubt..."
                                            style={{ width: '100%', padding: '10px 44px 10px 16px', borderRadius: '9999px', border: `1px solid ${inputBorder}`, background: inputBg, fontSize: '13px', color: inputColor, outline: 'none', fontFamily: 'inherit' }}
                                        />
                                        <button type="submit" disabled={!chatInput.trim()} style={{ position: 'absolute', right: '6px', width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(168,85,247,0.3)', background: 'rgba(168,85,247,0.1)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: chatInput.trim() ? 'pointer' : 'not-allowed', opacity: chatInput.trim() ? 1 : 0.5, transition: 'all 0.2s' }}>
                                            <Send size={13} />
                                        </button>
                                    </form>
                                    <p style={{ textAlign: 'center', marginTop: '8px', fontSize: '10px', color: textSec }}>LecturAI can make mistakes. Verify important info.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile FAB */}
            <button onClick={() => setIsDrawerOpen(true)} className="md:hidden" style={{ position: 'fixed', bottom: '6rem', right: '1.5rem', zIndex: 30, width: '56px', height: '56px', borderRadius: '50%', background: '#22d3ee', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 5px 20px rgba(34,211,238,0.4)', cursor: 'pointer' }}>
                <Menu size={24} />
            </button>

            <style>{`@keyframes bounce { 0%, 100% { height: 4px; } 50% { height: 14px; } }`}</style>
        </div>
    );
}