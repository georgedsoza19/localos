"use client";

import { Button } from "@/components/ui/button";

export function LeadsExport({
  rows,
}: {
  rows: {
    id: string;
    name: string | null;
    phone: string | null;
    channel: string;
    status: string;
    createdAt: string;
  }[];
}) {
  function exportCsv() {
    const header = "id,name,phone,channel,status,createdAt\n";
    const body = rows
      .map((r) =>
        [r.id, r.name, r.phone, r.channel, r.status, r.createdAt]
          .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.csv";
    a.click();
  }

  return (
    <Button variant="outline" onClick={exportCsv}>
      Export CSV
    </Button>
  );
}
