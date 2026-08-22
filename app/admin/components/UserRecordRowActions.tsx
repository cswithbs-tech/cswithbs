"use client";

import { useState } from "react";
import { useToast } from "@/app/context/ToastContext";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/Button";
import { ConfirmDialog } from "@/app/components/ui/ConfirmDialog";

interface UserRecordRowActionsProps {
  userId: string;
  isCourseRestricted: boolean;
  userName: string;
  roles: string[];
}

export function UserRecordRowActions({
  userId,
  isCourseRestricted,
  userName,
  roles,
}: UserRecordRowActionsProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isRestricted, setIsRestricted] = useState(isCourseRestricted);
  const { showToast } = useToast();
  const router = useRouter();

  const isAdmin = roles?.some(r => ["ADMIN", "SUPER_ADMIN", "admin", "super_admin"].includes(r));

  const handleToggleRestrict = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCourseRestricted: !isRestricted }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update restriction");

      setIsRestricted(!isRestricted);
      showToast(`User ${userName} is now ${!isRestricted ? "restricted from" : "allowed into"} courses.`, "success");
      router.refresh();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        disabled={loading || isAdmin}
        onClick={() => setShowConfirm(true)}
        className={isRestricted ? "border-amber-500/50 text-amber-500 hover:bg-amber-500/10 disabled:opacity-30 disabled:border-zinc-700 disabled:text-zinc-500" : "border-red-500/50 text-red-500 hover:bg-red-500/10 disabled:opacity-30 disabled:border-zinc-700 disabled:text-zinc-500"}
        title={isAdmin ? "Cannot restrict admins" : undefined}
      >
        {loading ? "Saving..." : isRestricted ? "Unrestrict" : "Restrict"}
      </Button>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleToggleRestrict}
        title={isRestricted ? "Unrestrict User" : "Restrict User"}
        description={isRestricted ? `Are you sure you want to unrestrict ${userName} and allow them back into courses?` : `Are you sure you want to restrict ${userName} from accessing courses? This is usually done if they fail identity verification.`}
        confirmText={isRestricted ? "Yes, Unrestrict" : "Yes, Restrict"}
        variant={isRestricted ? "info" : "danger"}
      />
    </>
  );
}
