import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import { ThemeProvider } from "@/context/ThemeContext";
import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative bg-white dark:bg-gray-900 h-screen overflow-hidden">
      <ThemeProvider>
        <div className="flex flex-col lg:flex-row w-full h-full">
          {/* Left Side: Form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
            {children}
          </div>

          {/* Right Side: Branding */}
          <div className="hidden lg:flex lg:w-1/2 bg-brand-600 dark:bg-brand-900 items-center justify-center relative overflow-hidden">
            {/* Subtle background pattern (optional, but keep it clean) */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
              <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
            </div>

            <div className="relative z-10 text-center px-12">
              <Link href="/dashboard" className="inline-block mb-8">
                <span className="text-4xl xl:text-5xl font-extrabold tracking-tighter text-white uppercase drop-shadow-md">
                  Naturally <br /> Organic
                </span>
              </Link>
              <div className="w-24 h-1 bg-white/30 mx-auto mb-8 rounded-full"></div>
              {/* <p className="text-xl text-brand-50 font-medium max-w-sm mx-auto leading-relaxed opacity-90">
                Purity on your plate, <br />health in every bite.
              </p> */}
            </div>
          </div>

          {/* Theme Toggler */}
          <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
            <ThemeTogglerTwo />
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
