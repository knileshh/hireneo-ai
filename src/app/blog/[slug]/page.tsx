import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { posts } from '@/lib/blog-data';
import { NewsletterForm } from '@/components/newsletter-form';
import { Navbar } from '@/components/landing/navbar';

export default async function BlogPostPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const post = posts[slug];

    if (!post) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            {/* Navigation */}
            <Navbar />

            {/* Article */}
            <article className="py-20 px-4">
                <div className="max-w-3xl mx-auto">
                    <Link href="/blog" className="text-sm text-muted-foreground hover:text-[#1A3305] mb-8 inline-flex items-center group transition-colors">
                        <span className="group-hover:-translate-x-1 transition-transform">←</span>
                        <span className="ml-2">Back to Blog</span>
                    </Link>

                    {/* Header */}
                    <div className="mb-12">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                            <span className="bg-[#1A3305]/5 text-[#1A3305] px-3 py-1 rounded-full font-medium text-xs uppercase tracking-wider">{post.category}</span>
                            <span>{post.date}</span>
                            <span>•</span>
                            <span>{post.readTime}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-heading font-extrabold mb-8 leading-tight text-foreground">{post.title}</h1>
                        <div className="aspect-video w-full rounded-2xl overflow-hidden mb-8 bg-gray-100 shadow-sm">
                            <img
                                src={post.imageUrl}
                                alt={post.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="prose prose-lg prose-slate max-w-none prose-headings:font-heading prose-headings:font-bold prose-h1:hidden prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-p:leading-relaxed prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-foreground prose-a:text-[#1A3305]">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {post.content}
                        </ReactMarkdown>
                    </div>

                    {/* Share/CTA */}
                    <div className="mt-16 pt-8 border-t border-black/10">
                        <div className="bg-[#FAFAF9] p-8 rounded-2xl border border-black/5 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h3 className="font-bold text-xl mb-2">Enjoyed this article?</h3>
                                <p className="text-muted-foreground">Subscribe to get more insights like this to your inbox.</p>
                            </div>
                            <div className="w-full md:w-auto">
                                <NewsletterForm />
                            </div>
                        </div>
                    </div>
                </div>
            </article>

            {/* Footer */}
            <footer className="py-8 border-t px-4 bg-[#FAFAF9]">
                <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
                    <p>© 2026 HireNeo AI. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
