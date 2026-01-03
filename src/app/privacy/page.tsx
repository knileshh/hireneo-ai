import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy - HireNeo AI',
    description: 'How we collect, use, and protect your data at HireNeo AI.',
};

export default function PrivacyPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-20">
            <h1 className="text-4xl font-bold mb-8 font-heading">Privacy Policy</h1>
            <p className="text-muted-foreground mb-8">Last updated: January 3, 2026</p>

            <div className="prose prose-slate max-w-none">
                <p className="mb-4">
                    At HireNeo AI, we take your privacy seriously. This policy explains how we collect, use, and protect your personal information.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">1. Information We Collect</h2>
                <p className="mb-4">
                    We collect information you provide directly to us, such as when you create an account, subscribe to our newsletter, or use our interview assessment tools. This includes your name, email address, and interview responses.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">2. How We Use Your Information</h2>
                <p className="mb-4">
                    We use your information to provide, maintain, and improve our services, including generating personalized interview questions and analyzing assessment performance.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">3. Data Security</h2>
                <p className="mb-4">
                    We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">4. Contact Us</h2>
                <p className="mb-4">
                    If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@hireneo-ai.xyz" className="text-primary hover:underline">support@hireneo-ai.xyz</a>.
                </p>
            </div>
        </div>
    );
}
