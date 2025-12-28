import Link from 'next/link';
import { notFound } from 'next/navigation';

// Sample blog posts content
const posts: Record<string, { title: string; content: string; date: string; category: string }> = {
    'getting-started': {
        title: 'Getting Started with HireNeo AI',
        date: '2024-12-28',
        category: 'Guide',
        content: `
# Getting Started with HireNeo AI

Welcome to HireNeo AI! This guide will walk you through setting up your first AI-powered interview.

## Step 1: Create Your Account

Sign up for HireNeo AI using your email or Google account. The free tier gives you 5 interviews per month.

## Step 2: Schedule Your First Interview

Click "New Interview" from the dashboard and fill in:
- Candidate name and email
- Job role and experience level
- Interview date and time

## Step 3: Generate AI Questions

Our AI will automatically generate tailored interview questions based on the job role. You can review and customize these questions.

## Step 4: Conduct the Interview

After the interview, fill out the scorecard to rate the candidate across key dimensions:
- Technical Skills
- Communication
- Culture Fit
- Problem Solving

## Step 5: Get AI Evaluation

Click "Run Evaluation" to generate an AI-powered summary with:
- Overall score (1-10)
- Key strengths
- Potential risks
- Hiring recommendation

That's it! You're now ready to make data-driven hiring decisions.
    `,
    },
    'ai-hiring-guide': {
        title: 'The Complete Guide to AI-Powered Hiring',
        date: '2024-12-25',
        category: 'AI',
        content: `
# The Complete Guide to AI-Powered Hiring

Artificial intelligence is revolutionizing how companies hire. Here's what you need to know.

## What is AI-Powered Hiring?

AI-powered hiring uses machine learning to:
- Screen resumes at scale
- Generate interview questions
- Analyze candidate responses
- Provide objective evaluations

## Benefits of AI in Hiring

### 1. Reduced Bias
Structured evaluations help eliminate unconscious bias by focusing on objective criteria.

### 2. Time Savings
AI can process candidate data in seconds, saving hours of manual review.

### 3. Consistency
Every candidate is evaluated using the same criteria, ensuring fairness.

### 4. Better Predictions
AI models can identify patterns that predict job success.

## Best Practices

- Always keep humans in the loop for final decisions
- Regularly audit your AI for bias
- Be transparent with candidates about AI use
- Use AI to augment, not replace, human judgment

The future of hiring is here. Embrace AI while maintaining the human connection.
    `,
    },
};

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
            <nav className="border-b py-4 px-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link href="/" className="font-bold text-xl">HireNeo AI</Link>
                    <div className="flex gap-6 text-sm">
                        <Link href="/pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link>
                        <Link href="/blog" className="font-medium">Blog</Link>
                    </div>
                </div>
            </nav>

            {/* Article */}
            <article className="py-12 px-4">
                <div className="max-w-3xl mx-auto">
                    <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-block">
                        ← Back to Blog
                    </Link>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span className="bg-muted px-2 py-1 rounded">{post.category}</span>
                        <span>{post.date}</span>
                    </div>

                    <h1 className="text-4xl font-bold mb-8">{post.title}</h1>

                    <div className="prose prose-neutral dark:prose-invert max-w-none">
                        {post.content.split('\n').map((line, i) => {
                            if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-bold mt-8 mb-4">{line.slice(2)}</h1>;
                            if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold mt-6 mb-3">{line.slice(3)}</h2>;
                            if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-semibold mt-4 mb-2">{line.slice(4)}</h3>;
                            if (line.startsWith('- ')) return <li key={i} className="ml-4">{line.slice(2)}</li>;
                            if (line.trim()) return <p key={i} className="my-2 text-muted-foreground">{line}</p>;
                            return null;
                        })}
                    </div>
                </div>
            </article>

            {/* Footer */}
            <footer className="py-8 border-t px-4">
                <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
                    <p>© 2024 HireNeo AI. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
