import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Static blog posts data (in production, this would come from MDX files or CMS)
const posts = [
    {
        slug: 'getting-started',
        title: 'Getting Started with HireNeo AI',
        description: 'Learn how to set up your first AI-powered interview in minutes.',
        date: '2024-12-28',
        readTime: '5 min read',
        category: 'Guide',
    },
    {
        slug: 'ai-hiring-guide',
        title: 'The Complete Guide to AI-Powered Hiring',
        description: 'Discover how artificial intelligence is transforming the recruitment landscape.',
        date: '2024-12-25',
        readTime: '8 min read',
        category: 'AI',
    },
    {
        slug: 'interview-best-practices',
        title: '5 Interview Best Practices for 2025',
        description: 'Tips from hiring experts on conducting effective interviews.',
        date: '2024-12-20',
        readTime: '6 min read',
        category: 'Tips',
    },
    {
        slug: 'reduce-bias',
        title: 'How to Reduce Interview Bias with AI',
        description: 'Structured evaluations help eliminate unconscious bias in hiring.',
        date: '2024-12-15',
        readTime: '7 min read',
        category: 'AI',
    },
    {
        slug: 'why-scorecards-matter',
        title: 'Why Interview Scorecards Matter',
        description: 'Building consistent evaluation frameworks for better hiring decisions.',
        date: '2024-12-10',
        readTime: '5 min read',
        category: 'Guide',
    },
];

export default function BlogPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <nav className="border-b py-4 px-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link href="/" className="font-bold text-xl">HireNeo AI</Link>
                    <div className="flex gap-6 text-sm">
                        <Link href="/pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link>
                        <Link href="/blog" className="font-medium">Blog</Link>
                        <Link href="/sign-in" className="text-muted-foreground hover:text-foreground">Sign In</Link>
                    </div>
                </div>
            </nav>

            {/* Blog Header */}
            <section className="py-12 px-4 text-center border-b">
                <h1 className="text-4xl font-bold mb-4">Blog</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Insights on AI-powered hiring, interview best practices, and building great teams.
                </p>
            </section>

            {/* Blog Posts */}
            <section className="py-12 px-4">
                <div className="max-w-4xl mx-auto grid gap-6">
                    {posts.map((post) => (
                        <Link href={`/blog/${post.slug}`} key={post.slug}>
                            <Card className="hover:border-primary transition-colors cursor-pointer">
                                <CardHeader>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                        <span className="bg-muted px-2 py-1 rounded">{post.category}</span>
                                        <span>{post.date}</span>
                                        <span>{post.readTime}</span>
                                    </div>
                                    <CardTitle className="text-xl">{post.title}</CardTitle>
                                    <CardDescription>{post.description}</CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Newsletter */}
            <section className="py-12 bg-muted/50 px-4">
                <div className="max-w-xl mx-auto text-center">
                    <h2 className="text-xl font-bold mb-2">Subscribe to our newsletter</h2>
                    <p className="text-muted-foreground text-sm mb-4">
                        Get the latest insights on AI hiring delivered to your inbox.
                    </p>
                    <div className="flex gap-2 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="your@email.com"
                            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium">
                            Subscribe
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t px-4">
                <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
                    <p>© 2024 HireNeo AI. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
