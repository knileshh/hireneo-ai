import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Community - HireNeo AI',
    description: 'Join the HireNeo AI community.',
};

export default function CommunityPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-20">
            <h1 className="text-4xl font-bold mb-6 font-heading">HireNeo Community</h1>
            <p className="text-xl text-muted-foreground mb-12">
                Connect with other recruiters, hiring managers, and candidates sharing their experiences.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-[#1A3305]/5 p-8 rounded-2xl border border-[#1A3305]/10">
                    <h2 className="text-2xl font-bold mb-4">Discord Server</h2>
                    <p className="mb-6">Join our real-time chat for tips, support, and networking.</p>
                    <button className="px-6 py-3 bg-[#5865F2] text-white font-bold rounded-lg hover:bg-[#5865F2]/90 transition-colors w-full">Join Discord</button>
                </div>

                <div className="bg-[#1A3305]/5 p-8 rounded-2xl border border-[#1A3305]/10">
                    <h2 className="text-2xl font-bold mb-4">LinkedIn Group</h2>
                    <p className="mb-6">Professional discussions on the future of AI in recruitment.</p>
                    <button className="px-6 py-3 bg-[#0A66C2] text-white font-bold rounded-lg hover:bg-[#1A3305]/90 transition-colors w-full">Join Group</button>
                </div>
            </div>

            <div className="mt-16 text-center">
                <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
                <p className="text-muted-foreground">No events scheduled at the moment. Check back soon!</p>
            </div>
        </div>
    );
}
