import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Play, Pause, Volume2, Maximize, BrainCircuit, Download, Share2,
    Zap, Send, Sparkles, Headphones, Activity, Menu, X, ChevronRight
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAnonymousUser } from '../../hooks/useAnonymousUser';
import { getCurrentUser } from 'aws-amplify/auth';

export default function DashboardView() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isDarkMode } = useTheme();
    const dark = isDarkMode;
    const anonymousUserId = useAnonymousUser();

    // ── Theme tokens ──────────────────────────────────────────
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

    // ── State ─────────────────────────────────────────────────
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [realUserId, setRealUserId] = useState(null);
    const [isLowBandwidth, setIsLowBandwidth] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('curriculum');
    const [chatInput, setChatInput] = useState('');
    const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
    const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
    const [quizData, setQuizData] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showQuizResults, setShowQuizResults] = useState(false);
    const [quizError, setQuizError] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [chatMessages, setChatMessages] = useState([
        { role: 'ai', content: "Hi! I'm your AI companion. Do you have any questions about this lecture?" }
    ]);
    const videoRef = useRef(null);
    const pollRef = useRef(null);

    const API_BASE = 'https://0la9c5d8ve.execute-api.us-east-1.amazonaws.com';

    // ── Get logged-in user ────────────────────────────────────
    useEffect(() => {
        getCurrentUser()
            .then(user => {
                const id = user.username || user.userId;
                setRealUserId(id);
            })
            .catch(() => setRealUserId(anonymousUserId));
    }, [anonymousUserId]);

    // ── Fetch with 503 retry ──────────────────────────────────
    const fetchWithRetry = async (url, options = {}) => {
        const res = await fetch(url, options);
        if (res.status === 503) {
            await new Promise(r => setTimeout(r, 5000));
            return fetch(url, options);
        }
        return res;
    };

    // ── Fetch courses — polls every 60s, stops when all ready ─
    useEffect(() => {
        if (!realUserId) return;

        const fetchCourses = async () => {
            try {
                const res = await fetchWithRetry(`${API_BASE}/getCourses?userId=${realUserId}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                const list = data.courses || [];
                setCourses(list);
                setIsLoading(false);

                if (list.length > 0 && !selectedCourse) {
                    const sorted = [...list].sort((a, b) =>
                        new Date(b.createdAt) - new Date(a.createdAt)
                    );
                    setSelectedCourse(sorted[0]);
                }

                // Stop polling once all courses are in a terminal state
                const allDone = list.every(c =>
                    c.videoStatus?.includes('Video Ready') ||
                    c.videoStatus === 'Completed' ||
                    c.videoStatus?.startsWith('Error')
                );
                if (allDone && pollRef.current) {
                    clearInterval(pollRef.current);
                    pollRef.current = null;
                }
            } catch (err) {
                console.error('Failed to fetch courses:', err);
                setIsLoading(false);
            }
        };

        fetchCourses();
        // Poll every 60s to avoid exhausting 10-slot Lambda concurrency limit
        pollRef.current = setInterval(fetchCourses, 60000);
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [realUserId]);

    // Update selectedCourse when courses refresh
    useEffect(() => {
        if (selectedCourse && courses.length > 0) {
            const updated = courses.find(c => c.courseId === selectedCourse.courseId);
            if (updated) setSelectedCourse(updated);
        }
    }, [courses]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        const userMsg = chatInput;
        setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setChatInput('');

        try {
            const res = await fetchWithRetry(`${API_BASE}/askAI`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: userMsg,
                    curriculum: curriculum,
                    fileName: selectedCourse?.fileName || 'this course'
                })
            });
            const data = await res.json();
            if (data.answer) {
                setChatMessages(prev => [...prev, { role: 'ai', content: data.answer }]);
            } else {
                throw new Error("Invalid response");
            }
        } catch (err) {
            console.error('Ask AI error:', err);
            setChatMessages(prev => [...prev, { role: 'ai', content: 'Oops! I am having trouble connecting right now. Please try again later.' }]);
        }
    };

    const handleGenerateQuiz = async () => {
        setIsQuizModalOpen(true);
        setIsGeneratingQuiz(true);
        setQuizError(null);
        setQuizData([]);
        setCurrentQuestionIndex(0);
        setScore(0);
        setShowQuizResults(false);
        setSelectedOption(null);

        try {
            const res = await fetchWithRetry(`${API_BASE}/generateQuiz`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    curriculum: curriculum,
                    fileName: selectedCourse?.fileName || 'this course'
                })
            });
            const data = await res.json();
            if (data.questions && Array.isArray(data.questions)) {
                setQuizData(data.questions);
            } else {
                throw new Error("Invalid quiz data format from server");
            }
        } catch (err) {
            console.error("Generate quiz error:", err);
            setQuizError("Failed to generate quiz. Please try again.");
        } finally {
            setIsGeneratingQuiz(false);
        }
    };

    const handleQuizOptionSelect = (option) => {
        if (selectedOption !== null) return;
        setSelectedOption(option);

        setTimeout(() => {
            if (option === quizData[currentQuestionIndex].answer) {
                setScore(s => s + 1);
            }
            if (currentQuestionIndex < quizData.length - 1) {
                setCurrentQuestionIndex(i => i + 1);
                setSelectedOption(null);
            } else {
                setShowQuizResults(true);
            }
        }, 1500);
    };

    // ── Derived values from selected course ───────────────────
    const videoStatus = selectedCourse?.videoStatus || '';
    const videoUrl = selectedCourse?.videoUrl || null;
    const isVideoReady = videoStatus.includes('Video Ready') || videoStatus === 'Completed';
    const isError = videoStatus.startsWith('Error');

    // Parse curriculum from DynamoDB format
    const curriculum = selectedCourse?.curriculum?.map(item => {
        if (item?.M) {
            const title = item.M.lessonTitle?.S || item.M.lesson?.S || 'Lesson';
            const duration = item.M.duration?.S || '';
            const concepts = item.M.concepts?.L?.map(c => c.S).filter(Boolean) || [];
            return { title, duration, concepts };
        }
        if (item?.lessonTitle || item?.lesson) {
            return {
                title: item.lessonTitle || item.lesson,
                duration: item.duration || '',
                concepts: item.concepts || []
            };
        }
        return item;
    }) || [];

    const sortedCourses = [...courses].sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    );

    // ── Loading screen ────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#22d3ee] border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-600 dark:text-slate-400 font-medium animate-pulse">Loading your courses...</p>
                </div>
            </div>
        );
    }

    // ── Empty state ───────────────────────────────────────────
    if (courses.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center p-8">
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                        <Sparkles size={32} style={{ color: '#22d3ee' }} />
                    </div>
                    <h2 style={{ fontSize: 24, fontWeight: 700, color: textPri }}>No courses yet</h2>
                    <p style={{ color: textSec, maxWidth: 300 }}>Upload a PDF to generate your first AI-powered video course!</p>
                    <button onClick={() => navigate('/')} style={{ marginTop: 8, padding: '10px 24px', borderRadius: 9999, background: '#22d3ee', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 14 }}>
                        Upload a PDF
                    </button>
                </div>
            </div>
        );
    }

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

                    {/* Course Header */}
                    <div className="mb-[-8px]">
                        <div style={{ color: '#22d3ee', fontSize: '11px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px', marginLeft: '4px' }}>
                            AI Generated Course
                        </div>
                        <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, color: textPri }}>
                            {selectedCourse?.fileName?.replace('.pdf', '') || 'Your Course'}
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', marginLeft: '4px' }}>
                            <span style={{ padding: '3px 10px', borderRadius: '6px', background: isVideoReady ? 'rgba(34,211,238,0.1)' : (isError ? 'rgba(239,68,68,0.1)' : 'rgba(168,85,247,0.1)'), border: `1px solid ${isVideoReady ? 'rgba(34,211,238,0.3)' : (isError ? 'rgba(239,68,68,0.3)' : 'rgba(168,85,247,0.3)')}`, fontSize: '11px', fontWeight: 700, color: isVideoReady ? '#22d3ee' : (isError ? '#ef4444' : '#a855f7') }}>
                                {isVideoReady ? '✓ Video Ready' : isError ? '✗ Error' : '⟳ Processing...'}
                            </span>
                            <span style={{ fontSize: '12px', color: textSec }}>
                                {selectedCourse?.createdAt ? new Date(selectedCourse.createdAt).toLocaleDateString() : ''}
                            </span>
                        </div>
                    </div>

                    {/* Video Card */}
                    <div style={{ background: panel, border: `1px solid ${panelBorder}`, borderRadius: '16px', overflow: 'hidden', boxShadow: dark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <div style={{ aspectRatio: '16/9', background: '#0a0a0a', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {isError ? (
                                <div style={{ color: '#ef4444', textAlign: 'center', padding: '20px' }}>
                                    <p style={{ fontWeight: 700, marginBottom: '8px', fontSize: 16 }}>⚠ Video Generation Failed</p>
                                    <p style={{ fontSize: '12px', color: 'rgba(239,68,68,0.7)' }}>{videoStatus}</p>
                                </div>
                            ) : isVideoReady && videoUrl ? (
                                <video
                                    ref={videoRef}
                                    key={videoUrl}
                                    src={videoUrl}
                                    controls
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    onError={(e) => console.error('Video load error:', e)}
                                >
                                    Your browser does not support the HTML5 video tag.
                                </video>
                            ) : isVideoReady && !videoUrl ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: 20 }}>
                                    <div className="w-10 h-10 border-4 border-[#22d3ee] border-t-transparent rounded-full animate-spin" />
                                    <p style={{ color: '#22d3ee', fontWeight: 600 }}>Video ready, loading URL...</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: 20, textAlign: 'center' }}>
                                    <div className="w-12 h-12 border-4 border-[#a855f7] border-t-transparent rounded-full animate-spin" />
                                    <div style={{ color: 'white', fontWeight: 600 }}>
                                        {videoStatus || 'AI is generating your lecture...'}
                                    </div>
                                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                                        This usually takes 2–5 minutes. Page auto-refreshes.
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Bar */}
                        <div style={{ padding: '14px 16px', borderTop: `1px solid ${panelBorder}`, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', background: panelSub }}>
                            <button onClick={handleGenerateQuiz} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', borderRadius: '9999px', border: '1px solid rgba(168,85,247,0.4)', background: 'rgba(168,85,247,0.08)', color: '#a855f7', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
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

                    {/* My Courses list */}
                    {sortedCourses.length > 1 && (
                        <div style={{ background: panel, border: `1px solid ${panelBorder}`, borderRadius: '14px', padding: '1.25rem', boxShadow: dark ? '0 4px 20px rgba(0,0,0,0.25)' : '0 1px 4px rgba(0,0,0,0.04)' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 700, color: textPri, marginBottom: '12px' }}>My Courses</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {sortedCourses.map((course) => {
                                    const isSelected = course.courseId === selectedCourse?.courseId;
                                    const ready = course.videoStatus?.includes('Video Ready') || course.videoStatus === 'Completed';
                                    const err = course.videoStatus?.startsWith('Error');
                                    return (
                                        <div
                                            key={course.courseId}
                                            onClick={() => setSelectedCourse(course)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                                                borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
                                                border: isSelected ? '1px solid rgba(34,211,238,0.3)' : `1px solid ${panelBorder}`,
                                                background: isSelected ? 'rgba(34,211,238,0.06)' : (dark ? 'rgba(255,255,255,0.02)' : '#fafafa'),
                                            }}
                                            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = rowHover; }}
                                            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isSelected ? 'rgba(34,211,238,0.06)' : (dark ? 'rgba(255,255,255,0.02)' : '#fafafa'); }}
                                        >
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: ready ? '#22d3ee' : (err ? '#ef4444' : '#a855f7') }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: 13, fontWeight: isSelected ? 600 : 500, color: isSelected ? '#22d3ee' : textMid, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {course.fileName?.replace('.pdf', '') || course.courseId}
                                                </div>
                                                <div style={{ fontSize: 11, color: textSec, marginTop: 1 }}>
                                                    {course.videoStatus || 'Pending'}
                                                </div>
                                            </div>
                                            <ChevronRight size={14} style={{ color: textSec, flexShrink: 0 }} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile Backdrop */}
                <div className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity ${isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsDrawerOpen(false)} />

                {/* ── RIGHT PANEL ── */}
                <div
                    className={`fixed md:relative top-0 right-0 h-full md:h-[calc(100vh-10rem)] w-[85%] sm:w-[350px] md:w-auto flex flex-col shadow-2xl transition-transform duration-500 z-50 md:z-auto ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}
                    style={{ background: panel, border: `1px solid ${panelBorder}`, borderRadius: '14px', overflow: 'hidden' }}
                >
                    {/* Mobile close */}
                    <div style={{ display: 'none', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderBottom: `1px solid ${panelBorder}`, background: panelSub }}
                        className="!flex md:!hidden">
                        <span style={{ fontWeight: 700, color: textPri, fontSize: '15px' }}>Course Materials</span>
                        <button onClick={() => setIsDrawerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: textSec }}>
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
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: tab === 'curriculum' ? '#22d3ee' : '#a855f7' }} />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div style={{ flex: 1, overflowY: 'auto', background: panel }}>
                        {activeTab === 'curriculum' && (
                            <div>
                                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${panelBorder}`, background: panelSub }}>
                                    <h4 style={{ fontWeight: 600, color: textPri, marginBottom: '4px', fontSize: '14px' }}>Course Curriculum</h4>
                                    <p style={{ fontSize: '11px', color: textSec, fontFamily: 'monospace' }}>
                                        {curriculum.length} lessons
                                    </p>
                                </div>
                                {curriculum.length === 0 ? (
                                    <div style={{ padding: '20px', color: textSec, fontSize: 13, textAlign: 'center' }}>
                                        Curriculum is being generated...
                                    </div>
                                ) : curriculum.map((lesson, idx) => (
                                    <div key={idx} style={{ padding: '14px 16px', borderBottom: `1px solid ${panelBorder}`, transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = rowHover}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                            <div style={{ width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0, marginTop: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, border: `1px solid ${panelBorder}`, background: dark ? 'rgba(255,255,255,0.05)' : '#f8fafc', color: textSec }}>
                                                {idx + 1}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '13px', fontWeight: 600, color: textMid, marginBottom: '4px' }}>{lesson.title}</div>
                                                {lesson.duration && (
                                                    <div style={{ fontSize: '11px', color: textSec, fontFamily: 'monospace', marginBottom: '4px' }}>{lesson.duration}</div>
                                                )}
                                                {lesson.concepts?.length > 0 && (
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                                                        {lesson.concepts.slice(0, 3).map((concept, cIdx) => (
                                                            <span key={cIdx} style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '9999px', background: dark ? 'rgba(34,211,238,0.08)' : 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.2)', color: '#22d3ee', fontWeight: 500 }}>
                                                                {concept}
                                                            </span>
                                                        ))}
                                                        {lesson.concepts.length > 3 && (
                                                            <span style={{ fontSize: '10px', color: textSec }}>+{lesson.concepts.length - 3} more</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
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
                                        <button type="submit" disabled={!chatInput.trim()} style={{ position: 'absolute', right: '6px', width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(168,85,247,0.3)', background: 'rgba(168,85,247,0.1)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: chatInput.trim() ? 'pointer' : 'not-allowed', opacity: chatInput.trim() ? 1 : 0.5 }}>
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

            {/* Quiz Modal */}
            {isQuizModalOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }}>
                    <div style={{ background: panel, width: '90%', maxWidth: '500px', borderRadius: '16px', border: `1px solid ${panelBorder}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${panelBorder}`, background: panelSub, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <BrainCircuit size={18} style={{ color: '#a855f7' }} />
                                <h3 style={{ fontWeight: 700, color: textPri, fontSize: '16px' }}>AI Quiz</h3>
                            </div>
                            <button onClick={() => setIsQuizModalOpen(false)} style={{ background: 'none', border: 'none', color: textSec, cursor: 'pointer', padding: '4px' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ padding: '24px', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            {isGeneratingQuiz ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
                                    <div className="w-12 h-12 border-4 border-[#a855f7] border-t-transparent rounded-full animate-spin" />
                                    <div style={{ color: textPri, fontWeight: 600 }}>Claude is analyzing your curriculum...</div>
                                    <div style={{ color: textSec, fontSize: '13px' }}>Crafting tricky multiple choice questions!</div>
                                </div>
                            ) : quizError ? (
                                <div style={{ textAlign: 'center', color: '#ef4444' }}>
                                    <p style={{ fontWeight: 600 }}>{quizError}</p>
                                    <button onClick={handleGenerateQuiz} style={{ marginTop: '16px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #ef4444', background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer' }}>Try Again</button>
                                </div>
                            ) : showQuizResults ? (
                                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(168,85,247,0.1)', border: '2px solid #a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 800, color: '#a855f7', marginBottom: '8px' }}>
                                        {score}/{quizData.length}
                                    </div>
                                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: textPri }}>Quiz Completed!</h2>
                                    <p style={{ color: textSec, fontSize: '14px' }}>Great job reviewing your course material.</p>
                                    <button onClick={() => setIsQuizModalOpen(false)} style={{ marginTop: '20px', padding: '10px 24px', borderRadius: '9999px', background: '#a855f7', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer', width: '100%' }}>Return to Dashboard</button>
                                </div>
                            ) : quizData.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: textSec, fontWeight: 600 }}>
                                        <span>Question {currentQuestionIndex + 1} of {quizData.length}</span>
                                        <span>Score: {score}</span>
                                    </div>
                                    <p style={{ fontSize: '16px', color: textPri, fontWeight: 500, lineHeight: 1.5 }}>
                                        {quizData[currentQuestionIndex].question}
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {quizData[currentQuestionIndex].options.map((opt, idx) => {
                                            const isSelected = selectedOption === opt;
                                            const isCorrect = opt === quizData[currentQuestionIndex].answer;
                                            const showCorrect = selectedOption !== null && isCorrect;
                                            const showWrong = isSelected && !isCorrect;

                                            let bg = dark ? 'rgba(255,255,255,0.04)' : '#f8fafc';
                                            let brColor = panelBorder;
                                            if (showCorrect) { bg = 'rgba(34,197,94,0.1)'; brColor = '#22c55e'; }
                                            else if (showWrong) { bg = 'rgba(239,68,68,0.1)'; brColor = '#ef4444'; }
                                            else if (isSelected) { bg = 'rgba(168,85,247,0.1)'; brColor = '#a855f7'; }

                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleQuizOptionSelect(opt)}
                                                    disabled={selectedOption !== null}
                                                    style={{
                                                        padding: '12px 16px', borderRadius: '10px',
                                                        border: `1px solid ${brColor}`, background: bg,
                                                        color: textPri, fontSize: '14px', textAlign: 'left',
                                                        cursor: selectedOption !== null ? 'default' : 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {opt}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}