"use client";
import React from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useRouter } from "next/navigation";
import { userApi } from "@/api/api";

export default function UserInfoCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [isPassModalOpen, setIsPassModalOpen] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const router = useRouter();

  React.useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await userApi.resetPassword(user._id, { password: newPassword });
      if (response.success) {
        alert("Password changed successfully. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/signin");
      }
    } catch (err: any) {
      alert(err.message || "Failed to change password");
    }
  };

  const permissions = user ? Object.entries(user)
    .filter(([key, value]) => key.endsWith("Access") && value === true)
    .map(([key, _]) => key.replace("Access", "").replace(/([A-Z])/g, ' $1').trim().toUpperCase())
    : [];

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Account Details & Access
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Full Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.name || "N/A"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Username
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.login || "N/A"}
              </p>
            </div>

            <div className="lg:col-span-2">
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Granted Permissions
              </p>
              <div className="flex flex-wrap gap-2">
                {permissions.length > 0 ? permissions.map(p => (
                  <span key={p} className="px-2.5 py-0.5 text-xs font-medium bg-brand-100 text-brand-600 rounded-md dark:bg-brand-500/10 dark:text-brand-400">
                    {p}
                  </span>
                )) : <span className="text-sm text-gray-400 italic">No special access granted</span>}
              </div>
            </div>
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsPassModalOpen(true)}
          className="lg:inline-flex lg:w-auto"
        >
          Change Password
        </Button>
      </div>

      <Modal isOpen={isPassModalOpen} onClose={() => setIsPassModalOpen(false)} className="max-w-[400px]">
        <div className="p-8">
          <h4 className="text-xl font-bold mb-2">Change Password</h4>
          <p className="text-sm text-gray-500 mb-6 font-medium">Please enter your new password twice to confirm.</p>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1">Update Password</Button>
              <Button variant="outline" onClick={() => setIsPassModalOpen(false)} className="flex-1">Cancel</Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
