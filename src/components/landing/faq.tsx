'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
    {
        id: 1,
        question: "How is HireNeo different from other mock interview platforms?",
        answer: "HireNeo provides an interactive, AI-driven interview experience that adapts to your responses in real time. Unlike traditional mock interviews, our AI dynamically adjusts follow-up questions, offers instant feedback, and tailors the session to your performance. This ensures a more personalized and effective way to improve your interview skills."
    },
    {
        id: 2,
        question: "Is there a free trial available for HireNeo's AI interviews?",
        answer: "Yes! We offer a free trial that allows you to experience our AI interview platform. You can practice mock interviews, receive AI-generated feedback, and explore our question bank before committing to a paid plan."
    },
    {
        id: 3,
        question: "Who should use HireNeo's AI interview coaching?",
        answer: "HireNeo is perfect for job seekers preparing for technical or behavioral interviews, students practicing for campus placements, recruiters testing their interview processes, and companies looking to streamline candidate assessments. Whether you're a beginner or an experienced professional, our platform adapts to your skill level."
    },
    {
        id: 4,
        question: "What is the typical length of an AI interview session?",
        answer: "Most AI interview sessions last between 15-30 minutes, depending on the role and difficulty level you select. You can customize the session duration to fit your schedule, and you can pause and resume interviews at any time."
    },
    {
        id: 5,
        question: "How does HireNeo's AI analyze my responses and provide feedback?",
        answer: "Our AI uses advanced natural language processing and machine learning to evaluate your answers based on clarity, relevance, technical accuracy, and communication skills. After each session, you receive a detailed scorecard with strengths, areas for improvement, and actionable recommendations to enhance your performance."
    },
    {
        id: 6,
        question: "Can I customize my interview experience for different job roles?",
        answer: "Absolutely! HireNeo allows you to select specific job roles, industries, and skill levels. You can customize question types (technical, behavioral, situational), difficulty levels, and even integrate with your ATS via webhooks to create role-specific interview experiences tailored to your needs."
    }
];

export function FAQ() {
    const [openId, setOpenId] = useState<number | null>(1); // First one open by default

    const toggleFAQ = (id: number) => {
        setOpenId(openId === id ? null : id);
    };

    return (
        <section className="py-20 px-4 bg-[#FAFAF9]">
            <div className="max-w-4xl mx-auto">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex justify-center mb-6"
                >
                    <div className="inline-flex items-center gap-2 bg-[#ECFDF5] text-[#1A3305] font-medium px-4 py-2 rounded-full text-sm border border-[#1A3305]/10">
                        <span className="w-5 h-5 bg-[#1A3305] text-white rounded flex items-center justify-center text-xs font-bold">+</span>
                        For Job Seekers
                    </div>
                </motion.div>

                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="font-heading font-bold text-4xl md:text-5xl mb-4">
                        Frequently asked questions
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Everything you need to know about HireNeo's AI interview platform
                    </p>
                </motion.div>

                {/* FAQ Accordion */}
                <div className="space-y-0">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={faq.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="border-b-2 border-dashed border-black/30 last:border-0"
                        >
                            <button
                                onClick={() => toggleFAQ(faq.id)}
                                className="w-full py-6 flex items-center justify-between gap-4 text-left hover:opacity-70 transition-opacity"
                            >
                                <span className="font-bold text-lg md:text-xl pr-8">
                                    {faq.question}
                                </span>
                                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                                    {openId === faq.id ? (
                                        <Minus className="w-6 h-6" />
                                    ) : (
                                        <Plus className="w-6 h-6" />
                                    )}
                                </span>
                            </button>

                            <AnimatePresence>
                                {openId === faq.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pb-6 pr-12">
                                            <div className="bg-[#ECFDF5]/50 p-6 rounded-xl border border-[#1A3305]/5">
                                                <p className="text-foreground/80 leading-relaxed">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
