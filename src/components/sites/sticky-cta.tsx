"use client";

import { Phone, MessageCircle, Mail } from "lucide-react";
import { telLink, whatsappLink } from "@/lib/hours";

export function StickyCta({
  orgSlug,
  storeSlug,
  phone,
  whatsapp,
  showCall,
  showWhatsapp,
  showEnquire,
  visitorId,
  enquireHref = "#enquire",
}: {
  orgSlug: string;
  storeSlug?: string;
  phone?: string | null;
  whatsapp?: string | null;
  showCall: boolean;
  showWhatsapp: boolean;
  showEnquire: boolean;
  visitorId: string;
  enquireHref?: string;
}) {
  async function track(channel: "call" | "whatsapp") {
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orgSlug,
        storeSlug,
        channel,
        phone: whatsapp || phone,
        visitorId,
        consent: true,
        landingPage: window.location.pathname,
      }),
    }).catch(() => null);
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orgSlug,
        storeSlug,
        visitorId,
        eventType: "cta_click",
        pagePath: window.location.pathname,
        meta: { channel },
      }),
    }).catch(() => null);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white/95 backdrop-blur md:hidden">
      <div className="grid grid-cols-3 gap-1 p-2">
        {showCall && phone ? (
          <a
            href={telLink(phone)}
            onClick={() => track("call")}
            className="flex flex-col items-center gap-0.5 rounded-md bg-teal-800 py-2 text-[11px] font-medium text-white"
          >
            <Phone className="size-4" />
            Call
          </a>
        ) : (
          <span />
        )}
        {showWhatsapp && whatsapp ? (
          <a
            href={whatsappLink(whatsapp, "Hi, I found you on your LocalOS page.")}
            target="_blank"
            rel="noreferrer"
            onClick={() => track("whatsapp")}
            className="flex flex-col items-center gap-0.5 rounded-md bg-emerald-600 py-2 text-[11px] font-medium text-white"
          >
            <MessageCircle className="size-4" />
            WhatsApp
          </a>
        ) : (
          <span />
        )}
        {showEnquire ? (
          <a
            href={enquireHref}
            className="flex flex-col items-center gap-0.5 rounded-md bg-amber-700 py-2 text-[11px] font-medium text-white"
          >
            <Mail className="size-4" />
            Enquire
          </a>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
