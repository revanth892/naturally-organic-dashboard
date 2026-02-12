"use client";
import PermissionGuard from "@/components/common/PermissionGuard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useEffect, useState, useRef } from "react";
import { brandApi, mediaApi } from "@/api/api";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { PlusIcon, TrashIcon, EditIcon, Loader2, ImageIcon, CameraIcon } from "lucide-react";
import Badge from "@/components/ui/badge/Badge";

export default function BrandsPage() {
    const [brands, setBrands] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<any>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState<any>({
        name: "",
        description: "",
        image: { key: "", location: "", thumbnailKey: "", blurhash: "" }
    });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await brandApi.getAll();
            if (res.success) setBrands(res.data);
        } catch (err: any) {
            setError(err.message || "Failed to fetch brands");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async () => {
        if (!form.name.trim()) return alert("Brand name is required");
        setIsSaving(true);
        try {
            let res;
            if (editingBrand) {
                res = await brandApi.update(editingBrand._id, form);
            } else {
                res = await brandApi.create(form);
            }
            if (res.success) {
                fetchData();
                setIsModalOpen(false);
                resetForm();
            }
        } catch (err: any) {
            alert(err.message || "Error saving brand");
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setForm({ name: "", description: "", image: { key: "", location: "", thumbnailKey: "", blurhash: "" } });
        setEditingBrand(null);
    };

    const startEditing = (brand: any) => {
        setEditingBrand(brand);
        setForm({
            name: brand.name,
            description: brand.description || "",
            image: brand.image || { key: "", location: "", thumbnailKey: "", blurhash: "" }
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this brand?")) return;
        try {
            const res = await brandApi.delete(id);
            if (res.success) {
                fetchData();
            }
        } catch (err: any) {
            alert(err.message || "Failed to delete brand");
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const imageCompression = (await import("browser-image-compression")).default;

            const presignedRes = await mediaApi.getPresignedUrl(file.name, file.type);
            if (!presignedRes.success) throw new Error("Failed to get upload URL");

            const { uploadUrl, key, viewUrl } = presignedRes.data;

            await fetch(uploadUrl, {
                method: "PUT",
                body: file,
                headers: { "Content-Type": file.type }
            });

            const options = {
                maxSizeMB: 0.1,
                maxWidthOrHeight: 300,
                useWebWorker: true,
                fileType: "image/webp"
            };

            let thumbnailKey = null;
            try {
                const compressedFile = await imageCompression(file, options);
                const thumbFileName = file.name.split('.')[0] + ".webp";
                const thumbPresignedRes = await mediaApi.getPresignedUrl(thumbFileName, "image/webp", "thumbnail");
                if (thumbPresignedRes.success) {
                    const { uploadUrl: thumbUploadUrl, key: thumbKey } = thumbPresignedRes.data;
                    await fetch(thumbUploadUrl, {
                        method: "PUT",
                        body: compressedFile,
                        headers: { "Content-Type": "image/webp" }
                    });
                    thumbnailKey = thumbKey;
                }
            } catch (thumbErr) {
                console.warn("Brand thumbnail generation failed", thumbErr);
            }

            let blurhash = null;
            try {
                const { generateBlurhash } = await import("@/utils/blurhash");
                blurhash = await generateBlurhash(file);
            } catch (hashErr) {
                console.warn("Brand BlurHash generation failed", hashErr);
            }

            setForm((prev: any) => ({
                ...prev,
                image: { key, thumbnailKey, blurhash, location: viewUrl }
            }));
        } catch (err: any) {
            alert("Upload failed: " + err.message);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <PermissionGuard permission="brandAccess">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <PageBreadcrumb pageTitle="Brands Management" />
                <Button onClick={() => { resetForm(); setIsModalOpen(true); }} size="sm" startIcon={<PlusIcon className="w-4 h-4" />}>
                    Add Brand
                </Button>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="p-10 text-center text-gray-400">Loading brands...</div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                            <thead className="bg-[#F9FAFB] dark:bg-white/[0.02]">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Brand</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Description</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-500">Products</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-500">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {brands.map((brand: any) => (
                                    <tr key={brand._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 overflow-hidden flex items-center justify-center">
                                                    {brand.image?.location ? (
                                                        <img src={brand.image.location} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ImageIcon className="w-5 h-5 text-gray-300" />
                                                    )}
                                                </div>
                                                <div className="font-bold text-gray-800 dark:text-white/90">{brand.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                                {brand.description || "—"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <Badge variant="light" color="primary">
                                                {brand.productCount || 0} Products
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button
                                                onClick={() => startEditing(brand)}
                                                className="text-brand-500 hover:text-brand-600 mr-3 p-1 rounded-md hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors"
                                            >
                                                <EditIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(brand._id)}
                                                className="text-red-500 hover:text-red-600 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {brands.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center text-gray-400 text-sm">
                                            No brands found. Click "Add Brand" to create one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Brand Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-[450px]">
                <div className="p-8 bg-white dark:bg-gray-900 rounded-3xl">
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-6 uppercase tracking-wider">
                        {editingBrand ? "Update Brand" : "Add New Brand"}
                    </h4>

                    {/* Image Upload */}
                    <div className="mb-6 flex flex-col items-center">
                        <div className="relative group w-32 h-32 mb-4">
                            <div className="w-full h-full rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                                {form.image?.location ? (
                                    <img src={form.image.location} className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon className="w-10 h-10 text-gray-300" />
                                )}
                                {isUploading && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-2 -right-2 p-2 bg-brand-500 text-white rounded-xl shadow-lg hover:scale-110 transition-transform"
                                disabled={isUploading}
                            >
                                <CameraIcon className="w-4 h-4" />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                        </div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Brand Logo / Image</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <Label>Brand Name</Label>
                            <Input placeholder="e.g. Organic Tattva" value={form.name} onChange={(e) => setForm((prev: any) => ({ ...prev, name: e.target.value }))} />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Input placeholder="Brief details about the brand" value={form.description} onChange={(e) => setForm((prev: any) => ({ ...prev, description: e.target.value }))} />
                        </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                        <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button className="flex-1" onClick={handleSave} disabled={isSaving || isUploading}>
                            {isSaving ? "Saving..." : editingBrand ? "Update Brand" : "Create Brand"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </PermissionGuard>
    );
}
