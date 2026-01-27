"use client";
import PermissionGuard from "@/components/common/PermissionGuard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useEffect, useState } from "react";
import { userApi } from "@/api/api";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Checkbox from "@/components/form/input/Checkbox";

export default function UserManagementPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    // Modals state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    // Form states
    const [newUser, setNewUser] = useState({ name: "", login: "", password: "" });
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [permissions, setPermissions] = useState<any>({});

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await userApi.getAll();
            if (response.success) {
                setUsers(response.data);
            }
        } catch (err: any) {
            setError(err.message || "Failed to fetch users");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleStatus = async (id: string) => {
        try {
            await userApi.toggleStatus(id);
            fetchUsers();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await userApi.create({ ...newUser, ...permissions });
            setIsCreateModalOpen(false);
            setNewUser({ name: "", login: "", password: "" });
            setPermissions({});
            fetchUsers();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            await userApi.resetPassword(selectedUser._id, { password: newPassword });
            setIsPasswordModalOpen(false);
            setNewPassword("");
            setConfirmPassword("");
            fetchUsers();

            const storedUser = localStorage.getItem("user");
            const currentUser = storedUser ? JSON.parse(storedUser) : null;

            if (currentUser && currentUser._id === selectedUser._id) {
                alert("Your password has been changed. Please log in again.");
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/signin";
            } else {
                alert("Password changed successfully");
            }
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleUpdatePermissions = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await userApi.updatePermissions(selectedUser._id, permissions);
            setIsPermissionModalOpen(false);
            fetchUsers();
            alert("Permissions updated successfully");
        } catch (err: any) {
            alert(err.message);
        }
    };

    const openPermissionModal = (user: any) => {
        setSelectedUser(user);
        setPermissions({
            userProfilesAccess: !!user.userProfilesAccess,
            productAccess: !!user.productAccess,
            financeAccess: !!user.financeAccess,
            userManagementAccess: !!user.userManagementAccess,
            analyticsAccess: !!user.analyticsAccess,
            orderManagementAccess: !!user.orderManagementAccess,
            leadManagementAccess: !!user.leadManagementAccess,
            couponAccess: !!user.couponAccess,
        });
        setIsPermissionModalOpen(true);
    };

    const getActivePermissions = (user: any) => {
        return Object.entries(user)
            .filter(([key, value]) => key.endsWith("Access") && value === true)
            .map(([key, _]) => key.replace("Access", "").replace(/([A-Z])/g, ' $1').trim());
    };

    const permissionList = [
        { key: "userProfilesAccess", label: "User Profiles" },
        { key: "productAccess", label: "Products" },
        { key: "financeAccess", label: "Finance" },
        { key: "userManagementAccess", label: "User Management" },
        { key: "analyticsAccess", label: "Analytics" },
        { key: "orderManagementAccess", label: "Order Management" },
        { key: "leadManagementAccess", label: "Lead Management" },
        { key: "couponAccess", label: "Coupons" },
    ];

    return (
        <PermissionGuard permission="userManagementAccess">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <PageBreadcrumb pageTitle="User Management" />
                <Button size="sm" onClick={() => { setPermissions({}); setIsCreateModalOpen(true); }}>
                    Create New User
                </Button>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="px-5 py-6 sm:px-6 lg:px-8 border-b border-gray-200 dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        CMS Administrators
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    {isLoading && users.length === 0 ? (
                        <div className="p-10 text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-500 border-r-transparent align-[-0.125em]"></div>
                        </div>
                    ) : error ? (
                        <div className="p-10 text-center text-red-500">{error}</div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                            <thead className="bg-[#F9FAFB] dark:bg-white/[0.02]">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Permissions</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {users.map((user) => (
                                    <tr key={user._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500 font-bold">
                                                    {user.name?.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-800 dark:text-white/90">{user.name}</div>
                                                    <div className="text-sm text-gray-500">@{user.login}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1 max-md">
                                                {getActivePermissions(user).map((perm) => (
                                                    <span key={perm} className="px-2 py-0.5 rounded text-[10px] font-medium bg-brand-100 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
                                                        {perm.toUpperCase()}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleToggleStatus(user._id)}
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium cursor-pointer hover:opacity-80 ${user.isActive
                                                    ? "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400"
                                                    : "bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-400"
                                                    }`}
                                            >
                                                {user.isActive ? "Active" : "Inactive"}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2 text-nowrap whitespace-nowrap">
                                            <button
                                                onClick={() => openPermissionModal(user)}
                                                className="text-xs text-brand-500 hover:underline"
                                            >
                                                Edit Permissions
                                            </button>
                                            <button
                                                onClick={() => { setSelectedUser(user); setIsPasswordModalOpen(true); }}
                                                className="text-xs text-gray-500 hover:underline"
                                            >
                                                Change Password
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Create User Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} className="max-w-[500px]">
                <div className="p-8">
                    <h4 className="text-xl font-bold mb-4">Create New CMS User</h4>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                        <div>
                            <Label>Full Name</Label>
                            <Input value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} required />
                        </div>
                        <div>
                            <Label>Username (Login)</Label>
                            <Input value={newUser.login} onChange={(e) => setNewUser({ ...newUser, login: e.target.value })} required />
                        </div>
                        <div>
                            <Label>Initial Password</Label>
                            <Input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required />
                        </div>
                        <div>
                            <Label>Grant Access To:</Label>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {permissionList.map(p => (
                                    <div key={p.key} className="flex items-center gap-2">
                                        <Checkbox checked={!!permissions[p.key]} onChange={(checked) => setPermissions({ ...permissions, [p.key]: checked })} />
                                        <span className="text-sm">{p.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="pt-4 flex gap-3">
                            <Button type="submit" className="flex-1">Create User</Button>
                            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="flex-1">Cancel</Button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Permission Modal */}
            <Modal isOpen={isPermissionModalOpen} onClose={() => setIsPermissionModalOpen(false)} className="max-w-[400px]">
                <div className="p-8">
                    <h4 className="text-xl font-bold mb-2">Edit Permissions</h4>
                    <p className="text-sm text-gray-500 mb-6 font-medium">Updating access for {selectedUser?.name}</p>
                    <form onSubmit={handleUpdatePermissions} className="space-y-3">
                        {permissionList.map(p => (
                            <div key={p.key} className="flex items-center justify-between p-2 border rounded-lg dark:border-gray-800">
                                <span className="text-sm font-medium">{p.label}</span>
                                <Checkbox checked={!!permissions[p.key]} onChange={(checked) => setPermissions({ ...permissions, [p.key]: checked })} />
                            </div>
                        ))}
                        <div className="pt-4 flex gap-3">
                            <Button type="submit" className="flex-1">Update Access</Button>
                            <Button variant="outline" onClick={() => setIsPermissionModalOpen(false)} className="flex-1">Cancel</Button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Change Password Modal */}
            <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} className="max-w-[400px]">
                <div className="p-8">
                    <h4 className="text-xl font-bold mb-2">Change Password</h4>
                    <p className="text-sm text-gray-500 mb-6 font-medium">Setting new password for {selectedUser?.login}</p>
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div>
                            <Label>New Password</Label>
                            <Input type="password" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                        </div>
                        <div>
                            <Label>Confirm Password</Label>
                            <Input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button type="submit" className="flex-1">Update Password</Button>
                            <Button variant="outline" onClick={() => setIsPasswordModalOpen(false)} className="flex-1">Cancel</Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </PermissionGuard>
    );
}
