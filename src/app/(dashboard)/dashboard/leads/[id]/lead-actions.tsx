"use client";

import { useRouter } from "next/navigation";
import {
  addLeadNote,
  assignLead,
  mergeLeadsByPhone,
  setFollowUp,
  updateLeadStatus,
} from "@/lib/actions/leads";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const STATUSES = ["new", "contacted", "qualified", "won", "lost"] as const;

export function LeadDetailActions({
  leadId,
  status,
  team,
  assignedToUserId,
  phone,
}: {
  leadId: string;
  status: string;
  team: { userId: string; name: string; email: string }[];
  assignedToUserId: string | null;
  phone: string | null;
}) {
  const router = useRouter();

  return (
    <div className="w-full max-w-sm space-y-3 rounded-xl border border-stone-200 bg-white p-4">
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-stone-500">Pipeline status</p>
        <Select
          defaultValue={status}
          onValueChange={async (v) => {
            if (!v) return;
            await updateLeadStatus(leadId, v as (typeof STATUSES)[number]);
            toast.success("Status updated");
            router.refresh();
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-medium text-stone-500">Assign to</p>
        <Select
          defaultValue={assignedToUserId || "unassigned"}
          onValueChange={async (v) => {
            if (!v) return;
            await assignLead(leadId, v === "unassigned" ? null : v);
            toast.success("Assigned");
            router.refresh();
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {team.map((t) => (
              <SelectItem key={t.userId} value={t.userId}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <form
        className="space-y-2"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          await setFollowUp(leadId, String(fd.get("followUp") || "") || null);
          toast.success("Follow-up set");
          router.refresh();
        }}
      >
        <p className="text-xs font-medium text-stone-500">Follow-up reminder</p>
        <Input name="followUp" type="datetime-local" />
        <Button type="submit" size="sm" variant="outline" className="w-full">
          Save reminder
        </Button>
      </form>

      <form
        className="space-y-2"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          await addLeadNote(leadId, String(fd.get("body")));
          e.currentTarget.reset();
          toast.success("Note added");
          router.refresh();
        }}
      >
        <Textarea name="body" required placeholder="Add a note…" />
        <Button type="submit" size="sm" className="w-full bg-teal-800">
          Add note
        </Button>
      </form>

      {phone && (
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={async () => {
            const res = await mergeLeadsByPhone(phone);
            toast.success(`Merged ${res.merged} duplicates`);
            router.refresh();
          }}
        >
          Merge duplicates by phone
        </Button>
      )}
    </div>
  );
}
