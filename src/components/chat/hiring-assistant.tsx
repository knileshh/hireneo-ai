'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    MessageSquare,
    Send,
    X,
    Loader2,
    Bot,
    User,
    Sparkles,
    Minimize2,
    Maximize2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export function HiringAssistantChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: '/api/chat',
    });

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

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
            className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl border border-black/10 z-50 transition-all ${isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
                }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-[#1A3305] to-[#2D5A10] rounded-t-2xl text-white">
                <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    <span className="font-bold">AI Hiring Assistant</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="p-1 hover:bg-white/20 rounded transition-colors"
                    >
                        {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 hover:bg-white/20 rounded transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[360px]">
                        {messages.length === 0 && (
                            <div className="text-center text-muted-foreground py-8">
                                <Bot className="w-12 h-12 mx-auto mb-3 text-[#1A3305]/30" />
                                <p className="font-medium mb-2">How can I help you today?</p>
                                <div className="space-y-2 text-sm">
                                    <p className="text-xs">Try asking:</p>
                                    <button
                                        onClick={() => handleInputChange({ target: { value: 'Show me all candidates' } } as any)}
                                        className="block w-full text-left px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        "Show me all candidates"
                                    </button>
                                    <button
                                        onClick={() => handleInputChange({ target: { value: 'What are my hiring stats?' } } as any)}
                                        className="block w-full text-left px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        "What are my hiring stats?"
                                    </button>
                                    <button
                                        onClick={() => handleInputChange({ target: { value: 'Who are the top candidates?' } } as any)}
                                        className="block w-full text-left px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
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
                                    <div className="w-8 h-8 rounded-full bg-[#1A3305] flex items-center justify-center flex-shrink-0">
                                        <Bot className="w-4 h-4 text-white" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${message.role === 'user'
                                            ? 'bg-[#1A3305] text-white'
                                            : 'bg-gray-100 text-gray-900'
                                        }`}
                                >
                                    {message.role === 'assistant' ? (
                                        <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
                                            <ReactMarkdown>{message.content}</ReactMarkdown>
                                        </div>
                                    ) : (
                                        <p className="text-sm">{message.content}</p>
                                    )}
                                </div>
                                {message.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
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
                                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                                    <Loader2 className="w-4 h-4 animate-spin text-[#1A3305]" />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="p-4 border-t">
                        <div className="flex gap-2">
                            <Input
                                value={input}
                                onChange={handleInputChange}
                                placeholder="Ask about candidates..."
                                className="flex-1 rounded-xl"
                                disabled={isLoading}
                            />
                            <Button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="bg-[#1A3305] hover:bg-[#1A3305]/90 rounded-xl"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
}
