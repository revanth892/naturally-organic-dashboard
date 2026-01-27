"use client";
import PermissionGuard from "@/components/common/PermissionGuard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function UserProfilesPage() {
    return (
        <PermissionGuard permission="userProfilesAccess">
            <PageBreadcrumb pageTitle="User Profiles" />
            <div className="p-4 bg-white rounded-2xl border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">User Profiles Management</h2>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                    This page is only accessible to users with <strong>userProfilesAccess</strong>.
                </p>
            </div>
        </PermissionGuard>
    );
}
