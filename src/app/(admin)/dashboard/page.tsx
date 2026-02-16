"use client";
import React from "react";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PermissionGuard from "@/components/common/PermissionGuard";
import PageTutorial from "@/components/common/PageTutorial";
import {
  Package,
  Users,
  Tag,
  TicketPercent,
  ShieldCheck,
  HelpCircle,
  MapPin,
  Hammer,
  Clock,
  ArrowRight
} from "lucide-react";

export default function DashboardOverview() {
  const tutorialSteps = [
    {
      title: "Module Status",
      description: "Modules with the 'Hammer' icon are currently under development. You can still use the functional modules below."
    },
    {
      title: "Quick Navigation",
      description: "Use the grid of cards to jump directly into management tools like Products, Leads, or Users."
    },
    {
      title: "Navigation Sidebar",
      description: "The left sidebar remains your primary tool for deep navigation across all system sections."
    }
  ];

  const quickAccess = [
    {
      title: "Products",
      desc: "Manage your inventory and categories",
      icon: <Package className="w-6 h-6" />,
      path: "/products",
      color: "bg-blue-500",
    },
    {
      title: "App Users",
      desc: "View and manage your leads/customers",
      icon: <Users className="w-6 h-6" />,
      path: "/lead-management",
      color: "bg-purple-500",
    },
    {
      title: "Admin Management",
      desc: "Manage CMS staff and permissions",
      icon: <ShieldCheck className="w-6 h-6" />,
      path: "/user-management",
      color: "bg-indigo-500",
    },
    {
      title: "Brands",
      desc: "Manage product manufacturing brands",
      icon: <Tag className="w-6 h-6" />,
      path: "/brands",
      color: "bg-pink-500",
    },
    {
      title: "Coupons",
      desc: "Setup discounts and promotions",
      icon: <TicketPercent className="w-6 h-6" />,
      path: "/coupons",
      color: "bg-cyan-500",
    },
    {
      title: "FAQs",
      desc: "Manage frequently asked questions",
      icon: <HelpCircle className="w-6 h-6" />,
      path: "/faq",
      color: "bg-amber-500",
    },
    {
      title: "Postcodes",
      desc: "Configure delivery availability",
      icon: <MapPin className="w-6 h-6" />,
      path: "/postcodes",
      color: "bg-rose-500",
    },
  ];

  return (
    <PermissionGuard>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <PageBreadcrumb pageTitle="Dashboard Overview" />
        <PageTutorial
          title="Dashboard"
          overview="The Dashboard provides a bird's-eye view of your entire operation. It highlights active modules and system status."
          steps={tutorialSteps}
        />
      </div>

      <div className="space-y-10">
        {/* Status Section */}
        <div className="flex flex-col items-center justify-center p-10 text-center bg-white rounded-3xl border border-gray-100 shadow-sm dark:bg-gray-900 dark:border-gray-800">
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center dark:bg-brand-500/10">
              <Hammer className="w-8 h-8 text-brand-600 dark:text-brand-400 animate-bounce" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm dark:bg-gray-800">
              <Clock className="w-5 h-5 text-orange-500 animate-pulse" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90 mb-3 uppercase tracking-tight">
            Dashboard Analytics Under Development
          </h2>

          <p className="max-w-2xl text-gray-500 dark:text-gray-400 leading-relaxed text-lg">
            We&apos;re currently perfecting the <strong>Dashboard Analytics</strong> module to give you the best experience. Check back soon for powerful insights and management tools!
          </p>
        </div>

        {/* Quick Access Grid */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white/90 mb-6 flex items-center gap-2">
            Quick Access Modules
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickAccess.map((item) => (
              <Link
                key={item.title}
                href={item.path}
                className="group relative overflow-hidden bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`${item.color} w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-2 group-hover:text-brand-500 transition-colors">
                  {item.title}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {item.desc}
                </p>
                <div className="flex items-center text-xs font-bold text-brand-500 uppercase tracking-wider group-hover:gap-2 transition-all">
                  Open Module <ArrowRight className="w-4 h-4" />
                </div>

                {/* Decorative background element */}
                <div className="absolute -right-4 -bottom-4 opacity-[0.03] text-black dark:text-white dark:opacity-[0.05] scale-150 rotate-12 transition-transform group-hover:rotate-0">
                  {item.icon}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
