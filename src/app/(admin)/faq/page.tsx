"use client";
import PermissionGuard from "@/components/common/PermissionGuard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useEffect, useState } from "react";
import { faqApi } from "@/api/api";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { PlusIcon, TrashIcon, EditIcon, HelpCircle } from "lucide-react";

export default function FAQPage() {
    const [faqs, setFaqs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState<any>(null);
    const [form, setForm] = useState({
        question: "",
        answer: ""
    });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await faqApi.getAll();
            if (res.success) setFaqs(res.data);
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
        if (!form.question || !form.answer) {
            alert("Question and Answer are required");
            return;
        }

        setIsSaving(true);
        try {
            let res;
            if (editingFaq) {
                res = await faqApi.update(editingFaq._id, form);
            } else {
                res = await faqApi.create(form);
            }
            if (res.success) {
                fetchData();
                setIsModalOpen(false);
                resetForm();
            }
        } catch (err: any) {
            alert(err.message || "Error saving FAQ");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this FAQ?")) return;
        try {
            const res = await faqApi.delete(id);
            if (res.success) fetchData();
        } catch (err: any) {
            alert(err.message || "Error deleting FAQ");
        }
    };

    const startEditing = (faq: any) => {
        setEditingFaq(faq);
        setForm({
            question: faq.question,
            answer: faq.answer
        });
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setForm({ question: "", answer: "" });
        setEditingFaq(null);
    };

    return (
        <PermissionGuard permission="faqAccess">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <PageBreadcrumb pageTitle="FAQ Management" />
                <Button onClick={() => { resetForm(); setIsModalOpen(true); }} size="sm" startIcon={<PlusIcon className="w-4 h-4" />}>Add FAQ</Button>
            </div>

            <div className="grid gap-6">
                {isLoading ? (
                    <div className="text-center p-10 text-gray-500">Loading FAQs...</div>
                ) : faqs.length === 0 ? (
                    <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No FAQs found</h3>
                        <p className="text-gray-500 mt-1">Get started by creating a new Frequently Asked Question.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {faqs.map((faq) => (
                            <div key={faq._id} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow group relative">
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => startEditing(faq)} className="p-2 text-brand-500 hover:bg-brand-50 rounded-lg dark:hover:bg-brand-900/20"><EditIcon className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(faq._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg dark:hover:bg-red-900/20"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-20 mb-2">{faq.question}</h3>
                                <div className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">{faq.answer}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-[600px]">
                <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl">
                    <h4 className="text-xl font-bold mb-6">{editingFaq ? "Edit FAQ" : "Add FAQ"}</h4>
                    <div className="space-y-4">
                        <div>
                            <Label>Question</Label>
                            <Input
                                placeholder="E.g. What are your opening hours?"
                                value={form.question}
                                onChange={e => setForm({ ...form, question: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Answer</Label>
                            <textarea
                                className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none h-40 placeholder:text-gray-400 dark:text-white/90"
                                placeholder="Enter the answer here..."
                                value={form.answer}
                                onChange={e => setForm({ ...form, answer: e.target.value })}
                            />
                            <p className="text-xs text-gray-400 mt-1">New lines will be preserved in the display.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 mt-8">
                        <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button className="flex-1" onClick={handleSave} disabled={isSaving}>{isSaving ? "Saving..." : "Save FAQ"}</Button>
                    </div>
                </div>
            </Modal>
        </PermissionGuard>
    );
}
