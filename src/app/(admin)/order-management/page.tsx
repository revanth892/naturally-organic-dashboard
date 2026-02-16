"use client";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PermissionGuard from "@/components/common/PermissionGuard";
import WorkInProgress from "@/components/common/WorkInProgress";

export default function OrderManagementPage() {
    return (
        <PermissionGuard>
            <PageBreadcrumb pageTitle="Order Management" />
            <div className="space-y-6">
                <WorkInProgress title="Orders & Fulfillment" />
            </div>
        </PermissionGuard>
    );
}
