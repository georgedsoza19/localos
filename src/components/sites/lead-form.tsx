"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function LeadForm({
  orgSlug,
  storeSlug,
  productId,
  visitorId,
}: {
  orgSlug: string;
  storeSlug?: string;
  productId?: string;
  visitorId: string;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams(window.location.search);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orgSlug,
        storeSlug,
        productId,
        channel: "form",
        name: fd.get("name"),
        phone: fd.get("phone"),
        email: fd.get("email"),
        message: fd.get("message"),
        consent: fd.get("consent") === "yes",
        visitorId,
        utmSource: params.get("utm_source") || undefined,
        utmMedium: params.get("utm_medium") || undefined,
        utmCampaign: params.get("utm_campaign") || undefined,
        landingPage: window.location.pathname,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Something went wrong");
      setStatus("error");
      return;
    }
    setStatus("done");
    e.currentTarget.reset();
  }

  if (status === "done") {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
        Thanks! We received your enquiry. The store will contact you soon.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3" id="enquire">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required placeholder="Your name" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          required
          placeholder="10-digit mobile"
          inputMode="tel"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email (optional)</Label>
        <Input id="email" name="email" type="email" placeholder="you@email.com" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" placeholder="How can we help?" />
      </div>
      <label className="flex items-start gap-2 text-xs text-stone-600">
        <input type="checkbox" name="consent" value="yes" required className="mt-0.5" />
        I consent to being contacted about this enquiry (DPDP).
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={status === "loading"} className="w-full">
        {status === "loading" ? "Sending…" : "Send enquiry"}
      </Button>
    </form>
  );
}
