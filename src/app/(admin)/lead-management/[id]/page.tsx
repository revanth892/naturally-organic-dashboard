"use client";
import PermissionGuard from "@/components/common/PermissionGuard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useEffect, useState, use } from "react";
import { appUserApi, mediaApi, userApi } from "@/api/api";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import {
    ChevronLeft,
    Calendar,
    Pencil,
    Check,
    X,
    Upload,
    History,
    MessageSquare,
    Clock,
    User,
    ShieldCheck,
} from "lucide-react";
import Link from "next/link";

export default function LeadDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [lead, setLead] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [admins, setAdmins] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState("");

    // Tracking State
    const [trackingState, setTrackingState] = useState({
        status: "New Lead",
        remarks: "",
        followUpDate: "",
        interactionCount: "0 times",
        interactionNum: 0,
        assignedTo: ""
    });

    // Editable Form State
    const [editForm, setEditForm] = useState<any>(null);

    const fetchLeadData = async () => {
        setIsLoading(true);
        try {
            const [leadRes, historyRes, adminsRes] = await Promise.all([
                appUserApi.getById(id),
                appUserApi.getHistory(id),
                userApi.getAll()
            ]);

            if (leadRes.success) {
                setLead(leadRes.data);
                setEditForm(JSON.parse(JSON.stringify(leadRes.data)));

                // Initialize tracking state
                const countStr = leadRes.data.interactionCount || "0 times";
                const countNum = parseInt(countStr.split(" ")[0]) || 0;

                setTrackingState({
                    status: leadRes.data.status || "New Lead",
                    remarks: leadRes.data.remarks || "",
                    followUpDate: leadRes.data.followUpDate ? new Date(leadRes.data.followUpDate).toISOString().split('T')[0] : "",
                    interactionCount: countStr,
                    interactionNum: countNum,
                    assignedTo: leadRes.data.assignedTo?._id || ""
                });
            }
            if (historyRes.success) {
                setHistory(historyRes.data);
            }
            if (adminsRes.success) {
                setAdmins(adminsRes.data);
            }
        } catch (err: any) {
            setError(err.message || "Failed to fetch lead details");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLeadData();
    }, [id]);

    const handleInputChange = (path: string, value: any) => {
        const newForm = { ...editForm };
        const keys = path.split('.');
        let current = newForm;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        setEditForm(newForm);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError("");
        try {
            const response = await appUserApi.updateByAdmin(id, editForm);
            if (response.success) {
                setLead(response.data);
                setIsEditing(false);
            }
        } catch (err: any) {
            setError(err.message || "Update failed");
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleTrackingUpdate = async () => {
        setIsSaving(true);
        try {
            const response = await appUserApi.updateLeadTracking(id, {
                status: trackingState.status,
                remarks: trackingState.remarks,
                followUpDate: trackingState.followUpDate,
                interactionCount: trackingState.interactionCount,
                assignedTo: trackingState.assignedTo
            });
            if (response.success) {
                setLead(response.data);
                // Refresh History
                const historyRes = await appUserApi.getHistory(id);
                if (historyRes.success) setHistory(historyRes.data);
                alert("Lead tracking updated successfully");
            }
        } catch (err: any) {
            alert(err.message || "Failed to update tracking");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditForm(JSON.parse(JSON.stringify(lead)));
        setIsEditing(false);
    };

    const handleInteractionChange = (num: number) => {
        const str = `${num} times`;
        setTrackingState(prev => ({ ...prev, interactionNum: num, interactionCount: str }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const customName = prompt("Enter a display name for this document:", file.name);
        if (customName === null) return;

        setIsSaving(true);
        try {
            const { data } = await mediaApi.getPresignedUrl(file.name, file.type);
            const { uploadUrl, key, viewUrl } = data;

            const uploadResponse = await fetch(uploadUrl, {
                method: "PUT",
                body: file,
                headers: { "Content-Type": file.type }
            });

            if (!uploadResponse.ok) throw new Error("Upload to Wasabi failed");

            const newImage = {
                key,
                link: viewUrl,
                filename: file.name,
                displayName: customName || file.name
            };
            const currentImages = editForm[field] || [];
            handleInputChange(field, [...currentImages, newImage]);

        } catch (err: any) {
            setError(err.message || "File upload failed");
        } finally {
            setIsSaving(false);
        }
    };

    const ImageGallery = ({ title, field, images }: { title: string, field: string, images: any[] }) => {
        return (
            <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title} ({images?.length || 0})</h5>
                    {isEditing && (
                        <div className="relative">
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => handleFileUpload(e, field)}
                                accept="image/*,.pdf"
                            />
                            <Button variant="outline" size="sm" startIcon={<Upload className="w-4 h-4" />}>
                                {isSaving ? "Uploading..." : "Add New"}
                            </Button>
                        </div>
                    )}
                </div>

                {(!images || images.length === 0) ? (
                    <div className="p-4 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-center text-xs text-gray-400 font-medium">
                        No documents uploaded for this category
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {images.map((img, i) => (
                            <div key={i} className="group relative aspect-square rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-white/5">
                                {img.link ? (
                                    <img src={img.link} alt={img.filename || title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 uppercase">{img.filename || "No Preview"}</div>
                                )}

                                {isEditing && (
                                    <button
                                        onClick={() => {
                                            const updated = images.filter((_, idx) => idx !== i);
                                            handleInputChange(field, updated);
                                        }}
                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}

                                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                                    <p className="text-[10px] text-white truncate font-medium">{img.displayName || img.filename || "unnamed_file"}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="p-20 text-center flex flex-col items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-brand-500 border-r-transparent"></div>
                <p className="mt-4 text-gray-500 font-bold">Loading Profile...</p>
            </div>
        );
    }

    if (error) {
        return <div className="p-10 text-center text-red-500">{error}</div>;
    }

    const currentLeadData = isEditing ? editForm : lead;

    return (
        <PermissionGuard permission="leadManagementAccess">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <Link href="/lead-management" className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-500 mb-4 transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                        Back to Listings
                    </Link>
                    <PageBreadcrumb pageTitle="App User Data Dossier" />
                </div>

                <div className="flex items-center gap-3">
                    {!isEditing ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                            startIcon={<Pencil className="w-5 h-5 text-gray-500 shrink-0" />}
                        >
                            Edit Profile
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancel}
                                disabled={isSaving}
                                startIcon={<X className="w-5 h-5 text-gray-400 shrink-0" />}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={isSaving}
                                startIcon={<Check className="w-5 h-5 text-white shrink-0" />}
                            >
                                {isSaving ? "Saving..." : "Save Changes"}
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                {/* Header Identity Card */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="relative group/avatar">
                            <div className={`w-28 h-28 overflow-hidden flex items-center justify-center rounded-2xl text-white text-5xl font-black shadow-lg transition-all ${isEditing ? 'ring-4 ring-brand-500/20' : ''} ${currentLeadData?.isFarmer ? "bg-success-500" : "bg-brand-500"}`}>
                                {currentLeadData?.profileImages && currentLeadData.profileImages.length > 0 ? (
                                    <img
                                        src={currentLeadData.profileImages[currentLeadData.profileImages.length - 1].link}
                                        className="w-full h-full object-cover"
                                        alt="Profile"
                                    />
                                ) : (
                                    currentLeadData?.username?.charAt(0) || "?"
                                )}

                                {isEditing && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer">
                                        <Upload className="w-8 h-8 text-white mb-1" />
                                        <span className="text-[10px] text-white font-bold uppercase">Change</span>
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={(e) => handleFileUpload(e, 'profileImages')}
                                            accept="image/*"
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2">
                                <Badge color={currentLeadData?.isFarmer ? "success" : "primary"} variant="solid" size="sm">
                                    {currentLeadData?.isFarmer ? "FARMER" : "RETAILER"}
                                </Badge>
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center gap-4 mb-2 justify-center md:justify-start">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        className="text-2xl font-bold bg-transparent border-b border-brand-500 focus:outline-none text-gray-800 dark:text-white mb-0 w-full max-w-md"
                                        value={editForm.username}
                                        onChange={(e) => handleInputChange('username', e.target.value)}
                                    />
                                ) : (
                                    <h4 className="text-2xl font-bold text-gray-800 dark:text-white">{lead?.username}</h4>
                                )}
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-50 dark:bg-brand-500/10 rounded-full border border-brand-100 dark:border-brand-500/20">
                                    <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
                                    <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">
                                        Owner: {lead?.assignedTo?.name || "UNASSIGNED"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase">Phone:</span>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="text-sm font-semibold bg-transparent border-b border-brand-500 focus:outline-none text-gray-700 dark:text-gray-300"
                                            value={editForm.phoneNumber}
                                            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                        />
                                    ) : (
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{lead?.phoneNumber}</span>
                                    )}
                                </div>
                                <div className="h-4 w-px bg-gray-200 dark:bg-gray-700"></div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase">Status:</span>
                                    <Badge size="sm" color={lead?.status === "KYC Pending" ? "error" : lead?.status === "FO Pending" ? "warning" : "primary"}>
                                        {lead?.status || "New Lead"}
                                    </Badge>
                                </div>
                                <div className="h-4 w-px bg-gray-200 dark:bg-gray-700"></div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase">Joined:</span>
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{new Date(lead?.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left Column: Lead Tracking & History */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Lead Tracking Form */}
                        <div className="p-6 border border-gray-200 rounded-2xl bg-white dark:bg-white/[0.03] dark:border-gray-800">
                            <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                                <Clock className="w-4 h-4 text-brand-500" />
                                Lead Tracking
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block tracking-widest">Assign FO/Manager</label>
                                    <select
                                        className="w-full text-sm font-bold bg-brand-50/50 dark:bg-brand-500/5 border border-brand-200 dark:border-brand-500/20 rounded-lg p-2.5 outline-none focus:ring-2 ring-brand-500/20"
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
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Update Status</label>
                                    <select
                                        className="w-full text-sm font-medium bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-lg p-2.5 outline-none focus:border-brand-500"
                                        value={trackingState.status}
                                        onChange={(e) => setTrackingState(prev => ({ ...prev, status: e.target.value }))}
                                    >
                                        <option value="New Lead">New Lead</option>
                                        <option value="Follow up">Follow up</option>
                                        <option value="FO Pending">FO Pending</option>
                                        <option value="KYC Pending">KYC Pending</option>
                                    </select>
                                </div>

                                {trackingState.status === "Follow up" && (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block text-orange-500">Scheduled Follow-up</label>
                                        <input
                                            type="date"
                                            className="w-full text-sm font-medium bg-orange-50/50 dark:bg-orange-500/5 border border-orange-100 dark:border-orange-500/20 rounded-lg p-2.5 outline-none"
                                            value={trackingState.followUpDate}
                                            onChange={(e) => setTrackingState(prev => ({ ...prev, followUpDate: e.target.value }))}
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block tracking-wide">Interaction Counter</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            className="w-20 text-sm font-bold bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-lg p-2.5 text-center outline-none"
                                            value={trackingState.interactionNum}
                                            onChange={(e) => handleInteractionChange(parseInt(e.target.value) || 0)}
                                            min="0"
                                        />
                                        <span className="text-xs font-bold text-brand-500 uppercase">{trackingState.interactionCount}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Remarks / Logic</label>
                                    <textarea
                                        rows={3}
                                        className="w-full text-sm font-medium bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-lg p-2.5 outline-none focus:border-brand-500"
                                        placeholder="Add current interaction notes..."
                                        value={trackingState.remarks}
                                        onChange={(e) => setTrackingState(prev => ({ ...prev, remarks: e.target.value }))}
                                    />
                                </div>

                                <Button size="sm" className="w-full mt-2 shadow-lg shadow-brand-500/20" onClick={handleTrackingUpdate} disabled={isSaving}>
                                    {isSaving ? "Syncing..." : "Update Roadmap"}
                                </Button>
                            </div>
                        </div>

                        {/* Audit History Timeline */}
                        <div className="p-6 border border-gray-200 rounded-2xl bg-white dark:bg-white/[0.03] dark:border-gray-800">
                            <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                                <History className="w-4 h-4 text-success-500" />
                                Audit Trail
                            </h4>
                            <div className="relative space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-gray-100 dark:before:bg-gray-800">
                                {history.length === 0 ? (
                                    <p className="text-xs text-gray-400 pl-8 italic font-medium">No history recorded yet.</p>
                                ) : (
                                    history.map((record, idx) => (
                                        <div key={record._id} className="relative pl-8 group">
                                            <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 bg-gray-300 group-first:bg-brand-500 ring-4 ring-white dark:ring-gray-900 shadow-sm transition-colors"></div>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center justify-between">
                                                    <Badge size="sm" variant="light" color={record.status === "Follow up" ? "info" : record.status === "FO Pending" ? "warning" : record.status === "KYC Pending" ? "error" : "primary"}>
                                                        {record.status}
                                                    </Badge>
                                                    <span className="text-[10px] text-gray-400 font-bold">{new Date(record.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium line-clamp-2 mt-1 italic">"{record.remarks || 'No notes'}"</p>

                                                {record.assignedTo && (
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <ShieldCheck className="w-3 h-3 text-brand-500" />
                                                        <span className="text-[9px] font-black text-brand-600 uppercase">Assigned to: {record.assignedTo.name}</span>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-1.5 mt-1.5">
                                                    <div className="h-4 w-4 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                                                        <User className="w-2.5 h-2.5 text-gray-400" />
                                                    </div>
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase">{record.updatedBy?.name || "System"}</span>
                                                    <span className="text-[9px] text-gray-300 font-black">•</span>
                                                    <span className="text-[9px] font-bold text-brand-500">{record.interactionCount}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Profile Content */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Location Details */}
                            <div className="lg:col-span-1 p-6 border border-gray-200 rounded-2xl bg-white dark:bg-white/[0.03] dark:border-gray-800">
                                <div className="flex items-center justify-between mb-6">
                                    <h4 className="text-lg font-bold text-gray-800 dark:text-white">Location</h4>
                                    {isEditing ? (
                                        <select
                                            className="text-xs bg-transparent border-b border-brand-500 focus:outline-none text-brand-500"
                                            value={editForm.address?.addressType || "Residence"}
                                            onChange={(e) => handleInputChange('address.addressType', e.target.value)}
                                        >
                                            <option value="Home">Home</option>
                                            <option value="Office">Office</option>
                                            <option value="Shop">Shop</option>
                                            <option value="Farm">Farm</option>
                                        </select>
                                    ) : (
                                        <Badge variant="light" size="sm" color="primary">{lead?.address?.addressType || "Residence"}</Badge>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { label: "Building / Plot", key: "address.buildingNumber" },
                                        { label: "Village / Locality", key: "address.village" },
                                        { label: "City", key: "address.city" },
                                        { label: "District", key: "address.district" },
                                        { label: "Pincode", key: "address.pincode", highlight: true }
                                    ].map((item, idx) => {
                                        const value = isEditing ? (editForm.address?.[item.key.split('.')[1]] || '') : lead?.address?.[item.key.split('.')[1]];
                                        if (!isEditing && !value) return null;

                                        return (
                                            <div key={idx} className="flex justify-between items-start pt-3 first:pt-0 border-t border-gray-50 dark:border-white/5 first:border-0 text-theme-sm">
                                                <span className="text-gray-400 font-medium">{item.label}</span>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        className="font-semibold text-right max-w-[120px] bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-brand-500 focus:outline-none text-gray-700 dark:text-gray-300"
                                                        value={value}
                                                        onChange={(e) => handleInputChange(item.key, e.target.value)}
                                                    />
                                                ) : (
                                                    <span className={`font-semibold text-right max-w-[120px] ${item.highlight ? 'text-brand-500' : 'text-gray-700 dark:text-gray-300'}`}>
                                                        {value}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Data Breakdown */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 border border-gray-200 rounded-2xl dark:border-gray-800 bg-white dark:bg-white/[0.03]">
                                        <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Legal & Tax</h4>
                                        <div className="space-y-4">
                                            <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                                                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">GST Registration</p>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        className="w-full text-sm font-bold text-brand-600 bg-transparent border-b border-brand-500 focus:outline-none"
                                                        value={editForm.legalAndTax?.gstNumber || ""}
                                                        onChange={(e) => handleInputChange('legalAndTax.gstNumber', e.target.value)}
                                                    />
                                                ) : (
                                                    <p className="text-sm font-bold text-brand-600">{lead?.legalAndTax?.gstNumber || "Not Registered"}</p>
                                                )}
                                            </div>
                                            <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                                                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Income Tax (PAN)</p>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        className="w-full text-sm font-bold text-gray-800 dark:text-white bg-transparent border-b border-brand-500 focus:outline-none"
                                                        value={editForm.legalAndTax?.pan || ""}
                                                        onChange={(e) => handleInputChange('legalAndTax.pan', e.target.value)}
                                                    />
                                                ) : (
                                                    <p className="text-sm font-bold text-gray-800 dark:text-white">{lead?.legalAndTax?.pan || "Not Provided"}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 border border-gray-200 rounded-2xl dark:border-gray-800 bg-white dark:bg-white/[0.03]">
                                        <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Business Profile</h4>
                                        <div className="space-y-4">
                                            <div className="p-3 bg-success-50/50 dark:bg-success-500/5 rounded-xl">
                                                <p className="text-[10px] font-black text-success-600 uppercase mb-1">Category</p>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        className="w-full text-sm font-bold text-success-800 dark:text-success-400 bg-transparent border-b border-success-500 focus:outline-none"
                                                        value={editForm.businessDetails?.businessType || ""}
                                                        onChange={(e) => handleInputChange('businessDetails.businessType', e.target.value)}
                                                    />
                                                ) : (
                                                    <p className="text-sm font-bold text-success-800 dark:text-success-400">{lead?.businessDetails?.businessType || "Individual"}</p>
                                                )}
                                            </div>
                                            <div className="p-3 bg-brand-50/50 dark:bg-brand-500/5 rounded-xl">
                                                <p className="text-[10px] font-black text-brand-600 uppercase mb-1">Annual Turnover</p>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        className="w-full text-sm font-bold text-brand-800 dark:text-brand-400 bg-transparent border-b border-brand-500 focus:outline-none"
                                                        value={editForm.businessDetails?.annualIncome || ""}
                                                        onChange={(e) => handleInputChange('businessDetails.annualIncome', e.target.value)}
                                                    />
                                                ) : (
                                                    <p className="text-sm font-bold text-brand-800 dark:text-brand-400">{lead?.businessDetails?.annualIncome || "Syncing Data..."}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Image Vault */}
                        <div className="p-6 border border-gray-200 rounded-2xl bg-white dark:bg-white/[0.03] dark:border-gray-800">
                            <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Document Vault</h4>
                            <p className="text-xs text-gray-500 mb-8 font-medium">Verified scanned copies and shop front assets.</p>

                            <div className="space-y-12">
                                <ImageGallery title="Profile Pictures" field="profileImages" images={currentLeadData?.profileImages} />
                                <ImageGallery title="Aadhar Front" field="aadharFrontImages" images={currentLeadData?.aadharFrontImages} />
                                <ImageGallery title="Aadhar Back" field="aadharBackImages" images={currentLeadData?.aadharBackImages} />
                                <ImageGallery title="PAN Card" field="panCardImages" images={currentLeadData?.panCardImages} />
                                <ImageGallery title="GST Certificate" field="gstCertificateImages" images={currentLeadData?.gstCertificateImages} />
                                <ImageGallery title="Shop Front" field="shopFrontImages" images={currentLeadData?.shopFrontImages} />
                                <ImageGallery title="Other Documents" field="otherDocuments" images={currentLeadData?.otherDocuments} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PermissionGuard>
    );
}
