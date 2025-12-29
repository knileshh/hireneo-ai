import { Checkout } from "@polar-sh/nextjs";

export const GET = Checkout({
    accessToken: process.env.POLAR_ACCESS_TOKEN!,
    successUrl: process.env.NEXT_PUBLIC_BASE_URL
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?subscribed=true`
        : "http://localhost:3000/dashboard?subscribed=true",
    server: process.env.NODE_ENV === "production" ? "production" : "sandbox",
});
