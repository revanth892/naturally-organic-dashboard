"use client";
import PermissionGuard from "@/components/common/PermissionGuard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useEffect, useState, useRef } from "react";
import { productApi, categoryApi, mediaApi } from "@/api/api";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import {
    SaveIcon,
    ArrowLeft,
    TrashIcon,
    PlusIcon,
    EditIcon,
    Image as ImageIcon,
    UploadCloud,
    Package,
    Layers,
    Tag,
    ChevronLeft,
    X,
    Check,
    Loader2
} from "lucide-react";
import Badge from "@/components/ui/badge/Badge";
import Link from "next/link";

// Moved outside to prevent re-creation on every render causing focus loss
const VariantFormRow = ({ form, setForm, onSave, onCancel, isSaving, unit }: any) => {
    return (
        <div className="p-4 border border-brand-200 dark:border-brand-500/30 rounded-xl bg-brand-50/50 dark:bg-brand-500/10 mb-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="col-span-12 md:col-span-2">
                    <Label className="text-[10px] uppercase">Size ({unit})</Label>
                    <Input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} placeholder="Ex: 500" className="h-9 text-sm" />
                </div>
                <div className="col-span-6 md:col-span-2">
                    <Label className="text-[10px] uppercase">In Box</Label>
                    <Input
                        value={form.noInBox}
                        onChange={(e) => setForm({ ...form, noInBox: e.target.value })}
                        className="h-9 text-sm"
                        placeholder="0"
                    />
                </div>
                <div className="col-span-6 md:col-span-2">
                    <Label className="text-[10px] uppercase">Stock</Label>
                    <Input
                        value={form.stockQuantity}
                        onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
                        className="h-9 text-sm"
                        placeholder="0"
                    />
                </div>
                <div className="col-span-6 md:col-span-2">
                    <Label className="text-[10px] uppercase text-brand-600">Cust. Price</Label>
                    <Input
                        value={form.customerPrice}
                        onChange={(e) => setForm({ ...form, customerPrice: e.target.value })}
                        className="h-9 text-sm border-brand-200 focus:border-brand-500"
                        placeholder="₹ 0"
                    />
                </div>
                <div className="col-span-6 md:col-span-2">
                    <Label className="text-[10px] uppercase text-blue-600">Ret. Price</Label>
                    <Input
                        value={form.retailerPrice}
                        onChange={(e) => setForm({ ...form, retailerPrice: e.target.value })}
                        className="h-9 text-sm border-blue-200 focus:border-blue-500"
                        placeholder="₹ 0"
                    />
                </div>
                <div className="col-span-12 md:col-span-2 flex gap-2">
                    <Button size="sm" onClick={onSave} disabled={isSaving} className="flex-1 h-9">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </Button>
                    <Button size="sm" variant="outline" onClick={onCancel} className="flex-1 h-9">
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Advanced Fields Row */}
                <div className="col-span-12 flex flex-wrap gap-4 pt-2 border-t border-brand-200 dark:border-brand-500/20 mt-2">
                    <div className="w-32">
                        <Label className="text-[10px] uppercase">Cust. Disc</Label>
                        <Input
                            value={form.customerDiscount}
                            onChange={(e) => setForm({ ...form, customerDiscount: e.target.value })}
                            className="h-8 text-xs"
                            placeholder="0"
                        />
                    </div>
                    <div className="w-32">
                        <Label className="text-[10px] uppercase">Ret. Disc</Label>
                        <Input
                            value={form.retailerDiscount}
                            onChange={(e) => setForm({ ...form, retailerDiscount: e.target.value })}
                            className="h-8 text-xs"
                            placeholder="0"
                        />
                    </div>
                    <div className="w-40">
                        <Label className="text-[10px] uppercase">Visibility</Label>
                        <select
                            className="w-full h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 text-xs"
                            value={form.liveFor}
                            onChange={(e) => setForm({ ...form, liveFor: e.target.value })}
                        >
                            <option value="none">Hidden</option>
                            <option value="customer">Customer Only</option>
                            <option value="retailer">Retailer Only</option>
                            <option value="both">All</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-4 ml-auto pt-4">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="edit-isactive"
                                className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                                checked={form.isActive}
                                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                            />
                            <label htmlFor="edit-isactive" className="text-xs font-bold text-gray-700 dark:text-white">Active</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function ProductDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const productId = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);

    // Product State
    const [product, setProduct] = useState<any>(null);
    const [isEditingProduct, setIsEditingProduct] = useState(false);
    const [originalProduct, setOriginalProduct] = useState<any>(null);

    // Inline Variant Editing State
    const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
    const [variantEditForm, setVariantEditForm] = useState<any>({});
    const [isAddingVariant, setIsAddingVariant] = useState(false);

    // Initial State now uses string for numbers to allow better UI typing
    const [newVariantForm, setNewVariantForm] = useState<any>({
        size: "",
        noInBox: "",
        customerPrice: "",
        retailerPrice: "",
        customerDiscount: "",
        retailerDiscount: "",
        liveFor: "both",
        stockQuantity: "",
        isInStock: true,
        isActive: true
    });

    // Images Upload
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchProductData = async () => {
        setIsLoading(true);
        try {
            const [prodRes, catRes] = await Promise.all([
                productApi.getById(productId),
                categoryApi.getAll()
            ]);

            if (prodRes.success) {
                setProduct(prodRes.data);
                setOriginalProduct(JSON.parse(JSON.stringify(prodRes.data)));
            }
            if (catRes.success) setCategories(catRes.data);
        } catch (err: any) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (productId) fetchProductData();
    }, [productId]);

    const handleEditProduct = () => {
        setIsEditingProduct(true);
    };

    const handleCancelEditProduct = () => {
        setProduct(JSON.parse(JSON.stringify(originalProduct)));
        setIsEditingProduct(false);
    };

    const handleSaveGeneral = async () => {
        setIsSaving(true);
        try {
            const payload = {
                name: product.name,
                category: typeof product.category === 'object' ? product.category._id : product.category,
                unit: product.unit,
                soldBy: product.soldBy,
                manufacturedBy: product.manufacturedBy,
                description: product.description,
                packagingInfo: product.packagingInfo,
            };

            const res = await productApi.update(productId, payload);
            if (res.success) {
                setProduct(res.data);
                setOriginalProduct(JSON.parse(JSON.stringify(res.data)));
                setIsEditingProduct(false);
                alert("Product details updated successfully");
            }
        } catch (err: any) {
            alert(err.message || "Failed to update product");
        } finally {
            setIsSaving(false);
        }
    };

    // --- Image Handling ---

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        try {
            const newImages: any[] = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const presignedRes = await mediaApi.getPresignedUrl(file.name, file.type);
                if (!presignedRes.success) throw new Error("Failed to get upload URL");

                const { uploadUrl, key, viewUrl } = presignedRes.data;

                await fetch(uploadUrl, {
                    method: "PUT",
                    body: file,
                    headers: { "Content-Type": file.type }
                });

                newImages.push({
                    key,
                    location: viewUrl,
                    filename: file.name,
                    isActive: true
                });
            }

            const updatedImages = [...(product.images || []), ...newImages];
            const res = await productApi.update(productId, { images: updatedImages });

            if (res.success) {
                setProduct(res.data);
                setOriginalProduct(JSON.parse(JSON.stringify(res.data)));
            }

        } catch (err: any) {
            console.error(err);
            alert("Upload failed");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDeleteImage = async (key: string) => {
        if (!confirm("Remove this image?")) return;
        const updatedImages = product.images.filter((img: any) => img.key !== key);
        try {
            const res = await productApi.update(productId, { images: updatedImages });
            if (res.success) {
                setProduct(res.data);
                setOriginalProduct(JSON.parse(JSON.stringify(res.data)));
            }
        } catch (err) {
            alert("Failed to delete image");
        }
    };

    const handleToggleImageActive = async (key: string, isActive: boolean) => {
        const updatedImages = product.images.map((img: any) =>
            img.key === key ? { ...img, isActive } : img
        );
        try {
            const res = await productApi.update(productId, { images: updatedImages });
            if (res.success) {
                setProduct(res.data);
                setOriginalProduct(JSON.parse(JSON.stringify(res.data)));
            }
        } catch (err) {
            alert("Failed to update image status");
        }
    };

    // --- Inline Variant Handling ---

    const startEditingVariant = (variant: any) => {
        setEditingVariantId(variant._id);
        // Convert numbers to strings for easier editing
        setVariantEditForm({
            ...variant,
            noInBox: variant.noInBox?.toString() || "",
            stockQuantity: variant.stockQuantity?.toString() || "",
            customerPrice: variant.customerPrice?.toString() || "",
            retailerPrice: variant.retailerPrice?.toString() || "",
            customerDiscount: variant.customerDiscount?.toString() || "",
            retailerDiscount: variant.retailerDiscount?.toString() || ""
        });
        setIsAddingVariant(false);
    };

    const cancelEditingVariant = () => {
        setEditingVariantId(null);
        setVariantEditForm({});
    };

    const saveVariant = async () => {
        if (!editingVariantId) return;
        setIsSaving(true);
        try {
            // Convert strings back to numbers
            const payload = {
                ...variantEditForm,
                noInBox: Number(variantEditForm.noInBox) || 0,
                stockQuantity: Number(variantEditForm.stockQuantity) || 0,
                customerPrice: Number(variantEditForm.customerPrice) || 0,
                retailerPrice: Number(variantEditForm.retailerPrice) || 0,
                customerDiscount: Number(variantEditForm.customerDiscount) || 0,
                retailerDiscount: Number(variantEditForm.retailerDiscount) || 0
            };

            const res = await productApi.updateVariant(productId, editingVariantId, payload);
            if (res.success) {
                setProduct(res.data);
                setOriginalProduct(JSON.parse(JSON.stringify(res.data)));
                setEditingVariantId(null);
            }
        } catch (err: any) {
            alert(err.message || "Failed to update variant");
        } finally {
            setIsSaving(false);
        }
    };

    const startAddingVariant = () => {
        setNewVariantForm({
            size: "",
            noInBox: "",
            customerPrice: "",
            retailerPrice: "",
            customerDiscount: "",
            retailerDiscount: "",
            liveFor: "both",
            stockQuantity: "",
            isInStock: true,
            isActive: true
        });
        setIsAddingVariant(true);
        setEditingVariantId(null); // Close other edits
    };

    const cancelAddingVariant = () => {
        setIsAddingVariant(false);
    };

    const saveNewVariant = async () => {
        setIsSaving(true);
        try {
            const payload = {
                ...newVariantForm,
                noInBox: Number(newVariantForm.noInBox) || 0,
                stockQuantity: Number(newVariantForm.stockQuantity) || 0,
                customerPrice: Number(newVariantForm.customerPrice) || 0,
                retailerPrice: Number(newVariantForm.retailerPrice) || 0,
                customerDiscount: Number(newVariantForm.customerDiscount) || 0,
                retailerDiscount: Number(newVariantForm.retailerDiscount) || 0
            };

            const res = await productApi.addVariant(productId, payload);
            if (res.success) {
                setProduct(res.data);
                setOriginalProduct(JSON.parse(JSON.stringify(res.data)));
                setIsAddingVariant(false);
            }
        } catch (err: any) {
            alert(err.message || "Failed to add variant");
        } finally {
            setIsSaving(false);
        }
    };

    const deleteVariant = async (variantId: string) => {
        if (!confirm("Are you sure you want to delete this variant?")) return;
        try {
            const res = await productApi.deleteVariant(productId, variantId);
            if (res.success) {
                setProduct(res.data);
                setOriginalProduct(JSON.parse(JSON.stringify(res.data)));
            }
        } catch (err: any) {
            alert(err.message || "Failed to delete variant");
        }
    };

    if (isLoading) return <div className="p-20 text-center text-gray-400">Loading Product...</div>;
    if (!product) return <div className="p-20 text-center text-red-500">Product not found</div>;

    return (
        <PermissionGuard permission="productAccess">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <Link href="/products" className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-500 mb-4 transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                        Back to Inventory
                    </Link>
                    <PageBreadcrumb pageTitle="Product Dossier" />
                </div>
                <div className="flex gap-2">
                    {/* Global Save Button Removed - Actions are context specific now */}
                </div>
            </div>

            <div className="space-y-6">
                {/* Header Identity Card */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* No Profile Image Required on Products as requested. Showing Main product image instead as identity */}
                        <div className="relative group/avatar">
                            <div className="w-28 h-28 overflow-hidden flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-100 dark:border-gray-700 shadow-lg relative">
                                {product.images && product.images.length > 0 ? (
                                    <img src={product.images[0].location} className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon className="w-10 h-10 text-gray-300" />
                                )}
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left w-full">
                            <div className="flex items-center justify-between w-full mb-4">
                                <h4 className="text-2xl font-bold text-gray-800 dark:text-white">{product.name}</h4>
                                {!isEditingProduct ? (
                                    <Button onClick={handleEditProduct} size="sm" variant="outline" startIcon={<EditIcon className="w-4 h-4" />}>
                                        Edit Details
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button onClick={handleCancelEditProduct} size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">
                                            Cancel
                                        </Button>
                                        <Button onClick={handleSaveGeneral} size="sm" disabled={isSaving}>
                                            Save Changes
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase">Category:</span>
                                    <Badge size="sm" variant="light" color="primary">{product.category?.name || "Uncategorized"}</Badge>
                                </div>
                                <div className="h-4 w-px bg-gray-200 dark:bg-gray-700"></div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase">Base Unit:</span>
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{product.unit || "N/A"}</span>
                                </div>
                                <div className="h-4 w-px bg-gray-200 dark:bg-gray-700"></div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase">Active Variants:</span>
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{product.variants?.filter((v: any) => v.isActive).length || 0}</span>
                                </div>
                                <div className="h-4 w-px bg-gray-200 dark:bg-gray-700"></div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase">Last Updated By:</span>
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{product.updatedBy?.name || "System"}</span>
                                    <span className="text-[10px] text-gray-400">({new Date(product.updatedAt).toLocaleDateString()})</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left Column: Quick Actions & Status */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="p-5 border border-gray-200 rounded-2xl bg-white dark:bg-white/[0.03] dark:border-gray-800">
                            <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-4 uppercase tracking-widest flex items-center gap-2">
                                <Tag className="w-4 h-4 text-brand-500" />
                                Product Details
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-[10px] uppercase tracking-widest text-gray-400">Product Name</Label>
                                    {isEditingProduct ? (
                                        <Input value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} className="h-9 text-sm" />
                                    ) : (
                                        <p className="text-sm font-semibold text-gray-800 dark:text-white py-1">{product.name}</p>
                                    )}
                                </div>
                                <div>
                                    <Label className="text-[10px] uppercase tracking-widest text-gray-400">Category</Label>
                                    {isEditingProduct ? (
                                        <select
                                            className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 border rounded-lg p-2 text-sm outline-none"
                                            value={typeof product.category === 'object' ? product.category?._id : product.category}
                                            onChange={(e) => setProduct({ ...product, category: e.target.value })}
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                        </select>
                                    ) : (
                                        <p className="text-sm font-semibold text-gray-800 dark:text-white py-1">{product.category?.name || "Uncategorized"}</p>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-[10px] uppercase tracking-widest text-gray-400">Unit</Label>
                                    {isEditingProduct ? (
                                        <select
                                            className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 border rounded-lg p-2 text-sm outline-none"
                                            value={product.unit}
                                            onChange={(e) => setProduct({ ...product, unit: e.target.value })}
                                        >
                                            <option value="ml">ml (Milliliters)</option>
                                            <option value="gm">gm (Grams)</option>
                                            <option value="kg">kg (Kilograms)</option>
                                            <option value="ltr">ltr (Liters)</option>
                                            <option value="pcs">pcs (Pieces)</option>
                                        </select>
                                    ) : (
                                        <p className="text-sm font-semibold text-gray-800 dark:text-white py-1">{product.unit || "N/A"}</p>
                                    )}
                                </div>
                                <div>
                                    <Label className="text-[10px] uppercase tracking-widest text-gray-400">Sold By</Label>
                                    {isEditingProduct ? (
                                        <Input value={product.soldBy || ""} onChange={(e) => setProduct({ ...product, soldBy: e.target.value })} className="h-9 text-sm" />
                                    ) : (
                                        <p className="text-sm font-semibold text-gray-800 dark:text-white py-1">{product.soldBy || "—"}</p>
                                    )}
                                </div>
                                <div>
                                    <Label className="text-[10px] uppercase tracking-widest text-gray-400">Manufactured By</Label>
                                    {isEditingProduct ? (
                                        <Input value={product.manufacturedBy || ""} onChange={(e) => setProduct({ ...product, manufacturedBy: e.target.value })} className="h-9 text-sm" />
                                    ) : (
                                        <p className="text-sm font-semibold text-gray-800 dark:text-white py-1">{product.manufacturedBy || "—"}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-5 border border-gray-200 rounded-2xl bg-white dark:bg-white/[0.03] dark:border-gray-800">
                            <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-4 uppercase tracking-widest flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-brand-500" />
                                Gallery ({product.images?.length || 0})
                            </h4>
                            <div className="grid grid-cols-3 gap-2">
                                {product.images?.slice(0, 6).map((img: any) => (
                                    <div key={img.key} className="relative group aspect-square rounded-lg bg-gray-100 dark:bg-white/5 overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                                        <img src={img.location} className={`w-full h-full object-cover transition-opacity ${!img.isActive ? 'opacity-40' : ''}`} />
                                        {!img.isActive && (
                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                <span className="text-white text-[10px] font-bold uppercase bg-red-500 px-2 py-0.5 rounded">Inactive</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleToggleImageActive(img.key, !img.isActive); }}
                                                className="text-white text-[9px] font-bold uppercase bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-sm hover:bg-black/70 transition-colors"
                                            >
                                                {img.isActive ? 'Hide' : 'Show'}
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteImage(img.key); }}
                                                className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                            >
                                                <X className="w-2 h-2" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="aspect-square rounded-lg border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" /> : <PlusIcon className="w-5 h-5 text-gray-400" />}
                                </button>
                            </div>
                            <input
                                type="file"
                                multiple
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileUpload}
                            />
                        </div>
                    </div>

                    {/* Right Column: Details & Variants */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Description Section */}
                        <div className="p-6 border border-gray-200 rounded-2xl bg-white dark:bg-white/[0.03] dark:border-gray-800">
                            <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Detailed Description</h4>
                            {isEditingProduct ? (
                                <>
                                    <TextArea
                                        value={product.description || ""}
                                        onChange={(val) => setProduct({ ...product, description: val })}
                                        rows={4}
                                        placeholder="Write a detailed description for the app users..."
                                        className="text-sm"
                                    />
                                    <div className="mt-4">
                                        <Label className="text-xs">Packaging Information</Label>
                                        <Input value={product.packagingInfo || ""} onChange={(e) => setProduct({ ...product, packagingInfo: e.target.value })} placeholder="e.g. Recyclable bottle" />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed min-h-[60px]">
                                        {product.description || <span className="text-gray-400 italic">No description provided.</span>}
                                    </p>
                                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <span className="text-xs font-bold text-gray-400 uppercase">Packaging Info:</span>
                                        <span className="text-sm text-gray-700 dark:text-gray-300 ml-2">{product.packagingInfo || "N/A"}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Variants Section */}
                        <div className="p-6 border border-gray-200 rounded-2xl bg-white dark:bg-white/[0.03] dark:border-gray-800">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h4 className="text-lg font-bold text-gray-800 dark:text-white">Product Variants</h4>
                                    <p className="text-xs text-gray-500">Manage pricing and stock for different sizes.</p>
                                </div>
                                {!isAddingVariant && (
                                    <Button size="sm" onClick={startAddingVariant} startIcon={<PlusIcon className="w-4 h-4" />}>
                                        Add Variant
                                    </Button>
                                )}
                            </div>

                            <div className="space-y-3">
                                {/* New Variant Form */}
                                {isAddingVariant && (
                                    <VariantFormRow
                                        form={newVariantForm}
                                        setForm={setNewVariantForm}
                                        onSave={saveNewVariant}
                                        onCancel={cancelAddingVariant}
                                        isSaving={isSaving}
                                        unit={product.unit} // Pass unit prop
                                    />
                                )}

                                {/* Existing Variants List */}
                                {product.variants?.map((variant: any) => {
                                    if (editingVariantId === variant._id) {
                                        return (
                                            <VariantFormRow
                                                key={variant._id}
                                                form={variantEditForm}
                                                setForm={setVariantEditForm}
                                                onSave={saveVariant}
                                                onCancel={cancelEditingVariant}
                                                isSaving={isSaving}
                                                unit={product.unit} // Pass unit prop
                                            />
                                        )
                                    }

                                    return (
                                        <div key={variant._id} className="group p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-white/5 hover:border-brand-200 dark:hover:border-brand-500/30 transition-all">
                                            <div className="flex flex-col gap-3">
                                                {/* Header Row */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-bold text-gray-800 dark:text-white text-base">{variant.size} {product.unit}</span>
                                                        <Badge size="sm" variant="light" color={variant.isActive ? "success" : "error"} className="py-0 h-4 text-[9px]">
                                                            {variant.isActive ? "ACTIVE" : "INACTIVE"}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => startEditingVariant(variant)} className="p-1.5 text-gray-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-colors">
                                                            <EditIcon className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => deleteVariant(variant._id)} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Details Grid */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                                                    <div>
                                                        <p className="text-[9px] text-gray-400 uppercase font-bold mb-1">In Box</p>
                                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{variant.noInBox}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-gray-400 uppercase font-bold mb-1">Stock</p>
                                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{variant.stockQuantity}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-gray-400 uppercase font-bold mb-1">Visibility</p>
                                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">{variant.liveFor || "none"}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-gray-400 uppercase font-bold mb-1">Stock Status</p>
                                                        <Badge size="sm" variant="light" color={variant.isInStock ? "success" : "error"} className="text-[9px]">
                                                            {variant.isInStock ? "In Stock" : "Out of Stock"}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                {/* Pricing Grid */}
                                                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                                                    <div className="p-3 bg-brand-50/50 dark:bg-brand-500/5 rounded-lg border border-brand-100 dark:border-brand-500/10">
                                                        <p className="text-[9px] text-brand-600 dark:text-brand-400 uppercase font-bold mb-2">Customer Pricing</p>
                                                        <div className="flex items-baseline gap-2">
                                                            {variant.customerDiscount > 0 ? (
                                                                <>
                                                                    <span className="text-sm font-semibold text-gray-400 line-through">₹{variant.customerPrice}</span>
                                                                    <span className="text-lg font-bold text-gray-800 dark:text-white">₹{variant.customerDiscount}</span>
                                                                </>
                                                            ) : (
                                                                <span className="text-lg font-bold text-gray-800 dark:text-white">₹{variant.customerPrice}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="p-3 bg-blue-50/50 dark:bg-blue-500/5 rounded-lg border border-blue-100 dark:border-blue-500/10">
                                                        <p className="text-[9px] text-blue-600 dark:text-blue-400 uppercase font-bold mb-2">Retailer Pricing</p>
                                                        <div className="flex items-baseline gap-2">
                                                            {variant.retailerDiscount > 0 ? (
                                                                <>
                                                                    <span className="text-sm font-semibold text-gray-400 line-through">₹{variant.retailerPrice}</span>
                                                                    <span className="text-lg font-bold text-gray-800 dark:text-white">₹{variant.retailerDiscount}</span>
                                                                </>
                                                            ) : (
                                                                <span className="text-lg font-bold text-gray-800 dark:text-white">₹{variant.retailerPrice}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}

                                {(!product.variants || product.variants.length === 0) && !isAddingVariant && (
                                    <div className="py-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                                        No variants added yet. Click 'Add Variant' to create one.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PermissionGuard>
    );
}
