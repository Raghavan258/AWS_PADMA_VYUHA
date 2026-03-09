import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Zap, Lock, Play, ArrowLeft, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAnonymousUser } from '../../hooks/useAnonymousUser';
import { getCurrentUser } from 'aws-amplify/auth';

export default function CurriculumView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    const dark = isDarkMode;
    const anonymousUserId = useAnonymousUser();

    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [realUserId, setRealUserId] = useState(null);
    const [expandedChapter, setExpandedChapter] = useState(0);

    // ── Get logged-in user ────────────────────────────────────
    useEffect(() => {
        getCurrentUser()
            .then(user => setRealUserId(user.username || user.userId))
            .catch(() => setRealUserId(anonymousUserId));
    }, [anonymousUserId]);

    // ── Fetch courses ─────────────────────────────────────────
    useEffect(() => {
        if (!realUserId) return;

        const fetchCourses = async () => {
            try {
                const res = await fetch(`https://0la9c5d8ve.execute-api.us-east-1.amazonaws.com/getCourses?userId=${realUserId}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                const list = data.courses || [];
                setCourses(list);

                // If id param provided, find that course; otherwise pick most recent
                if (id) {
                    const found = list.find(c => c.courseId === id);
                    setSelectedCourse(found || list[0] || null);
                } else {
                    const sorted = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setSelectedCourse(sorted[0] || null);
                }
            } catch (err) {
                console.error('Failed to fetch courses:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourses();
    }, [realUserId, id]);

    // ── Parse curriculum from DynamoDB format ─────────────────
    const curriculum = selectedCourse?.curriculum?.map(item => {
        if (item?.M) {
            return {
                title: item.M.lessonTitle?.S || item.M.lesson?.S || 'Lesson',
                duration: item.M.duration?.S || '',
                concepts: item.M.concepts?.L?.map(c => c.S).filter(Boolean) || [],
            };
        }
        if (item?.lessonTitle || item?.lesson) {
            return {
                title: item.lessonTitle || item.lesson,
                duration: item.duration || '',
                concepts: item.concepts || [],
            };
        }
        return { title: 'Lesson', duration: '', concepts: [] };
    }) || [];

    const isVideoReady = selectedCourse?.videoStatus?.includes('Video Ready') || selectedCourse?.videoStatus === 'Completed';
    const isProcessing = !isVideoReady && !selectedCourse?.videoStatus?.startsWith('Error');

    // ── Loading ───────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#22d3ee] border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-600 dark:text-slate-400 font-medium animate-pulse">Loading curriculum...</p>
                </div>
            </div>
        );
    }

    // ── Empty ─────────────────────────────────────────────────
    if (!selectedCourse) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center p-8">
                    <Sparkles size={32} style={{ color: '#22d3ee' }} />
                    <h2 className="text-slate-900 dark:text-white font-bold text-xl">No courses found</h2>
                    <button onClick={() => navigate('/')} style={{ padding: '10px 24px', borderRadius: 9999, background: '#22d3ee', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                        Upload a PDF
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="px-6 md:px-12 pt-10 pb-32 min-h-screen bg-slate-50 dark:bg-[#0a0f1c] transition-colors duration-500" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

            {/* Breadcrumb */}
            <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 mb-6 text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white transition-colors"
                style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer' }}
            >
                <ArrowLeft size={14} /> Back to Dashboard
            </button>

            {/* Course selector if multiple courses */}
            {courses.length > 1 && (
                <div style={{ marginBottom: '24px' }}>
                    <select
                        value={selectedCourse?.courseId || ''}
                        onChange={e => {
                            const found = courses.find(c => c.courseId === e.target.value);
                            if (found) setSelectedCourse(found);
                        }}
                        style={{
                            padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                            border: '1px solid #e2e8f0', background: dark ? '#0f1623' : 'white',
                            color: dark ? '#f1f5f9' : '#0f172a', cursor: 'pointer', outline: 'none'
                        }}
                    >
                        {courses.map(c => (
                            <option key={c.courseId} value={c.courseId}>
                                {c.fileName?.replace('.pdf', '') || c.courseId}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Header */}
            <header className="flex items-center justify-between mb-10 pb-8 border-b border-gray-200 dark:border-white/10">
                <div className="flex-1 pr-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
                        {selectedCourse?.fileName?.replace('.pdf', '') || 'Your Course'}
                    </h1>
                    <p className="text-slate-500 dark:text-white/50 text-sm mt-1 mb-6">
                        {curriculum.length} Lessons •{' '}
                        <span style={{ color: isVideoReady ? '#0d9488' : '#a855f7' }}>
                            {isVideoReady ? 'Video Ready' : selectedCourse?.videoStatus || 'Processing...'}
                        </span>
                    </p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{
                            background: 'rgba(34,211,238,0.08)', color: '#0d9488',
                            fontSize: '11px', fontWeight: 700, padding: '8px 18px',
                            border: '1px solid rgba(34,211,238,0.4)', borderRadius: '9999px',
                            cursor: 'pointer', letterSpacing: '0.1em',
                            boxShadow: '0 0 12px rgba(34,211,238,0.15)', transition: 'all 0.2s',
                        }}
                        className="dark:!text-[#22d3ee]"
                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 22px rgba(34,211,238,0.4)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 12px rgba(34,211,238,0.15)'}
                    >
                        [ WATCH VIDEO ]
                    </button>
                </div>

                {/* Progress Ring */}
                <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
                    <svg style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                        <circle cx="40" cy="40" r="34" stroke="#e2e8f0" strokeWidth="6" fill="transparent" className="dark:!stroke-white/10" />
                        <circle cx="40" cy="40" r="34" stroke="#0d9488" strokeWidth="6" fill="transparent"
                            strokeDasharray={2 * Math.PI * 34}
                            strokeDashoffset={isVideoReady ? 0 : 2 * Math.PI * 34 * 0.7}
                            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                            className="dark:!stroke-[#22d3ee]"
                        />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0d9488' }} className="dark:!text-[#22d3ee]">
                            {isVideoReady ? '100%' : '30%'}
                        </span>
                    </div>
                </div>
            </header>

            {/* Curriculum */}
            <main>
                <h2 className="text-xs uppercase tracking-widest text-slate-400 dark:text-white/40 mb-4 pb-4 border-b border-gray-200 dark:border-white/10" style={{ letterSpacing: '3px' }}>
                    Course Contents
                </h2>

                {curriculum.length === 0 ? (
                    <div className="flex flex-col items-center gap-4 py-16 text-center">
                        <div className="w-10 h-10 border-4 border-[#a855f7] border-t-transparent rounded-full animate-spin" />
                        <p className="text-slate-500 dark:text-white/50">Curriculum is being generated...</p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {curriculum.map((lesson, index) => {
                            const isExpanded = expandedChapter === index;

                            return (
                                <div key={index} className="flex flex-col mb-3">
                                    {/* Lesson Card */}
                                    <div
                                        className="flex items-center justify-between px-5 py-4 rounded-xl border transition-all duration-200 cursor-pointer"
                                        style={{
                                            background: dark ? '#0f1623' : 'white',
                                            border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                        }}
                                        onClick={() => setExpandedChapter(isExpanded ? null : index)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span style={{
                                                fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em',
                                                padding: '3px 10px', borderRadius: '9999px',
                                                background: dark ? 'rgba(34,211,238,0.1)' : '#f1f5f9',
                                                color: dark ? '#22d3ee' : '#64748b',
                                            }}>
                                                {String(index + 1).padStart(2, '0')}
                                            </span>
                                            <h3 className="text-slate-900 dark:text-white font-semibold" style={{ fontSize: '15px' }}>
                                                {lesson.title}
                                            </h3>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {lesson.duration && (
                                                <span style={{ fontSize: '12px', color: dark ? 'rgba(255,255,255,0.4)' : '#94a3b8', fontFamily: 'monospace' }}>
                                                    {lesson.duration}
                                                </span>
                                            )}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(34,211,238,0.3)', background: 'rgba(34,211,238,0.08)' }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22d3ee' }} />
                                                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', color: '#22d3ee' }}>READY</span>
                                            </div>
                                            <span style={{ color: dark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>
                                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Expanded Concepts */}
                                    {isExpanded && lesson.concepts?.length > 0 && (
                                        <div style={{ marginTop: '4px', marginLeft: '1rem', paddingLeft: '1rem', borderLeft: `2px solid ${dark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}` }}>
                                            {lesson.concepts.map((concept, cIdx) => (
                                                <div
                                                    key={cIdx}
                                                    onClick={() => navigate('/dashboard')}
                                                    className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 border-b border-gray-100 dark:border-white/5 cursor-pointer transition-all"
                                                    style={{ borderRadius: '8px' }}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #22d3ee', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                            <Play size={13} style={{ color: '#22d3ee', fill: '#22d3ee', marginLeft: '2px' }} />
                                                        </div>
                                                        <span className="text-slate-700 dark:text-white font-medium text-sm">{concept}</span>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Watch full lesson */}
                                            <div
                                                onClick={() => navigate('/dashboard')}
                                                style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                    padding: '12px 16px', marginTop: '8px', borderRadius: '10px',
                                                    border: '1px solid rgba(168,85,247,0.2)', background: 'rgba(168,85,247,0.06)',
                                                    cursor: 'pointer', transition: 'all 0.2s',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 15px rgba(168,85,247,0.2)'}
                                                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <Zap size={18} style={{ color: '#a855f7', fill: '#a855f7' }} />
                                                    <span style={{ color: '#a855f7', fontWeight: 700 }}>Watch Full Lecture</span>
                                                </div>
                                                <span style={{ padding: '4px 10px', borderRadius: '9999px', border: '1px solid rgba(168,85,247,0.3)', background: 'rgba(168,85,247,0.1)', color: '#a855f7', fontSize: '11px', fontWeight: 700 }}>
                                                    {lesson.duration || 'Video'}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}