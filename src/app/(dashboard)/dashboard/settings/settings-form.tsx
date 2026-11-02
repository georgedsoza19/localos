"use client";

import { useRouter } from "next/navigation";
import { updateOrganization } from "@/lib/actions/org";
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
import { useState } from "react";
import { toast } from "sonner";

export function SettingsForm({
  initial,
}: {
  initial: {
    name: string;
    tagline: string;
    logo: string;
    primaryColor: string;
    secondaryColor: string;
    socialInstagram: string;
    socialFacebook: string;
    socialYoutube: string;
    industry: "clinic" | "salon" | "retail";
  };
}) {
  const router = useRouter();
  const [industry, setIndustry] = useState(initial.industry);

  return (
    <form
      className="grid max-w-xl gap-4 rounded-xl border border-stone-200 bg-white p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        await updateOrganization({
          name: String(fd.get("name")),
          tagline: String(fd.get("tagline")),
          logo: String(fd.get("logo")),
          primaryColor: String(fd.get("primaryColor")),
          secondaryColor: String(fd.get("secondaryColor")),
          socialInstagram: String(fd.get("socialInstagram")),
          socialFacebook: String(fd.get("socialFacebook")),
          socialYoutube: String(fd.get("socialYoutube")),
          industry,
        });
        toast.success("Saved");
        router.refresh();
      }}
    >
      <div className="space-y-1.5">
        <Label>Brand name</Label>
        <Input name="name" defaultValue={initial.name} required />
      </div>
      <div className="space-y-1.5">
        <Label>Tagline</Label>
        <Input name="tagline" defaultValue={initial.tagline} />
      </div>
      <div className="space-y-1.5">
        <Label>Logo URL</Label>
        <Input name="logo" defaultValue={initial.logo} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Primary color</Label>
          <Input name="primaryColor" type="color" defaultValue={initial.primaryColor} />
        </div>
        <div className="space-y-1.5">
          <Label>Secondary color</Label>
          <Input name="secondaryColor" type="color" defaultValue={initial.secondaryColor} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Industry</Label>
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
        <Label>Instagram URL</Label>
        <Input name="socialInstagram" defaultValue={initial.socialInstagram} />
      </div>
      <div className="space-y-1.5">
        <Label>Facebook URL</Label>
        <Input name="socialFacebook" defaultValue={initial.socialFacebook} />
      </div>
      <div className="space-y-1.5">
        <Label>YouTube URL</Label>
        <Input name="socialYoutube" defaultValue={initial.socialYoutube} />
      </div>
      <Button type="submit" className="bg-teal-800">
        Save settings
      </Button>
    </form>
  );
}
