"use client";
import PermissionGuard from "@/components/common/PermissionGuard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";

export default function AnalyticsPage() {
    return (
        <PermissionGuard permission="analyticsAccess">
            <PageBreadcrumb pageTitle="Analytics" />
            <div className="grid grid-cols-12 gap-4 md:gap-6">
                <div className="col-span-12 xl:col-span-7">
                    <MonthlySalesChart />
                </div>
                <div className="col-span-12 xl:col-span-5">
                    <StatisticsChart />
                </div>
            </div>
        </PermissionGuard>
    );
}
