"use client";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageTutorial from "@/components/common/PageTutorial";

import PermissionGuard from "@/components/common/PermissionGuard";
import WorkInProgress from "@/components/common/WorkInProgress";

export default function OrderManagementPage() {
    const tutorialSteps = [
        {
            title: "Fulfillment Workflow",
            description: "Process orders from 'Pending' to 'Shipped' with integrated barcode and label generation."
        },
        {
            title: "Logistics Tracking",
            description: "Monitor delivery partners in real-time and provide customers with live shipping updates."
        },
        {
            title: "Returns & Refunds",
            description: "Handle customer returns and process quality-check-based refunds through an automated queue."
        }
    ];

    return (
        <PermissionGuard>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <PageBreadcrumb pageTitle="Order Management" />
                <PageTutorial
                    title="Orders"
                    overview="The Order Management system will streamline your logistics, ensuring every customer gets their fresh organic produce on time."
                    steps={tutorialSteps}
                />
            </div>

            <div className="space-y-6">
                <WorkInProgress title="Orders & Fulfillment" />
            </div>
        </PermissionGuard>
    );
}
