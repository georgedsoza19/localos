import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { requireSession } from "@/lib/session";
import { id } from "@/lib/ids";

export async function POST(req: Request) {
  await requireSession();
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }
  if (file.size > 2_000_000) {
    return NextResponse.json({ error: "Max 2MB" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const allowed = ["jpg", "jpeg", "png", "webp", "gif"];
  if (!allowed.includes(ext)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const filename = `${id("img")}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), bytes);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
