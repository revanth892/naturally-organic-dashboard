"use client";
import PermissionGuard from "@/components/common/PermissionGuard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useEffect, useState } from "react";
import { couponApi } from "@/api/api";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";
import { ChevronLeft, EditIcon, CheckCircleIcon, XCircleIcon, Calendar, Tag, User, Hash, Info } from "lucide-react";
import Badge from "@/components/ui/badge/Badge";
import Link from "next/link";

export default function CouponDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const couponId = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [coupon, setCoupon] = useState<any>(null);

    const fetchCoupon = async () => {
        setIsLoading(true);
        try {
            const res = await couponApi.getById(couponId);
            if (res.success) setCoupon(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (couponId) fetchCoupon();
    }, [couponId]);

    if (isLoading) return <div className="p-20 text-center text-gray-400">Loading Coupon...</div>;
    if (!coupon) return <div className="p-20 text-center text-red-500">Coupon not found</div>;

    const isExpired = coupon.endDate && new Date(coupon.endDate) < new Date();

    return (
        <PermissionGuard permission="couponAccess">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <Link href="/coupons" className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-500 mb-4 transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                        Back to Coupons
                    </Link>
                    <PageBreadcrumb pageTitle={`Coupon: ${coupon.code}`} />
                </div>
                <div className="flex gap-2">
                    {/* Add Edit Logic later if needed, current flow uses modal on list page */}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Identity Card */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03]">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-3xl font-bold font-serif text-gray-900 dark:text-white tracking-tight uppercase">
                                        {coupon.code}
                                    </h2>
                                    <Badge variant="light" color={coupon.isActive && !isExpired ? "success" : "error"}>
                                        {coupon.isActive ? (isExpired ? "Expired" : "Active") : "Inactive"}
                                    </Badge>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400">{coupon.description || "No description provided."}</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Benefit</span>
                                <span className="text-3xl font-black text-brand-600">
                                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`} OFF
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-100 dark:border-gray-800 pt-8">
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-brand-500/10 rounded-xl text-brand-500">
                                        <Hash className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-800 dark:text-white/90 uppercase tracking-wider">Usage Stats</h4>
                                        <div className="mt-2 text-2xl font-bold">{coupon.usedCount}</div>
                                        <p className="text-xs text-gray-500 mt-1">Total uses across all accounts</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-800 dark:text-white/90 uppercase tracking-wider">Target Group</h4>
                                        <div className="mt-2 flex gap-2">
                                            <Badge variant="light" color="primary" className="capitalize">{coupon.userType}</Badge>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Eligible users for this coupon</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 text-sm">
                                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-400">Min Order Value:</span>
                                        <span className="font-bold">₹{coupon.minOrderValue}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-400">Max Discount:</span>
                                        <span className="font-bold">{coupon.maxDiscountAmount ? `₹${coupon.maxDiscountAmount}` : 'No Limit'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-400">Total Usage Limit:</span>
                                        <span className="font-bold">{coupon.usageLimit || 'Unlimited'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-400">Limit per User:</span>
                                        <span className="font-bold">{coupon.perUserLimit}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Performance Section Placeholder */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                        <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                            <Info className="w-4 h-4 text-brand-500" />
                            Technical Details
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="p-3 border border-gray-100 dark:border-gray-800 rounded-xl">
                                <span className="text-[10px] text-gray-400 uppercase block mb-1">Created At</span>
                                <span className="text-sm font-medium text-gray-800 dark:text-white/90">{new Date(coupon.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="p-3 border border-gray-100 dark:border-gray-800 rounded-xl">
                                <span className="text-[10px] text-gray-400 uppercase block mb-1">Last Updated</span>
                                <span className="text-sm font-medium text-gray-800 dark:text-white/90">{new Date(coupon.updatedAt).toLocaleString()}</span>
                            </div>
                            <div className="p-3 border border-gray-100 dark:border-gray-800 rounded-xl">
                                <span className="text-[10px] text-gray-400 uppercase block mb-1">Last Updated By</span>
                                <span className="text-sm font-medium text-brand-600 font-bold">{coupon.updatedBy?.name || "System"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Cards */}
                <div className="space-y-6">
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                        <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-brand-500" />
                            Validity Period
                        </h3>

                        <div className="space-y-4">
                            <div className="relative pl-6 border-l-2 border-brand-500 pb-4">
                                <div className="absolute top-0 -left-1.5 w-3 h-3 rounded-full bg-brand-500"></div>
                                <span className="text-[10px] text-gray-400 uppercase block">Starts</span>
                                <span className="font-bold">{coupon.startDate ? new Date(coupon.startDate).toLocaleDateString() : 'Immediate'}</span>
                            </div>
                            <div className="relative pl-6 border-l-2 border-gray-200 dark:border-gray-800">
                                <div className="absolute top-0 -left-1.5 w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                                <span className="text-[10px] text-gray-400 uppercase block">Expires</span>
                                <span className="font-bold">{coupon.endDate ? new Date(coupon.endDate).toLocaleDateString() : 'Never'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-brand-600 p-6 text-white text-center">
                        <Tag className="w-8 h-8 mx-auto mb-4 opacity-50" />
                        <h4 className="font-bold mb-2">Internal Notes</h4>
                        <p className="text-xs text-brand-100 leading-relaxed">
                            This coupon is visible across the platform for {coupon.userType === 'all' ? 'everyone' : coupon.userType + 's'}.
                            Ensure minimum order values are met for correct application.
                        </p>
                    </div>
                </div>
            </div>
        </PermissionGuard>
    );
}
