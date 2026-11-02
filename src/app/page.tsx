import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0B3D3A] text-teal-50">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 10% 20%, rgba(251,191,36,.25), transparent 45%), radial-gradient(ellipse at 90% 10%, rgba(45,212,191,.2), transparent 40%), linear-gradient(180deg, transparent, rgba(0,0,0,.35))",
        }}
      />
      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-8">
        <header className="flex items-center justify-between">
          <p className="font-serif text-2xl text-amber-100">LocalOS</p>
          <div className="flex gap-2">
            <Link href="/login">
              <Button variant="ghost" className="text-teal-100 hover:bg-white/10 hover:text-white">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-amber-200 text-teal-950 hover:bg-amber-100">Start free</Button>
            </Link>
          </div>
        </header>

        <section className="flex flex-1 flex-col justify-center py-16">
          <p className="text-xs uppercase tracking-[0.25em] text-amber-200/80">
            Hyperlocal · Omnichannel · India SMB
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[1.05] text-amber-50 md:text-6xl">
            LocalOS
          </h1>
          <p className="mt-5 max-w-xl text-lg text-teal-100/85">
            Onboard your brand, publish store microsites, and capture WhatsApp, call, and form
            leads — with a full journey CRM.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup">
              <Button size="lg" className="bg-amber-200 text-teal-950 hover:bg-amber-100">
                Create your brand
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-teal-200/40 bg-transparent text-teal-50 hover:bg-white/10"
              >
                Open dashboard
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
