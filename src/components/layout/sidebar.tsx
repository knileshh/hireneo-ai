'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    LogOut,
    BrainCircuit
} from 'lucide-react';
import { UserButton } from '@clerk/nextjs';

const sidebarItems = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Interviews',
        href: '/dashboard/interviews', // We'll map this to search/filter later
        icon: Users,
    },
    {
        title: 'Evaluations',
        href: '/dashboard/evaluations',
        icon: FileText,
    },
    {
        title: 'Settings',
        href: '/dashboard/settings',
        icon: Settings,
    },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex bg-card h-full w-64 flex-col border-r">
            <div className="p-6">
                <Link href="/" className="flex items-center gap-2 font-heading font-bold text-xl text-[#1A3305]">
                    <BrainCircuit className="h-6 w-6" />
                    <span>HireNeo AI</span>
                </Link>
            </div>

            <div className="flex-1 px-3 py-2">
                <nav className="space-y-1">
                    {sidebarItems.map((item) => (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant={pathname === item.href ? 'secondary' : 'ghost'}
                                className={cn(
                                    'w-full justify-start gap-3 rounded-xl font-medium',
                                    pathname === item.href
                                        ? 'bg-[#FEF08A] text-black hover:bg-[#FDE047]' // Active: Yellow
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.title}
                            </Button>
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="border-t p-4">
                <div className="flex items-center gap-3 px-2">
                    <UserButton afterSignOutUrl="/" />
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">My Account</span>
                        <span className="text-xs text-muted-foreground">Manage profile</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
