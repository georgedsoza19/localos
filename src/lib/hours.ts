type DayHours = { open: string; close: string; closed?: boolean };

const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export const DEFAULT_HOURS: Record<(typeof DAY_KEYS)[number], DayHours> = {
  monday: { open: "10:00", close: "20:00" },
  tuesday: { open: "10:00", close: "20:00" },
  wednesday: { open: "10:00", close: "20:00" },
  thursday: { open: "10:00", close: "20:00" },
  friday: { open: "10:00", close: "20:00" },
  saturday: { open: "10:00", close: "20:00" },
  sunday: { open: "10:00", close: "14:00", closed: true },
};

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function getOpenStatus(
  hours: Record<string, DayHours> | null | undefined,
  now = new Date(),
) {
  if (!hours) {
    return { open: false, label: "Hours not set", nextOpen: null as string | null };
  }

  const day = DAY_KEYS[now.getDay()];
  const today = hours[day];
  if (!today || today.closed) {
    for (let i = 1; i <= 7; i++) {
      const nextDay = DAY_KEYS[(now.getDay() + i) % 7];
      const next = hours[nextDay];
      if (next && !next.closed) {
        return {
          open: false,
          label: "Closed",
          nextOpen: `${nextDay} ${next.open}`,
        };
      }
    }
    return { open: false, label: "Closed", nextOpen: null };
  }

  const mins = now.getHours() * 60 + now.getMinutes();
  const openMins = toMinutes(today.open);
  const closeMins = toMinutes(today.close);
  if (mins >= openMins && mins < closeMins) {
    return { open: true, label: "Open now", nextOpen: null };
  }
  if (mins < openMins) {
    return { open: false, label: "Closed", nextOpen: `Today ${today.open}` };
  }
  return { open: false, label: "Closed", nextOpen: null };
}

export function whatsappLink(phone: string, text?: string) {
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.startsWith("91") ? digits : `91${digits}`;
  const url = new URL(`https://wa.me/${normalized}`);
  if (text) url.searchParams.set("text", text);
  return url.toString();
}

export function telLink(phone: string) {
  return `tel:${phone.replace(/\s/g, "")}`;
}
