import React from "react";
import { Hammer, Clock } from "lucide-react";

interface WorkInProgressProps {
    title: string;
}

export default function WorkInProgress({ title }: WorkInProgressProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-white rounded-3xl border border-gray-100 shadow-sm dark:bg-gray-900 dark:border-gray-800">
            <div className="relative mb-6">
                <div className="w-24 h-24 bg-brand-50 rounded-full flex items-center justify-center dark:bg-brand-500/10">
                    <Hammer className="w-10 h-10 text-brand-600 dark:text-brand-400 animate-bounce" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm dark:bg-gray-800">
                    <Clock className="w-6 h-6 text-orange-500 animate-pulse" />
                </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90 mb-3">
                {title} Under Development
            </h2>

            <p className="max-w-md text-gray-500 dark:text-gray-400 leading-relaxed">
                We're currently perfecting the <strong>{title}</strong> module to give you the best experience. Check back soon for powerful insights and management tools!
            </p>

            <div className="mt-8 flex gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-500 animate-ping"></div>
                <div className="w-2 h-2 rounded-full bg-brand-400 animate-ping [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-brand-300 animate-ping [animation-delay:0.4s]"></div>
            </div>
        </div>
    );
}
