import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Use - HireNeo AI',
    description: 'Terms and conditions for using HireNeo AI.',
};

export default function TermsPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-20">
            <h1 className="text-4xl font-bold mb-8 font-heading">Terms of Use</h1>
            <p className="text-muted-foreground mb-8">Last updated: January 3, 2026</p>

            <div className="prose prose-slate max-w-none">
                <p className="mb-4">
                    Welcome to HireNeo AI. By accessing our website and using our services, you agree to comply with and be bound by the following terms and conditions.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
                <p className="mb-4">
                    By accessing and using HireNeo AI, you accept and agree to be bound by the terms and provision of this agreement.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">2. Use of Service</h2>
                <p className="mb-4">
                    You agree to use HireNeo AI only for lawful purposes and in a way that does not infringe the rights of, restrict or inhibit anyone else's use and enjoyment of the website.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">3. AI-Generated Content</h2>
                <p className="mb-4">
                    Our service utilizes Artificial Intelligence to generate interview questions, assessments, and feedback. While we strive for accuracy, you acknowledge that AI-generated content may not always be 100% accurate or free from bias.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">4. Changes to Terms</h2>
                <p className="mb-4">
                    We reserve the right to modify these terms at any time. Your continued use of the service after any such changes constitutes your acceptance of the new terms.
                </p>
            </div>
        </div>
    );
}
