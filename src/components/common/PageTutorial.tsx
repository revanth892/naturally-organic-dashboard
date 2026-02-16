"use client";
import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { HelpCircle, BookOpen, CheckCircle2, Info, Lightbulb, PlayCircle } from "lucide-react";

export interface TutorialStep {
    title: string;
    description: string;
    icon?: React.ReactNode;
}

interface PageTutorialProps {
    title: string;
    overview: string;
    steps: TutorialStep[];
}

export default function PageTutorial({ title, overview, steps }: PageTutorialProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-brand-600 bg-brand-50 rounded-xl hover:bg-brand-100 transition-all dark:bg-brand-500/10 dark:text-brand-400 group"
            >
                <PlayCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Tutorial</span>
            </button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} className="max-w-[600px]">
                <div className="p-8">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                {title} Tutorial
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                Master this section in minutes
                            </p>
                        </div>
                    </div>

                    {/* Overview Card */}
                    <div className="bg-gray-50 dark:bg-white/[0.03] rounded-2xl p-5 mb-8 border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2 mb-2 text-brand-600 dark:text-brand-400">
                            <Info className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Overview</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            {overview}
                        </p>
                    </div>

                    {/* Steps */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2 text-orange-500">
                            <Lightbulb className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">How to Use</span>
                        </div>

                        <div className="grid gap-6">
                            {steps.map((step, index) => (
                                <div key={index} className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-sm border border-brand-100 dark:border-brand-500/20">
                                        {index + 1}
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-bold text-gray-800 dark:text-white">
                                            {step.title}
                                        </h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Action */}
                    <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-800">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            <span>Got it, thanks!</span>
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
