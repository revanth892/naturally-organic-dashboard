"use client";
import PermissionGuard from "@/components/common/PermissionGuard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageTutorial from "@/components/common/PageTutorial";

import { useEffect, useState } from "react";
import { postcodeApi } from "@/api/api";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Checkbox from "@/components/form/input/Checkbox";
import { PlusIcon, TrashIcon, EditIcon, Truck, MapPin } from "lucide-react";

export default function PostcodePage() {
    const tutorialSteps = [
        {
            title: "Postcode Coverage",
            description: "Add individual postcodes to the list to enable delivery for those specific geographic areas."
        },
        {
            title: "Service Logic",
            description: "For each postcode, you can enable/disable specifically: Free Same Day, Special Same Day, or Express delivery."
        },
        {
            title: "Minimum Order Values",
            description: "Set minimum spend requirements for each delivery type to ensure logistics costs are covered."
        }
    ];

    const defaultService = { isEligible: false, description: "", minimumValue: 0 };
    const [postcodes, setPostcodes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({
        postcode: "",
        freeSameDayDelivery: { ...defaultService },
        specialSameDayDelivery: { ...defaultService },
        expressDelivery: { ...defaultService },
    });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await postcodeApi.getAll();
            if (res.success) setPostcodes(res.data);
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
        if (!form.postcode) {
            alert("Postcode is required");
            return;
        }

        setIsSaving(true);
        try {
            let res;
            if (editingId) {
                res = await postcodeApi.update(editingId, form);
            } else {
                res = await postcodeApi.create(form);
            }
            if (res.success) {
                fetchData();
                setIsModalOpen(false);
                resetForm();
            }
        } catch (err: any) {
            alert(err.message || "Error saving postcode");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string, code: string) => {
        if (!confirm(`Are you sure you want to delete postcode ${code}?`)) return;
        try {
            const res = await postcodeApi.delete(id);
            if (res.success) fetchData();
        } catch (err: any) {
            alert(err.message || "Error deleting postcode");
        }
    };

    const startEditing = (pc: any) => {
        setEditingId(pc._id);
        setForm({
            postcode: pc.postcode,
            freeSameDayDelivery: pc.freeSameDayDelivery || { ...defaultService },
            specialSameDayDelivery: pc.specialSameDayDelivery || { ...defaultService },
            expressDelivery: pc.expressDelivery || { ...defaultService },
        });
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setForm({
            postcode: "",
            freeSameDayDelivery: { ...defaultService },
            specialSameDayDelivery: { ...defaultService },
            expressDelivery: { ...defaultService },
        });
        setEditingId(null);
    };

    const updateService = (serviceName: "freeSameDayDelivery" | "specialSameDayDelivery" | "expressDelivery", field: string, value: any) => {
        setForm(prev => ({
            ...prev,
            [serviceName]: {
                ...prev[serviceName],
                [field]: field === 'minimumValue' ? Number(value) : value
            }
        }));
    };

    const renderServiceFields = (title: string, key: "freeSameDayDelivery" | "specialSameDayDelivery" | "expressDelivery") => (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
                <h5 className="font-semibold text-sm text-gray-700 dark:text-gray-300">{title}</h5>
                <Checkbox
                    checked={form[key].isEligible}
                    onChange={(checked) => updateService(key, 'isEligible', checked)}
                    label="Eligible"
                />
            </div>
            {form[key].isEligible && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div>
                        <Label className="text-xs">Description</Label>
                        <Input
                            value={form[key].description}
                            onChange={(e: any) => updateService(key, 'description', e.target.value)}
                            placeholder="e.g. Orders over £50"
                            className="bg-white dark:bg-gray-900"
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Minimum Value</Label>
                        <Input
                            type="number"
                            min="0"
                            value={form[key].minimumValue}
                            onChange={(e: any) => updateService(key, 'minimumValue', e.target.value)}
                            className="bg-white dark:bg-gray-900"
                        />
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <PermissionGuard permission="postcodeAccess">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <PageBreadcrumb pageTitle="Delivery Coverage" />
                    <PageTutorial
                        title="Postcodes"
                        overview="The Postcode module controls your delivery logistics. It determines where you ship and what service levels are available."
                        steps={tutorialSteps}
                    />
                </div>

                <Button onClick={() => { resetForm(); setIsModalOpen(true); }} size="sm" startIcon={<PlusIcon className="w-4 h-4" />}>Add Postcode</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {isLoading ? (
                    <div className="col-span-full text-center p-10 text-gray-500">Loading Postcodes...</div>
                ) : postcodes.length === 0 ? (
                    <div className="col-span-full text-center p-10 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No Postcodes found</h3>
                        <p className="text-gray-500 mt-1">Start by adding deliverable postcodes.</p>
                    </div>
                ) : (
                    postcodes.map((pc) => (
                        <div key={pc._id} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow group relative">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{pc.postcode}</h3>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => startEditing(pc)} className="p-1.5 text-gray-500 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><EditIcon className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(pc._id, pc.postcode)} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <ServiceBadge label="Free Same Day" service={pc.freeSameDayDelivery} />
                                <ServiceBadge label="Special Same Day" service={pc.specialSameDayDelivery} />
                                <ServiceBadge label="Express 1-2h" service={pc.expressDelivery} />
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-[700px]">
                <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl max-h-[90vh] overflow-y-auto">
                    <h4 className="text-xl font-bold mb-6">{editingId ? "Edit Postcode" : "Add Postcode"}</h4>
                    <div className="space-y-6">
                        <div>
                            <Label>Postcode</Label>
                            <Input
                                placeholder="e.g. 560001"
                                value={form.postcode}
                                onChange={(e) => setForm({ ...form, postcode: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-4">
                            <Label>Delivery Services Configuration</Label>
                            {renderServiceFields("Free Same Day Delivery", "freeSameDayDelivery")}
                            {renderServiceFields("Special Same Day Delivery", "specialSameDayDelivery")}
                            {renderServiceFields("Express 1-2 Hour Delivery", "expressDelivery")}
                        </div>
                    </div>
                    <div className="flex gap-4 mt-8 sticky bottom-0 bg-white dark:bg-gray-900 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button className="flex-1" onClick={handleSave} disabled={isSaving}>{isSaving ? "Saving..." : "Save Configuration"}</Button>
                    </div>
                </div>
            </Modal>
        </PermissionGuard>
    );
}

const ServiceBadge = ({ label, service }: { label: string, service: any }) => {
    if (!service?.isEligible) return (
        <div className="flex items-center justify-between text-xs text-gray-400 py-1 border-b border-gray-100 dark:border-gray-800 last:border-0">
            <span>{label}</span>
            <span className="italic">Not Eligible</span>
        </div>
    );

    return (
        <div className="flex flex-col text-xs py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
            <div className="flex items-center justify-between font-medium text-gray-700 dark:text-gray-300">
                <span className="flex items-center gap-1.5"><Truck className="w-3 h-3 text-green-500" /> {label}</span>
                {service.minimumValue > 0 && <span className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 px-1.5 py-0.5 rounded">Min: {service.minimumValue}</span>}
            </div>
            {service.description && (
                <div className="text-gray-500 mt-0.5 pl-4.5">{service.description}</div>
            )}
        </div>
    );
};
