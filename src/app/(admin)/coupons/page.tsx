"use client";
import PermissionGuard from "@/components/common/PermissionGuard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useEffect, useState } from "react";
import { couponApi } from "@/api/api";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { PlusIcon, TrashIcon, EditIcon, CheckCircleIcon, XCircleIcon, Eye, Calendar as CalendarIcon, List } from "lucide-react";
import Badge from "@/components/ui/badge/Badge";
import Link from "next/link";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<any>(null);
    const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

    const [form, setForm] = useState({
        code: "",
        description: "",
        discountType: "percentage",
        discountValue: 0,
        minOrderValue: 0,
        maxDiscountAmount: 0,
        usageLimit: 0,
        perUserLimit: 1,
        startDate: "",
        endDate: "",
        isActive: true,
    });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await couponApi.getAll();
            if (res.success) setCoupons(res.data);
        } catch (err: any) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Clean up numbers
            const payload = {
                ...form,
                discountValue: Number(form.discountValue),
                minOrderValue: Number(form.minOrderValue),
                maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : undefined,
                usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
                perUserLimit: Number(form.perUserLimit),
                startDate: form.startDate || undefined,
                endDate: form.endDate || undefined,
            };

            let res;
            if (editingCoupon) {
                res = await couponApi.update(editingCoupon._id, payload);
            } else {
                res = await couponApi.create(payload);
            }

            if (res.success) {
                fetchData();
                setIsModalOpen(false);
                resetForm();
            }
        } catch (err: any) {
            alert(err.message || "Error saving coupon");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this coupon?")) return;
        try {
            const res = await couponApi.delete(id);
            if (res.success) fetchData();
        } catch (err: any) {
            alert(err.message || "Error deleting coupon");
        }
    };

    const resetForm = () => {
        setForm({
            code: "",
            description: "",
            discountType: "percentage",
            discountValue: 0,
            minOrderValue: 0,
            maxDiscountAmount: 0,
            usageLimit: 0,
            perUserLimit: 1,
            startDate: "",
            endDate: "",
            isActive: true,
        });
        setEditingCoupon(null);
    };

    const openEditModal = (coupon: any) => {
        setEditingCoupon(coupon);
        setForm({
            code: coupon.code,
            description: coupon.description || "",
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            minOrderValue: coupon.minOrderValue || 0,
            maxDiscountAmount: coupon.maxDiscountAmount || 0,
            usageLimit: coupon.usageLimit || 0,
            perUserLimit: coupon.perUserLimit || 1,
            startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : "",
            endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().split('T')[0] : "",
            isActive: coupon.isActive,
        });
        setIsModalOpen(true);
    };

    return (
        <PermissionGuard permission="couponAccess">
            <div>
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <PageBreadcrumb pageTitle="Coupon Management" />
                    <Button onClick={() => { resetForm(); setIsModalOpen(true); }} size="sm" startIcon={<PlusIcon className="w-4 h-4" />}>
                        Create Coupon
                    </Button>
                </div>

                <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
                    <button
                        onClick={() => setViewMode("list")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-800 shadow-sm text-brand-600' : 'text-gray-500'}`}
                    >
                        <List className="w-4 h-4 inline-block mr-2" />
                        List View
                    </button>
                    <button
                        onClick={() => setViewMode("calendar")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-gray-800 shadow-sm text-brand-600' : 'text-gray-500'}`}
                    >
                        <CalendarIcon className="w-4 h-4 inline-block mr-2" />
                        Calendar
                    </button>
                </div>

                <div className="mt-6 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                    {viewMode === 'list' ? (
                        <div className="overflow-x-auto">
                            {isLoading ? (
                                <div className="p-10 text-center text-gray-400">Loading coupons...</div>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                                    <thead className="bg-[#F9FAFB] dark:bg-white/[0.02]">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Code</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Discount</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Limits</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Validity</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Updated By</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                        {coupons.map((coupon) => (
                                            <tr key={coupon._id}>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="font-bold text-gray-800 dark:text-white/90">{coupon.code}</div>
                                                    <div className="text-xs text-gray-400">{coupon.description}</div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="text-sm font-medium">
                                                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `£${coupon.discountValue}`} OFF
                                                    </div>
                                                    <div className="text-[10px] text-gray-400">Min Order: £{coupon.minOrderValue}</div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="text-xs text-gray-600 dark:text-gray-400">Used: {coupon.usedCount} / {coupon.usageLimit || '∞'}</div>
                                                    <div className="text-[10px] text-gray-400">Per User: {coupon.perUserLimit}</div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="text-[10px] text-gray-500">
                                                        {coupon.startDate ? new Date(coupon.startDate).toLocaleDateString() : 'Now'} - {coupon.endDate ? new Date(coupon.endDate).toLocaleDateString() : 'Forever'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="text-xs font-medium text-gray-800 dark:text-white/90">
                                                        {coupon.updatedBy?.name || "System"}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400">
                                                        {new Date(coupon.updatedAt).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {coupon.isActive ? (
                                                        <Badge variant="light" color="success" startIcon={<CheckCircleIcon className="w-3 h-3" />}>Active</Badge>
                                                    ) : (
                                                        <Badge variant="light" color="error" startIcon={<XCircleIcon className="w-3 h-3" />}>Inactive</Badge>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link href={`/coupons/${coupon._id}`} className="text-gray-500 hover:text-brand-500">
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <button onClick={() => openEditModal(coupon)} className="text-brand-500 hover:text-brand-600">
                                                            <EditIcon className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDelete(coupon._id)} className="text-red-500 hover:text-red-600">
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {coupons.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">
                                                    No coupons found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    ) : (
                        <div className="p-6 custom-calendar">
                            <FullCalendar
                                plugins={[dayGridPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                events={coupons.map(c => ({
                                    id: c._id,
                                    title: `${c.code} (${c.discountType === 'percentage' ? c.discountValue + '%' : '£' + c.discountValue})`,
                                    start: c.startDate || c.createdAt,
                                    end: c.endDate,
                                    backgroundColor: c.isActive ? '#3b82f6' : '#94a3b8',
                                    borderColor: 'transparent',
                                    extendedProps: { ...c }
                                }))}
                                dateClick={(info) => {
                                    resetForm();
                                    setForm(prev => ({ ...prev, startDate: info.dateStr }));
                                    setIsModalOpen(true);
                                }}
                                eventClick={(info) => {
                                    // Optional: Navigate to detail page on click
                                    window.location.href = `/coupons/${info.event.id}`;
                                }}
                                height="auto"
                            />
                        </div>
                    )}
                </div>

                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <div className="p-6 lg:p-10 bg-white dark:bg-gray-900 rounded-3xl">
                        <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-6 uppercase">
                            {editingCoupon ? "Edit Coupon" : "Create Coupon"}
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2 text-xs text-gray-400 italic mb-2">
                                Leave code empty to auto-generate a random 8-character code.
                            </div>
                            <div>
                                <Label>Coupon Code</Label>
                                <Input placeholder="e.g. WELCOME20" value={form.code} onChange={(e) => setForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))} />
                            </div>
                            <div className="md:col-span-2">
                                <Label>Description</Label>
                                <Input placeholder="e.g. 20% off for first order" value={form.description} onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))} />
                            </div>
                            <div>
                                <Label>Discount Type</Label>
                                <select
                                    className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-2.5 text-sm"
                                    value={form.discountType}
                                    onChange={(e) => setForm(prev => ({ ...prev, discountType: e.target.value as any }))}
                                >
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount (£)</option>
                                </select>
                            </div>
                            <div>
                                <Label>Discount Value</Label>
                                <Input type="number" value={form.discountValue} onChange={(e) => setForm(prev => ({ ...prev, discountValue: Number(e.target.value) }))} />
                            </div>
                            <div>
                                <Label>Min Order Value (£)</Label>
                                <Input type="number" value={form.minOrderValue} onChange={(e) => setForm(prev => ({ ...prev, minOrderValue: Number(e.target.value) }))} />
                            </div>
                            <div>
                                <Label>Max Discount (£) {form.discountType === 'fixed' && <span className="text-[10px] text-gray-400">(N/A for fixed)</span>}</Label>
                                <Input type="number" value={form.maxDiscountAmount} onChange={(e) => setForm(prev => ({ ...prev, maxDiscountAmount: Number(e.target.value) }))} disabled={form.discountType === 'fixed'} />
                            </div>
                            <div>
                                <Label>Usage Limit (Total)</Label>
                                <Input type="number" placeholder="0 = Unlimited" value={form.usageLimit} onChange={(e) => setForm(prev => ({ ...prev, usageLimit: Number(e.target.value) }))} />
                            </div>
                            <div>
                                <Label>Per User Limit</Label>
                                <Input type="number" value={form.perUserLimit} onChange={(e) => setForm(prev => ({ ...prev, perUserLimit: Number(e.target.value) }))} />
                            </div>
                            <div>
                                <Label>Start Date</Label>
                                <Input type="date" value={form.startDate} onChange={(e) => setForm(prev => ({ ...prev, startDate: e.target.value }))} />
                            </div>
                            <div>
                                <Label>End Date</Label>
                                <Input type="date" value={form.endDate} onChange={(e) => setForm(prev => ({ ...prev, endDate: e.target.value }))} />
                            </div>
                            <div className="flex items-center gap-2 mt-4">
                                <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))} className="w-4 h-4 text-brand-500 border-gray-300 rounded focus:ring-brand-500" />
                                <Label htmlFor="isActive" className="mb-0">Active</Label>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button className="flex-1" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? "Saving..." : editingCoupon ? "Update" : "Create"}
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </PermissionGuard>
    );
}
