"use client";
import PermissionGuard from "@/components/common/PermissionGuard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageTutorial from "@/components/common/PageTutorial";
import { useEffect, useState, useRef } from "react";
import { productApi, categoryApi, subcategoryApi, childCategoryApi, brandApi, mediaApi } from "@/api/api";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { PlusIcon, TrashIcon, EditIcon, CameraIcon, ImageIcon, Loader2, X, Search, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";

export default function ProductsPage() {
    const tutorialSteps = [
        {
            title: "Inventory Management",
            description: "View, edit, and search through all products. You can toggle stock levels and change visibility here."
        },
        {
            title: "Category Hierarchy",
            description: "Use the tabs to switch between Categories, Sub-categories, and Child-categories to organize your catalog."
        },
        {
            title: "Brand Management",
            description: "Manage the manufacturing brands associated with your organic produce."
        },
        {
            title: "Quick Actions",
            description: "Add new products or categories using the 'Add' buttons located top right of each section."
        }
    ];

    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [subcategories, setSubcategories] = useState<any[]>([]);
    const [childCategories, setChildCategories] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<"products" | "categories" | "subcategories" | "childCategories" | "brands">("products");
    const [searchQuery, setSearchQuery] = useState("");
    const [counts, setCounts] = useState({ products: 0, categories: 0, subcategories: 0, childCategories: 0, brands: 0 });

    // Modal State
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
    const [isChildCategoryModalOpen, setIsChildCategoryModalOpen] = useState(false);
    const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);

    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [editingSubcategory, setEditingSubcategory] = useState<any>(null);
    const [editingChildCategory, setEditingChildCategory] = useState<any>(null);
    const [editingBrand, setEditingBrand] = useState<any>(null);

    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [productForm, setProductForm] = useState({
        name: "",
        brand: "",
        category: "",
        subcategory: "",
        childCategory: "",
        unit: "ml",
        soldBy: "",
        manufacturedBy: "",
        variants: [
            { variantName: "", size: "", noInBox: 0, price: 0, discount: 0, stockQuantity: 0 }
        ],
        packagingInfo: "",
        images: [] as any[]
    });

    const [categoryForm, setCategoryForm] = useState({
        name: "",
        description: "",
        image: { key: "", location: "" }
    });

    const [subcategoryForm, setSubcategoryForm] = useState({
        name: "",
        description: "",
        category: "",
        image: { key: "", location: "" }
    });

    const [childCategoryForm, setChildCategoryForm] = useState({
        name: "",
        description: "",
        category: "",
        subcategory: "",
        image: { key: "", location: "" }
    });

    const [brandForm, setBrandForm] = useState({
        name: "",
        description: "",
        image: { key: "", location: "" }
    });

    const fetchData = async (search = "") => {
        setIsLoading(true);
        try {
            const params = search ? `?search=${encodeURIComponent(search)}` : "";
            let res;
            if (activeTab === "products") res = await productApi.getAllWithParams(params);
            else if (activeTab === "categories") res = await categoryApi.getAllWithParams(params);
            else if (activeTab === "subcategories") res = await subcategoryApi.getAllWithParams(params);
            else if (activeTab === "childCategories") res = await childCategoryApi.getAllWithParams(params);
            else if (activeTab === "brands") res = await brandApi.getAllWithParams(params);

            if (res?.success) {
                if (activeTab === "products") setProducts(res.data);
                else if (activeTab === "categories") setCategories(res.data);
                else if (activeTab === "subcategories") setSubcategories(res.data);
                else if (activeTab === "childCategories") setChildCategories(res.data);
                else if (activeTab === "brands") setBrands(res.data);

                setCounts(prev => ({ ...prev, [activeTab]: res.count || res.data.length }));
            }
        } catch (err: any) {
            setError(err.message || "Failed to fetch data");
        } finally {
            setIsLoading(false);
        }
    };

    // Need to fetch dropdown options separately (all data) for forms vs paginated table data
    const [allCategories, setAllCategories] = useState<any[]>([]);
    const [allSubcategories, setAllSubcategories] = useState<any[]>([]);
    const [allChildCategories, setAllChildCategories] = useState<any[]>([]);
    const [allBrands, setAllBrands] = useState<any[]>([]);

    const fetchDropdownData = async () => {
        try {
            // Fetch all for dropdowns (no limit)
            const [catRes, subRes, childRes, brandRes] = await Promise.all([
                categoryApi.getAllWithParams("?limit=1000"),
                subcategoryApi.getAllWithParams("?limit=1000"),
                childCategoryApi.getAllWithParams("?limit=1000"),
                brandApi.getAllWithParams("?limit=1000")
            ]);
            if (catRes.success) setAllCategories(catRes.data);
            if (subRes.success) setAllSubcategories(subRes.data);
            if (childRes.success) setAllChildCategories(childRes.data);
            if (brandRes.success) setAllBrands(brandRes.data);
        } catch (e) { console.error("Dropdown data fetch failed", e); }
    };

    const fetchAllCounts = async () => {
        try {
            const [prodRes, catRes, subRes, childRes, brandRes] = await Promise.all([
                productApi.getAllWithParams("?limit=1"),
                categoryApi.getAllWithParams("?limit=1"),
                subcategoryApi.getAllWithParams("?limit=1"),
                childCategoryApi.getAllWithParams("?limit=1"),
                brandApi.getAllWithParams("?limit=1")
            ]);

            setCounts({
                products: prodRes.pagination?.total || 0,
                categories: catRes.pagination?.total || 0,
                subcategories: subRes.pagination?.total || 0,
                childCategories: childRes.pagination?.total || 0,
                brands: brandRes.pagination?.total || 0
            });
        } catch (error) {
            console.error("Error fetching counts:", error);
        }
    };

    useEffect(() => {
        fetchData(searchQuery);
    }, [activeTab]); // Fetch when tab changes

    // Debounce search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchData(searchQuery);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    useEffect(() => {
        // Initial fetch for dropdowns
        fetchDropdownData();
        fetchAllCounts();
    }, []);


    const handleSaveProduct = async () => {
        setIsSaving(true);
        try {
            // Ensure optional fields are handled correctly for the API
            const payload = {
                ...productForm,
                brand: productForm.brand || null,
                subcategory: productForm.subcategory || null,
                childCategory: productForm.childCategory || null,
            };

            let res;
            if (editingProduct) {
                res = await productApi.update(editingProduct._id, payload);
            } else {
                res = await productApi.create(payload);
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
            let res;
            if (editingCategory) {
                res = await categoryApi.update(editingCategory._id, categoryForm);
            } else {
                res = await categoryApi.create(categoryForm);
            }
            if (res.success) {
                fetchData();
                setIsCategoryModalOpen(false);
                setCategoryForm({ name: "", description: "", image: { key: "", location: "" } });
                setEditingCategory(null);
            }
        } catch (err: any) {
            alert(err.message || "Error saving category");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveSubcategory = async () => {
        setIsSaving(true);
        try {
            let res;
            if (editingSubcategory) {
                res = await subcategoryApi.update(editingSubcategory._id, subcategoryForm);
            } else {
                res = await subcategoryApi.create(subcategoryForm);
            }
            if (res.success) {
                fetchData();
                setIsSubcategoryModalOpen(false);
                setSubcategoryForm({ name: "", description: "", category: "", image: { key: "", location: "" } });
                setEditingSubcategory(null);
            }
        } catch (err: any) {
            alert(err.message || "Error saving subcategory");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveChildCategory = async () => {
        setIsSaving(true);
        try {
            let res;
            if (editingChildCategory) {
                res = await childCategoryApi.update(editingChildCategory._id, childCategoryForm);
            } else {
                res = await childCategoryApi.create(childCategoryForm);
            }
            if (res.success) {
                fetchData();
                setIsChildCategoryModalOpen(false);
                setChildCategoryForm({ name: "", description: "", category: "", subcategory: "", image: { key: "", location: "" } });
                setEditingChildCategory(null);
            }
        } catch (err: any) {
            alert(err.message || "Error saving child category");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveBrand = async () => {
        setIsSaving(true);
        try {
            let res;
            if (editingBrand) {
                res = await brandApi.update(editingBrand._id, brandForm);
            } else {
                res = await brandApi.create(brandForm);
            }
            if (res.success) {
                fetchData();
                setIsBrandModalOpen(false);
                setBrandForm({ name: "", description: "", image: { key: "", location: "" } });
                setEditingBrand(null);
            }
        } catch (err: any) {
            alert(err.message || "Error saving brand");
        } finally {
            setIsSaving(false);
        }
    };

    const resetProductForm = () => {
        setProductForm({
            name: "",
            brand: "",
            category: "",
            subcategory: "",
            childCategory: "",
            unit: "ml",
            soldBy: "",
            manufacturedBy: "",
            variants: [{ variantName: "", size: "", noInBox: 0, price: 0, discount: 0, stockQuantity: 0 }],
            packagingInfo: "",
            images: []
        });
        setEditingProduct(null);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetForm: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const presignedRes = await mediaApi.getPresignedUrl(file.name, file.type);
            if (!presignedRes.success) throw new Error("Failed to get upload URL");

            const { uploadUrl, key, viewUrl } = presignedRes.data;

            await fetch(uploadUrl, {
                method: "PUT",
                body: file,
                headers: { "Content-Type": file.type }
            });

            const imageData = { key, location: viewUrl };

            if (targetForm === "category") setCategoryForm(prev => ({ ...prev, image: imageData }));
            else if (targetForm === "subcategory") setSubcategoryForm(prev => ({ ...prev, image: imageData }));
            else if (targetForm === "childCategory") setChildCategoryForm(prev => ({ ...prev, image: imageData }));
            else if (targetForm === "brand") setBrandForm(prev => ({ ...prev, image: imageData }));
            else if (targetForm === "product") setProductForm(prev => ({ ...prev, images: [...prev.images, imageData] }));

        } catch (err: any) {
            alert("Upload failed: " + err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const addVariantField = () => {
        setProductForm(prev => ({
            ...prev,
            variants: [...prev.variants, { variantName: "", size: "", noInBox: 0, price: 0, discount: 0, stockQuantity: 0 }]
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

    const handleDelete = async (id: string, type: string) => {
        if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
        try {
            let res;
            if (type === "product") res = await productApi.softDelete(id);
            else if (type === "category") res = await categoryApi.delete(id);
            else if (type === "subcategory") res = await subcategoryApi.delete(id);
            else if (type === "childCategory") res = await childCategoryApi.delete(id);
            else if (type === "brand") res = await brandApi.delete(id);

            if (res.success) fetchData();
        } catch (err: any) {
            alert(err.message || `Error deleting ${type}`);
        }
    };

    const startEditing = (item: any, type: string) => {
        if (type === "category") {
            setEditingCategory(item);
            setCategoryForm({ name: item.name, description: item.description || "", image: item.image || { key: "", location: "" } });
            setIsCategoryModalOpen(true);
        } else if (type === "subcategory") {
            setEditingSubcategory(item);
            setSubcategoryForm({ name: item.name, description: item.description || "", category: item.category?._id || item.category || "", image: item.image || { key: "", location: "" } });
            setIsSubcategoryModalOpen(true);
        } else if (type === "childCategory") {
            setEditingChildCategory(item);
            setChildCategoryForm({ name: item.name, description: item.description || "", category: item.category?._id || item.category || "", subcategory: item.subcategory?._id || item.subcategory || "", image: item.image || { key: "", location: "" } });
            setIsChildCategoryModalOpen(true);
        } else if (type === "brand") {
            setEditingBrand(item);
            setBrandForm({ name: item.name, description: item.description || "", image: item.image || { key: "", location: "" } });
            setIsBrandModalOpen(true);
        }
    };

    return (
        <PermissionGuard permission="productAccess">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <PageBreadcrumb pageTitle="Inventory & Categories" />
                    <PageTutorial
                        title="Products"
                        overview="The Products section is where you manage your entire storefront catalog, from individual items to the complex category hierarchy."
                        steps={tutorialSteps}
                    />
                </div>

                <div className="flex gap-2">
                    {activeTab === "products" && <Button onClick={() => { resetProductForm(); setIsProductModalOpen(true); }} size="sm" startIcon={<PlusIcon className="w-4 h-4" />}>Add Product</Button>}
                    {activeTab === "categories" && <Button onClick={() => { setEditingCategory(null); setIsCategoryModalOpen(true); }} size="sm" startIcon={<PlusIcon className="w-4 h-4" />}>Add Category</Button>}
                    {activeTab === "subcategories" && <Button onClick={() => { setEditingSubcategory(null); setIsSubcategoryModalOpen(true); }} size="sm" startIcon={<PlusIcon className="w-4 h-4" />}>Add Subcategory</Button>}
                    {activeTab === "childCategories" && <Button onClick={() => { setEditingChildCategory(null); setIsChildCategoryModalOpen(true); }} size="sm" startIcon={<PlusIcon className="w-4 h-4" />}>Add Child Category</Button>}
                    {activeTab === "brands" && <Button onClick={() => { setEditingBrand(null); setIsBrandModalOpen(true); }} size="sm" startIcon={<PlusIcon className="w-4 h-4" />}>Add Brand</Button>}
                </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                {/* Tabs */}
                <div className="px-5 pt-4 border-b border-gray-200 dark:border-gray-800 flex gap-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
                    {[
                        { id: "products", label: "Products", count: counts.products },
                        { id: "categories", label: "Categories", count: counts.categories },
                        { id: "subcategories", label: "Sub-Categories", count: counts.subcategories },
                        { id: "childCategories", label: "Child-Categories", count: counts.childCategories },
                        { id: "brands", label: "Brands", count: counts.brands }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === tab.id
                                ? "text-brand-500 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-brand-500"
                                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder={`Search ${activeTab}...`}
                            className="pl-10 h-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
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
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Brand</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Hierarchy</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Variants</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                        {products.map((product) => (
                                            <tr key={product._id}>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="font-bold text-gray-800 dark:text-white/90">{product.name}</div>
                                                    <div className="text-[10px] text-gray-400">{product.unit}</div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <Badge variant="light" color="info">{product.brand?.name || "No Brand"}</Badge>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex flex-col gap-1">
                                                        <Badge variant="light" color="primary" className="text-[10px] w-fit">{product.category?.name || "No Category"}</Badge>
                                                        {product.subcategory && <Badge variant="light" color="success" className="text-[10px] w-fit">{product.subcategory?.name || "Sub"}</Badge>}
                                                        {product.childCategory && <Badge variant="light" color="warning" className="text-[10px] w-fit">{product.childCategory?.name || "Child"}</Badge>}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                                                        {product.variants.map((v: any, idx: number) => (
                                                            <span key={idx} className="text-[9px] bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-gray-500">
                                                                {v.size ? `${v.size} ${product.unit || ""}` : v.variantName}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link href={`/products/${product._id}`} className="text-brand-500 hover:text-brand-600 p-1">
                                                            <EditIcon className="w-4 h-4" />
                                                        </Link>
                                                        <button onClick={() => handleDelete(product._id, "product")} className="text-red-500 hover:text-red-600 p-1">
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {activeTab === "categories" && (
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                                    <thead className="bg-[#F9FAFB] dark:bg-white/[0.02]">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Image</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Category Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Products</th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-500">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                        {categories.map((cat) => (
                                            <tr key={cat._id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {cat.image?.location ? <img src={cat.image.location} className="h-10 w-10 rounded-lg object-cover" /> : <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center"><ImageIcon className="w-5 h-5 text-gray-300" /></div>}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-800 dark:text-white/90">{cat.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge size="sm" variant="light" color="primary">{cat.productCount || 0} Products</Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <button onClick={() => startEditing(cat, "category")} className="text-brand-500 hover:text-brand-600 mr-3"><EditIcon className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDelete(cat._id, "category")} className="text-red-500 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {activeTab === "subcategories" && (
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                                    <thead className="bg-[#F9FAFB] dark:bg-white/[0.02]">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Subcategory</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Parent Category</th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-500">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                        {subcategories.map((sub) => (
                                            <tr key={sub._id}>
                                                <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-800 dark:text-white/90">{sub.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap"><Badge variant="light" color="primary">{sub.category?.name || "No Category"}</Badge></td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <button onClick={() => startEditing(sub, "subcategory")} className="text-brand-500 hover:text-brand-600 mr-3"><EditIcon className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDelete(sub._id, "subcategory")} className="text-red-500 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {activeTab === "childCategories" && (
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                                    <thead className="bg-[#F9FAFB] dark:bg-white/[0.02]">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Child Category</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Subcategory</th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-500">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                        {childCategories.map((child) => (
                                            <tr key={child._id}>
                                                <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-800 dark:text-white/90">{child.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap"><Badge variant="light" color="success">{child.subcategory?.name || "No Subcategory"}</Badge></td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <button onClick={() => startEditing(child, "childCategory")} className="text-brand-500 hover:text-brand-600 mr-3"><EditIcon className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDelete(child._id, "childCategory")} className="text-red-500 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {activeTab === "brands" && (
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                                    <thead className="bg-[#F9FAFB] dark:bg-white/[0.02]">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Logo</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Brand Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Description</th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-500">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                        {brands.map((brand) => (
                                            <tr key={brand._id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {brand.image?.location ? <img src={brand.image.location} className="h-10 w-24 object-contain" /> : <div className="h-10 w-24 rounded bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">NO LOGO</div>}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-800 dark:text-white/90">{brand.name}</td>
                                                <td className="px-6 py-4 whitespace-normal text-sm text-gray-500 max-w-xs">{brand.description || "—"}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <button onClick={() => startEditing(brand, "brand")} className="text-brand-500 hover:text-brand-600 mr-3"><EditIcon className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDelete(brand._id, "brand")} className="text-red-500 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </>
                    )}
                </div>

            </div>

            {/* Product Modal */}
            <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} className="max-w-[800px] max-h-[90vh] overflow-y-auto">
                <div className="p-6 lg:p-10 bg-white dark:bg-gray-900 rounded-3xl">
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-6 uppercase border-b pb-2">{editingProduct ? "Edit Product" : "New Product"}</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Product Name</Label>
                            <Input placeholder="Enter product name" value={productForm.name} onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))} />
                        </div>
                        <div>
                            <Label>Brand</Label>
                            <select className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-2.5 text-sm" value={productForm.brand} onChange={(e) => setProductForm(prev => ({ ...prev, brand: e.target.value }))}>
                                <option value="">Select Brand</option>
                                {allBrands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <Label>Category</Label>
                            <select className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-2.5 text-sm" value={productForm.category} onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value, subcategory: "", childCategory: "" }))}>
                                <option value="">Select Category</option>
                                {allCategories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <Label>Subcategory</Label>
                            <select className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-2.5 text-sm" value={productForm.subcategory} onChange={(e) => setProductForm(prev => ({ ...prev, subcategory: e.target.value, childCategory: "" }))} disabled={!productForm.category}>
                                <option value="">Select Subcategory</option>
                                {allSubcategories.filter(s => (s.category?._id || s.category) === productForm.category).map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <Label>Child Category</Label>
                            <select className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-2.5 text-sm" value={productForm.childCategory} onChange={(e) => setProductForm(prev => ({ ...prev, childCategory: e.target.value }))} disabled={!productForm.subcategory}>
                                <option value="">Select Child Category</option>
                                {allChildCategories.filter(c => (c.subcategory?._id || c.subcategory) === productForm.subcategory).map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <Label>Unit</Label>
                            <select className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-2.5 text-sm" value={productForm.unit} onChange={(e) => setProductForm(prev => ({ ...prev, unit: e.target.value }))}>
                                <option value="ml">ml</option><option value="gm">gm</option><option value="kg">kg</option><option value="ltr">ltr</option><option value="pcs">pcs</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-2 border-b pb-1">
                            <h5 className="text-sm font-bold uppercase">Variants</h5>
                            <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={addVariantField}>+ Add</Button>
                        </div>
                        <div className="space-y-3">
                            {productForm.variants.map((v, idx) => (
                                <div key={idx} className="grid grid-cols-2 md:grid-cols-5 gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl items-end">
                                    <div className="col-span-1"><Label className="text-[10px]">Size</Label><Input value={v.size} onChange={e => updateVariantField(idx, "size", e.target.value)} /></div>
                                    <div className="col-span-1"><Label className="text-[10px]">Price</Label><Input type="number" value={v.price} onChange={e => updateVariantField(idx, "price", Number(e.target.value))} /></div>
                                    <div className="col-span-1"><Label className="text-[10px]">Disc (%)</Label><Input type="number" value={v.discount} onChange={e => updateVariantField(idx, "discount", Number(e.target.value))} /></div>
                                    <div className="col-span-1"><Label className="text-[10px]">Stock</Label><Input type="number" value={v.stockQuantity} onChange={e => updateVariantField(idx, "stockQuantity", Number(e.target.value))} /></div>
                                    <Button variant="outline" size="sm" className="h-10 text-red-500" onClick={() => removeVariantField(idx)} disabled={productForm.variants.length === 1}><TrashIcon className="w-4 h-4" /></Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                        <Button variant="outline" className="flex-1" onClick={() => setIsProductModalOpen(false)}>Cancel</Button>
                        <Button className="flex-1" onClick={handleSaveProduct} disabled={isSaving}>{isSaving ? "Saving..." : "Save Product"}</Button>
                    </div>
                </div>
            </Modal>

            {/* Category Modal */}
            <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} className="max-w-[400px]">
                <div className="p-8 bg-white dark:bg-gray-900 rounded-3xl">
                    <h4 className="text-xl font-bold mb-6 uppercase">{editingCategory ? "Edit" : "Add"} Category</h4>
                    <div className="space-y-4">
                        <div><Label>Name</Label><Input value={categoryForm.name} onChange={e => setCategoryForm(prev => ({ ...prev, name: e.target.value }))} /></div>
                        <div><Label>Description</Label><Input value={categoryForm.description} onChange={e => setCategoryForm(prev => ({ ...prev, description: e.target.value }))} /></div>
                        <div>
                            <Label>Image</Label>
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 relative overflow-hidden">
                                {categoryForm.image?.location ? (
                                    <img src={categoryForm.image.location} className="w-full h-full object-contain" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <CameraIcon className="w-8 h-8 text-gray-400 mb-2" />
                                        <p className="text-xs text-gray-500">Click to upload</p>
                                    </div>
                                )}
                                <input type="file" className="hidden" onChange={e => handleImageUpload(e, "category")} />
                            </label>
                        </div>
                    </div>
                    <div className="flex gap-4 mt-8">
                        <Button variant="outline" className="flex-1" onClick={() => setIsCategoryModalOpen(false)}>Cancel</Button>
                        <Button className="flex-1" onClick={handleSaveCategory} disabled={isSaving || isUploading}>Save</Button>
                    </div>
                </div>
            </Modal>

            {/* Subcategory Modal */}
            <Modal isOpen={isSubcategoryModalOpen} onClose={() => setIsSubcategoryModalOpen(false)} className="max-w-[400px]">
                <div className="p-8 bg-white dark:bg-gray-900 rounded-3xl">
                    <h4 className="text-xl font-bold mb-6 uppercase">{editingSubcategory ? "Edit" : "Add"} Subcategory</h4>
                    <div className="space-y-4">
                        <div><Label>Parent Category</Label><select className="w-full bg-gray-50 border rounded-lg p-2 text-sm" value={subcategoryForm.category} onChange={e => setSubcategoryForm(prev => ({ ...prev, category: e.target.value }))}><option value="">Select</option>{allCategories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
                        <div><Label>Name</Label><Input value={subcategoryForm.name} onChange={e => setSubcategoryForm(prev => ({ ...prev, name: e.target.value }))} /></div>
                        <div>
                            <Label>Image</Label>
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 relative overflow-hidden">
                                {subcategoryForm.image?.location ? (
                                    <img src={subcategoryForm.image.location} className="w-full h-full object-contain" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <CameraIcon className="w-8 h-8 text-gray-400 mb-2" />
                                        <p className="text-xs text-gray-500">Click to upload</p>
                                    </div>
                                )}
                                <input type="file" className="hidden" onChange={e => handleImageUpload(e, "subcategory")} />
                            </label>
                        </div>
                    </div>
                    <div className="flex gap-4 mt-8">
                        <Button variant="outline" className="flex-1" onClick={() => setIsSubcategoryModalOpen(false)}>Cancel</Button>
                        <Button className="flex-1" onClick={handleSaveSubcategory} disabled={isSaving || isUploading}>Save</Button>
                    </div>
                </div>
            </Modal>

            {/* Child Category Modal */}
            <Modal isOpen={isChildCategoryModalOpen} onClose={() => setIsChildCategoryModalOpen(false)} className="max-w-[400px]">
                <div className="p-8 bg-white dark:bg-gray-900 rounded-3xl">
                    <h4 className="text-xl font-bold mb-6 uppercase">{editingChildCategory ? "Edit" : "Add"} Child Category</h4>
                    <div className="space-y-4">
                        <div><Label>Category</Label><select className="w-full bg-gray-50 border rounded-lg p-2 text-sm" value={childCategoryForm.category} onChange={e => setChildCategoryForm(prev => ({ ...prev, category: e.target.value, subcategory: "" }))}><option value="">Select</option>{allCategories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
                        <div><Label>Subcategory</Label><select className="w-full bg-gray-50 border rounded-lg p-2 text-sm" value={childCategoryForm.subcategory} onChange={e => setChildCategoryForm(prev => ({ ...prev, subcategory: e.target.value }))} disabled={!childCategoryForm.category}><option value="">Select</option>{allSubcategories.filter(s => (s.category?._id || s.category) === childCategoryForm.category).map(s => <option key={s._id} value={s._id}>{s.name}</option>)}</select></div>
                        <div><Label>Name</Label><Input value={childCategoryForm.name} onChange={e => setChildCategoryForm(prev => ({ ...prev, name: e.target.value }))} /></div>
                    </div>
                    <div className="flex gap-4 mt-8">
                        <Button variant="outline" className="flex-1" onClick={() => setIsChildCategoryModalOpen(false)}>Cancel</Button>
                        <Button className="flex-1" onClick={handleSaveChildCategory} disabled={isSaving || isUploading}>Save</Button>
                    </div>
                </div>
            </Modal>

            {/* Brand Modal */}
            <Modal isOpen={isBrandModalOpen} onClose={() => setIsBrandModalOpen(false)} className="max-w-[400px]">
                <div className="p-8 bg-white dark:bg-gray-900 rounded-3xl">
                    <h4 className="text-xl font-bold mb-6 uppercase">{editingBrand ? "Edit" : "Add"} Brand</h4>
                    <div className="space-y-4">
                        <div><Label>Brand Name</Label><Input value={brandForm.name} onChange={e => setBrandForm(prev => ({ ...prev, name: e.target.value }))} /></div>
                        <div><Label>Description</Label><Input value={brandForm.description} onChange={e => setBrandForm(prev => ({ ...prev, description: e.target.value }))} /></div>
                        <div>
                            <Label>Logo</Label>
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 relative overflow-hidden">
                                {brandForm.image?.location ? (
                                    <img src={brandForm.image.location} className="w-full h-full object-contain" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <CameraIcon className="w-8 h-8 text-gray-400 mb-2" />
                                        <p className="text-xs text-gray-500">Click to upload</p>
                                    </div>
                                )}
                                <input type="file" className="hidden" onChange={e => handleImageUpload(e, "brand")} />
                            </label>
                        </div>
                    </div>
                    <div className="flex gap-4 mt-8">
                        <Button variant="outline" className="flex-1" onClick={() => setIsBrandModalOpen(false)}>Cancel</Button>
                        <Button className="flex-1" onClick={handleSaveBrand} disabled={isSaving || isUploading}>Save</Button>
                    </div>
                </div>
            </Modal>
        </PermissionGuard>
    );
}

