import { requireOrg } from "@/lib/session";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const { organization } = await requireOrg();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Brand settings</h1>
        <p className="mt-1 text-sm text-stone-600">
          Logo, colors, socials, and industry defaults.
        </p>
      </div>
      <SettingsForm
        initial={{
          name: organization.name,
          tagline: organization.tagline || "",
          logo: organization.logo || "",
          primaryColor: organization.primaryColor || "#0F766E",
          secondaryColor: organization.secondaryColor || "#134E4A",
          socialInstagram: organization.socialInstagram || "",
          socialFacebook: organization.socialFacebook || "",
          socialYoutube: organization.socialYoutube || "",
          industry: organization.industry || "retail",
        }}
      />
    </div>
  );
}
