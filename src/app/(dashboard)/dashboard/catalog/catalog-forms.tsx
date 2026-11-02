"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createCategory, createProduct, importCatalogCsv } from "@/lib/actions/catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export function CatalogForms({
  categories,
}: {
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function addProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    await createProduct({
      name: String(fd.get("name")),
      price: String(fd.get("price") || ""),
      description: String(fd.get("description") || ""),
      categoryId: categoryId || undefined,
      featured: fd.get("featured") === "on",
    });
    toast.success("Product added");
    e.currentTarget.reset();
    setLoading(false);
    router.refresh();
  }

  async function addCategory(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await createCategory(String(fd.get("name")));
    toast.success("Category added");
    e.currentTarget.reset();
    router.refresh();
  }

  async function onImport(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const text = String(fd.get("csv"));
    const res = await importCatalogCsv(text);
    toast.success(`Imported ${res.imported} rows`);
    router.refresh();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <form onSubmit={addProduct} className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
        <h2 className="font-medium">Add item</h2>
        <div className="space-y-1.5">
          <Label>Name</Label>
          <Input name="name" required />
        </div>
        <div className="space-y-1.5">
          <Label>Price</Label>
          <Input name="price" />
        </div>
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "")}>
            <SelectTrigger>
              <SelectValue placeholder="Optional" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea name="description" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" /> Featured
        </label>
        <Button type="submit" disabled={loading} className="bg-teal-800">
          Save
        </Button>
      </form>

      <form onSubmit={addCategory} className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
        <h2 className="font-medium">Add category</h2>
        <Input name="name" required placeholder="Services" />
        <Button type="submit" variant="outline">
          Add category
        </Button>
      </form>

      <form onSubmit={onImport} className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
        <h2 className="font-medium">CSV import</h2>
        <p className="text-xs text-stone-500">
          Header: name,price,category,description
        </p>
        <Textarea
          name="csv"
          required
          rows={6}
          placeholder={"name,price,category,description\nHaircut,499,Services,Classic cut"}
        />
        <Button type="submit" variant="outline">
          Import
        </Button>
      </form>
    </div>
  );
}
