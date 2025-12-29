'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    LogOut,
    Briefcase,
    User,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

const sidebarItems = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Jobs',
        href: '/dashboard/jobs',
        icon: Briefcase,
    },
    {
        title: 'Interviews',
        href: '/dashboard/interviews',
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
    const router = useRouter();
    const [user, setUser] = useState<{ email?: string; full_name?: string } | null>(null);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) {
                setUser({
                    email: data.user.email,
                    full_name: data.user.user_metadata?.full_name,
                });
            }
        });
    }, []);

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    return (
        <div className="flex bg-card h-full w-64 flex-col border-r">
            <div className="p-6">
                <Link href="/" className="flex items-center gap-2 font-heading font-bold text-xl text-[#1A3305]">
                    <Image src="/logo.png" alt="HireNeo AI" width={32} height={32} className="rounded-md" />
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
                                        ? 'bg-[#FEF08A] text-black hover:bg-[#FDE047]'
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
                    <div className="w-8 h-8 rounded-full bg-[#1A3305] flex items-center justify-center text-white">
                        <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="block text-sm font-medium truncate">
                            {user?.full_name || 'My Account'}
                        </span>
                        <span className="block text-xs text-muted-foreground truncate">
                            {user?.email || 'Loading...'}
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSignOut}
                        className="text-gray-500 hover:text-red-600"
                    >
                        <LogOut className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

