import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Timer, ArrowRight, ArrowLeft, Award, RefreshCcw } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { mockQuestions } from '../../lib/mockData';

export default function QuizView() {
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    const [quizData, setQuizData] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isAnswerChecked, setIsAnswerChecked] = useState(false);
    const [userAnswers, setUserAnswers] = useState([]);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('YOUR_QUIZ_API_URL')
            .then(res => res.json())
            .then(data => {
                setQuizData(data || []);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch quiz data:', err);
                setIsLoading(false);
            });
    }, []);

    const [isReviewMode, setIsReviewMode] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300);

    useEffect(() => {
        if (timeLeft > 0 && !isFinished) {
            const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft <= 0) {
            setIsFinished(true);
        }
    }, [timeLeft, isFinished]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleSelect = (idx) => { if (!isAnswerChecked) setSelectedAnswer(idx); };

    const handleSubmit = () => {
        if (!isAnswerChecked) {
            const isCorrect = selectedAnswer === quizData[currentQuestionIndex].correctAnswer;
            if (isCorrect) setScore(prev => prev + 1);
            setUserAnswers(prev => [...prev, { questionIdx: currentQuestionIndex, selectedIdx: selectedAnswer, isCorrect }]);
            setIsAnswerChecked(true);
        } else {
            if (currentQuestionIndex < quizData.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setSelectedAnswer(null);
                setIsAnswerChecked(false);
            } else {
                setIsFinished(true);
            }
        }
    };

    const handleSkip = () => {
        setUserAnswers(prev => [...prev, { questionIdx: currentQuestionIndex, selectedIdx: null, isCorrect: false }]);
        if (currentQuestionIndex < quizData.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsAnswerChecked(false);
        } else {
            setIsFinished(true);
        }
    };

    // ---- RESULTS SCREEN ----
    if (isFinished) {
        if (isReviewMode) {
            return (
                <div className="max-w-[800px] mx-auto px-4 py-12 min-h-screen bg-slate-50 dark:bg-transparent transition-colors duration-500">
                    <button
                        onClick={() => setIsReviewMode(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}
                        className="dark:!bg-white/5 dark:!border-white/10 dark:!text-white/70"
                    >
                        <ArrowLeft size={16} /> Back to Results
                    </button>

                    <h2 className="text-3xl font-bold mb-8 text-slate-900 dark:text-white">Review Answers</h2>

                    <div className="flex flex-col gap-6">
                        {userAnswers.map((ua, index) => {
                            const q = quizData[ua.questionIdx];
                            return (
                                <div key={index} style={{ padding: '1.5rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }} className="dark:!bg-white/5 dark:!border-white/10">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Question {index + 1}</span>
                                        <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', background: ua.isCorrect ? '#dcfce7' : '#fee2e2', color: ua.isCorrect ? '#166534' : '#991b1b' }}>
                                            {ua.isCorrect ? 'Correct' : 'Incorrect'}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{q.questionText}</h3>
                                    <div className="flex flex-col gap-2">
                                        {q.options.map((opt, oIdx) => {
                                            const isUserPick = ua.selectedIdx === oIdx;
                                            const isActualCorrect = q.correctAnswer === oIdx;

                                            // Dynamic Styling mapped to Light/Dark Mode
                                            let bgClass = isDarkMode ? 'bg-transparent border-slate-700' : 'bg-slate-50 border-slate-200';
                                            let textClass = isDarkMode ? 'text-slate-400' : 'text-slate-600';
                                            let dotBorderClass = isDarkMode ? 'border-slate-600' : 'border-slate-300';
                                            let dotBgClass = 'bg-transparent';
                                            let dotInnerClass = 'bg-transparent';

                                            if (isActualCorrect) {
                                                // The inherently correct answer
                                                bgClass = isDarkMode ? 'bg-green-500/10 border-green-500' : 'bg-green-50 border-green-300';
                                                textClass = isDarkMode ? 'text-green-400 font-semibold' : 'text-green-800 font-semibold';
                                                dotBorderClass = isDarkMode ? 'border-green-400' : 'border-green-500';
                                                dotBgClass = isDarkMode ? 'bg-green-400/20' : 'bg-green-500';
                                                dotInnerClass = isDarkMode ? 'bg-green-400' : 'bg-white';
                                            } else if (isUserPick && !isActualCorrect) {
                                                // What the user got wrong
                                                bgClass = isDarkMode ? 'bg-red-500/10 border-red-500/50' : 'bg-red-50 border-red-300';
                                                textClass = isDarkMode ? 'text-red-400' : 'text-red-800';
                                                dotBorderClass = isDarkMode ? 'border-red-400' : 'border-red-400';
                                                dotBgClass = isDarkMode ? 'bg-red-400/20' : 'bg-red-500';
                                                dotInnerClass = isDarkMode ? 'bg-red-400' : 'bg-white';
                                            }

                                            return (
                                                <div key={oIdx} className={`px-4 py-3 rounded-[10px] border flex items-center gap-[10px] ${bgClass}`}>
                                                    <div className={`w-[18px] h-[18px] rounded-full border-2 shrink-0 flex items-center justify-center ${dotBorderClass} ${dotBgClass}`}>
                                                        {(isActualCorrect || isUserPick) && <div className={`w-[6px] h-[6px] rounded-full ${dotInnerClass}`} />}
                                                    </div>
                                                    <span className={`text-[14px] ${textClass}`}>{opt}</span>
                                                </div>

                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-slate-50 dark:bg-transparent transition-colors duration-500">
                <div style={{ width: '100%', maxWidth: '480px', padding: '3rem', textAlign: 'center', background: 'white', border: '1px solid #e2e8f0', borderRadius: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }} className="dark:!bg-white/5 dark:!border-white/10">
                    <Award size={64} style={{ color: '#0f172a', margin: '0 auto 1.5rem' }} className="dark:!text-white" />
                    <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Quiz Results</h2>
                    <p className="text-slate-500 dark:text-gray-400 mb-8 text-lg">You scored {score} out of {quizData.length}</p>
                    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem', border: '1px solid #e2e8f0' }} className="dark:!bg-black/20 dark:!border-white/5">
                        <div className="text-5xl font-extrabold text-slate-900 dark:text-white">{quizData.length > 0 ? Math.round((score / quizData.length) * 100) : 0}%</div>
                        <div className="text-slate-500 dark:text-white/50 text-sm font-medium uppercase tracking-widest mt-2">Final Score</div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {[
                            { label: 'Retake Quiz', onClick: () => { setCurrentQuestionIndex(0); setSelectedAnswer(null); setScore(0); setTimeLeft(300); setIsFinished(false); setUserAnswers([]); } },
                            { label: 'Review Answers', onClick: () => setIsReviewMode(true) },
                            { label: 'Return to Video', onClick: () => navigate('/dashboard') },
                        ].map(btn => (
                            <button key={btn.label} onClick={btn.onClick} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '9999px', fontWeight: 600, border: '1px solid #e2e8f0', background: 'white', color: '#334155', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s' }}
                                className="dark:!bg-white/10 dark:!border-white/10 dark:!text-white"
                                onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                                onMouseLeave={e => e.currentTarget.style.background = 'white'}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ---- LOADING AND EMPTY STATES ----
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0a0f1c] transition-colors duration-500">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!quizData || quizData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50 dark:bg-[#0a0f1c] transition-colors duration-500">
                <div className="w-full max-w-[500px] text-center bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-8 shadow-sm">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Award size={32} className="text-slate-400 dark:text-slate-300" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">No Quiz Generated Yet.</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                        Return to the video player and click Generate Quiz to test your knowledge.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-[14px] transition-all duration-300 bg-slate-900 text-white hover:-translate-y-1 shadow-[0_4px_15px_rgba(0,0,0,0.1)] dark:bg-white dark:text-slate-900"
                    >
                        <ArrowLeft size={16} />
                        Back to Video
                    </button>
                </div>
            </div>
        );
    }

    // ---- QUIZ SCREEN ----
    const question = quizData[currentQuestionIndex];

    return (
        <div className="w-full h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-[800px] bg-white dark:bg-transparent transition-colors duration-500">
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}
                        className="dark:!bg-white/5 dark:!border-white/10 dark:!text-white/70"
                    >
                        <ArrowLeft size={16} /> Back to Video
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: 600 }} className="dark:!text-gray-300">
                        <Timer size={20} style={{ color: '#94a3b8' }} />
                        <span style={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>{formatTime(timeLeft)}</span>
                    </div>
                </div>

                {/* Card */}
                <div style={{ padding: '2.5rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', marginBottom: '3rem' }} className="dark:!bg-white/5 dark:!border-white/10">

                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
                        Question {currentQuestionIndex + 1} of {quizData.length}
                    </div>

                    <h2 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white leading-relaxed">
                        {question.questionText}
                    </h2>

                    {question.options.map((option, idx) => {
                        const isSelected = selectedAnswer === idx;
                        const isCorrectOption = idx === question.correctAnswer;
                        const showCorrect = isAnswerChecked && isCorrectOption;
                        const showIncorrect = isAnswerChecked && isSelected && !isCorrectOption;

                        let bgClass = isDarkMode ? 'bg-transparent border-slate-700' : 'bg-white border-slate-200';
                        let hoverClass = isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50';
                        let textClass = isDarkMode ? 'text-slate-300' : 'text-slate-700';
                        let dotBorderClass = isDarkMode ? 'border-slate-500' : 'border-slate-300';
                        let dotBgClass = 'bg-transparent';

                        if (showCorrect) {
                            bgClass = isDarkMode ? 'bg-green-500/10 border-green-500/50' : 'bg-green-50 border-green-500';
                            textClass = isDarkMode ? 'text-green-400 font-medium' : 'text-green-800 font-medium';
                            dotBgClass = 'bg-green-500';
                            dotBorderClass = 'border-green-500';
                            hoverClass = '';
                        } else if (showIncorrect) {
                            bgClass = isDarkMode ? 'bg-red-500/10 border-red-500/50' : 'bg-red-50 border-red-500';
                            textClass = isDarkMode ? 'text-red-400 font-medium' : 'text-red-800 font-medium';
                            dotBgClass = 'bg-red-500';
                            dotBorderClass = 'border-red-500';
                            hoverClass = '';
                        } else if (isSelected && !isAnswerChecked) {
                            bgClass = isDarkMode ? 'bg-indigo-900/30 border-indigo-500' : 'bg-indigo-50 border-indigo-500';
                            textClass = isDarkMode ? 'text-white' : 'text-indigo-900';
                            dotBorderClass = isDarkMode ? 'border-indigo-400' : 'border-indigo-600';
                            hoverClass = '';
                        } else if (isAnswerChecked) {
                            bgClass = isDarkMode ? 'bg-transparent border-slate-800' : 'bg-slate-50 border-slate-200';
                            textClass = isDarkMode ? 'text-slate-600' : 'text-slate-400';
                            hoverClass = '';
                        }

                        return (
                            <div
                                key={idx}
                                onClick={() => handleSelect(idx)}
                                className={`p-4 rounded-xl border-2 flex items-center gap-4 transition-all duration-200 ${isAnswerChecked ? 'cursor-default' : `cursor-pointer ${hoverClass}`} ${isAnswerChecked && !isSelected && !isCorrectOption ? 'opacity-60' : 'opacity-100'} ${bgClass}`}
                            >
                                <div className={`w-[22px] h-[22px] rounded-full border-2 shrink-0 flex items-center justify-center transition-colors duration-200 ${dotBorderClass} ${dotBgClass}`}>
                                    {isSelected && !isAnswerChecked && <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-indigo-400' : 'bg-indigo-600'}`} />}
                                    {(showCorrect || showIncorrect) && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                                <span className={`text-[15px] leading-relaxed transition-colors duration-200 ${textClass} ${isSelected || showCorrect ? 'font-semibold' : 'font-normal'}`}>{option}</span>
                            </div>
                        );
                    })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem', marginTop: '1.5rem' }} className="dark:!border-white/10">
                    {!isAnswerChecked && (
                        <button onClick={handleSkip} style={{ padding: '10px 20px', borderRadius: '9999px', border: 'none', background: 'transparent', color: '#94a3b8', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>
                            Skip Question
                        </button>
                    )}
                    {isAnswerChecked && <div />}
                    <button
                        onClick={handleSubmit}
                        disabled={selectedAnswer === null}
                        className={`flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-[15px] transition-all duration-300 ${selectedAnswer === null ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-1 shadow-[0_4px_15px_rgba(0,0,0,0.1)]'
                            }`}
                        style={{
                            background: selectedAnswer === null ? (isDarkMode ? '#334155' : '#e2e8f0') : (isDarkMode ? '#ffffff' : '#0f172a'),
                            color: selectedAnswer === null ? (isDarkMode ? '#64748b' : '#94a3b8') : (isDarkMode ? '#0f172a' : '#ffffff')
                        }}
                    >
                        {!isAnswerChecked ? 'Check Answer' : currentQuestionIndex === quizData.length - 1 ? 'Finish Quiz' : 'Next Question'}
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}