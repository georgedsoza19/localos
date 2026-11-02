"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrganization, createStore, completeOnboarding } from "@/lib/actions/org";
import { createProduct } from "@/lib/actions/catalog";
import { updateSiteConfig } from "@/lib/actions/site";
import { updateStore } from "@/lib/actions/org";
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

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [industry, setIndustry] = useState<"clinic" | "salon" | "retail">("salon");
  const [storeId, setStoreId] = useState<string | null>(null);
  const [orgSlug, setOrgSlug] = useState("");

  async function stepBrand(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const fd = new FormData(e.currentTarget);
      const res = await createOrganization({
        name: String(fd.get("name")),
        industry,
        tagline: String(fd.get("tagline") || ""),
      });
      setOrgSlug(res.slug);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function stepStore(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const fd = new FormData(e.currentTarget);
      const res = await createStore({
        name: String(fd.get("name")),
        phone: String(fd.get("phone") || ""),
        whatsapp: String(fd.get("whatsapp") || ""),
        city: String(fd.get("city") || ""),
        pincode: String(fd.get("pincode") || ""),
        addressLine1: String(fd.get("address") || ""),
      });
      setStoreId(res.storeId);
      await updateSiteConfig({
        template: industry,
        headline: String(fd.get("name")),
        storeId: res.storeId,
      });
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function stepCatalog(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const fd = new FormData(e.currentTarget);
      const name = String(fd.get("product") || "");
      if (name) {
        await createProduct({
          name,
          price: String(fd.get("price") || ""),
          description: String(fd.get("description") || ""),
          featured: true,
        });
      }
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function publish() {
    setLoading(true);
    try {
      if (storeId) await updateStore(storeId, { published: true });
      await completeOnboarding();
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <p className="text-xs uppercase tracking-widest text-teal-800">Setup · Step {step} of 4</p>
      <h1 className="mt-2 font-serif text-3xl text-stone-900">Launch your brand</h1>
      <p className="mt-2 text-sm text-stone-600">
        Brand → store → catalog → publish. Takes a few minutes.
      </p>

      {step === 1 && (
        <form onSubmit={stepBrand} className="mt-8 space-y-4 rounded-xl border border-stone-200 bg-white p-6">
          <div className="space-y-1.5">
            <Label>Brand / business name</Label>
            <Input name="name" required placeholder="e.g. Glow Salon" />
          </div>
          <div className="space-y-1.5">
            <Label>Industry template</Label>
            <Select value={industry} onValueChange={(v) => v && setIndustry(v as typeof industry)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clinic">Clinic</SelectItem>
                <SelectItem value="salon">Salon</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Tagline</Label>
            <Input name="tagline" placeholder="Beauty near you" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading} className="bg-teal-800">
            Continue
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={stepStore} className="mt-8 space-y-4 rounded-xl border border-stone-200 bg-white p-6">
          <div className="space-y-1.5">
            <Label>First store name</Label>
            <Input name="name" required placeholder="Glow Salon — Koramangala" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input name="phone" required placeholder="9876543210" />
            </div>
            <div className="space-y-1.5">
              <Label>WhatsApp</Label>
              <Input name="whatsapp" placeholder="9876543210" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Address</Label>
            <Input name="address" placeholder="12th Main" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>City</Label>
              <Input name="city" required placeholder="Bengaluru" />
            </div>
            <div className="space-y-1.5">
              <Label>Pincode</Label>
              <Input name="pincode" placeholder="560034" />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading} className="bg-teal-800">
            Continue
          </Button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={stepCatalog} className="mt-8 space-y-4 rounded-xl border border-stone-200 bg-white p-6">
          <p className="text-sm text-stone-600">Add your first product or service (optional).</p>
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input name="product" placeholder="Haircut / Consultation / Product" />
          </div>
          <div className="space-y-1.5">
            <Label>Price (INR)</Label>
            <Input name="price" placeholder="499" />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea name="description" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading} className="bg-teal-800">
            Continue
          </Button>
        </form>
      )}

      {step === 4 && (
        <div className="mt-8 space-y-4 rounded-xl border border-stone-200 bg-white p-6">
          <p className="text-sm text-stone-700">
            Ready to publish your store microsite
            {orgSlug ? (
              <>
                {" "}
                at <code className="rounded bg-stone-100 px-1">/s/{orgSlug}</code>
              </>
            ) : null}
            .
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button onClick={publish} disabled={loading} className="bg-teal-800">
            Publish & open dashboard
          </Button>
        </div>
      )}
    </div>
  );
}
