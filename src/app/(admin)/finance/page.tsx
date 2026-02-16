"use client";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageTutorial from "@/components/common/PageTutorial";

import PermissionGuard from "@/components/common/PermissionGuard";
import WorkInProgress from "@/components/common/WorkInProgress";

export default function FinancePage() {
    const tutorialSteps = [
        {
            title: "Revenue Monitoring",
            description: "Track gross and net revenue across all storefront operations in real-time."
        },
        {
            title: "Payout Management",
            description: "Manage bank transfers, settlement cycles, and vendor payouts through a unified ledger."
        },
        {
            title: "Financial Reporting",
            description: "Download tax-ready reports and annual statements for your accounting requirements."
        }
    ];

    return (
        <PermissionGuard>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <PageBreadcrumb pageTitle="Finance" />
                <PageTutorial
                    title="Finance"
                    overview="The Finance module will serve as the financial heart of your operation, managing everything from revenue to payouts."
                    steps={tutorialSteps}
                />
            </div>

            <div className="space-y-6">
                <WorkInProgress title="Finance Management" />
            </div>
        </PermissionGuard>
    );
}
