"use client";
import PermissionGuard from "@/components/common/PermissionGuard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useEffect, useState } from "react";
import { appUserApi, userApi } from "@/api/api";
import {
    UserIcon,
    GridIcon,
    HorizontaLDots,
} from "@/icons";
import { Calendar, FileEdit, Clock, MessageSquare, ListTodo, User as UserIconLucide } from "lucide-react";
import Badge from "@/components/ui/badge/Badge";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Link from "next/link";

export default function LeadManagementPage() {
    const [leads, setLeads] = useState<any[]>([]);
    const [admins, setAdmins] = useState<any[]>([]);
    const [filteredLeads, setFilteredLeads] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [activeFilter, setActiveFilter] = useState<"farmer" | "retailer">("farmer");

    // Details Modal
    const [selectedLead, setSelectedLead] = useState<any>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    // Quick Tracking Modal
    const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
    const [trackingState, setTrackingState] = useState({
        status: "New Lead",
        remarks: "",
        followUpDate: "",
        interactionCount: "0 times",
        interactionNum: 0,
        assignedTo: ""
    });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [leadsRes, adminsRes] = await Promise.all([
                appUserApi.getAll(),
                userApi.getAll()
            ]);

            if (leadsRes.success) setLeads(leadsRes.data);
            if (adminsRes.success) setAdmins(adminsRes.data);

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
        if (activeFilter === "farmer") {
            setFilteredLeads(leads.filter(l => l.isFarmer));
        } else if (activeFilter === "retailer") {
            setFilteredLeads(leads.filter(l => l.isRetailer));
        }
    }, [activeFilter, leads]);

    const formatAddress = (addr: any) => {
        if (!addr) return "No address provided";
        const parts = [
            addr.buildingNumber,
            addr.shopNumber,
            addr.shopName,
            addr.village || addr.area,
            addr.city,
            addr.pincode
        ].filter(Boolean);
        return parts.length > 0 ? parts.join(", ") : "Address incomplete";
    };

    const getTabClass = (filter: "farmer" | "retailer") =>
        activeFilter === filter
            ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
            : "text-gray-500 dark:text-gray-400";

    const openDetails = (lead: any) => {
        setSelectedLead(lead);
        setIsDetailsModalOpen(true);
    };

    const openQuickTracking = (lead: any) => {
        setSelectedLead(lead);
        const countStr = lead.interactionCount || "0 times";
        const countNum = parseInt(countStr.split(" ")[0]) || 0;

        setTrackingState({
            status: lead.status || "New Lead",
            remarks: lead.remarks || "",
            followUpDate: lead.followUpDate ? new Date(lead.followUpDate).toISOString().split('T')[0] : "",
            interactionCount: countStr,
            interactionNum: countNum,
            assignedTo: lead.assignedTo?._id || ""
        });
        setIsTrackingModalOpen(true);
    };

    const handleTrackingUpdate = async () => {
        setIsSaving(true);
        try {
            const response = await appUserApi.updateLeadTracking(selectedLead._id, {
                status: trackingState.status,
                remarks: trackingState.remarks,
                followUpDate: trackingState.followUpDate,
                interactionCount: trackingState.interactionCount,
                assignedTo: trackingState.assignedTo
            });
            if (response.success) {
                // Refresh specific lead in local state
                setLeads(prev => prev.map(l => l._id === selectedLead._id ? response.data : l));
                setIsTrackingModalOpen(false);
            }
        } catch (err: any) {
            alert(err.message || "Failed to update tracking");
        } finally {
            setIsSaving(false);
        }
    };

    const handleInteractionChange = (num: number) => {
        const str = `${num} times`;
        setTrackingState(prev => ({ ...prev, interactionNum: num, interactionCount: str }));
    };

    return (
        <PermissionGuard permission="leadManagementAccess">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <PageBreadcrumb pageTitle="Lead Management" />

                <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900 w-fit">
                    <button
                        onClick={() => setActiveFilter("farmer")}
                        className={`px-4 py-2 font-medium rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white transition-all ${getTabClass("farmer")}`}
                    >
                        Farmers
                        <span className="ml-2 text-xs opacity-60">({leads.filter(l => l.isFarmer).length})</span>
                    </button>
                    <button
                        onClick={() => setActiveFilter("retailer")}
                        className={`px-4 py-2 font-medium rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white transition-all ${getTabClass("retailer")}`}
                    >
                        Retailers
                        <span className="ml-2 text-xs opacity-60">({leads.filter(l => l.isRetailer).length})</span>
                    </button>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="px-5 py-6 sm:px-6 lg:px-8 border-b border-gray-200 dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        {activeFilter === "farmer" ? "Growers Database" : "Retailer Network"}
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
                                    {activeFilter === "retailer" && (
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Shop</th>
                                    )}
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Owner</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Connected</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Remarks</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Joined</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {filteredLeads.map((lead) => (
                                    <tr key={lead._id}>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-theme-xs ${activeFilter === "farmer" ? "bg-success-500" : "bg-brand-500"}`}>
                                                    {lead.username?.charAt(0) || "?"}
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-theme-xs font-bold text-gray-800 dark:text-white/90">{lead.username}</div>
                                                    <div className="text-[10px] text-gray-400 font-medium lowercase">via {lead.source || "app"}</div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="text-theme-xs font-bold text-gray-700 dark:text-gray-300">{lead.phoneNumber}</div>
                                            <div className="text-[10px] text-gray-500 mt-0.5 truncate max-w-[130px]" title={formatAddress(lead.address)}>
                                                {formatAddress(lead.address)}
                                            </div>
                                        </td>

                                        {activeFilter === "retailer" && (
                                            <td className="px-4 py-3">
                                                <div className="text-theme-xs font-bold text-gray-800 dark:text-white/90 truncate max-w-[100px]">
                                                    {lead.retailerProfile?.shopName || "N/A"}
                                                </div>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Badge size="sm" color="primary" variant="light" className="text-[9px] px-1 py-0 h-4">
                                                        GST: {lead.retailerProfile?.gstNumber ? "YES" : "NO"}
                                                    </Badge>
                                                </div>
                                            </td>
                                        )}

                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {lead.assignedTo ? (
                                                <div className="flex items-center gap-1.5">
                                                    <div className="h-5 w-5 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center">
                                                        <UserIconLucide className="w-2.5 h-2.5 text-brand-500" />
                                                    </div>
                                                    <div className="text-[10px] font-bold text-gray-600 dark:text-gray-400 underline decoration-brand-500/30">
                                                        {lead.assignedTo.name}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter">Unassigned</span>
                                            )}
                                        </td>

                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <Badge color="primary" variant="solid" className="text-[10px] font-black px-1.5 py-0 h-4">
                                                {lead.interactionCount || "0 times"}
                                            </Badge>
                                        </td>

                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex flex-col gap-0.5">
                                                <Badge
                                                    size="sm"
                                                    color={
                                                        lead.status === "New Lead" ? "primary" :
                                                            lead.status === "Follow up" ? "info" :
                                                                lead.status === "FO Pending" ? "warning" :
                                                                    lead.status === "KYC Pending" ? "error" : "primary"
                                                    }
                                                    variant="light"
                                                    className="text-[9px] px-1 py-0 h-4"
                                                >
                                                    {lead.status || "New Lead"}
                                                </Badge>
                                                {lead.status === "Follow up" && lead.followUpDate && (
                                                    <div className="flex items-center gap-0.5 text-[9px] text-orange-600 font-bold italic">
                                                        <Clock className="w-2 h-2" />
                                                        {new Date(lead.followUpDate).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3">
                                            {lead.remarks ? (
                                                <div className="flex items-start gap-1 max-w-[130px]">
                                                    <MessageSquare className="w-2.5 h-2.5 text-gray-300 mt-0.5 shrink-0" />
                                                    <span className="text-[10px] text-gray-500 line-clamp-2 italic leading-tight" title={lead.remarks}>
                                                        {lead.remarks}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-gray-300 italic">No notes</span>
                                            )}
                                        </td>

                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-800 dark:text-white/90">
                                                <Calendar className="w-2.5 h-2.5 text-gray-400 shrink-0" />
                                                {new Date(lead.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </div>
                                            <div className="text-[9px] text-gray-400 ml-3.5">
                                                {new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 whitespace-nowrap text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                <button
                                                    onClick={() => openQuickTracking(lead)}
                                                    className="text-[10px] text-brand-500 font-bold hover:bg-brand-50 dark:hover:bg-brand-500/10 px-1.5 py-0.5 rounded border border-brand-200 transition-colors flex items-center gap-0.5"
                                                >
                                                    <ListTodo className="w-2.5 h-2.5" />
                                                    Track
                                                </button>
                                                <Link
                                                    href={`/lead-management/${lead._id}`}
                                                    className="text-[10px] text-gray-400 hover:text-brand-500 font-bold uppercase tracking-tighter"
                                                >
                                                    Profile
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Quick Tracking Modal */}
            <Modal isOpen={isTrackingModalOpen} onClose={() => setIsTrackingModalOpen(false)} className="max-w-[450px]">
                <div className="no-scrollbar relative w-full overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-10">
                    <div className="mb-6">
                        <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-brand-500" />
                            Update Lead Tracking
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Quickly update the status and interaction status for <span className="font-bold text-gray-800 dark:text-white">{selectedLead?.username}</span>.
                        </p>
                    </div>

                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block tracking-widest">Assign FO/Manager</label>
                                <select
                                    className="w-full text-xs font-bold bg-brand-50/50 dark:bg-brand-500/5 border border-brand-200 dark:border-brand-500/20 rounded-lg p-3 outline-none focus:ring-2 ring-brand-500/20"
                                    value={trackingState.assignedTo}
                                    onChange={(e) => setTrackingState(prev => ({ ...prev, assignedTo: e.target.value }))}
                                >
                                    <option value="">Unassigned</option>
                                    {admins.map(admin => (
                                        <option key={admin._id} value={admin._id}>{admin.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Status</label>
                                <select
                                    className="w-full text-xs font-bold bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-lg p-3 outline-none focus:border-brand-500"
                                    value={trackingState.status}
                                    onChange={(e) => setTrackingState(prev => ({ ...prev, status: e.target.value }))}
                                >
                                    <option value="New Lead">New Lead</option>
                                    <option value="Follow up">Follow up</option>
                                    <option value="FO Pending">FO Pending</option>
                                    <option value="KYC Pending">KYC Pending</option>
                                </select>
                            </div>
                        </div>

                        {trackingState.status === "Follow up" && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="text-[10px] font-bold text-orange-500 uppercase mb-1.5 block">Follow-up Date</label>
                                <input
                                    type="date"
                                    className="w-full text-sm font-medium bg-orange-50/50 dark:bg-orange-500/5 border border-orange-100 dark:border-orange-500/20 rounded-lg p-3 outline-none"
                                    value={trackingState.followUpDate}
                                    onChange={(e) => setTrackingState(prev => ({ ...prev, followUpDate: e.target.value }))}
                                />
                            </div>
                        )}

                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Interaction Counter</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="number"
                                    className="w-24 text-sm font-bold bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-lg p-3 text-center outline-none"
                                    value={trackingState.interactionNum}
                                    onChange={(e) => handleInteractionChange(parseInt(e.target.value) || 0)}
                                    min="0"
                                />
                                <Badge color="primary" variant="solid" size="sm" className="font-black px-3 py-1">
                                    {trackingState.interactionCount}
                                </Badge>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Remarks</label>
                            <textarea
                                rows={4}
                                className="w-full text-sm font-medium bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-lg p-3 outline-none focus:border-brand-500"
                                placeholder="Type your interaction notes here..."
                                value={trackingState.remarks}
                                onChange={(e) => setTrackingState(prev => ({ ...prev, remarks: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-8">
                        <Button variant="outline" className="flex-1" onClick={() => setIsTrackingModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button className="flex-1 shadow-lg shadow-brand-500/20" onClick={handleTrackingUpdate} disabled={isSaving}>
                            {isSaving ? "Syncing..." : "Update Lead"}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Details Modal */}
            <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} className="max-w-[700px]">
                <div className="no-scrollbar relative w-full overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                    <div className="px-2 pr-14">
                        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                            Snapshot: {selectedLead?.username}
                        </h4>
                        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                            Core information for {selectedLead?.isFarmer ? "Farmer" : "Retailer"} lead from {selectedLead?.source || "app"}.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Meta Card Style */}
                        <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
                            <div className="flex items-center gap-5">
                                <div className={`h-16 w-16 rounded-full flex items-center justify-center text-white text-2xl font-black shadow-inner ${selectedLead?.isFarmer ? "bg-success-500" : "bg-brand-500"}`}>
                                    {selectedLead?.profileImages && selectedLead.profileImages.length > 0 ? (
                                        <img src={selectedLead.profileImages[selectedLead.profileImages.length - 1].link} className="w-full h-full object-cover rounded-full" />
                                    ) : (
                                        selectedLead?.username?.charAt(0) || "?"
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-gray-800 dark:text-white">{selectedLead?.username}</h4>
                                    <div className="flex items-center gap-3">
                                        <p className="text-sm text-gray-500 font-medium">{selectedLead?.phoneNumber}</p>
                                        <div className="h-3 w-px bg-gray-300"></div>
                                        <Badge color={selectedLead?.isFarmer ? "success" : "primary"} variant="light" size="sm">
                                            {selectedLead?.isFarmer ? "FARMER" : "RETAILER"}
                                        </Badge>
                                        <div className="h-3 w-px bg-gray-300"></div>
                                        <span className="text-[10px] font-bold text-brand-500 px-1.5 py-0.5 bg-brand-50 dark:bg-brand-500/10 rounded uppercase">
                                            {selectedLead?.language || "English"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Info Card Style */}
                        <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="mb-1 text-xs font-bold text-gray-400 uppercase tracking-tight">Registered On</p>
                                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-white">
                                        <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                                        <span>{new Date(selectedLead?.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="mb-1 text-xs font-bold text-gray-400 uppercase tracking-widest">Platform</p>
                                    <p className="text-sm font-semibold text-gray-800 dark:text-white uppercase">{selectedLead?.source || "app" || "N/A"}</p>
                                </div>

                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <p className="mb-1 text-xs font-bold text-gray-400 uppercase">Assigned To</p>
                                    <div className="flex items-center gap-2 font-bold text-brand-600">
                                        <UserIconLucide className="w-3.5 h-3.5" />
                                        {selectedLead?.assignedTo?.name || "No FO Assigned"}
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <p className="mb-1 text-xs font-bold text-gray-400 uppercase">Current Roadmap</p>
                                    <Badge size="sm" variant="solid" color={selectedLead?.status === "KYC Pending" ? "error" : "primary"}>
                                        {selectedLead?.status || "New Lead"}
                                    </Badge>
                                </div>

                                <div className="md:col-span-2 border-t border-gray-100 dark:border-gray-800 pt-6">
                                    <p className="mb-1 text-xs font-bold text-gray-400 uppercase">Active Remarks</p>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 italic bg-gray-50 dark:bg-white/5 p-3 rounded-lg border-l-4 border-brand-500">
                                        {selectedLead?.remarks || "No administrative remarks recorded."}
                                    </p>
                                </div>

                                <div className="md:col-span-2 border-t border-gray-100 dark:border-gray-800 pt-6">
                                    <p className="mb-1 text-xs font-bold text-gray-400 uppercase">Mailing Address</p>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-white/5 p-3 rounded-lg">
                                        {formatAddress(selectedLead?.address)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-8 lg:justify-end">
                        <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>
                            Close
                        </Button>
                        <Link href={`/lead-management/${selectedLead?._id}`}>
                            <Button size="sm">Full Profile</Button>
                        </Link>
                    </div>
                </div>
            </Modal>
        </PermissionGuard>
    );
}
