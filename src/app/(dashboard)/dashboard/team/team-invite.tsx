"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { inviteTeamMember } from "@/lib/actions/org";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export function TeamInviteForm({
  stores,
}: {
  stores: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [role, setRole] = useState<"brand_manager" | "store_manager" | "staff">(
    "staff",
  );
  const [storeId, setStoreId] = useState<string>("");

  return (
    <form
      className="space-y-3 rounded-xl border border-stone-200 bg-white p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const res = await inviteTeamMember({
          email: String(fd.get("email")),
          role,
          storeId: storeId || undefined,
        });
        toast.success(`Invite ready: ${res.inviteUrl}`);
        e.currentTarget.reset();
        router.refresh();
      }}
    >
      <h2 className="font-medium">Invite teammate</h2>
      <div className="space-y-1.5">
        <Label>Email</Label>
        <Input name="email" type="email" required />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Role</Label>
          <Select value={role} onValueChange={(v) => v && setRole(v as typeof role)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="brand_manager">Brand manager</SelectItem>
              <SelectItem value="store_manager">Store manager</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Store scope (optional)</Label>
          <Select value={storeId} onValueChange={(v) => setStoreId(v ?? "")}>
            <SelectTrigger>
              <SelectValue placeholder="All stores" />
            </SelectTrigger>
            <SelectContent>
              {stores.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" className="bg-teal-800">
        Send invite
      </Button>
    </form>
  );
}
