import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, FileText, Layout, Video, Mic, Film } from 'lucide-react';

const STEPS = [
    { id: 1, label: 'Extracting Text (Amazon Textract)', icon: FileText, duration: 25 },
    { id: 2, label: 'Synthesizing Knowledge (Claude 3.5)', icon: Layout, duration: 50 },
    { id: 3, label: 'Generating Visuals', icon: Video, duration: 75 },
    { id: 4, label: 'Rendering Native Audio', icon: Mic, duration: 100 }
];

export default function ProcessingModal({ isOpen, onComplete }) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!isOpen) {
            setProgress(0);
            return;
        }

        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer);
                    setTimeout(() => onComplete(), 600);
                    return 100;
                }
                return prev + 1;
            });
        }, 60); // approx 6 seconds total

        return () => clearInterval(timer);
    }, [isOpen, onComplete]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-all duration-300">
            <div className="w-full max-w-[500px] p-8 md:p-10 bg-white/90 dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/20 dark:text-white shadow-2xl dark:shadow-[0_0_50px_rgba(34,211,238,0.1)] rounded-3xl transform transition-all scale-100">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-6 relative">
                        <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full"></div>
                        <Loader2 size={48} className="animate-spin text-cyan-500 dark:text-cyan-400 relative z-10" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-purple-500">
                        Initializing the Magic
                    </h2>
                    <p className="text-slate-500 dark:text-gray-400 text-sm">
                        Please wait while AI processes your document... {progress}%
                    </p>
                </div>

                {/* Vertical Stepper */}
                <div className="flex flex-col gap-6 relative">
                    {/* Progress Line Background */}
                    <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-slate-200 dark:bg-white/10"></div>

                    {/* Active Progress Line */}
                    <div
                        className="absolute left-[19px] top-6 w-0.5 bg-gradient-to-b from-cyan-400 to-purple-500 transition-all duration-300 ease-linear shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                        style={{ height: `max(0%, calc(${progress}% - 24px))` }}
                    ></div>

                    {STEPS.map((step, idx) => {
                        const isCompleted = progress >= step.duration;
                        const isActive = progress >= (idx === 0 ? 0 : STEPS[idx - 1].duration) && progress < step.duration;
                        const StepIcon = step.icon;

                        return (
                            <div
                                key={step.id}
                                className={`flex items-start gap-5 relative z-10 transition-all duration-300 ${isActive || isCompleted ? 'opacity-100 transform translate-x-2' : 'opacity-40'}`}
                            >
                                <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500
                ${isCompleted ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' :
                                        isActive ? 'bg-white dark:bg-slate-800 border-2 border-cyan-400 text-cyan-500 dark:text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)] animate-pulse' :
                                            'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-gray-600 border border-slate-200 dark:border-white/10'}`}
                                >
                                    {isCompleted ? <CheckCircle2 size={20} className="drop-shadow-md" /> : <StepIcon size={18} />}
                                </div>

                                <div className="mt-2 flex-1">
                                    <div className={`text-sm transition-colors duration-300 ${isActive ? 'font-bold text-slate-900 dark:text-cyan-300 drop-shadow-[0_0_5px_rgba(34,211,238,0.3)]' : isCompleted ? 'font-semibold text-slate-700 dark:text-white' : 'font-medium text-slate-500 dark:text-gray-500'}`}>
                                        {step.label}
                                    </div>
                                    {isActive && (
                                        <div className="text-xs text-slate-500 dark:text-cyan-400/80 mt-1 animate-pulse font-mono tracking-wide">
                                            Processing...
                                        </div>
                                    )}
                                </div>
                            </div >
                        );
                    })}
                </div >
            </div >
        </div >
    );
}
