import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Recruitment Strategies - HireNeo AI',
    description: 'Modern recruitment strategies powered by AI.',
};

export default function RecruitmentPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-20">
            <h1 className="text-4xl font-bold mb-6 font-heading">Recruitment Strategy</h1>
            <p className="text-xl text-muted-foreground mb-12">
                Building high-performing teams requires more than just filling seats.
            </p>

            <div className="space-y-12">
                <section>
                    <h2 className="text-2xl font-bold mb-4 font-heading">1. Define Clear Role Requirements</h2>
                    <p className="text-gray-600 leading-relaxed">
                        Success starts with knowing exactly what you're looking for. HireNeo AI helps you craft precise job descriptions and competencies.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 font-heading">2. Reduce Unconscious Bias</h2>
                    <p className="text-gray-600 leading-relaxed">
                        Traditional screening is fraught with bias. Our AI evaluates candidates based purely on their skills and potential, ensuring a fairer process.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 font-heading">3. Optimize for Speed and Quality</h2>
                    <p className="text-gray-600 leading-relaxed">
                        The best candidates don't wait around. Automated workflows keep the momentum going, reducing time-to-hire without sacrificing quality.
                    </p>
                </section>
            </div>

            <div className="mt-16 bg-[#FAFAF9] p-8 rounded-2xl border border-black/5">
                <h3 className="text-xl font-bold mb-4">Want to learn more?</h3>
                <p className="mb-6 text-gray-600">Check out our blog for the latest insights in recruitment technology.</p>
                <Link href="/blog" className="px-6 py-3 bg-white border border-gray-300 font-bold rounded-lg hover:border-[#1A3305] transition-colors">
                    Visit Blog
                </Link>
            </div>
        </div>
    );
}
