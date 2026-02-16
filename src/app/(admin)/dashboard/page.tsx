"use client";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PermissionGuard from "@/components/common/PermissionGuard";
import WorkInProgress from "@/components/common/WorkInProgress";

export default function DashboardOverview() {
  return (
    <PermissionGuard>
      <PageBreadcrumb pageTitle="Dashboard Overview" />
      <div className="space-y-6">
        <WorkInProgress title="Dashboard Analytics" />
      </div>
    </PermissionGuard>
  );
}
