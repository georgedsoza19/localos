"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createStore } from "@/lib/actions/org";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function StoreForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const fd = new FormData(e.currentTarget);
      const pincodes = String(fd.get("servicePincodes") || "")
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
      await createStore({
        name: String(fd.get("name")),
        phone: String(fd.get("phone") || ""),
        whatsapp: String(fd.get("whatsapp") || ""),
        city: String(fd.get("city") || ""),
        pincode: String(fd.get("pincode") || ""),
        addressLine1: String(fd.get("address") || ""),
        state: String(fd.get("state") || ""),
        servicePincodes: pincodes,
      });
      e.currentTarget.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 grid gap-3 sm:grid-cols-2">
      <div className="space-y-1.5 sm:col-span-2">
        <Label>Name</Label>
        <Input name="name" required />
      </div>
      <div className="space-y-1.5">
        <Label>Phone</Label>
        <Input name="phone" />
      </div>
      <div className="space-y-1.5">
        <Label>WhatsApp</Label>
        <Input name="whatsapp" />
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label>Address</Label>
        <Input name="address" />
      </div>
      <div className="space-y-1.5">
        <Label>City</Label>
        <Input name="city" />
      </div>
      <div className="space-y-1.5">
        <Label>State</Label>
        <Input name="state" />
      </div>
      <div className="space-y-1.5">
        <Label>Pincode</Label>
        <Input name="pincode" />
      </div>
      <div className="space-y-1.5">
        <Label>Service pincodes (comma-separated)</Label>
        <Input name="servicePincodes" placeholder="560034, 560035" />
      </div>
      {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={loading} className="bg-teal-800 sm:col-span-2">
        {loading ? "Saving…" : "Create store"}
      </Button>
    </form>
  );
}
