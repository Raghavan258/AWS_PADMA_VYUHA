import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Play, Pause, Volume2, Maximize, BrainCircuit, Download, Share2,
    Zap, Send, Sparkles, Headphones, Activity, Menu, X, Subtitles
} from 'lucide-react';
import { mockChapters, mockTakeaways } from '../../lib/mockData';
import { useTheme } from '../../contexts/ThemeContext';
import { useAnonymousUser } from '../../hooks/useAnonymousUser';

export default function DashboardView() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isDarkMode } = useTheme();
    const dark = isDarkMode;
    const anonymousUserId = useAnonymousUser();

    const [courseData, setCourseData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!anonymousUserId) return;

        const API_URL = 'https://0la9c5d8ve.execute-api.us-east-1.amazonaws.com/getCourses';

        // Create a dedicated fetch function
        const fetchCourses = () => {
            fetch(`${API_URL}?userId=${anonymousUserId}`)
                .then(res => res.json())
                .then(data => {
                    setCourseData(data.courses || data || []);
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error('Failed to fetch filtered course data:', err);
                    setIsLoading(false);
                });
        };

        // 1. Fetch immediately on load
        fetchCourses();

        // 2. Poll every 10 seconds to check for video completion
        const intervalId = setInterval(fetchCourses, 10000);

        // 3. Cleanup interval on unmount
        return () => clearInterval(intervalId);
    }, [anonymousUserId]);

    const videoData = location.state || {};

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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] flex items-center justify-center transition-colors duration-500">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#22d3ee] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium animate-pulse">Loading course content...</p>
                </div>
            </div>
        );
    }

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
                            {courseData?.title || 'Loading...'}
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', marginLeft: '4px' }}>
                            <span style={{ padding: '4px 10px', borderRadius: '6px', background: dark ? 'rgba(255,255,255,0.08)' : 'white', border: `1px solid ${panelBorder}`, fontSize: '12px', fontFamily: 'monospace', color: textMid }}>
                                {courseData?.currentVideoDuration || '0:00'}
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
                            <div style={{ aspectRatio: '16/9', background: '#0a0a0a', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }} className="group">

                                {/* 1. CHECK STATUS: Did it fail? */}
                                {courseData?.[0]?.videoStatus?.startsWith('Error') ? (
                                    <div style={{ color: '#ef4444', textAlign: 'center', padding: '20px' }}>
                                        <p style={{ fontWeight: 700, marginBottom: '8px' }}>Video Generation Failed</p>
                                        <p style={{ fontSize: '12px' }}>{courseData?.[0]?.videoStatus}</p>
                                    </div>

                                    /* 2. CHECK STATUS: Is it fully complete? (Video Ready or Completed) */
                                ) : (courseData?.[0]?.videoStatus?.includes('Ready') || courseData?.[0]?.videoStatus === 'Completed') ? (
                                    <video
                                        // Uses the URL we predicted and saved to DynamoDB!
                                        src={courseData?.[0]?.videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4"}
                                        controls
                                        autoPlay
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    >
                                        Your browser does not support the HTML5 video tag.
                                    </video>

                                    /* 3. DEFAULT: If it's not Error and not Ready, it must still be processing! */
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                                        <div className="w-12 h-12 border-4 border-[#a855f7] border-t-transparent rounded-full animate-spin"></div>
                                        <div style={{ color: 'white', fontWeight: 600, animation: 'pulse 2s infinite' }}>
                                            {courseData?.[0]?.videoStatus || 'AI is generating your lecture...'}
                                        </div>
                                    </div>
                                )}

                                {/* Keep your CC and Action Bar overlays here if you want them floating over the video */}
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
                            {courseData?.smartNotes ? courseData.smartNotes.map((note, idx) => {
                                const t = note.time || idx * 15;
                                const takeawayText = note.text || note;
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
                                            {takeawayText}
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
                                    <p style={{ fontSize: '11px', color: textSec, fontFamily: 'monospace' }}>{courseData?.totalChapters || 0} Chapters • {courseData?.totalDuration || 0} min total</p>
                                </div>
                                {courseData?.chapters?.map((chapter, idx) => {
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