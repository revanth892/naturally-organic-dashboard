"use client";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageTutorial from "@/components/common/PageTutorial";

import PermissionGuard from "@/components/common/PermissionGuard";
import WorkInProgress from "@/components/common/WorkInProgress";

export default function AnalyticsPage() {
    const tutorialSteps = [
        {
            title: "Sales Trends",
            description: "Visualize your revenue over time with daily, weekly, and monthly growth charts."
        },
        {
            title: "Customer Insights",
            description: "Understand your audience with data on registration peaks and high-value customer segments."
        },
        {
            title: "Product Performance",
            description: "Identify your best-sellers and lower-performing items to optimize your inventory."
        }
    ];

    return (
        <PermissionGuard>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <PageBreadcrumb pageTitle="Analytics" />
                <PageTutorial
                    title="Analytics"
                    overview="The Analytics module is being built to provide you with actionable data to grow your organic business."
                    steps={tutorialSteps}
                />
            </div>

            <div className="space-y-6">
                <WorkInProgress title="Analytics & Insights" />
            </div>
        </PermissionGuard>
    );
}
