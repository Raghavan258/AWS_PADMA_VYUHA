import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Check, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const CATEGORIES = [
    { title: "CENTRAL BOARDS", items: ["CBSE (Class 10 & 12)", "CISCE (ICSE/ISC)", "NIOS"] },
    { title: "STATE BOARDS", items: ["AP State Board (BIEAP)", "Telangana Board (BIE)", "UP Board (UPMSP)", "Maharashtra Board (MSBSHSE)", "Karnataka Board (KSEEB)"] },
    { title: "ENGINEERING ENTRANCE", items: ["JEE Main", "JEE Advanced", "BITSAT", "AP EAPCET", "TS EAMCET", "MHT CET", "KCET", "VITEEE"] },
    { title: "MEDICAL ENTRANCE", items: ["NEET-UG", "AIIMS", "JIPMER"] },
    { title: "CIVIL SERVICES & GOVT", items: ["UPSC CSE (IAS/IPS)", "SSC CGL", "RRB NTPC", "IBPS PO", "NDA"] },
    { title: "POST-GRAD & HIGHER ED", items: ["GATE", "CAT", "XAT", "CLAT"] },
    { title: "UNIVERSITY & SEMESTER EXAMS", items: ["B.Tech Semester Exams (e.g., KL University, JNTU)", "B.Sc / BCA", "Medical Prof. (MBBS)", "Artificial Intelligence & Data Science (AI & DS)", "Computer Science", "Electronics & Communication"] }
];

export default function GoalSelectionView() {
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGoal, setSelectedGoal] = useState(null);

    const handleContinue = () => {
        if (selectedGoal) {
            localStorage.setItem('hasSelectedStream', 'true');
            localStorage.setItem('selectedGoals', JSON.stringify([selectedGoal]));
            navigate('/upload');
        }
    };

    const filteredCategories = CATEGORIES.map(category => ({
        ...category,
        items: category.items.filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
    })).filter(category => category.items.length > 0);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] text-slate-900 dark:text-white transition-colors duration-500 pb-32">

            {/* Sticky Header */}
            <div className="sticky top-0 z-40 bg-slate-50/90 dark:bg-[#0a0f1c]/90 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 pt-16 pb-6 px-6">
                <div className="max-w-4xl mx-auto flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-bold tracking-widest uppercase" style={{ color: '#22d3ee' }}>
                        <Sparkles size={14} className="animate-pulse" /> Onboarding
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-center tracking-tight mb-4 text-slate-900 dark:text-white">What are you preparing for?</h1>
                    <p className="text-slate-500 dark:text-gray-400 text-center mb-8 max-w-xl text-sm md:text-base">
                        Select your primary goal so we can tailor your AI lectures and curriculum to exactly what you need.
                    </p>
                    <div className="relative w-full max-w-2xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500" size={20} />
                        <input
                            type="text"
                            placeholder="Search exams, boards, or subjects..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/20 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-500 focus:ring-1 focus:ring-cyan-400 transition-all shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Grid Content */}
            <div className="max-w-4xl mx-auto px-6 pt-12">
                {filteredCategories.length === 0 ? (
                    <div className="text-center py-20 text-slate-500 dark:text-gray-500">
                        No matches found for "{searchQuery}".
                    </div>
                ) : (
                    <div className="flex flex-col gap-12">
                        {filteredCategories.map((category, idx) => (
                            <div key={idx}>
                                <h2 className="text-sm font-bold text-slate-400 dark:text-gray-500 mb-4 tracking-widest uppercase ml-1">
                                    {category.title}
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {category.items.map((item, itemIdx) => {
                                        const isSelected = selectedGoal === item;
                                        return (
                                            <div
                                                key={itemIdx}
                                                onClick={() => setSelectedGoal(item)}
                                                className="relative p-5 rounded-2xl cursor-pointer transition-all duration-200 flex items-center justify-between overflow-hidden"
                                                style={{
                                                    border: isSelected ? (isDarkMode ? '2px solid #22d3ee' : '2px solid #0891b2') : (isDarkMode ? '2px solid rgba(255,255,255,0.1)' : '2px solid #e2e8f0'),
                                                    background: isSelected ? (isDarkMode ? 'rgba(34,211,238,0.1)' : 'rgba(8,145,178,0.05)') : (isDarkMode ? 'rgba(255,255,255,0.05)' : 'white'),
                                                    boxShadow: isSelected ? '0 0 15px rgba(34,211,238,0.2)' : (isDarkMode ? 'none' : '0 1px 3px rgba(0,0,0,0.06)'),
                                                }}
                                            >
                                                <span style={{
                                                    fontWeight: '600',
                                                    color: isSelected ? (isDarkMode ? '#22d3ee' : '#0891b2') : (isDarkMode ? '#e2e8f0' : '#334155'),
                                                    fontSize: '0.9rem',
                                                }}>
                                                    {item}
                                                </span>
                                                {isSelected && (
                                                    <div style={{
                                                        width: '1.5rem', height: '1.5rem', borderRadius: '50%',
                                                        background: '#22d3ee', display: 'flex', alignItems: 'center',
                                                        justifyContent: 'center', flexShrink: 0, marginLeft: '0.5rem',
                                                    }}>
                                                        <Check size={14} color="white" strokeWidth={3} />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Sticky Footer CTA */}
            <div
                className="fixed bottom-0 left-0 w-full z-50 transition-all duration-300"
                style={{ background: selectedGoal ? (isDarkMode ? '#4338ca' : '#4f46e5') : (isDarkMode ? '#0f172a' : '#e2e8f0'), borderTop: isDarkMode && !selectedGoal ? '1px solid rgba(255,255,255,0.1)' : 'none' }}
            >
                <div className="max-w-4xl mx-auto px-6 py-4 md:py-5 flex items-center justify-between">
                    <span className="hidden sm:block font-bold text-base" style={{ color: selectedGoal ? '#e0e7ff' : (isDarkMode ? '#94a3b8' : '#64748b') }}>
                        {selectedGoal ? `Goal: ${selectedGoal}` : 'Select a goal to proceed'}
                    </span>
                    <button
                        onClick={handleContinue}
                        disabled={!selectedGoal}
                        className={`flex items-center gap-3 w-full sm:w-auto justify-center rounded-xl py-4 px-8 font-black text-lg md:text-xl tracking-wide transition-all duration-300 ${!selectedGoal ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-xl cursor-pointer'}`}
                        style={{
                            background: !selectedGoal ? (isDarkMode ? '#334155' : '#cbd5e1') : 'white',
                            color: !selectedGoal ? (isDarkMode ? '#64748b' : '#64748b') : (isDarkMode ? '#3730a3' : '#4338ca')
                        }}
                    >
                        Continue to Dashboard <ChevronRight size={22} />
                    </button>
                </div>
            </div>
        </div>
    );
}