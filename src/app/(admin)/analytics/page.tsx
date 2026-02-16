"use client";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PermissionGuard from "@/components/common/PermissionGuard";
import WorkInProgress from "@/components/common/WorkInProgress";

export default function AnalyticsPage() {
    return (
        <PermissionGuard>
            <PageBreadcrumb pageTitle="Analytics" />
            <div className="space-y-6">
                <WorkInProgress title="Analytics & Insights" />
            </div>
        </PermissionGuard>
    );
}
