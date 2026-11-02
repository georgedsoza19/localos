import { nanoid } from "nanoid";

export function id(prefix?: string) {
  return prefix ? `${prefix}_${nanoid(12)}` : nanoid(16);
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
