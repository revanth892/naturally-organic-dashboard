"use client";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PermissionGuard from "@/components/common/PermissionGuard";
import WorkInProgress from "@/components/common/WorkInProgress";

export default function FinancePage() {
    return (
        <PermissionGuard>
            <PageBreadcrumb pageTitle="Finance" />
            <div className="space-y-6">
                <WorkInProgress title="Finance Management" />
            </div>
        </PermissionGuard>
    );
}
