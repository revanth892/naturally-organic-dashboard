"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
    const router = useRouter();

    useEffect(() => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (token) {
            router.replace("/products");
        } else {
            router.replace("/signin");
        }
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
}
