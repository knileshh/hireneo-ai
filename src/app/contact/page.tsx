import { Metadata } from 'next';
import { Mail, MessageSquare, Phone } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Contact Us - HireNeo AI',
    description: 'Get in touch with the HireNeo AI team.',
};

export default function ContactPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-20">
            <h1 className="text-4xl font-bold mb-6 font-heading">Get in Touch</h1>
            <p className="text-xl text-muted-foreground mb-12">
                Have questions about our platform or want to schedule a demo? We're here to help.
            </p>

            <div className="grid md:grid-cols-2 gap-12">
                <div>
                    <div className="space-y-8">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#1A3305]/10 flex items-center justify-center text-[#1A3305]">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">Email</h3>
                                <p className="text-gray-600 mb-1">General inquiries & support</p>
                                <a href="mailto:support@hireneo-ai.xyz" className="text-[#1A3305] font-medium hover:underline">support@hireneo-ai.xyz</a>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#1A3305]/10 flex items-center justify-center text-[#1A3305]">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">Sales</h3>
                                <p className="text-gray-600 mb-1">For enterprise plans & demos</p>
                                <a href="mailto:sales@hireneo-ai.xyz" className="text-[#1A3305] font-medium hover:underline">sales@hireneo-ai.xyz</a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Simple Contact Form */}
                <div className="bg-[#FAFAF9] p-8 rounded-2xl border border-black/5">
                    <h3 className="font-bold text-xl mb-6">Send us a message</h3>
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Name</label>
                            <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-[#1A3305] outline-none" placeholder="Your name" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input type="email" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-[#1A3305] outline-none" placeholder="you@company.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Message</label>
                            <textarea className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-[#1A3305] outline-none h-32" placeholder="How can we help?"></textarea>
                        </div>
                        <button className="w-full py-3 bg-[#1A3305] text-white font-bold rounded-lg hover:bg-[#1A3305]/90 transition-colors">
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
