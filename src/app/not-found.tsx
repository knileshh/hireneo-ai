'use client';

import Link from 'next/link';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    // Optimization: Use MotionValues instead of State to prevent re-renders on every mouse move
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth spring animation for the eye movement
    const springConfig = { damping: 15, stiffness: 150 };
    const eyeX = useSpring(mouseX, springConfig);
    const eyeY = useSpring(mouseY, springConfig);

    const pathname = usePathname();

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Calculate mouse position relative to window center
            // Limit the movement range (divided by 15) so the iris stays within the eye
            const x = (e.clientX - window.innerWidth / 2) / 15;
            const y = (e.clientY - window.innerHeight / 2) / 15;

            mouseX.set(x);
            mouseY.set(y);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <div className="min-h-screen bg-[#FAFAF9] flex flex-col items-center justify-center p-4 text-center overflow-hidden relative">

            {/* Text Content - Top */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                className="mb-12 relative z-10"
            >
                <div className="inline-block bg-red-100/80 border border-red-200 text-red-600 px-6 py-2 rounded-full text-sm font-bold mb-6 tracking-wide uppercase font-mono shadow-sm">
                    {pathname} NOT FOUND
                </div>

                <h1 className="text-5xl md:text-7xl font-heading font-extrabold mb-6 tracking-tight text-[#1A3305]">
                    Qualification Mismatch
                </h1>

                <p className="text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
                    Our AI recruiters have searched the entire database, but this page seems to have been rejected.
                </p>
            </motion.div>

            {/* 3D Interactive AI Eyes - Middle */}
            <motion.div
                className="flex gap-8 mb-16 relative z-10"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            >
                {/* Left Eye */}
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center relative overflow-hidden shadow-[inset_-10px_-10px_30px_rgba(0,0,0,0.2),_0_10px_40px_rgba(0,0,0,0.1)]">
                    {/* Sclera/Socket Shading */}
                    <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,_#ffffff_0%,_#f0f0f0_40%,_#d9d9d9_100%)] opacity-50" />

                    <motion.div
                        className="w-16 h-16 rounded-full relative shadow-lg"
                        style={{
                            x: eyeX,
                            y: eyeY,
                            background: 'radial-gradient(circle at center, #3A5F1F 0%, #1A3305 70%, #0d1a03 100%)',
                        }}
                    >
                        {/* Iris Texture/Detail */}
                        <div className="absolute inset-0 rounded-full opacity-30 bg-[repeating-conic-gradient(#5C8D2D_0deg_10deg,_transparent_10deg_20deg)]" />

                        {/* Pupil */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-black rounded-full shadow-[0_0_10px_rgba(0,0,0,0.8)]" />

                        {/* Glare/Reflection */}
                        <div className="absolute top-3 left-3 w-4 h-2 bg-white rounded-full opacity-60 blur-[1px] -rotate-45" />
                        <div className="absolute bottom-4 right-4 w-2 h-1 bg-white rounded-full opacity-30 blur-[1px] -rotate-45" />
                    </motion.div>
                </div>

                {/* Right Eye */}
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center relative overflow-hidden shadow-[inset_-10px_-10px_30px_rgba(0,0,0,0.2),_0_10px_40px_rgba(0,0,0,0.1)]">
                    {/* Sclera/Socket Shading */}
                    <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,_#ffffff_0%,_#f0f0f0_40%,_#d9d9d9_100%)] opacity-50" />

                    <motion.div
                        className="w-16 h-16 rounded-full relative shadow-lg"
                        style={{
                            x: eyeX,
                            y: eyeY,
                            background: 'radial-gradient(circle at center, #3A5F1F 0%, #1A3305 70%, #0d1a03 100%)',
                        }}
                    >
                        {/* Iris Texture/Detail */}
                        <div className="absolute inset-0 rounded-full opacity-30 bg-[repeating-conic-gradient(#5C8D2D_0deg_10deg,_transparent_10deg_20deg)]" />

                        {/* Pupil */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-black rounded-full shadow-[0_0_10px_rgba(0,0,0,0.8)]" />

                        {/* Glare/Reflection */}
                        <div className="absolute top-3 left-3 w-4 h-2 bg-white rounded-full opacity-60 blur-[1px] -rotate-45" />
                        <div className="absolute bottom-4 right-4 w-2 h-1 bg-white rounded-full opacity-30 blur-[1px] -rotate-45" />
                    </motion.div>
                </div>
            </motion.div>

            {/* Button - Bottom */}
            <motion.div
                className="relative z-20 inline-block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            >
                <Link href="/">
                    <Button className="h-14 px-8 rounded-full bg-[#1A3305] text-white hover:bg-[#1A3305]/90 text-lg font-bold shadow-lg shadow-[#1A3305]/20 hover:scale-105 transition-all duration-300">
                        Return to Homepage
                    </Button>
                </Link>
            </motion.div>

            {/* Background Elements */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
            >
                <span className="text-[35vw] font-syne font-extrabold text-black/[0.03] leading-none tracking-tighter">
                    404
                </span>
            </motion.div>
        </div>
    );
}
