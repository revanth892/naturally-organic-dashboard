"use client";
import PermissionGuard from "@/components/common/PermissionGuard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageTutorial from "@/components/common/PageTutorial";
import WorkInProgress from "@/components/common/WorkInProgress";


export default function UserProfilesPage() {
    const tutorialSteps = [
        {
            title: "Role Definition",
            description: "Create and define specific user roles with custom naming for your organic commerce ecosystem."
        },
        {
            title: "Access Groups",
            description: "Categorize users into functional groups to streamline administration and reporting."
        },
        {
            title: "Identity Management",
            description: "Manage extended profile metadata that goes beyond basic account details."
        }
    ];

    return (
        <PermissionGuard permission="userProfilesAccess">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <PageBreadcrumb pageTitle="User Profiles" />
                <PageTutorial
                    title="User Profiles"
                    overview="The User Profiles section is designed for advanced identity and role management, allowing you to fine-tune how different user types interact with your platform."
                    steps={tutorialSteps}
                />
            </div>

            <div className="space-y-6">
                <WorkInProgress title="User Profiles & Roles" />
            </div>
        </PermissionGuard>
    );
}
