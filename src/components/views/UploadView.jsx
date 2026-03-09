import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, PlaySquare, Clock, BookOpen, ChevronRight, PlayCircle, Zap, Layers } from 'lucide-react';
import { uploadData, list } from 'aws-amplify/storage';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import MagneticButton from '../common/MagneticButton';
import ProcessingModal from './ProcessingModal';
import { useAnonymousUser } from '../../hooks/useAnonymousUser';

export default function UploadView() {
    const anonymousUserId = useAnonymousUser();
    const navigate = useNavigate();
    const [dragState, setDragState] = useState('idle'); // idle, dragover, processing
    const [showDuplicateToast, setShowDuplicateToast] = useState(false);
    const [isProcessingModalOpen, setIsProcessingModalOpen] = useState(false);
    const [currentCourseId, setCurrentCourseId] = useState(null);
    const [primaryGoal, setPrimaryGoal] = useState('your');
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userStats, setUserStats] = useState({ videosGenerated: 0, lecturesCompleted: 0, videosWeekly: 0, lecturesWeekly: 0 });

    // Route Protection & State Reading
    useEffect(() => {
        if (localStorage.getItem('isLoggedIn') !== 'true') {
            navigate('/login');
            return;
        }

        const storedGoals = localStorage.getItem('selectedGoals');
        if (storedGoals) {
            try {
                const parsed = JSON.parse(storedGoals);
                if (parsed.length > 0) {
                    setPrimaryGoal(parsed[0]);
                }
            } catch (e) { }
        }
    }, [navigate]);

    const [textbooks, setTextbooks] = useState([]);

    // Data Fetching
    useEffect(() => {
        async function fetchTextbooks() {
            try {
                // Assuming files were uploaded with a 'pdfs/' prefix
                const result = await list({
                    prefix: 'pdfs/',
                    options: {
                        accessLevel: 'private'
                    }
                });

                // Update state with the fetched items
                setTextbooks(result.items || []);
                console.log("Fetched textbooks from S3:", result.items);
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching from S3:", error);
                setIsLoading(false);
            }
        }

        fetchTextbooks();
    }, []);


    // Scroll reveal logic
    useEffect(() => {
        const elements = document.querySelectorAll('.stagger-reveal');
        elements.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('revealed');
            }, 100 * (index + 1));
        });
    }, []);

    const handleDragOver = (e) => {
        e.preventDefault();
        if (dragState !== 'processing') setDragState('dragover');
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        if (dragState !== 'processing') setDragState('idle');
    };

    const handleFileUpload = async (file) => {
        setDragState('processing');
        try {
            // Generate a unique filename
            const uniqueFileName = `pdfs/${Date.now()}-${file.name}`;

            // Start the upload
            const uploadTask = uploadData({
                key: uniqueFileName,
                data: file,
                options: {
                    accessLevel: 'private', // CHANGED FROM GUEST
                    contentType: file.type // Ensure S3 knows it is a PDF
                }
            });

            // Await the final result
            const result = await uploadTask.result;
            console.log('Successfully uploaded to S3:', result);

            // --- DYNAMODB INTEGRATION ---
            try {
                // Get credentials and identityId from Amplify session
                const session = await fetchAuthSession();
                const identityId = session.identityId;
                const credentials = session.credentials;

                let authUser = null;
                try {
                    authUser = await getCurrentUser();
                } catch (e) {
                    console.log("No authenticated user found for upload.");
                }
                const resolvedUserId = authUser ? (authUser.username || authUser.userId) : null;

                if (!credentials) {
                    throw new Error("No AWS credentials available from Auth session");
                }

                // Initialize DynamoDB Client with session credentials
                const ddbClient = new DynamoDBClient({
                    region: 'us-east-1',
                    credentials: {
                        accessKeyId: credentials.accessKeyId,
                        secretAccessKey: credentials.secretAccessKey,
                        sessionToken: credentials.sessionToken
                    }
                });

                const docClient = DynamoDBDocumentClient.from(ddbClient);

                // Create a unique courseId
                const courseId = `course_${Date.now()}`;
                setCurrentCourseId(courseId);

                // Write to LecturAi-Courses table
                const putCommand = new PutCommand({
                    TableName: 'LecturAi-Courses',
                    Item: {
                        courseId: courseId,
                        userId: resolvedUserId || anonymousUserId || identityId || 'unknown-user',
                        fileName: file.name,
                        s3Key: uniqueFileName,
                        videoStatus: 'Pending',
                        createdAt: new Date().toISOString()
                    }
                });

                await docClient.send(putCommand);
                console.log('Successfully saved upload record to DynamoDB:', courseId);
            } catch (dbError) {
                console.error("Error saving to DynamoDB:", dbError);
            }
            // --- END DYNAMODB INTEGRATION ---

            setDragState('idle');
            setIsProcessingModalOpen(true);

        } catch (error) {
            console.error("Error uploading file:", error);
            setDragState('idle');
            setShowDuplicateToast(true); // You could create a generic error toast here instead if preferred
            setTimeout(() => setShowDuplicateToast(false), 5000);
        }
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        const files = e.dataTransfer?.files || e.target?.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        handleFileUpload(file);
    };

    return (
        <div className="upload-page-container pt-24 pb-40">

            {/* Duplicate Detection Toast */}
            <div className={`duplicate-toast ${showDuplicateToast ? 'toast-visible' : ''}`}>
                <AlertCircle size={24} color="#f59e0b" />
                <div className="toast-content">
                    <p className="toast-title">File Already Synthesized</p>
                    <p className="toast-desc">You've already converted this textbook!</p>
                </div>
                <button
                    className="toast-action"
                    onClick={() => { setShowDuplicateToast(false); navigate('/dashboard'); }}
                >
                    Go to Video <ChevronRight size={16} />
                </button>
            </div>

            <ProcessingModal
                isOpen={isProcessingModalOpen}
                onComplete={async () => {
                    setIsProcessingModalOpen(false);

                    if (currentCourseId) {
                        try {
                            const session = await fetchAuthSession();
                            const credentials = session.credentials;

                            if (credentials) {
                                const ddbClient = new DynamoDBClient({
                                    region: 'us-east-1',
                                    credentials: {
                                        accessKeyId: credentials.accessKeyId,
                                        secretAccessKey: credentials.secretAccessKey,
                                        sessionToken: credentials.sessionToken
                                    }
                                });
                                const docClient = DynamoDBDocumentClient.from(ddbClient);

                                const updateCommand = new UpdateCommand({
                                    TableName: 'LecturAi-Courses',
                                    Key: { courseId: currentCourseId },
                                    UpdateExpression: "SET curriculum = :c, videoStatus = :s",
                                    ExpressionAttributeValues: {
                                        ":c": [
                                            {
                                                lessonTitle: "Foundation & Overview",
                                                duration: "05:00",
                                                concepts: ["Introduction", "Core Frameworks"]
                                            },
                                            {
                                                lessonTitle: "Deep Dive into Mechanics",
                                                duration: "10:30",
                                                concepts: ["Advanced Theory", "Practical Examples"]
                                            }
                                        ],
                                        ":s": "Completed"
                                    }
                                });

                                await docClient.send(updateCommand);
                                console.log("Updated DynamoDB with curriculum data");
                            }
                        } catch (err) {
                            console.error("Failed to update curriculum in DynamoDB:", err);
                        }
                    }

                    navigate('/dashboard');
                }}
            />

            {/* 1. The "Magic Drop" Upload Zone */}
            <section className="magic-drop-section stagger-reveal w-full max-w-5xl mx-auto px-6">
                <div className="section-header text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white transition-colors duration-500 mb-4 tracking-tight">Ready to conquer {primaryGoal !== 'your' ? `your ${primaryGoal}` : 'your'} exams?</h1>
                    <p className="text-slate-600 dark:text-gray-400 transition-colors duration-500 text-xl font-medium">Drop your textbook or syllabus PDF here to initialize the data core and generate your personalized lectures.</p>
                </div>

                <div
                    className={`magic-drop-zone ${dragState === 'dragover' ? 'glow-active' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => dragState === 'idle' && document.getElementById('file-upload').click()}
                >
                    <input
                        type="file"
                        id="file-upload"
                        accept=".pdf,.epub"
                        style={{ display: 'none' }}
                        onChange={handleDrop}
                    />

                    {/* Laser scanning animation on hover/drag */}
                    <div className="laser-scanner"></div>

                    <div className="drop-content w-full">
                        {dragState === 'processing' ? (
                            <div className="flex flex-col items-center justify-center h-full">
                                <Zap size={48} className="text-cyan mb-6 shatter-icon pulse-slow" />
                                <div className="text-cyan-400 font-medium text-lg drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
                                    Uploading...
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <div className={`icon-container ${dragState === 'dragover' ? 'float-up' : 'float-idle'}`}>
                                    <UploadCloud size={80} className={dragState === 'dragover' ? 'text-cyan' : 'text-purple'} />
                                </div>

                                <MagneticButton onClick={(e) => {
                                    e.stopPropagation();
                                    document.getElementById('file-upload').click();
                                }} styleClass="magnetic-btn-upload mt-12 bg-gradient-to-r from-cyan-500 to-purple-500 border-none text-white hover:opacity-90 shadow-[0_10px_30px_rgba(34,211,238,0.4)]">
                                    [ INITIALIZE DATA CORE ]
                                </MagneticButton>

                                <div className="mt-8 flex flex-col items-center gap-2">
                                    <p className="text-slate-500 dark:text-gray-500 text-sm tracking-widest font-mono transition-colors">MAX FRAGMENT SIZE: 50MB</p>
                                    <div className="flex gap-2">
                                        <span className="file-badge">PDF</span>
                                        <span className="file-badge">EPUB</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* 2. "My Learning" Stats Section */}
            <section className="stats-section stagger-reveal mt-12 mb-8 w-full max-w-4xl mx-auto px-6">
                <div className="stats-grid">
                    {/* Card 1: Videos Generated */}
                    <div className="stat-card glass-panel flex items-center justify-between p-8 hover:shadow-[inset_0_0_30px_rgba(168,85,247,0.15)] transition-shadow duration-300">
                        <div>
                            <p className="text-gray-400 font-semibold mb-2">Videos Generated</p>
                            <h3 className="text-5xl font-black text-slate-800 dark:text-white drop-shadow-sm dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-colors duration-500">{userStats.videosGenerated}</h3>
                            {userStats.videosWeekly > 0 && (
                                <div className="text-cyan-400 text-sm font-bold mt-2 tracking-wide">+{userStats.videosWeekly} this week</div>
                            )}
                        </div>
                        <div className="h-16 w-16 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                            <Zap className="text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" size={32} />
                        </div>
                    </div>

                    {/* Card 2: Lectures Completed */}
                    <div className="stat-card glass-panel flex items-center justify-between p-8 hover:shadow-[inset_0_0_30px_rgba(52,211,153,0.15)] transition-shadow duration-300">
                        <div>
                            <p className="text-gray-400 font-semibold mb-2">Lectures Completed</p>
                            <h3 className="text-5xl font-black text-slate-800 dark:text-white drop-shadow-sm dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-colors duration-500">{userStats.lecturesCompleted}</h3>
                            {userStats.lecturesWeekly > 0 && (
                                <div className="text-emerald-400 text-sm font-bold mt-2 tracking-wide">+{userStats.lecturesWeekly} this week</div>
                            )}
                        </div>
                        <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                            <CheckCircle2 className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" size={32} />
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. "Your Library" Section */}
            <section className="library-section stagger-reveal mt-16 w-full max-w-6xl mx-auto px-6">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors duration-500 flex items-center gap-3">
                        <BookOpen className="text-purple-600 dark:text-purple" /> Your Textbooks
                    </h2>
                    <button className="text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center text-sm font-semibold tracking-wide uppercase">
                        View All <ChevronRight size={16} />
                    </button>
                </div>

                {/* Horizontal Scroll / Grid -> Replaced with Empty State If No Conversions */}
                {isLoading ? (
                    <div className="empty-state-container">
                        <div className="empty-state-content glass-panel" style={{ padding: '2rem' }}>
                            <Layers size={48} className="empty-icon pulse-slow" color="#4b5563" />
                            <h3 className="empty-text">Loading data core...</h3>
                        </div>
                    </div>
                ) : textbooks.length === 0 ? (
                    <div className="empty-state-container">
                        <div className="empty-state-content glass-panel">
                            <Layers size={64} className="empty-icon pulse-slow" color="#4b5563" />
                            <h3 className="empty-text">Your data core is empty.</h3>
                            <p className="empty-subtext">Drop a syllabus or textbook PDF above to generate your first custom video lecture.</p>
                        </div>
                    </div>
                ) : (
                    <div className="library-grid">
                        {textbooks.map((textbook, index) => {
                            const color = ['#f472b6', '#4ade80', '#22d3ee', '#fbbf24'][index % 4];
                            const defaultIcon = [
                                <FileText size={24} color={color} />,
                                <CheckCircle2 size={24} color={color} />,
                                <BookOpen size={24} color={color} />,
                                <Clock size={24} color={color} />
                            ][index % 4];
                            const icon = defaultIcon;
                            const progress = 0;
                            const chapterCount = 0;

                            return (
                                <div
                                    key={textbook.key || index}
                                    className="library-card glass-panel group relative"
                                    onClick={() => navigate(`/curriculum/${encodeURIComponent(textbook.key)}`)}
                                >
                                    <div className="card-overlay">
                                        <BookOpen size={48} color="white" className="overlay-play" />
                                        <span className="overlay-text">View Curriculum</span>
                                    </div>

                                    <div className="card-content flex flex-col h-full">
                                        <div className="card-icon-wrapper mb-4" style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}>
                                            {icon}
                                        </div>
                                        <h3 className="text-slate-900 dark:text-white font-bold text-lg leading-tight line-clamp-2 transition-colors duration-500">{textbook.key.split('/').pop()}</h3>
                                        <p className="text-gray-500 text-xs mt-1 font-semibold tracking-wide mb-6 flex-1">
                                            {chapterCount} Chapters
                                        </p>

                                        <div className="progress-container">
                                            <div className="flex justify-between text-xs font-mono mb-2">
                                                <span className="text-gray-400">MASTERY</span>
                                                <span style={{ color: color, filter: 'drop-shadow(0 0 5px currentColor)', fontWeight: 600 }}>{progress}%</span>
                                            </div>
                                            {/* Thicker progress bar with matched glow */}
                                            <div className="progress-track" style={{ height: '6px', backgroundColor: '#1f2937' }}>
                                                <div
                                                    className="progress-fill"
                                                    style={{
                                                        width: `${progress}%`,
                                                        background: `linear-gradient(90deg, ${color}80, ${color})`,
                                                        boxShadow: `0 0 8px ${color}`,
                                                        borderRadius: '9999px',
                                                        height: '100%'
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            <style>{`
                .upload-page-container {
                    min-height: 100vh;
                    background-color: #f8fafc;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    font-family: 'Inter', system-ui, sans-serif;
                    position: relative;
                }
                .dark .upload-page-container {
                    background-color: #030305;
                }

                /* Typography Utilities */
                .text-center { text-align: center; }
                .text-white { color: white; }
                .text-gray-400 { color: #9ca3af; }
                .text-gray-500 { color: #6b7280; }
                .text-cyan { color: #22d3ee; }
                .text-purple { color: #a855f7; }
                .font-bold { font-weight: 700; }
                .font-mono { font-family: monospace; }
                .text-4xl { font-size: 2.25rem; }
                .text-3xl { font-size: 1.875rem; }
                .text-2xl { font-size: 1.5rem; }
                .text-lg { font-size: 1.125rem; }
                .text-sm { font-size: 0.875rem; }
                .text-xs { font-size: 0.75rem; }
                .mb-2 { margin-bottom: 0.5rem; }
                .mb-4 { margin-bottom: 1rem; }
                .mb-6 { margin-bottom: 1.5rem; }
                .mb-8 { margin-bottom: 2rem; }
                .mt-4 { margin-top: 1rem; }
                .mt-8 { margin-top: 2rem; }
                .mt-16 { margin-top: 4rem; }
                .pt-24 { padding-top: 6rem; }
                .pb-40 { padding-bottom: 10rem; }
                .flex { display: flex; }
                .flex-col { flex-direction: column; }
                .items-center { align-items: center; }
                .justify-between { justify-content: space-between; }
                .gap-3 { gap: 0.75rem; }
                .w-full { width: 100%; }
                .max-w-6xl { max-width: 72rem; }
                .mx-auto { margin-left: auto; margin-right: auto; }
                .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
                .tracking-widest { letter-spacing: 0.1em; }
                .tracking-wide { letter-spacing: 0.05em; }
                .uppercase { text-transform: uppercase; }
                .flex-1 { flex: 1; }
                .leading-tight { line-height: 1.25; }

                /* Stagger Reveal */
                .stagger-reveal {
                    opacity: 0;
                    transform: translateY(30px);
                    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .stagger-reveal.revealed {
                    opacity: 1;
                    transform: translateY(0);
                }

                /* Magic Drop Zone */
                .magic-drop-section {
                    z-index: 10;
                }
                .magic-drop-zone {
                    width: 100%;
                    min-height: 480px; 
                    background: rgba(255, 255, 255, 0.4);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 2px dashed #e5e7eb;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                    border-radius: 2rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    animation: borderPulseLight 4s infinite alternate;
                }
                .dark .magic-drop-zone {
                    background: rgba(255, 255, 255, 0.08);
                    border: 2px dashed rgba(255, 255, 255, 0.2);
                    animation: borderPulse 4s infinite alternate;
                }
                @keyframes borderPulse {
                    0% { border-color: rgba(34, 211, 238, 0.2); box-shadow: inset 0 0 0 rgba(34, 211, 238, 0); }
                    100% { border-color: rgba(34, 211, 238, 0.6); box-shadow: inset 0 0 20px rgba(34, 211, 238, 0.1); }
                }
                @keyframes borderPulseLight {
                    0% { border-color: rgba(34, 211, 238, 0.2); box-shadow: inset 0 0 0 rgba(34, 211, 238, 0); }
                    100% { border-color: rgba(34, 211, 238, 0.8); box-shadow: inset 0 0 20px rgba(34, 211, 238, 0.05); }
                }
                .magic-drop-zone.glow-active {
                    border-color: #22d3ee;
                    background: rgba(34, 211, 238, 0.05);
                    box-shadow: 0 0 40px rgba(34, 211, 238, 0.2), inset 0 0 40px rgba(34, 211, 238, 0.1);
                }
                .magic-drop-zone:hover:not(.glow-active) {
                    border-color: rgba(168, 85, 247, 0.3); /* Purple hint on hover */
                    background: rgba(168, 85, 247, 0.05);
                }
                .dark .magic-drop-zone:hover:not(.glow-active) {
                    border-color: rgba(168, 85, 247, 0.5); /* Purple hint on hover */
                }

                /* Laser Scanner Animation */
                .laser-scanner {
                    position: absolute;
                    top: -100px;
                    left: 0;
                    width: 100%;
                    height: 150px;
                    background: linear-gradient(to bottom, transparent, rgba(34, 211, 238, 0.1) 80%, rgba(34, 211, 238, 0.8) 100%);
                    opacity: 0;
                    pointer-events: none;
                    transform: translateY(-100%);
                    transition: opacity 0.3s;
                }
                .magic-drop-zone.glow-active .laser-scanner, .magic-drop-zone:hover .laser-scanner {
                    opacity: 1;
                    animation: scan 2.5s linear infinite;
                }
                @keyframes scan {
                    0% { transform: translateY(-100px); }
                    100% { transform: translateY(450px); }
                }

                .icon-container { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
                .icon-container.float-up { transform: translateY(-15px) scale(1.1); filter: drop-shadow(0 0 20px rgba(34,211,238,0.5)); }
                .icon-container.float-idle { animation: idleFloat 2s ease-in-out infinite alternate; }
                @keyframes idleFloat {
                    0% { transform: translateY(3px); }
                    100% { transform: translateY(-3px); }
                }

                .file-badge {
                    background: rgba(255, 255, 255, 0.8);
                    border: 1px solid rgba(0, 0, 0, 0.1);
                    color: #64748b;
                    font-size: 0.7rem;
                    font-weight: 600;
                    padding: 0.2rem 0.6rem;
                    border-radius: 9999px;
                    letter-spacing: 0.05em;
                }
                .dark .file-badge {
                    background: rgba(15, 23, 42, 0.5);
                    border-color: rgba(255, 255, 255, 0.1);
                    color: #9ca3af;
                }

                .typing-effect {
                    overflow: hidden;
                    white-space: nowrap;
                    animation: typing 0.5s steps(40, end);
                }
                @keyframes typing {
                    from { max-width: 0 }
                    to { max-width: 100% }
                }

                .magnetic-btn-upload {
                    background: rgba(255,255,255,0.8);
                    color: #0f172a; font-size: 1rem; font-weight: 700; padding: 1.25rem 2.5rem;
                    border: 1px solid rgba(0,0,0,0.1); border-radius: 4rem; cursor: pointer;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05); transition: all 0.3s ease;
                    letter-spacing: 0.1em;
                    backdrop-filter: blur(8px);
                }
                .dark .magnetic-btn-upload {
                    background: rgba(255,255,255,0.1);
                    color: white;
                    border-color: rgba(255,255,255,0.2);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                }
                .magnetic-btn-upload:hover { 
                    background: white; color: #030305; box-shadow: 0 0 30px rgba(0,0,0,0.1); 
                }
                .dark .magnetic-btn-upload:hover { 
                    box-shadow: 0 0 30px rgba(255,255,255,0.6); 
                }

                .pulse-slow { animation: pulseSlow 2s infinite alternate; }
                @keyframes pulseSlow { from { opacity: 0.8; transform: scale(0.98); } to { opacity: 1; transform: scale(1.02); } }

                /* Toast Notification */
                .duplicate-toast {
                    position: fixed;
                    top: -100px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(15, 23, 42, 0.9);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(245, 158, 11, 0.3); /* Amber/Orange */
                    border-bottom: 2px solid #f59e0b;
                    border-radius: 1rem;
                    padding: 1rem 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.5), 0 0 20px rgba(245, 158, 11, 0.2);
                    z-index: 100;
                    transition: top 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .duplicate-toast.toast-visible { top: 2rem; }
                .toast-content { display: flex; flex-direction: column; }
                .toast-title { color: white; font-weight: 700; font-size: 1rem; }
                .toast-desc { color: #d1d5db; font-size: 0.875rem; }
                .toast-action {
                    margin-left: 1rem; padding: 0.5rem 1rem;
                    background: rgba(245, 158, 11, 0.1); color: #f59e0b;
                    border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 0.5rem;
                    font-weight: 600; font-size: 0.875rem; display: flex; align-items: center; gap: 0.25rem;
                    cursor: pointer; transition: all 0.2s;
                }
                .toast-action:hover { background: #f59e0b; color: #020617; }

                /* Library Grid */
                .library-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
                    gap: 1.5rem;
                    width: 100%;
                }
                .library-card {
                    background: rgba(255, 255, 255, 0.8);
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                    border-radius: 1.25rem;
                    padding: 1.5rem;
                    position: relative;
                    overflow: hidden;
                    cursor: pointer;
                    height: 220px;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .dark .library-card {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.1);
                    box-shadow: none;
                }
                .library-card:hover {
                    transform: translateY(-8px);
                    border-color: rgba(0, 0, 0, 0.1);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.05);
                }
                .dark .library-card:hover {
                    border-color: rgba(255, 255, 255, 0.2);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                }
                .card-icon-wrapper {
                    width: 48px; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center;
                    aspect-ratio: 1;
                }

                .card-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(4px);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    z-index: 10;
                }
                .dark .card-overlay {
                    background: rgba(15, 23, 42, 0.85);
                }
                .library-card:hover .card-overlay { opacity: 1; }
                .overlay-text { color: #0f172a; font-weight: 600; font-size: 1rem; letter-spacing: 0.05em; }
                .dark .overlay-text { color: white; }
                .overlay-play { filter: drop-shadow(0 0 10px rgba(0,0,0,0.1)); transition: transform 0.2s; color: #0f172a !important; }
                .dark .overlay-play { filter: drop-shadow(0 0 10px rgba(255,255,255,0.5)); color: white !important; }
                .library-card:hover .overlay-play { transform: scale(1.1); }

                .progress-track {
                    height: 6px;
                    background: rgba(0,0,0,0.05);
                    border-radius: 999px;
                    overflow: hidden;
                    border: 1px solid rgba(0,0,0,0.05);
                }
                .dark .progress-track {
                    background: rgba(0,0,0,0.5);
                    border-color: rgba(255,255,255,0.05);
                }
                .progress-fill {
                    height: 100%;
                    border-radius: 999px;
                }

                /* Stats Section Layout */
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 1.5rem;
                }
                .stat-card {
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                    border-radius: 1.5rem;
                    padding: 2rem;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    position: relative;
                    overflow: hidden;
                    cursor: default;
                }
                .dark .stat-card {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.1);
                    box-shadow: none;
                }
                .stat-card-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                }
                .stat-label {
                    color: #64748b;
                    font-size: 0.875rem;
                    font-weight: 600;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    margin-bottom: 0.25rem;
                }
                .dark .stat-label { color: #9ca3af; }
                .stat-value {
                    color: #0f172a;
                    font-size: 3rem;
                    font-weight: 700;
                    line-height: 1;
                    transition: color 0.3s, text-shadow 0.3s;
                }
                .dark .stat-value { color: white; }
                .stat-icon-wrapper {
                    padding: 0.75rem;
                    border-radius: 0.75rem;
                    border: 1px solid transparent;
                    transition: box-shadow 0.3s;
                }
                
                /* Animations and specific colors */
                .stat-card:hover {
                    transform: scale(1.05);
                    background: white;
                    border-color: rgba(0, 0, 0, 0.1);
                }
                .dark .stat-card:hover {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: rgba(255, 255, 255, 0.2);
                }

                .stat-card:hover .val-purple {
                    color: #a855f7;
                    text-shadow: 0 0 25px rgba(168, 85, 247, 0.2);
                }
                .dark .stat-card:hover .val-purple {
                    text-shadow: 0 0 25px rgba(168, 85, 247, 0.6);
                }
                .stat-card:hover .val-green {
                    color: #4ade80;
                    text-shadow: 0 0 25px rgba(34, 197, 94, 0.2);
                }
                .dark .stat-card:hover .val-green {
                    text-shadow: 0 0 25px rgba(34, 197, 94, 0.6);
                }

                .max-w-4xl { max-width: 56rem; }
                .mt-12 { margin-top: 3rem; }

                /* Empty State Styles */
                .empty-state-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 4rem 1rem;
                    width: 100%;
                }
                .empty-state-content {
                    background: rgba(255, 255, 255, 0.8);
                    border: 1px dashed #e2e8f0;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                    border-radius: 1.5rem;
                    padding: 3rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    max-width: 480px;
                    width: 100%;
                    backdrop-filter: blur(12px);
                }
                .dark .empty-state-content {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.1);
                    box-shadow: none;
                }
                .empty-icon {
                    margin-bottom: 1.5rem;
                    opacity: 0.6;
                }
                .empty-text {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #d1d5db; /* gray-300 */
                    margin-bottom: 0.5rem;
                }
                .empty-subtext {
                    color: #9ca3af; /* gray-400 */
                    font-size: 0.875rem;
                    line-height: 1.5;
                }
            `}</style>
        </div>
    );
}
