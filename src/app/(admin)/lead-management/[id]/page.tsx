"use client";
import PermissionGuard from "@/components/common/PermissionGuard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useEffect, useState, use } from "react";
import { appUserApi, cartActivityApi, mediaApi } from "@/api/api";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import {
    ChevronLeft,
    Pencil,
    Check,
    X,
    Upload,
    ShoppingCart,
} from "lucide-react";
import Link from "next/link";

export default function LeadDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [lead, setLead] = useState<any>(null);
    const [cartActivities, setCartActivities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState("");

    // Editable Form State
    const [editForm, setEditForm] = useState<any>(null);

    const fetchLeadData = async () => {
        setIsLoading(true);
        try {
            const [leadRes, cartRes] = await Promise.all([
                appUserApi.getById(id),
                cartActivityApi.getAll(id),
            ]);

            if (leadRes.success) {
                setLead(leadRes.data);
                setEditForm(JSON.parse(JSON.stringify(leadRes.data)));
            }
            if (cartRes.success) {
                setCartActivities(cartRes.data);
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

    const handleCancel = () => {
        setEditForm(JSON.parse(JSON.stringify(lead)));
        setIsEditing(false);
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

            if (!uploadResponse.ok) throw new Error("Upload failed");

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
                        No documents uploaded
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
                        Back to List
                    </Link>
                    <PageBreadcrumb pageTitle="User Profile Dossier" />
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
                            <div className={`w-28 h-28 overflow-hidden flex items-center justify-center rounded-2xl text-white text-5xl font-black shadow-lg transition-all ${isEditing ? 'ring-4 ring-brand-500/20' : ''} bg-brand-500`}>
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
                                    <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">
                                        SOURCE: {lead?.source || "WEB"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase">Email:</span>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            className="text-sm font-semibold bg-transparent border-b border-brand-500 focus:outline-none text-gray-700 dark:text-gray-300"
                                            value={editForm.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                        />
                                    ) : (
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{lead?.email}</span>
                                    )}
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

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Main Content Area */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Location Details */}
                            <div className="p-6 border border-gray-200 rounded-2xl bg-white dark:bg-white/[0.03] dark:border-gray-800">
                                <div className="flex items-center justify-between mb-6">
                                    <h4 className="text-lg font-bold text-gray-800 dark:text-white">Location</h4>
                                    {isEditing ? (
                                        <select
                                            className="text-xs bg-transparent border-b border-brand-500 focus:outline-none text-brand-500 font-bold"
                                            value={editForm.address?.addressType || "Home"}
                                            onChange={(e) => handleInputChange('address.addressType', e.target.value)}
                                        >
                                            <option value="Home">Home</option>
                                            <option value="Office">Office</option>
                                        </select>
                                    ) : (
                                        <Badge variant="light" size="sm" color="primary">{lead?.address?.addressType || "Home"}</Badge>
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
                                                        className="font-semibold text-right max-w-[150px] bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-brand-500 focus:outline-none text-gray-700 dark:text-gray-300"
                                                        value={value}
                                                        onChange={(e) => handleInputChange(item.key, e.target.value)}
                                                    />
                                                ) : (
                                                    <span className={`font-semibold text-right max-w-[150px] ${item.highlight ? 'text-brand-500' : 'text-gray-700 dark:text-gray-300'}`}>
                                                        {value}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Basic Info */}
                            <div className="p-6 border border-gray-200 rounded-2xl bg-white dark:bg-white/[0.03] dark:border-gray-800">
                                <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Account Details</h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center pt-3 border-t border-gray-50 dark:border-white/5 first:border-0 text-theme-sm">
                                        <span className="text-gray-400 font-medium">Phone Number</span>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                className="font-semibold text-right bg-transparent border-b border-brand-500 focus:outline-none text-gray-700 dark:text-gray-300"
                                                value={editForm.phoneNumber || ""}
                                                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                                placeholder="not set"
                                            />
                                        ) : (
                                            <span className="font-semibold text-gray-700 dark:text-gray-300">{lead?.phoneNumber || "N/A"}</span>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-gray-50 dark:border-white/5 text-theme-sm">
                                        <span className="text-gray-400 font-medium">Contact Terms</span>
                                        <span className="font-semibold text-success-500 uppercase">{lead?.policyChecked ? "ACCEPTED" : "PENDING"}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-gray-50 dark:border-white/5 text-theme-sm">
                                        <span className="text-gray-400 font-medium">User ID</span>
                                        <span className="font-mono text-[10px] text-gray-400">{id}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Image Vault */}
                        <div className="p-6 border border-gray-200 rounded-2xl bg-white dark:bg-white/[0.03] dark:border-gray-800">
                            <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Media & Documents</h4>
                            <p className="text-xs text-gray-500 mb-8 font-medium">User profile photos and uploaded verification assets.</p>

                            <div className="space-y-12">
                                <ImageGallery title="Profile Pictures" field="profileImages" images={currentLeadData?.profileImages} />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Activity */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="p-6 border border-gray-200 rounded-2xl bg-white dark:bg-white/[0.03] dark:border-gray-800 h-full">
                            <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-4">
                                <ShoppingCart className="w-5 h-5 text-brand-500" />
                                Cart Activity
                            </h4>
                            <div className="relative space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-gray-100 dark:before:bg-gray-800">
                                {cartActivities.length === 0 ? (
                                    <p className="text-xs text-gray-400 pl-8 italic font-medium">No recent cart activity recorded.</p>
                                ) : (
                                    cartActivities.map((activity) => (
                                        <div key={activity._id} className="relative pl-8 group">
                                            <div className={`absolute left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ring-4 ring-white dark:ring-gray-900 shadow-sm transition-colors ${activity.action === 'ADD' ? 'bg-success-500' :
                                                activity.action === 'REMOVE' ? 'bg-error-500' : 'bg-brand-500'
                                                }`}></div>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-800 dark:text-white">
                                                        {activity.action.replace('_', ' ')}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-bold">{new Date(activity.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-xs text-gray-700 dark:text-gray-300 font-bold mt-1 leading-tight">
                                                    {activity.productName}
                                                    <span className="ml-1 text-gray-400 font-medium">({activity.variantSize})</span>
                                                </p>
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium italic mt-0.5">
                                                    "{activity.details}"
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PermissionGuard>
    );
}
