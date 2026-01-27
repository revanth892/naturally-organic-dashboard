"use client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";

interface PermissionGuardProps {
    children: ReactNode;
    permission?: string;
}

export default function PermissionGuard({ children, permission }: PermissionGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");

        if (!token || !userStr) {
            router.push("/signin");
            return;
        }

        const user = JSON.parse(userStr);

        if (permission) {
            if (user[permission] === true) {
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
                router.push("/access-denied");
            }
        } else {
            // If no specific permission is required, just being logged in is enough for now
            setIsAuthorized(true);
        }
    }, [permission, router, pathname]);

    if (isAuthorized === null) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return isAuthorized ? <>{children}</> : null;
}
