'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Clock, Mic, MicOff, ChevronRight, CheckCircle2, AlertCircle, Play, Loader2 } from 'lucide-react';
import Image from 'next/image';

type Question = {
    question: string;
    category: 'personal' | 'behavioral' | 'technical';
    difficulty: string;
    timeLimit: number;
};

type AssessmentData = {
    interview: {
        candidateName: string;
        jobRole: string;
        jobLevel: string;
    };
    questions: Question[];
    completedQuestions: number[];
    isStarted: boolean;
    totalQuestions: number;
};

export default function AssessmentPage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<AssessmentData | null>(null);
    const [started, setStarted] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [textAnswer, setTextAnswer] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [useTextInput, setUseTextInput] = useState(false);

    // Fetch assessment data
    useEffect(() => {
        async function fetchAssessment() {
            try {
                const res = await fetch(`/api/assessment/${token}`);
                if (!res.ok) {
                    const data = await res.json();
                    setError(data.error || 'Failed to load assessment');
                    return;
                }
                const assessmentData = await res.json();
                setData(assessmentData);
                setStarted(assessmentData.isStarted);

                // Find first uncompleted question
                if (assessmentData.completedQuestions.length > 0) {
                    const nextQuestion = assessmentData.questions.findIndex(
                        (_: Question, i: number) => !assessmentData.completedQuestions.includes(i)
                    );
                    setCurrentQuestion(nextQuestion >= 0 ? nextQuestion : 0);
                }
            } catch (err) {
                setError('Failed to load assessment');
            } finally {
                setLoading(false);
            }
        }
        fetchAssessment();
    }, [token]);

    // Timer
    useEffect(() => {
        if (!started || !data || completed) return;

        const question = data.questions[currentQuestion];
        if (!question) return;

        setTimeLeft(question.timeLimit);

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // Auto-submit when time runs out
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [started, currentQuestion, data, completed]);

    // Web Speech API for transcription
    const startRecording = useCallback(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Speech recognition not supported. Please use Chrome or type your answer.');
            setUseTextInput(true);
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript + ' ';
                }
            }
            if (finalTranscript) {
                setTranscript(prev => prev + finalTranscript);
            }
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsRecording(false);
        };

        recognition.onend = () => {
            setIsRecording(false);
        };

        (window as any).currentRecognition = recognition;
        recognition.start();
        setIsRecording(true);
    }, []);

    const stopRecording = useCallback(() => {
        if ((window as any).currentRecognition) {
            (window as any).currentRecognition.stop();
        }
        setIsRecording(false);
    }, []);

    const handleStart = async () => {
        try {
            await fetch(`/api/assessment/${token}`, { method: 'POST' });
            setStarted(true);
        } catch (err) {
            setError('Failed to start assessment');
        }
    };

    const handleSubmit = async () => {
        if (submitting || !data) return;
        setSubmitting(true);
        stopRecording();

        const question = data.questions[currentQuestion];
        const startTime = data.questions[currentQuestion].timeLimit;
        const durationSeconds = startTime - timeLeft;

        try {
            await fetch(`/api/assessment/${token}/response`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    questionIndex: currentQuestion,
                    question: question.question,
                    category: question.category,
                    timeLimit: question.timeLimit,
                    transcript: transcript || undefined,
                    textAnswer: textAnswer || undefined,
                    durationSeconds,
                }),
            });

            // Move to next question or complete
            if (currentQuestion < data.questions.length - 1) {
                setCurrentQuestion(prev => prev + 1);
                setTranscript('');
                setTextAnswer('');
                setUseTextInput(false);
            } else {
                // Complete assessment
                await fetch(`/api/assessment/${token}/complete`, { method: 'POST' });
                setCompleted(true);
            }
        } catch (err) {
            console.error('Failed to submit response:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'personal': return 'bg-blue-100 text-blue-700';
            case 'behavioral': return 'bg-purple-100 text-purple-700';
            case 'technical': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#1A3305]" />
                    <p className="mt-4 text-gray-600">Loading assessment...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Assessment Unavailable</h1>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    if (completed) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#ECFDF5] to-white">
                <div className="text-center max-w-md p-8">
                    <div className="w-20 h-20 bg-[#1A3305] rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Assessment Complete!</h1>
                    <p className="text-gray-600 mb-6">
                        Thank you for completing your assessment, {data?.interview.candidateName}.
                        Your responses are being evaluated and the interviewer will be in touch soon.
                    </p>
                    <div className="bg-white rounded-xl p-4 border">
                        <p className="text-sm text-gray-500">Questions Answered</p>
                        <p className="text-2xl font-bold text-[#1A3305]">{data?.questions.length}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!started) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#FAFAF9] to-white">
                <div className="max-w-2xl mx-auto px-4 py-16">
                    <div className="text-center mb-12">
                        <Image src="/logo.png" alt="HireNeo AI" width={64} height={64} className="mx-auto mb-4 rounded-xl" />
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {data?.interview.candidateName}!</h1>
                        <p className="text-gray-600">You're about to begin your assessment for</p>
                        <p className="text-xl font-semibold text-[#1A3305] mt-1">{data?.interview.jobRole}</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                        <h2 className="text-xl font-bold mb-6">Before You Begin</h2>

                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-blue-700 font-bold">1</span>
                                </div>
                                <div>
                                    <p className="font-medium">Timed Questions</p>
                                    <p className="text-gray-600 text-sm">Each question has a time limit. Answer before time runs out.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-purple-700 font-bold">2</span>
                                </div>
                                <div>
                                    <p className="font-medium">Voice Recording</p>
                                    <p className="text-gray-600 text-sm">Click the microphone to record your answer. We'll transcribe it automatically.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-green-700 font-bold">3</span>
                                </div>
                                <div>
                                    <p className="font-medium">Question Types</p>
                                    <p className="text-gray-600 text-sm">You'll answer personal, behavioral, and technical questions.</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-[#FEF08A]/30 rounded-xl border border-[#FEF08A]">
                            <p className="font-medium text-[#1A3305]">📋 {data?.totalQuestions} Questions Total</p>
                            <p className="text-sm text-gray-600 mt-1">Estimated time: {Math.ceil((data?.totalQuestions || 8) * 3)} minutes</p>
                        </div>
                    </div>

                    <Button
                        onClick={handleStart}
                        size="lg"
                        className="w-full bg-[#1A3305] hover:bg-[#1A3305]/90 text-white rounded-xl h-14 text-lg font-bold"
                    >
                        <Play className="w-5 h-5 mr-2" />
                        Start Assessment
                    </Button>
                </div>
            </div>
        );
    }

    const question = data?.questions[currentQuestion];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Image src="/logo.png" alt="HireNeo AI" width={32} height={32} className="rounded-lg" />
                        <span className="font-bold text-[#1A3305]">HireNeo AI</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">
                            Question {currentQuestion + 1} of {data?.questions.length}
                        </span>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold ${timeLeft < 30 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                            <Clock className="w-4 h-4" />
                            {formatTime(timeLeft)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress */}
            <div className="bg-white">
                <div className="max-w-4xl mx-auto">
                    <div className="h-1 bg-gray-100">
                        <div
                            className="h-full bg-[#1A3305] transition-all duration-300"
                            style={{ width: `${((currentQuestion + 1) / (data?.questions.length || 1)) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Question */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="flex items-center gap-2 mb-6">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(question?.category || '')}`}>
                            {question?.category}
                        </span>
                        <span className="text-sm text-gray-500">
                            {question?.timeLimit ? `${Math.floor(question.timeLimit / 60)} min` : ''}
                        </span>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-8">
                        {question?.question}
                    </h2>

                    {/* Answer Section */}
                    {!useTextInput ? (
                        <div className="space-y-6">
                            <div className="flex items-center justify-center">
                                <button
                                    onClick={isRecording ? stopRecording : startRecording}
                                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isRecording
                                            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                                            : 'bg-[#1A3305] hover:bg-[#1A3305]/90'
                                        }`}
                                >
                                    {isRecording ? (
                                        <MicOff className="w-10 h-10 text-white" />
                                    ) : (
                                        <Mic className="w-10 h-10 text-white" />
                                    )}
                                </button>
                            </div>
                            <p className="text-center text-gray-500">
                                {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
                            </p>

                            {transcript && (
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-sm text-gray-500 mb-2">Transcript:</p>
                                    <p className="text-gray-900">{transcript}</p>
                                </div>
                            )}

                            <button
                                onClick={() => setUseTextInput(true)}
                                className="text-sm text-gray-500 hover:text-gray-700 underline"
                            >
                                Prefer to type your answer?
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <textarea
                                value={textAnswer}
                                onChange={(e) => setTextAnswer(e.target.value)}
                                placeholder="Type your answer here..."
                                className="w-full h-48 p-4 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#1A3305]"
                            />
                            <button
                                onClick={() => setUseTextInput(false)}
                                className="text-sm text-gray-500 hover:text-gray-700 underline"
                            >
                                Switch to voice recording
                            </button>
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <div className="mt-6 flex justify-end">
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting || (!transcript && !textAnswer)}
                        size="lg"
                        className="bg-[#1A3305] hover:bg-[#1A3305]/90 text-white rounded-xl px-8"
                    >
                        {submitting ? (
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        ) : (
                            <ChevronRight className="w-5 h-5 mr-2" />
                        )}
                        {currentQuestion < (data?.questions.length || 1) - 1 ? 'Next Question' : 'Complete Assessment'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
