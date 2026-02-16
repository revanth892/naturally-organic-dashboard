import { Metadata } from "next";
import Link from "next/link";
import { ChevronLeftIcon } from "@/icons";

export const metadata: Metadata = {
    title: "Reset Password | Naturally Organic",
    description: "Reset your account password",
};

export default function ResetPasswordPage() {
    return (
        <div className="flex flex-col flex-1 lg:w-1/2 w-full">
            <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
                <Link
                    href="/signin"
                    className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                    <ChevronLeftIcon />
                    Back to sign in
                </Link>
            </div>
            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                <div>
                    <div className="mb-5 sm:mb-8">
                        <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                            Reset Password
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Please contact your system administrator to reset your password.
                        </p>
                    </div>

                    <div className="p-4 rounded-lg bg-brand-50 border border-brand-100 dark:bg-brand-500/10 dark:border-brand-500/20">
                        <p className="text-sm text-brand-700 dark:text-brand-400">
                            For security reasons, password resets must be performed through the User Management panel by an authorized administrator.
                        </p>
                    </div>

                    <div className="mt-8">
                        <Link
                            href="/signin"
                            className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition-colors rounded-lg bg-brand-500 hover:bg-brand-600 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                        >
                            Return to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
