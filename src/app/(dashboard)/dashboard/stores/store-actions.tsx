"use client";

import { useRouter } from "next/navigation";
import { updateStore } from "@/lib/actions/org";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function StoreActions({
  storeId,
  published,
  orgSlug,
  storeSlug,
  storeName,
}: {
  storeId: string;
  published: boolean;
  orgSlug: string;
  storeSlug: string;
  storeName: string;
}) {
  const router = useRouter();
  const siteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/s/${orgSlug}/store/${storeSlug}`
      : `/s/${orgSlug}/store/${storeSlug}`;

  async function togglePublish() {
    await updateStore(storeId, { published: !published });
    toast.success(published ? "Unpublished" : "Published");
    router.refresh();
  }

  async function downloadQr() {
    const url = `${window.location.origin}/s/${orgSlug}/store/${storeSlug}`;
    const QRCode = (await import("qrcode")).default;
    const dataUrl = await QRCode.toDataURL(url, { width: 512, margin: 2 });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${storeSlug}-qr.png`;
    a.click();
  }

  function shareWhatsapp() {
    const text = encodeURIComponent(`Visit ${storeName}: ${window.location.origin}/s/${orgSlug}/store/${storeSlug}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" onClick={togglePublish}>
        {published ? "Unpublish" : "Publish"}
      </Button>
      <Button size="sm" variant="outline" onClick={downloadQr}>
        Download QR
      </Button>
      <Button size="sm" variant="outline" onClick={shareWhatsapp}>
        Share WhatsApp
      </Button>
      <span className="sr-only">{siteUrl}</span>
    </div>
  );
}
