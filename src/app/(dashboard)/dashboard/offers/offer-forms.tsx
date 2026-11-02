"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createOffer, deleteOffer } from "@/lib/actions/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export function OfferForms({
  stores,
  offers,
}: {
  stores: { id: string; name: string }[];
  offers: { id: string; title: string; description: string | null; active: boolean }[];
}) {
  const router = useRouter();
  const [storeId, setStoreId] = useState<string>("all");

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form
        className="space-y-3 rounded-xl border border-stone-200 bg-white p-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          await createOffer({
            title: String(fd.get("title")),
            description: String(fd.get("description") || ""),
            storeId: storeId === "all" ? undefined : storeId,
            bannerImage: String(fd.get("banner") || ""),
            startsAt: String(fd.get("startsAt") || "") || undefined,
            endsAt: String(fd.get("endsAt") || "") || undefined,
          });
          toast.success("Offer created");
          e.currentTarget.reset();
          router.refresh();
        }}
      >
        <h2 className="font-medium">New offer</h2>
        <div className="space-y-1.5">
          <Label>Title</Label>
          <Input name="title" required />
        </div>
        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea name="description" />
        </div>
        <div className="space-y-1.5">
          <Label>Banner image URL</Label>
          <Input name="banner" />
        </div>
        <div className="space-y-1.5">
          <Label>Store scope</Label>
          <Select value={storeId} onValueChange={(v) => setStoreId(v ?? "all")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stores (brand)</SelectItem>
              {stores.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input name="startsAt" type="date" />
          <Input name="endsAt" type="date" />
        </div>
        <Button type="submit" className="bg-teal-800">
          Create
        </Button>
      </form>

      <ul className="space-y-3">
        {offers.map((o) => (
          <li
            key={o.id}
            className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4"
          >
            <div>
              <p className="font-medium">{o.title}</p>
              <p className="text-sm text-stone-500">{o.description}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await deleteOffer(o.id);
                toast.success("Deleted");
                router.refresh();
              }}
            >
              Delete
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
