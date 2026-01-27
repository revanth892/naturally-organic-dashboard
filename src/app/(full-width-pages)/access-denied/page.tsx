import Link from "next/link";
import React from "react";

export default function AccessDenied() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-error-500">403</h1>
                <h2 className="mt-4 text-3xl font-bold text-gray-800 dark:text-white sm:text-4xl">
                    Access Denied
                </h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                    Oops! You don&apos;t have permission to access this page.
                    Please contact your administrator if you think this is a mistake.
                </p>
                <div className="mt-8">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white transition-all bg-brand-500 rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
