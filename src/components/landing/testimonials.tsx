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
    },
    {
        id: 6,
        name: "Alex Thompson",
        role: "Recruiter @ Airbnb",
        avatar: "https://i.pravatar.cc/150?img=7",
        rating: 5,
        text: "This platform streamlined our entire interview process. The question bank alone is worth the subscription."
    },
    {
        id: 7,
        name: "Lisa Park",
        role: "VP Talent @ Uber",
        avatar: "https://i.pravatar.cc/150?img=10",
        rating: 5,
        text: "Reduced our time-to-hire by 50%. The AI insights are incredibly accurate and helpful."
    },
    {
        id: 8,
        name: "James Wilson",
        role: "Founder @ StartupX",
        avatar: "https://i.pravatar.cc/150?img=14",
        rating: 5,
        text: "Best investment for our hiring process. The scorecards keep everyone aligned on candidate evaluation."
    },
];

// Duplicate testimonials for seamless infinite scroll
const extendedTestimonials = [...testimonials, ...testimonials];

export function Testimonials() {
    return (
        <section className="py-20 px-4 bg-white border-y border-black/5 overflow-hidden">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="font-heading font-bold text-4xl md:text-5xl mb-4">
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

                {/* Scrolling Marquee - Row 1 (Left to Right) */}
                <div className="relative mb-6">
                    <div className="flex gap-6 animate-marquee">
                        {extendedTestimonials.slice(0, 8).map((testimonial, index) => (
                            <TestimonialCard key={`row1-${testimonial.id}-${index}`} testimonial={testimonial} />
                        ))}
                    </div>
                </div>

                {/* Scrolling Marquee - Row 2 (Right to Left) */}
                <div className="relative">
                    <div className="flex gap-6 animate-marquee-reverse">
                        {extendedTestimonials.slice(0, 8).reverse().map((testimonial, index) => (
                            <TestimonialCard key={`row2-${testimonial.id}-${index}`} testimonial={testimonial} />
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes marquee-reverse {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0%);
          }
        }

        .animate-marquee {
          animation: marquee 40s linear infinite;
        }

        .animate-marquee-reverse {
          animation: marquee-reverse 40s linear infinite;
        }
      `}</style>
        </section>
    );
}

// Testimonial Card Component
function TestimonialCard({ testimonial }: { testimonial: typeof testimonials[0] }) {
    return (
        <div className="flex-shrink-0 w-[380px] bg-[#FAFAF9] p-6 rounded-2xl border border-black/5 shadow-sm">
            {/* Stars */}
            <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#FDE047] text-[#FDE047]" />
                ))}
            </div>

            {/* Testimonial Text */}
            <p className="text-foreground/80 mb-6 leading-relaxed text-sm">
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
        </div>
    );
}
