"use client";
import PermissionGuard from "@/components/common/PermissionGuard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useEffect, useState } from "react";
import { appUserApi } from "@/api/api";
import {
    UserIcon,
    GridIcon,
} from "@/icons";
import { Calendar } from "lucide-react";
import Link from "next/link";

export default function LeadManagementPage() {
    const [leads, setLeads] = useState<any[]>([]);
    const [filteredLeads, setFilteredLeads] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await appUserApi.getAll();
            if (response.success) setLeads(response.data);
        } catch (err: any) {
            setError(err.message || "Failed to fetch dashboard data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        setFilteredLeads(leads);
    }, [leads]);

    const formatAddress = (addr: any) => {
        if (!addr) return "No address provided";
        const parts = [
            addr.buildingNumber,
            addr.village || addr.area,
            addr.city,
            addr.pincode
        ].filter(Boolean);
        return parts.length > 0 ? parts.join(", ") : "Address incomplete";
    };

    return (
        <PermissionGuard permission="leadManagementAccess">
            <div className="mb-6">
                <PageBreadcrumb pageTitle="User Management" />
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="px-5 py-6 sm:px-6 lg:px-8 border-b border-gray-200 dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        App User Database
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="p-10 text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-500 border-r-transparent align-[-0.125em]"></div>
                        </div>
                    ) : error ? (
                        <div className="p-10 text-center text-red-500">{error}</div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                            <thead className="bg-[#F9FAFB] dark:bg-white/[0.02]">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">User</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Contact</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Source</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Joined</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {filteredLeads.map((lead) => (
                                    <tr key={lead._id}>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-theme-xs bg-brand-500`}>
                                                    {lead.username?.charAt(0) || "?"}
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-theme-xs font-bold text-gray-800 dark:text-white/90">{lead.username}</div>
                                                    <div className="text-[10px] text-gray-400 font-medium truncate max-w-[150px]">{lead.email}</div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="text-theme-xs font-bold text-gray-700 dark:text-gray-300">{lead.phoneNumber}</div>
                                            <div className="text-[10px] text-gray-500 mt-0.5 truncate max-w-[200px]" title={formatAddress(lead.address)}>
                                                {formatAddress(lead.address)}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">{lead.source || "web"}</span>
                                        </td>

                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-800 dark:text-white/90">
                                                <Calendar className="w-2.5 h-2.5 text-gray-400 shrink-0" />
                                                {new Date(lead.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 whitespace-nowrap text-right">
                                            <Link
                                                href={`/lead-management/${lead._id}`}
                                                className="text-[10px] text-brand-500 hover:text-brand-600 font-bold uppercase tracking-widest px-3 py-1 rounded-lg bg-brand-50 dark:bg-brand-500/10 transition-colors"
                                            >
                                                View Profile
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {filteredLeads.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-10 text-center text-gray-500 text-sm italic">
                                            No users found in the database.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </PermissionGuard>
    );
}
