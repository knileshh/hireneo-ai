import { Sidebar } from '@/components/layout/sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Sidebar */}
            <aside className="hidden md:block">
                <Sidebar />
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto p-8 max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
