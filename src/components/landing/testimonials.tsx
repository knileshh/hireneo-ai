'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import Image from 'next/image';

// Realistic testimonials data
const testimonials = [
    {
        id: 1,
        name: "Sarah Chen",
        role: "Tech Lead @ Google",
        avatar: "https://i.pravatar.cc/150?img=1",
        rating: 5,
        text: "The AI-generated questions are spot-on! Saved us hours of prep time and helped us find our best React developer ever."
    },
    {
        id: 2,
        name: "Marcus Johnson",
        role: "HR Director @ Stripe",
        avatar: "https://i.pravatar.cc/150?img=13",
        rating: 5,
        text: "Finally, a structured way to evaluate candidates. The scorecards eliminated bias and our hiring quality improved by 40%."
    },
    {
        id: 3,
        name: "Priya Sharma",
        role: "Founder @ TechStart",
        avatar: "https://i.pravatar.cc/150?img=5",
        rating: 5,
        text: "As a startup, we don't have a dedicated recruiter. HireNeo acts like our AI hiring assistant. Game changer!"
    },
    {
        id: 4,
        name: "David Kim",
        role: "Engineering Manager @ Meta",
        avatar: "https://i.pravatar.cc/150?img=12",
        rating: 4,
        text: "The automated reminders alone saved us from so many no-shows. Great ROI for our team."
    },
    {
        id: 5,
        name: "Emily Rodriguez",
        role: "CTO @ Innovate Labs",
        avatar: "https://i.pravatar.cc/150?img=9",
        rating: 5,
        text: "Love the instant AI evaluations. We can now give candidates feedback within 24 hours instead of weeks."
    }
];

export function Testimonials() {
    const averageRating = 4.9;
    const totalUsers = "34,198+";

    return (
        <section className="py-20 px-4 bg-white border-y border-black/5">
            <div className="max-w-7xl mx-auto">

                {/* Header with Social Proof */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-3 mb-4"
                    >
                        {/* Avatar Stack */}
                        <div className="flex -space-x-2">
                            {testimonials.slice(0, 5).map((testimonial, i) => (
                                <div
                                    key={testimonial.id}
                                    className="relative w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-md"
                                    style={{ zIndex: 5 - i }}
                                >
                                    <Image
                                        src={testimonial.avatar}
                                        alt={testimonial.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-2">
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className="w-5 h-5 fill-[#FDE047] text-[#FDE047]"
                                    />
                                ))}
                            </div>
                            <span className="font-bold text-lg">{averageRating}/5.0</span>
                        </div>
                    </motion.div>

                    <p className="text-muted-foreground text-sm">
                        Used by <span className="font-bold text-foreground">{totalUsers} people</span>
                    </p>

                    <h2 className="font-heading font-bold text-4xl md:text-5xl mt-8 mb-4">
                        Loved by{' '}
                        <span className="relative inline-block">
                            <span className="relative z-10">hiring teams</span>
                            <span className="absolute bottom-1 left-0 right-0 h-3 bg-[#ECFDF5] -z-0 transform -rotate-1 rounded-sm"></span>
                        </span>
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Join thousands of companies making better hiring decisions with AI
                    </p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={testimonial.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-[#FAFAF9] p-6 rounded-2xl border border-black/5 hover:shadow-md transition-shadow"
                        >
                            {/* Stars */}
                            <div className="flex gap-1 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-[#FDE047] text-[#FDE047]" />
                                ))}
                            </div>

                            {/* Testimonial Text */}
                            <p className="text-foreground/80 mb-6 leading-relaxed">
                                "{testimonial.text}"
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                                    <Image
                                        src={testimonial.avatar}
                                        alt={testimonial.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">{testimonial.name}</p>
                                    <p className="text-muted-foreground text-xs">{testimonial.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
