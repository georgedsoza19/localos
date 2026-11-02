"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSiteConfig } from "@/lib/actions/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type Content = {
  testimonials?: { name: string; quote: string; rating?: number }[];
  faq?: { q: string; a: string }[];
  gallery?: string[];
  team?: { name: string; role: string; image?: string }[];
};

export function SiteEditor({
  orgSlug,
  initial,
  stores,
}: {
  orgSlug: string;
  initial: {
    template: "clinic" | "salon" | "retail";
    headline: string;
    subheadline: string;
    metaTitle: string;
    metaDescription: string;
    ogImage: string;
    stickyCall: boolean;
    stickyWhatsapp: boolean;
    stickyEnquire: boolean;
    content: Content;
  };
  stores: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [template, setTemplate] = useState(initial.template);
  const [stickyCall, setStickyCall] = useState(initial.stickyCall);
  const [stickyWhatsapp, setStickyWhatsapp] = useState(initial.stickyWhatsapp);
  const [stickyEnquire, setStickyEnquire] = useState(initial.stickyEnquire);
  const [testimonialsJson, setTestimonialsJson] = useState(
    JSON.stringify(initial.content.testimonials || [], null, 2),
  );
  const [faqJson, setFaqJson] = useState(
    JSON.stringify(initial.content.faq || [], null, 2),
  );
  const [teamJson, setTeamJson] = useState(
    JSON.stringify(initial.content.team || [], null, 2),
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await updateSiteConfig({
        template,
        headline: String(fd.get("headline")),
        subheadline: String(fd.get("subheadline")),
        metaTitle: String(fd.get("metaTitle")),
        metaDescription: String(fd.get("metaDescription")),
        ogImage: String(fd.get("ogImage")),
        stickyCall,
        stickyWhatsapp,
        stickyEnquire,
        content: {
          testimonials: JSON.parse(testimonialsJson || "[]"),
          faq: JSON.parse(faqJson || "[]"),
          team: JSON.parse(teamJson || "[]"),
          gallery: (initial.content.gallery || []).concat(
            String(fd.get("galleryUrl") || "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          ),
        },
      });
      toast.success("Site saved");
      router.refresh();
    } catch {
      toast.error("Invalid JSON in content fields");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 rounded-xl border border-stone-200 bg-white p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Template</Label>
          <Select
            value={template}
            onValueChange={(v) => v && setTemplate(v as typeof template)}
          >
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
          <Label>Headline</Label>
          <Input name="headline" defaultValue={initial.headline} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Subheadline</Label>
          <Input name="subheadline" defaultValue={initial.subheadline} />
        </div>
        <div className="space-y-1.5">
          <Label>SEO title</Label>
          <Input name="metaTitle" defaultValue={initial.metaTitle} />
        </div>
        <div className="space-y-1.5">
          <Label>OG image URL</Label>
          <Input name="ogImage" defaultValue={initial.ogImage} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>SEO description</Label>
          <Textarea name="metaDescription" defaultValue={initial.metaDescription} />
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={stickyCall} onCheckedChange={setStickyCall} /> Sticky Call
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={stickyWhatsapp} onCheckedChange={setStickyWhatsapp} /> Sticky WhatsApp
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={stickyEnquire} onCheckedChange={setStickyEnquire} /> Sticky Enquire
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Testimonials JSON</Label>
          <Textarea
            rows={8}
            value={testimonialsJson}
            onChange={(e) => setTestimonialsJson(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>FAQ JSON</Label>
          <Textarea rows={8} value={faqJson} onChange={(e) => setFaqJson(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Team JSON</Label>
          <Textarea rows={8} value={teamJson} onChange={(e) => setTeamJson(e.target.value)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Add gallery image URLs (comma-separated)</Label>
        <Input name="galleryUrl" placeholder="https://..., /uploads/..." />
      </div>

      <p className="text-xs text-stone-500">
        Stores: {stores.map((s) => s.name).join(", ") || "none"} · Public: /s/{orgSlug}
      </p>

      <Button type="submit" className="bg-teal-800">
        Save microsite
      </Button>
    </form>
  );
}
