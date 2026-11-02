"use client";

import { useRouter } from "next/navigation";
import { cloneProduct, updateProduct } from "@/lib/actions/catalog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ProductRow({
  product,
}: {
  product: {
    id: string;
    name: string;
    price: string | null;
    featured: boolean;
    active: boolean;
    images: string[] | null;
  };
}) {
  const router = useRouter();

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="flex items-center gap-3">
        {product.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.images[0]} alt="" className="size-10 rounded object-cover" />
        ) : (
          <div className="size-10 rounded bg-stone-100" />
        )}
        <div>
          <p className="font-medium">{product.name}</p>
          <p className="text-sm text-stone-500">
            {product.price ? `₹${product.price}` : "No price"}
            {product.featured && (
              <Badge className="ml-2" variant="secondary">
                Featured
              </Badge>
            )}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={async () => {
            await updateProduct(product.id, { featured: !product.featured });
            router.refresh();
          }}
        >
          {product.featured ? "Unfeature" : "Feature"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={async () => {
            await cloneProduct(product.id);
            toast.success("Cloned");
            router.refresh();
          }}
        >
          Clone
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={async () => {
            await updateProduct(product.id, { active: !product.active });
            router.refresh();
          }}
        >
          {product.active ? "Hide" : "Show"}
        </Button>
      </div>
    </li>
  );
}
