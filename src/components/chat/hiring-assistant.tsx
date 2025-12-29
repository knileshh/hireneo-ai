'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Send,
    X,
    Loader2,
    Bot,
    User,
    Sparkles,
    Minimize2,
    Maximize2,
    Expand
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type ChatSize = 'normal' | 'large' | 'fullscreen';

export function HiringAssistantChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [size, setSize] = useState<ChatSize>('normal');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: '/api/chat',
    });

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Size configurations
    const sizeClasses = {
        normal: 'w-[420px] h-[550px] bottom-6 right-6',
        large: 'w-[600px] h-[700px] bottom-6 right-6',
        fullscreen: 'w-[calc(100vw-48px)] h-[calc(100vh-48px)] bottom-6 right-6 md:w-[900px] md:h-[80vh]',
    };

    const messageAreaHeight = {
        normal: 'h-[400px]',
        large: 'h-[550px]',
        fullscreen: 'h-[calc(100%-140px)]',
    };

    const cycleSize = () => {
        const sizes: ChatSize[] = ['normal', 'large', 'fullscreen'];
        const currentIndex = sizes.indexOf(size);
        const nextIndex = (currentIndex + 1) % sizes.length;
        setSize(sizes[nextIndex]);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-[#1A3305] hover:bg-[#1A3305]/90 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-50"
            >
                <Sparkles className="w-6 h-6" />
            </button>
        );
    }

    return (
        <div
            className={`fixed bg-white rounded-2xl shadow-2xl border border-black/10 z-50 transition-all duration-300 flex flex-col ${isMinimized ? 'w-80 h-16 bottom-6 right-6' : sizeClasses[size]
                }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-[#1A3305] to-[#2D5A10] rounded-t-2xl text-white flex-shrink-0">
                <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    <span className="font-bold">AI Hiring Assistant</span>
                    {!isMinimized && (
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                            {size === 'normal' ? 'S' : size === 'large' ? 'M' : 'L'}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    {!isMinimized && (
                        <button
                            onClick={cycleSize}
                            className="p-1.5 hover:bg-white/20 rounded transition-colors"
                            title="Cycle size (S → M → L)"
                        >
                            <Expand className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="p-1.5 hover:bg-white/20 rounded transition-colors"
                    >
                        {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1.5 hover:bg-white/20 rounded transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages */}
                    <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${messageAreaHeight[size]}`}>
                        {messages.length === 0 && (
                            <div className="text-center text-muted-foreground py-8">
                                <Bot className="w-12 h-12 mx-auto mb-3 text-[#1A3305]/30" />
                                <p className="font-medium mb-3">How can I help you today?</p>
                                <div className="space-y-2 text-sm max-w-sm mx-auto">
                                    <p className="text-xs text-muted-foreground">Try asking:</p>
                                    <button
                                        onClick={() => handleInputChange({ target: { value: 'Show me all candidates' } } as any)}
                                        className="block w-full text-left px-4 py-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100"
                                    >
                                        "Show me all candidates"
                                    </button>
                                    <button
                                        onClick={() => handleInputChange({ target: { value: 'What are my hiring stats?' } } as any)}
                                        className="block w-full text-left px-4 py-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100"
                                    >
                                        "What are my hiring stats?"
                                    </button>
                                    <button
                                        onClick={() => handleInputChange({ target: { value: 'Who are the top candidates?' } } as any)}
                                        className="block w-full text-left px-4 py-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100"
                                    >
                                        "Who are the top candidates?"
                                    </button>
                                </div>
                            </div>
                        )}

                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {message.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-full bg-[#1A3305] flex items-center justify-center flex-shrink-0 mt-1">
                                        <Bot className="w-4 h-4 text-white" />
                                    </div>
                                )}
                                <div
                                    className={`rounded-2xl px-4 py-3 ${message.role === 'user'
                                            ? 'bg-[#1A3305] text-white max-w-[85%]'
                                            : 'bg-gray-50 text-gray-900 max-w-[90%] border border-gray-100'
                                        }`}
                                >
                                    {message.role === 'assistant' ? (
                                        <div className="prose prose-sm max-w-none 
                                            prose-headings:text-gray-900 prose-headings:font-semibold prose-headings:mt-3 prose-headings:mb-2
                                            prose-p:text-gray-700 prose-p:my-2 prose-p:leading-relaxed
                                            prose-ul:my-2 prose-ul:pl-4
                                            prose-ol:my-2 prose-ol:pl-4
                                            prose-li:my-1 prose-li:text-gray-700
                                            prose-strong:text-gray-900 prose-strong:font-semibold
                                            prose-code:bg-gray-200 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono
                                            prose-pre:bg-gray-800 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-3 prose-pre:overflow-x-auto
                                            prose-table:border-collapse prose-table:w-full prose-table:my-3
                                            prose-th:border prose-th:border-gray-200 prose-th:bg-gray-100 prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:text-sm prose-th:font-medium
                                            prose-td:border prose-td:border-gray-200 prose-td:px-3 prose-td:py-2 prose-td:text-sm
                                            prose-blockquote:border-l-4 prose-blockquote:border-[#1A3305] prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
                                            prose-hr:my-4 prose-hr:border-gray-200
                                        ">
                                            <ReactMarkdown>{message.content}</ReactMarkdown>
                                        </div>
                                    ) : (
                                        <p className="text-sm leading-relaxed">{message.content}</p>
                                    )}
                                </div>
                                {message.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                                        <User className="w-4 h-4 text-gray-600" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-3 justify-start">
                                <div className="w-8 h-8 rounded-full bg-[#1A3305] flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-[#1A3305]" />
                                    <span className="text-sm text-gray-500">Thinking...</span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="p-4 border-t bg-gray-50/50 rounded-b-2xl flex-shrink-0">
                        <div className="flex gap-2">
                            <Input
                                value={input}
                                onChange={handleInputChange}
                                placeholder="Ask about candidates, stats, or comparisons..."
                                className="flex-1 rounded-xl border-gray-200 focus:border-[#1A3305] focus:ring-[#1A3305]/20"
                                disabled={isLoading}
                            />
                            <Button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="bg-[#1A3305] hover:bg-[#1A3305]/90 rounded-xl px-4"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                            Press ↵ to send • Click <Expand className="w-3 h-3 inline" /> to resize
                        </p>
                    </form>
                </>
            )}
        </div>
    );
}
