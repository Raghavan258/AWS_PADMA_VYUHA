import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Zap, Lock, Play, ArrowLeft } from 'lucide-react';

export default function CurriculumView() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Mock data matching the requested textbook structure.
    const textbookData = {
        title: id === '2' ? 'Advanced Engineering Mathematics' : 'Biology Grade 12',
        overallProgress: id === '2' ? 100 : 24,
        chapters: [
            {
                id: 1,
                title: "Chapter 1: The Chemistry of Life",
                status: "READY",
                videos: [
                    { id: 101, title: "1.1 · Intro to Cell Structure", duration: "4m 20s", completed: true },
                    { id: 102, title: "1.2 · Mitosis and Meiosis", duration: "5m 10s", completed: false }
                ]
            },
            {
                id: 2,
                title: "Chapter 2: Energy Transfer",
                status: "PROCESSING",
                videos: []
            },
            {
                id: 3,
                title: "Chapter 3: Genetics",
                status: "UNPROCESSED",
                videos: []
            },
            {
                id: 4,
                title: "Chapter 4: Evolution",
                status: "UNPROCESSED",
                videos: []
            }
        ]
    };

    const [expandedChapter, setExpandedChapter] = useState(textbookData.chapters[0].id);

    const toggleChapter = (chapterId) => {
        setExpandedChapter(expandedChapter === chapterId ? null : chapterId);
    };

    return (
        <div className="px-12 pt-10 pb-32 relative overflow-hidden min-h-screen bg-slate-50 dark:bg-[#0a0f1c] font-sans transition-colors duration-500" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            {/* Background Spotlights & Noise */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden mix-blend-multiply dark:mix-blend-normal">
                <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 600px 400px at 10% 20%, rgba(0,245,212,0.06), transparent)' }}></div>
                <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 600px 400px at 90% 80%, rgba(124,58,237,0.08), transparent)' }}></div>
            </div>

            {/* Top Navigation / Breadcrumb */}
            <div className="w-full mx-auto flex items-center mb-6 relative z-10 p-2">
                <button
                    onClick={() => navigate('/upload')}
                    className="flex items-center gap-2 text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white transition-colors text-[12px] uppercase tracking-[2px]"
                >
                    <ArrowLeft size={14} /> Curriculum
                </button>
            </div>

            {/* Header Flex Row */}
            <header className="w-full mx-auto flex items-center justify-between relative z-10 mb-10 pb-8 border-b border-gray-200 dark:border-white/[0.08] transition-colors duration-500">
                <div className="flex flex-col items-start pr-8">
                    <h1 className="text-[40px] font-[800] text-slate-900 dark:text-white leading-tight font-display tracking-tight transition-colors duration-500">
                        {textbookData.title}
                    </h1>
                    <p className="text-slate-500 dark:text-white/50 text-[14px] mt-1 font-medium mb-6 transition-colors duration-500">
                        {textbookData.chapters.length} Chapters • {textbookData.overallProgress}% Mastery
                    </p>
                    <button className="magnetic-btn-neon shadow-[0_0_20px_rgba(0,245,212,0.3)]">
                        [ RESUME LEARNING ]
                    </button>
                </div>

                {/* Compact Progress Ring */}
                <div className="relative flex items-center justify-center w-[80px] h-[80px] shrink-0 mt-2">
                    <svg className="transform -rotate-90 w-full h-full drop-shadow-[0_0_8px_rgba(0,245,212,0.4)]">
                        <circle cx="40" cy="40" r="34" stroke="#1f2937" strokeWidth="6" fill="transparent" />
                        <circle cx="40" cy="40" r="34" stroke="#00f5d4" strokeWidth="6" fill="transparent"
                            strokeDasharray={2 * Math.PI * 34}
                            strokeDashoffset={2 * Math.PI * 34 - (textbookData.overallProgress / 100) * 2 * Math.PI * 34}
                            className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(0,245,212,0.6)]"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[16px] font-bold text-[#00f5d4]">{textbookData.overallProgress}%</span>
                    </div>
                </div>
            </header>

            {/* Curriculum Accordion List */}
            <main className="w-full mx-auto relative z-10">
                <div className="mb-4">
                    <h2 className="text-[11px] uppercase tracking-[3px] text-slate-400 dark:text-white/50 mb-4 pb-4 border-b border-gray-200 dark:border-white/[0.08] transition-colors duration-500">
                        Course Contents
                    </h2>
                </div>

                <div className="flex flex-col">
                    {textbookData.chapters.map((chapter, index) => {
                        const isReady = chapter.status === 'READY';
                        const isProcessing = chapter.status === 'PROCESSING';
                        const isUnprocessed = chapter.status === 'UNPROCESSED';
                        const isExpanded = expandedChapter === chapter.id;

                        const cardBaseClass = "relative overflow-hidden transition-all duration-200 ease-in-out border rounded-xl hover:-translate-y-[2px] mb-[12px] shadow-sm dark:shadow-none";
                        const cardBg = isUnprocessed ? "bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.1] opacity-60 hover:border-gray-300 dark:hover:border-white/[0.16]" : "bg-white dark:bg-white/[0.04] border-gray-200 dark:border-white/[0.08] hover:border-gray-300 dark:hover:border-white/[0.16]";

                        return (
                            <div key={chapter.id} className="flex flex-col group">
                                {/* Chapter Main Card */}
                                <div
                                    className={`${cardBaseClass} ${cardBg} px-6 py-5 flex items-center justify-between cursor-pointer`}
                                    onClick={() => {
                                        if (isReady) toggleChapter(chapter.id);
                                    }}
                                >
                                    {/* Left Side */}
                                    <div className="flex items-center">
                                        <span className="text-[10px] font-bold tracking-wider px-3 py-1 bg-slate-100 dark:bg-black/40 text-slate-500 dark:text-white/50 rounded-full transition-colors duration-500">
                                            CH 0{index + 1}
                                        </span>
                                        <h3 className={`text-[17px] font-semibold text-slate-900 dark:text-white ml-3 transition-colors duration-500 ${isUnprocessed ? 'text-slate-400 dark:text-white/40' : ''}`}>
                                            {chapter.title}
                                        </h3>
                                    </div>

                                    {/* Right Side */}
                                    <div className="flex items-center gap-4">
                                        {isReady && (
                                            <div className="flex items-center gap-1.5 px-3 py-1 rounded border border-teal-500/30 dark:border-[#00f5d4]/30 bg-teal-50 dark:bg-[#00f5d4]/10">
                                                <div className="w-1.5 h-1.5 rounded-full bg-teal-600 dark:bg-[#00f5d4]"></div>
                                                <span className="text-teal-700 dark:text-[#00f5d4] text-[11px] font-bold uppercase tracking-[1.5px] transition-colors duration-500">READY</span>
                                            </div>
                                        )}
                                        {isProcessing && (
                                            <div className="flex flex-col items-end">
                                                <div className="px-3 py-1 rounded border border-purple-300 dark:border-[#7c3aed]/40 bg-purple-50 dark:bg-[#7c3aed]/15 mb-1 text-center">
                                                    <span className="text-purple-700 dark:text-[#a78bfa] text-[11px] font-bold uppercase tracking-[1.5px] animate-pulse transition-colors duration-500">PROCESSING</span>
                                                </div>
                                                <span className="text-purple-600 dark:text-[#a78bfa] text-[10px] font-mono whitespace-nowrap opacity-80 transition-colors duration-500">AI is cooking... 65%</span>
                                            </div>
                                        )}
                                        {isUnprocessed && (
                                            <>
                                                <div className="px-3 py-1 rounded border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] flex items-center gap-2 transition-colors duration-500">
                                                    <Lock size={12} className="text-slate-400 dark:text-white/40" />
                                                    <span className="text-slate-500 dark:text-white/40 text-[11px] font-bold uppercase tracking-[1.5px]">UNPROCESSED</span>
                                                </div>
                                                <button
                                                    className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-gradient-to-br from-[#00f5d4] to-[#7c3aed] shadow-[0_0_20px_rgba(0,245,212,0.3)] hover:scale-105 hover:shadow-[0_0_25px_rgba(0,245,212,0.5)] transition-all ml-2 border border-transparent"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Zap size={12} className="text-white fill-white" />
                                                    <span className="text-white text-[11px] font-[700] uppercase tracking-[2px]">GENERATE</span>
                                                </button>
                                            </>
                                        )}
                                        {isReady && (
                                            <div className="text-slate-400 dark:text-white/30 ml-2 hover:text-slate-900 dark:hover:text-white transition-colors">
                                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </div>
                                        )}
                                    </div>

                                    {/* Processing Progress Bar at Bottom of Card */}
                                    {isProcessing && (
                                        <div className="absolute bottom-0 left-0 w-full h-[3px] overflow-hidden rounded-b-xl">
                                            <div className="absolute inset-0 bg-white/10" />
                                            <div className="absolute h-full bg-gradient-to-r from-transparent via-[#7c3aed] to-[#00f5d4] w-[65%] shimmer-sweep shadow-[0_0_8px_#7c3aed]"></div>
                                        </div>
                                    )}
                                </div>

                                {/* Expanded Content */}
                                {isReady && (
                                    <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[800px] opacity-100 mb-4' : 'max-h-0 opacity-0 overflow-hidden mb-0'}`}>
                                        <div className="flex flex-col pl-4 border-l border-gray-200 dark:border-white/5 ml-4 mt-2 transition-colors duration-500">
                                            {chapter.videos.map((video) => (
                                                <div
                                                    key={video.id}
                                                    onClick={() => navigate('/dashboard', {
                                                        state: {
                                                            activeVideoId: video.id,
                                                            chapterTitle: chapter.title,
                                                            playlist: chapter.videos
                                                        }
                                                    })}
                                                    className="lecture-row flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-white/[0.06] hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all duration-200 cursor-pointer group"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-8 h-8 rounded-full border border-teal-200 dark:border-[#00f5d4] flex items-center justify-center shrink-0 group-hover:bg-teal-50 dark:group-hover:bg-[#00f5d4]/10 transition-colors shadow-sm dark:shadow-[0_0_10px_rgba(0,245,212,0.1)]">
                                                            <Play size={14} className="text-teal-600 dark:text-[#00f5d4] fill-teal-600 dark:fill-[#00f5d4] ml-0.5" />
                                                        </div>
                                                        <span className="text-slate-700 dark:text-white font-medium group-hover:text-teal-700 dark:group-hover:text-[#00f5d4] transition-colors">{video.title}</span>
                                                    </div>
                                                    <span className="text-slate-500 dark:text-white/50 font-mono text-[13px] tracking-wide transition-colors duration-500">{video.duration}</span>
                                                </div>
                                            ))}

                                            {/* Boss Quiz */}
                                            <div
                                                onClick={() => navigate('/quiz')}
                                                className="quiz-row flex items-center justify-between px-4 py-3 border border-[#f700ff]/20 bg-[#f700ff]/[0.06] rounded-lg mt-2 cursor-pointer hover:shadow-[0_0_15px_rgba(247,0,255,0.2)] transition-all duration-200 group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Zap size={18} className="text-[#f700ff] fill-[#f700ff]" />
                                                    <span className="text-[#f700ff] font-bold group-hover:drop-shadow-[0_0_8px_rgba(247,0,255,0.6)]">Boss-Level Quiz</span>
                                                </div>
                                                <div className="px-3 py-1 rounded-full border border-[#f700ff]/30 bg-[#f700ff]/10">
                                                    <span className="text-[#f700ff] text-[11px] font-bold">3 Questions</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </main>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400..800&display=swap');

                .font-display {
                    font-family: 'Syne', sans-serif;
                }

                .magnetic-btn-neon {
                    background: rgba(0, 245, 212, 0.05);
                color: #00f5d4;
                font-size: 11px;
                font-weight: 700;
                padding: 8px 16px;
                border: 1px solid rgba(0, 245, 212, 0.4);
                border-radius: 9999px;
                cursor: pointer;
                box-shadow: 0 0 15px rgba(0, 245, 212, 0.2);
                transition: all 0.3s ease;
                letter-spacing: 0.1em;
                }
                .magnetic-btn-neon:hover {
                    background: rgba(0, 245, 212, 0.15);
                box-shadow: 0 0 25px rgba(0, 245, 212, 0.5);
                transform: translateY(-2px);
                }

                .lecture-row:hover {
                    transform: translateX(4px);
                }

                @keyframes shimmerSweep {
                    0% { transform: translateX(-100%); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateX(200%); opacity: 0; }
                }
                .shimmer-sweep {
                    position: relative;
                    overflow: hidden;
                }
                .shimmer-sweep::after {
                    content: '';
                position: absolute;
                top: 0;
                right: 0;
                bottom: 0;
                left: 0;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
                animation: shimmerSweep 2.5s infinite;
                }
            `}</style>
        </div>
    );
}
