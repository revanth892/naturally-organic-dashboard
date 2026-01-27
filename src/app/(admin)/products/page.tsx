"use client";
import PermissionGuard from "@/components/common/PermissionGuard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useEffect, useState } from "react";
import { productApi, categoryApi } from "@/api/api";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { PlusIcon, TrashIcon, EditIcon } from "lucide-react";
import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<"products" | "categories">("products");

    // Modal State
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);

    // Form State
    const [productForm, setProductForm] = useState({
        name: "",
        category: "",
        unit: "ml",
        soldBy: "",
        manufacturedBy: "",
        variants: [
            { size: "", noInBox: 0, customerPrice: 0, retailerPrice: 0, liveFor: "both" }
        ],
        packagingInfo: "",
    });

    const [categoryForm, setCategoryForm] = useState({
        name: "",
        description: "",
    });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [prodRes, catRes] = await Promise.all([
                productApi.getAll(),
                categoryApi.getAll()
            ]);
            if (prodRes.success) setProducts(prodRes.data);
            if (catRes.success) setCategories(catRes.data);
        } catch (err: any) {
            setError(err.message || "Failed to fetch products");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSaveProduct = async () => {
        setIsSaving(true);
        try {
            let res;
            if (editingProduct) {
                res = await productApi.update(editingProduct._id, productForm);
            } else {
                res = await productApi.create(productForm);
            }
            if (res.success) {
                fetchData();
                setIsProductModalOpen(false);
                resetProductForm();
            }
        } catch (err: any) {
            alert(err.message || "Error saving product");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveCategory = async () => {
        setIsSaving(true);
        try {
            const res = await categoryApi.create(categoryForm);
            if (res.success) {
                const newCatRes = await categoryApi.getAll();
                if (newCatRes.success) setCategories(newCatRes.data);
                setIsCategoryModalOpen(false);
                setCategoryForm({ name: "", description: "" });
            }
        } catch (err: any) {
            alert(err.message || "Error saving category");
        } finally {
            setIsSaving(false);
        }
    };

    const resetProductForm = () => {
        setProductForm({
            name: "",
            category: "",
            unit: "ml",
            soldBy: "",
            manufacturedBy: "",
            variants: [{ size: "", noInBox: 0, customerPrice: 0, retailerPrice: 0, liveFor: "both" }],
            packagingInfo: "",
        });
        setEditingProduct(null);
    };

    const addVariantField = () => {
        setProductForm(prev => ({
            ...prev,
            variants: [...prev.variants, { size: "", noInBox: 0, customerPrice: 0, retailerPrice: 0, liveFor: "both" }]
        }));
    };

    const removeVariantField = (index: number) => {
        setProductForm(prev => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index)
        }));
    };

    const updateVariantField = (index: number, field: string, value: any) => {
        const newVariants = [...productForm.variants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setProductForm(prev => ({ ...prev, variants: newVariants }));
    };

    return (
        <PermissionGuard permission="productAccess">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <PageBreadcrumb pageTitle="Products Management" />
                <div className="flex gap-2">
                    {activeTab === "categories" ? (
                        <Button onClick={() => setIsCategoryModalOpen(true)} size="sm" startIcon={<PlusIcon className="w-4 h-4" />}>
                            Add Category
                        </Button>
                    ) : (
                        <Button onClick={() => { resetProductForm(); setIsProductModalOpen(true); }} size="sm" startIcon={<PlusIcon className="w-4 h-4" />}>
                            Add Product
                        </Button>
                    )}
                </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                {/* Tabs */}
                <div className="px-5 pt-4 border-b border-gray-200 dark:border-gray-800 flex gap-6">
                    <button
                        onClick={() => setActiveTab("products")}
                        className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === "products"
                            ? "text-brand-500 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-brand-500"
                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            }`}
                    >
                        Products ({products.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("categories")}
                        className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === "categories"
                            ? "text-brand-500 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-brand-500"
                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            }`}
                    >
                        Categories ({categories.length})
                    </button>
                </div>

                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="p-10 text-center text-gray-400">Loading data...</div>
                    ) : (
                        <>
                            {activeTab === "products" && (
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                                    <thead className="bg-[#F9FAFB] dark:bg-white/[0.02]">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Product</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Category</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Unit</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Variants</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Updated By</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                        {products.map((product) => (
                                            <tr key={product._id}>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="font-bold text-gray-800 dark:text-white/90">{product.name}</div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <Badge variant="light" color="primary">{product.category?.name || "No Category"}</Badge>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-gray-600 dark:text-gray-400">
                                                    {product.unit}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex flex-wrap gap-1">
                                                        {product.variants.map((v: any, idx: number) => (
                                                            <span key={idx} className="text-[10px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-500">
                                                                {v.size} (Box: {v.noInBox})
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                                        {product.updatedBy?.name || "System"}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400">
                                                        {new Date(product.updatedAt).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-right">
                                                    <Link href={`/products/${product._id}`} className="inline-block text-brand-500 hover:text-brand-600 mr-2 p-1">
                                                        <EditIcon className="w-4 h-4" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                        {products.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">
                                                    No products found. Add one to get started.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}

                            {activeTab === "categories" && (
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                                    <thead className="bg-[#F9FAFB] dark:bg-white/[0.02]">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Category Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Description</th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-500">Products Count</th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-500">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                        {categories.map((cat) => (
                                            <tr key={cat._id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-bold text-gray-800 dark:text-white/90">{cat.name}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                                        {cat.description || "—"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <Badge variant="solid" color="info" className="min-w-[30px] justify-center">
                                                        {cat.productCount || 0}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    {/* <button className="text-brand-500 hover:text-brand-600 mr-2">
                                                        <EditIcon className="w-4 h-4" />
                                                    </button> */}
                                                    <span className="text-gray-400 text-xs italic">Managed via API</span>
                                                </td>
                                            </tr>
                                        ))}
                                        {categories.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">
                                                    No categories found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Product Modal */}
            <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} className="max-w-[700px] max-h-[90vh] overflow-y-auto">
                <div className="p-6 lg:p-10 bg-white dark:bg-gray-900 rounded-3xl">
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-6 uppercase tracking-wider border-b pb-2">
                        {editingProduct ? "Edit Product" : "Create New Product"}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label>Product Name</Label>
                            <Input placeholder="Enter product name" value={productForm.name} onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))} />
                        </div>

                        <div>
                            <Label>Category</Label>
                            <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-2.5 text-sm"
                                value={productForm.category}
                                onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label>Unit</Label>
                            <select
                                className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-2.5 text-sm"
                                value={productForm.unit}
                                onChange={(e) => setProductForm(prev => ({ ...prev, unit: e.target.value }))}
                            >
                                <option value="ml">ml (Milliliters)</option>
                                <option value="gm">gm (Grams)</option>
                                <option value="kg">kg (Kilograms)</option>
                                <option value="ltr">ltr (Liters)</option>
                                <option value="pcs">pcs (Pieces)</option>
                            </select>
                        </div>

                        <div>
                            <Label>Sold By</Label>
                            <Input placeholder="Vendor name" value={productForm.soldBy} onChange={(e) => setProductForm(prev => ({ ...prev, soldBy: e.target.value }))} />
                        </div>
                        <div>
                            <Label>Manufactured By</Label>
                            <Input placeholder="Manufacturer name" value={productForm.manufacturedBy} onChange={(e) => setProductForm(prev => ({ ...prev, manufacturedBy: e.target.value }))} />
                        </div>
                    </div>

                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-4 border-b pb-2">
                            <h5 className="font-bold text-gray-800 dark:text-white text-sm uppercase">Variants Configuration</h5>
                            <Button size="sm" variant="outline" className="text-[10px] h-7" onClick={addVariantField}>+ Add Variant</Button>
                        </div>
                        <div className="space-y-4">
                            {productForm.variants.map((variant, idx) => (
                                <div key={idx} className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-800/20 grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
                                    <div className="col-span-1">
                                        <Label className="text-xs">Size</Label>
                                        <Input placeholder="e.g. 500" value={variant.size} onChange={(e) => updateVariantField(idx, "size", e.target.value)} />
                                    </div>
                                    <div className="col-span-1">
                                        <Label className="text-xs">No in Box</Label>
                                        <Input type="number" value={variant.noInBox} onChange={(e) => updateVariantField(idx, "noInBox", Number(e.target.value))} />
                                    </div>
                                    <div className="col-span-1">
                                        <Label className="text-xs">Cust Price</Label>
                                        <Input type="number" value={variant.customerPrice} onChange={(e) => updateVariantField(idx, "customerPrice", Number(e.target.value))} />
                                    </div>
                                    <div className="col-span-1">
                                        <Label className="text-xs">Ret Price</Label>
                                        <Input type="number" value={variant.retailerPrice} onChange={(e) => updateVariantField(idx, "retailerPrice", Number(e.target.value))} />
                                    </div>

                                    <Button variant="outline" size="sm" className="h-10 text-red-500 border-red-100" onClick={() => removeVariantField(idx)} disabled={productForm.variants.length === 1}>
                                        <TrashIcon className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4 mt-10">
                        <Button variant="outline" className="flex-1" onClick={() => setIsProductModalOpen(false)}>Cancel</Button>
                        <Button className="flex-1" onClick={handleSaveProduct} disabled={isSaving}>
                            {isSaving ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Category Modal */}
            <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} className="max-w-[400px]">
                <div className="p-8 bg-white dark:bg-gray-900 rounded-3xl">
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-6 uppercase">Add Category</h4>
                    <div className="space-y-4">
                        <div>
                            <Label>Category Name</Label>
                            <Input placeholder="e.g. Fertilizers" value={categoryForm.name} onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))} />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Input placeholder="Optional" value={categoryForm.description} onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))} />
                        </div>
                    </div>
                    <div className="flex gap-4 mt-8">
                        <Button variant="outline" className="flex-1" onClick={() => setIsCategoryModalOpen(false)}>Cancel</Button>
                        <Button className="flex-1" onClick={handleSaveCategory} disabled={isSaving}>Save</Button>
                    </div>
                </div>
            </Modal>
        </PermissionGuard>
    );
}
