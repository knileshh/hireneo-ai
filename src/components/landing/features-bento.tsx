'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Brain, CheckCircle2, ChevronRight, Clock, Star, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const StickyNote = ({
    className,
    color = "bg-[#FEF08A]", // Default Yellow
    rotation = 2,
    children
}: {
    className?: string,
    color?: string,
    rotation?: number,
    children: React.ReactNode
}) => (
    <motion.div
        whileHover={{ scale: 1.02, rotate: 0 }}
        className={cn(
            "relative p-6 shadow-md border border-black/5 flex flex-col items-center text-center",
            color,
            className
        )}
        style={{ transform: `rotate(${rotation}deg)` }}
    >
        {/* "Tape" effect */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-8 bg-white/40 rotate-1 backdrop-blur-sm shadow-sm"></div>
        {children}
    </motion.div>
);

const FeatureCard = ({
    className,
    title,
    description,
    icon: Icon,
    image
}: {
    className?: string,
    title: string,
    description: string,
    icon?: any,
    image?: React.ReactNode
}) => (
    <div className={cn("p-8 rounded-3xl border border-black/5 bg-[#F6F6F6] shadow-sm hover:shadow-md transition-shadow", className)}>
        {image && <div className="mb-6">{image}</div>}
        {Icon && <div className="mb-4 w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
            <Icon className="w-6 h-6" />
        </div>}
        <h3 className="font-heading font-bold text-2xl mb-3">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
);

export function FeaturesBento() {
    return (
        <section className="py-24 px-4 bg-white relative overflow-hidden" id="features">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-[#F3F4F6] text-black font-medium px-4 py-1 rounded-full text-sm mb-6 border border-black/5">
                        🔥 Powerful Features
                    </div>
                    <h2 className="font-heading font-bold text-4xl md:text-5xl mb-6">
                        Everything you need to <br />
                        <span className="relative inline-block">
                            <span className="relative z-10">hire better.</span>
                            <span className="absolute bottom-1 left-0 right-0 h-4 bg-[#A7F3D0] -z-0 transform -rotate-1 rounded-sm opacity-80"></span>
                        </span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* Main Large Card - Question Generator */}
                    <div className="md:col-span-2 bg-[#ECFDF5] rounded-[2rem] p-8 md:p-12 border border-[#059669]/10 relative overflow-hidden group">
                        <div className="relative z-10 max-w-md">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm text-[#059669]">
                                <Brain className="w-7 h-7" />
                            </div>
                            <h3 className="font-heading font-bold text-3xl mb-4 text-[#064E3B]">AI Question Generator</h3>
                            <p className="text-[#065F46] text-lg mb-8">Stop Googling "good interview questions." Our AI analyzes the job role and generates perfect technical & behavioral questions instantly.</p>
                            <Button variant="outline" className="rounded-full bg-white border-[#059669]/20 text-[#065F46] hover:bg-[#D1FAE5] font-bold">
                                Try Generator <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>

                        {/* Abstract UI representation */}
                        <div className="absolute right-0 bottom-0 top-0 w-1/2 hidden md:block">
                            <div className="absolute top-12 right-12 w-full bg-white rounded-tl-2xl shadow-xl border border-black/5 p-6 transform rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                <div className="flex gap-2 mb-4">
                                    <div className="h-2 w-2 rounded-full bg-red-400"></div>
                                    <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                                    <div className="h-2 w-2 rounded-full bg-green-400"></div>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <div className="h-2 w-3/4 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-2 w-1/2 bg-gray-200 rounded"></div>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                                        <div className="flex gap-2 items-center mb-2">
                                            <div className="w-4 h-4 rounded bg-green-200"></div>
                                            <div className="h-2 w-20 bg-green-200 rounded"></div>
                                        </div>
                                        <div className="h-2 w-full bg-green-200/50 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sticky Notes Column */}
                    <div className="space-y-6 flex flex-col justify-center">
                        <StickyNote color="bg-[#FEF08A]" rotation={-2}>
                            <p className="font-handwriting text-2xl mb-2 text-black/80">"Wait, it generated the exact React questions I needed?"</p>
                            <div className="flex items-center gap-2 text-sm font-bold text-black/60">
                                <Star className="w-4 h-4 fill-black/20" /> Sarah, Tech Lead
                            </div>
                        </StickyNote>
                        <StickyNote color="bg-[#E5E7EB]" rotation={3}>
                            <h4 className="font-bold mb-2">Did you know?</h4>
                            <p className="text-sm">Structured interviews predict performance <span className="font-bold underline">2x better</span> than unstructured ones.</p>
                        </StickyNote>
                    </div>
                </div>

                {/* Second Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                        title="Smart Scorecards"
                        description="Rate candidates on consistent criteria. No more 'gut feeling' that introduces bias."
                        icon={CheckCircle2}
                        className="bg-[#FFF7ED]" // Orange tint
                    />
                    <FeatureCard
                        title="Auto-Reminders"
                        description="We chase the candidates for you. Automated emails ensure everyone shows up on time."
                        icon={Clock}
                        className="bg-[#EFF6FF]" // Blue tint
                    />
                    <FeatureCard
                        title="Instant Feedback"
                        description="AI summarizes the interview highlights and red flags immediately after you finish."
                        icon={Zap}
                        className="bg-[#ECFDF5]" // Green tint (replaced Purple)
                    />
                </div>

            </div>
        </section>
    );
}
