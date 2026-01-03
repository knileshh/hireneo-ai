import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { posts } from '@/lib/blog-data';
import { NewsletterForm } from '@/components/newsletter-form';
import { Navbar } from '@/components/landing/navbar';

export default function BlogPage() {
    // Convert posts object to array for mapping
    const postsList = Object.values(posts).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <Navbar />

            {/* Blog Header */}
            <section className="py-20 px-4 text-center border-b bg-[#FAFAF9]">
                <h1 className="text-5xl font-heading font-bold mb-6">Our Blog</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Insights on AI-powered hiring, future of work trends, and strategies for building world-class teams in 2026.
                </p>
            </section>

            {/* Blog Posts */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {postsList.map((post) => (
                        <Link href={`/blog/${post.slug}`} key={post.slug} className="group h-full">
                            <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 border-black/10 group-hover:border-[#1A3305]/50 py-0 gap-0">
                                <div className="h-56 relative w-full overflow-hidden bg-gray-100">
                                    <img
                                        src={post.imageUrl}
                                        alt={post.title}
                                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <CardHeader className="flex-1 flex flex-col py-6">
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">
                                        <span className="text-[#1A3305] bg-[#1A3305]/5 px-2 py-1 rounded-full">{post.category}</span>
                                        <span>•</span>
                                        <span>{post.date}</span>
                                        <span>•</span>
                                        <span>{post.readTime}</span>
                                    </div>
                                    <CardTitle className="text-xl font-bold mb-3 line-clamp-2 leading-tight group-hover:text-[#1A3305] transition-colors">{post.title}</CardTitle>
                                    <CardDescription className="line-clamp-3 text-sm leading-relaxed">{post.description}</CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Newsletter */}
            <section className="py-24 bg-[#1A3305] text-white px-4">
                <div className="max-w-xl mx-auto text-center">
                    <h2 className="text-3xl font-heading font-bold mb-4">Subscribe to our newsletter</h2>
                    <p className="text-white/80 mb-8 font-light">
                        Get the latest insights on AI hiring delivered to your inbox every week.
                    </p>
                    <div className="max-w-md mx-auto">
                        <NewsletterForm variant="inverted" />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t px-4 bg-[#FAFAF9]">
                <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
                    <p>© 2026 HireNeo AI. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
