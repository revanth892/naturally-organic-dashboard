"use client";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import React, { useEffect, useState } from "react";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import DemographicCard from "@/components/ecommerce/DemographicCard";
import PermissionGuard from "@/components/common/PermissionGuard";

export default function Ecommerce() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <PermissionGuard>
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {user?.analyticsAccess && (
          <div className="col-span-12 space-y-6 xl:col-span-7">
            <EcommerceMetrics />
            <MonthlySalesChart />
          </div>
        )}

        {user?.financeAccess && (
          <div className="col-span-12 xl:col-span-5">
            <MonthlyTarget />
          </div>
        )}

        {user?.analyticsAccess && (
          <div className="col-span-12">
            <StatisticsChart />
          </div>
        )}

        {user?.userProfilesAccess && (
          <div className="col-span-12 xl:col-span-5">
            <DemographicCard />
          </div>
        )}

        {user?.productAccess && (
          <div className="col-span-12 xl:col-span-7">
            <RecentOrders />
          </div>
        )}

        {!user?.analyticsAccess && !user?.financeAccess && !user?.userProfilesAccess && !user?.productAccess && !user?.orderManagementAccess && !user?.leadManagementAccess && !user?.couponAccess && (
          <div className="col-span-12 p-10 text-center bg-white rounded-2xl border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Welcome to Naturally Organic Dashboard</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              You currently have a restricted view. Please refer to the sidebar for accessible modules.
            </p>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
