"use client";
import PermissionGuard from "@/components/common/PermissionGuard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useEffect, useState } from "react";
import { storeApi, mediaApi } from "@/api/api";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Checkbox from "@/components/form/input/Checkbox";
import { PlusIcon, TrashIcon, EditIcon, CameraIcon, ImageIcon, MapPinIcon, X, Loader2, Phone } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface DayHours {
    day: string;
    open: string;
    close: string;
    isClosed: boolean;
}

const DEFAULT_HOURS: DayHours[] = DAYS.map(day => ({
    day,
    open: "08:00",
    close: "22:00",
    isClosed: false
}));

export default function StorePage() {
    const [stores, setStores] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStore, setEditingStore] = useState<any>(null);
    const [form, setForm] = useState<{
        name: string;
        address: string;
        phone: string;
        openingHours: DayHours[];
        googleMapsLink: string;
        images: { key: string; location: string }[];
    }>({
        name: "",
        address: "",
        phone: "",
        openingHours: DEFAULT_HOURS,
        googleMapsLink: "",
        images: []
    });
    const [isUploading, setIsUploading] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await storeApi.getAll();
            if (res.success) setStores(res.data);
        } catch (err: any) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const newImages: { key: string; location: string }[] = [];

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const presignedRes = await mediaApi.getPresignedUrl(file.name, file.type, "store");
                if (!presignedRes.success) throw new Error(`Failed to get upload URL for ${file.name}`);

                const { uploadUrl, key, viewUrl } = presignedRes.data;

                await fetch(uploadUrl, {
                    method: "PUT",
                    body: file,
                    headers: { "Content-Type": file.type }
                });
                newImages.push({ key, location: viewUrl });
            }

            setForm(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
        } catch (err: any) {
            alert("Upload failed: " + err.message);
        } finally {
            setIsUploading(false);
            // Reset input value to allow re-uploading same file if needed
            e.target.value = "";
        }
    };

    const removeImage = (index: number) => {
        setForm(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSave = async () => {
        if (!form.name || !form.address) {
            alert("Store Name and Address are required");
            return;
        }

        setIsSaving(true);
        try {
            let res;
            if (editingStore) {
                res = await storeApi.update(editingStore._id, form);
            } else {
                res = await storeApi.create(form);
            }
            if (res.success) {
                fetchData();
                setIsModalOpen(false);
                resetForm();
            }
        } catch (err: any) {
            alert(err.message || "Error saving store");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this store?")) return;
        try {
            const res = await storeApi.delete(id);
            if (res.success) fetchData();
        } catch (err: any) {
            alert(err.message || "Error deleting store");
        }
    };

    const startEditing = (store: any) => {
        setEditingStore(store);

        let hours = DEFAULT_HOURS;
        if (Array.isArray(store.openingHours) && store.openingHours.length > 0) {
            hours = DEFAULT_HOURS.map(defaultDay => {
                const found = store.openingHours.find((h: any) => h.day === defaultDay.day);
                return found || defaultDay;
            });
        }

        // Handle legacy single image or new images array
        let images = [];
        if (store.images && Array.isArray(store.images)) {
            images = store.images;
        } else if (store.image) {
            images = [store.image];
        }

        setForm({
            name: store.name || "",
            address: store.address || "",
            phone: store.phone || "",
            openingHours: hours,
            googleMapsLink: store.googleMapsLink || "",
            images: images
        });
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setForm({
            name: "",
            address: "",
            phone: "",
            openingHours: DEFAULT_HOURS,
            googleMapsLink: "",
            images: []
        });
        setEditingStore(null);
    };

    const updateHour = (index: number, field: keyof DayHours, value: any) => {
        const newHours = [...form.openingHours];
        newHours[index] = { ...newHours[index], [field]: value };
        setForm({ ...form, openingHours: newHours });
    };

    return (
        <PermissionGuard permission="storeAccess">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <PageBreadcrumb pageTitle="Store Management" />
                <Button onClick={() => { resetForm(); setIsModalOpen(true); }} size="sm" startIcon={<PlusIcon className="w-4 h-4" />}>Add Store</Button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl h-96 animate-pulse border border-gray-100 dark:border-gray-700"></div>
                    ))}
                </div>
            ) : stores.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center p-10 text-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50 dark:bg-gray-900/50">
                    <ImageIcon className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="mb-2 font-medium text-gray-600 dark:text-gray-300">No stores found</p>
                    <p className="text-sm">Click "Add Store" to create your first listing.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                    {stores.map((store) => (
                        <div key={store._id} className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-brand-500/20 transition-all duration-300 flex flex-col">
                            {/* Image Header */}
                            <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-900 overflow-hidden shrink-0">
                                {(store.images && store.images.length > 0) || store.image ? (
                                    <img src={(store.images?.[0]?.location) || store.image?.location} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={store.name} />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full text-gray-300 bg-gray-50 dark:bg-gray-800"><ImageIcon className="w-12 h-12" /></div>
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                {/* Actions Overlay */}
                                <div className="absolute top-3 right-3 flex gap-2 translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                    <button onClick={() => startEditing(store)} className="p-2 bg-white/90 dark:bg-gray-800/90 text-brand-600 rounded-full hover:bg-brand-500 hover:text-white shadow-lg backdrop-blur-sm transition-colors" title="Edit"><EditIcon className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(store._id)} className="p-2 bg-white/90 dark:bg-gray-800/90 text-red-500 rounded-full hover:bg-red-500 hover:text-white shadow-lg backdrop-blur-sm transition-colors" title="Delete"><TrashIcon className="w-4 h-4" /></button>
                                </div>

                                {/* Photos Badge */}
                                {store.images && store.images.length > 1 && (
                                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                        <CameraIcon className="w-3 h-3" /> +{store.images.length - 1}
                                    </div>
                                )}
                            </div>

                            {/* Card Body */}
                            <div className="p-5 flex flex-col flex-1">
                                <div className="mb-4">
                                    <div className="flex justify-between items-start mb-2 gap-2">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight line-clamp-1 group-hover:text-brand-500 transition-colors">{store.name}</h3>
                                        {store.googleMapsLink && (
                                            <a href={store.googleMapsLink} target="_blank" rel="noopener noreferrer" className="shrink-0 text-gray-400 hover:text-brand-500 p-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-colors" title="View on Map">
                                                <MapPinIcon className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>

                                    <div className="flex items-start gap-2.5 text-sm text-gray-500 dark:text-gray-400 min-h-[42px] mb-3">
                                        <MapPinIcon className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                                        <p className="whitespace-pre-wrap leading-relaxed text-xs">{store.address}</p>
                                    </div>

                                    <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg border border-gray-100 dark:border-gray-700/50">
                                        <Phone className="w-4 h-4 shrink-0 text-brand-500" />
                                        <span className="font-medium">{store.phone}</span>
                                    </div>
                                </div>

                                {/* Hours Section */}
                                <div className="mt-auto border-t border-gray-100 dark:border-gray-700 pt-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Opening Hours</span>
                                        {/* Status Indicator (Optional: Check if open now?) */}
                                    </div>
                                    <div className="space-y-1">
                                        {Array.isArray(store.openingHours) ? store.openingHours.map((h: any, i: number) => (
                                            <div key={i} className={`flex justify-between text-[11px] items-center py-0.5 border-b border-gray-50 dark:border-gray-800 last:border-0`}>
                                                <span className={`font-medium w-16 ${["Saturday", "Sunday"].includes(h.day) ? "text-brand-600 dark:text-brand-400" : "text-gray-500 dark:text-gray-400"}`}>
                                                    {h.day.substring(0, 3)}
                                                </span>
                                                <span className={`${h.isClosed ? "text-red-400 font-medium" : "text-gray-600 dark:text-gray-300"}`}>
                                                    {h.isClosed ? "Closed" : `${h.open} - ${h.close}`}
                                                </span>
                                            </div>
                                        )) : <div className="text-xs text-gray-400 italic">No hours set</div>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-[700px]">
                <div className="p-8 bg-white dark:bg-gray-900 rounded-3xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                    <h4 className="text-xl font-bold mb-6 uppercase border-b pb-2 sticky top-0 bg-white dark:bg-gray-900 z-10">{editingStore ? "Edit Store" : "Add Store"}</h4>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <Label>Store Images</Label>
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 relative overflow-hidden transition-colors">
                                    {isUploading ? (
                                        <div className="absolute inset-0 bg-white/90 dark:bg-gray-800/90 flex flex-col items-center justify-center z-10 cursor-not-allowed">
                                            <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-2" />
                                            <p className="text-sm font-medium text-brand-600 dark:text-brand-400">Processing...</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <CameraIcon className="w-8 h-8 text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-500">Click to upload images</p>
                                            <p className="text-xs text-gray-400 mt-1">(Multiple allowed)</p>
                                        </div>
                                    )}
                                    <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" multiple disabled={isUploading} />
                                </label>

                                {form.images.length > 0 && (
                                    <div className="grid grid-cols-4 gap-4 mt-4">
                                        {form.images.map((img, index) => (
                                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 group">
                                                <img src={img.location} className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Store Name</Label>
                                    <Input placeholder="Nature's Fresh" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                                </div>
                                <div>
                                    <Label>Phone Number</Label>
                                    <Input placeholder="E.g. 01322 617506" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label>Address</Label>
                            <textarea
                                className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none h-20 placeholder:text-gray-400 dark:text-white/90 dark:placeholder:text-white/30"
                                placeholder="Enter full address..."
                                value={form.address}
                                onChange={e => setForm({ ...form, address: e.target.value })}
                            />
                        </div>

                        <div>
                            <Label>Google Maps Link</Label>
                            <div className="relative">
                                <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input className="pl-9" placeholder="https://maps.google.com/..." value={form.googleMapsLink} onChange={e => setForm({ ...form, googleMapsLink: e.target.value })} />
                            </div>
                        </div>

                        <div>
                            <Label>Opening Hours</Label>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 space-y-3">
                                {form.openingHours.map((h, i) => (
                                    <div key={h.day} className="flex items-center gap-3 text-sm">
                                        <div className="w-24 font-medium text-gray-700 dark:text-gray-300">{h.day}</div>
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                checked={h.isClosed}
                                                onChange={(checked) => updateHour(i, 'isClosed', checked)}
                                                label="Closed"
                                            />
                                        </div>
                                        {!h.isClosed && (
                                            <div className="flex items-center gap-2 flex-1">
                                                <input
                                                    type="time"
                                                    className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs w-24 focus:ring-1 focus:ring-brand-500 outline-none"
                                                    value={h.open}
                                                    onChange={e => updateHour(i, 'open', e.target.value)}
                                                />
                                                <span className="text-gray-400">-</span>
                                                <input
                                                    type="time"
                                                    className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs w-24 focus:ring-1 focus:ring-brand-500 outline-none"
                                                    value={h.close}
                                                    onChange={e => updateHour(i, 'close', e.target.value)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4 mt-8 sticky bottom-0 bg-white dark:bg-gray-900 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button className="flex-1" onClick={handleSave} disabled={isSaving || isUploading}>{isSaving ? "Saving..." : "Save Store"}</Button>
                    </div>
                </div>
            </Modal>
        </PermissionGuard>
    );
}
