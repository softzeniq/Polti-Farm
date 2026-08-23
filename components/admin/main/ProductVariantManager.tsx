import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ProductVariant,
  useCreateVariant,
  useDeleteVariant,
  useProductVariants,
  useUpdateVariant,
} from "@/hooks/useVariants";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface ProductVariantManagerProps {
  productId: string;
  productName: string;
}

export function ProductVariantManager({
  productId,
  productName,
}: ProductVariantManagerProps) {
  const { data: variants = [] } = useProductVariants(productId);
  const createVariant = useCreateVariant();
  const updateVariant = useUpdateVariant();
  const deleteVariant = useDeleteVariant();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(
    null,
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkData, setBulkData] = useState<Record<string, { price: string; sale_price: string; stock: string }>>({});

  const [formData, setFormData] = useState({
    size: "",
    color: "",
    fabric: "",
    sku: "",
    variant_price: "",
    variant_sale_price: "",
    stock: "0",
  });

  const handleEdit = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setFormData({
      size: variant.size || "",
      color: variant.color || "",
      fabric: variant.fabric || "",
      sku: variant.sku,
      variant_price: variant.variant_price?.toString() || "",
      variant_sale_price: (variant as any).variant_sale_price?.toString() || "",
      stock: variant.stock.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const sizesList = formData.size ? formData.size.split(",").map(s => s.trim()).filter(Boolean) : [];
    if (!formData.variant_price.trim() && !(sizesList.length > 1 && !editingVariant)) {
      alert("Price is required");
      return;
    }

    const variantData = {
      size: formData.size || null,
      color: formData.color || null,
      fabric: formData.fabric || null,
      sku: formData.sku || `VAR-${Date.now()}`,
      variant_price: parseFloat(formData.variant_price) || 0,
      variant_sale_price: formData.variant_sale_price
        ? parseFloat(formData.variant_sale_price)
        : null,
      price_adjustment: 0,
      stock: parseInt(formData.stock) || 0,
      is_active: true,
    };

    try {
      if (editingVariant) {
        await updateVariant.mutateAsync({
          id: editingVariant.id,
          ...variantData,
        });
      } else {
        const sizes = formData.size ? formData.size.split(",").map(s => s.trim()).filter(Boolean) : [null];
        const baseSku = formData.sku || `VAR-${Date.now()}`;
        
        for (let i = 0; i < sizes.length; i++) {
          const s = sizes[i];
          const specificData = (s && bulkData[s]) ? bulkData[s] : null;

          await createVariant.mutateAsync({
            product_id: productId,
            ...variantData,
            size: s,
            sku: sizes.length > 1 && s ? `${baseSku}-${s.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}` : baseSku,
            variant_price: specificData && specificData.price ? parseFloat(specificData.price) : variantData.variant_price,
            variant_sale_price: specificData && specificData.sale_price ? parseFloat(specificData.sale_price) : variantData.variant_sale_price,
            stock: specificData && specificData.stock ? parseInt(specificData.stock) : variantData.stock,
          } as any);
          
          if (sizes.length > 1) await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      setIsDialogOpen(false);
      setEditingVariant(null);
      resetForm();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const resetForm = () => {
    setFormData({
      size: "",
      color: "",
      fabric: "",
      sku: "",
      variant_price: "",
      variant_sale_price: "",
      stock: "0",
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteVariant.mutateAsync({ id: deleteId, productId });
    setDeleteId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Variants</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingVariant(null);
                resetForm();
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Variant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingVariant ? "Edit Variant" : "Add New Variant"} -{" "}
                {productName}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Age & Quantity (Optional) — {editingVariant ? "select" : "tap multiple to create separate variants"}
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {["0-3 Days Old", "7 Days Old", "15 Days Old", "1 Month Old"].map((sizeOpt) => {
                    const selectedSizes = formData.size
                      ? formData.size
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean)
                      : [];
                    const isSelected = selectedSizes.includes(sizeOpt);
                    return (
                      <button
                        key={sizeOpt}
                        type="button"
                        onClick={() => {
                          if (editingVariant) {
                            setFormData({
                              ...formData,
                              size: sizeOpt,
                            });
                          } else {
                            let updated: string[];
                            if (isSelected) {
                              updated = selectedSizes.filter((s) => s !== sizeOpt);
                            } else {
                              updated = [...selectedSizes, sizeOpt];
                            }
                            setFormData({
                              ...formData,
                              size: updated.join(", "),
                            });
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          isSelected
                            ? "border-accent bg-accent text-accent-foreground"
                            : "border-border hover:border-accent/50"
                        }`}
                      >
                        {sizeOpt}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  value={formData.size}
                  onChange={(e) =>
                    setFormData({ ...formData, size: e.target.value })
                  }
                  placeholder="e.g., 0-3 Days Old, 7 Days Old"
                  className="input-shop"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Breed / Category (Optional)
                </label>
                <input
                  type="text"
                  value={formData.fabric}
                  onChange={(e) =>
                    setFormData({ ...formData, fabric: e.target.value })
                  }
                  placeholder="e.g., Sonali, Broiler, Deshi"
                  className="input-shop"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Gender (Optional) — tap multiple to combine
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {[
                    "Male",
                    "Female",
                    "Both",
                    "Straight Run"
                  ].map((color) => {
                    const selectedColors = formData.color
                      ? formData.color
                          .split(", ")
                          .map((c) => c.trim())
                          .filter(Boolean)
                      : [];
                    const isSelected = selectedColors.includes(color);
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          let updated: string[];
                          if (isSelected) {
                            updated = selectedColors.filter((c) => c !== color);
                          } else {
                            updated = [...selectedColors, color];
                          }
                          setFormData({
                            ...formData,
                            color: updated.join(", "),
                          });
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          isSelected
                            ? "border-accent bg-accent text-accent-foreground"
                            : "border-border hover:border-accent/50"
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  placeholder="Or type custom gender (comma-separated)"
                  className="input-shop"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  SKU (Optional)
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                  placeholder="Auto-generated if empty"
                  className="input-shop"
                />
              </div>

              {!editingVariant && formData.size.split(",").filter(s => s.trim()).length > 1 ? (
                <div className="space-y-4 border border-border/80 p-4 rounded-xl bg-muted/10">
                  <h4 className="text-sm font-bold text-accent">Prices & Stock per Age/Quantity</h4>
                  {formData.size.split(",").map(s => s.trim()).filter(Boolean).map(s => (
                    <div key={s} className="grid grid-cols-3 gap-2 items-end pb-3 border-b border-border/40 last:border-0 last:pb-0">
                      <div>
                        <label className="block text-[11px] font-bold mb-1">{s} - Reg Price *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={bulkData[s]?.price || ""}
                          onChange={(e) => setBulkData(prev => ({ ...prev, [s]: { ...prev[s], price: e.target.value, stock: prev[s]?.stock || "0" } }))}
                          className="input-shop text-xs py-1.5 px-2 h-8"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold mb-1">Sale Price</label>
                        <input
                          type="number"
                          step="0.01"
                          value={bulkData[s]?.sale_price || ""}
                          onChange={(e) => setBulkData(prev => ({ ...prev, [s]: { ...prev[s], sale_price: e.target.value, stock: prev[s]?.stock || "0" } }))}
                          className="input-shop text-xs py-1.5 px-2 h-8"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold mb-1">Stock *</label>
                        <input
                          type="number"
                          value={bulkData[s]?.stock || "0"}
                          onChange={(e) => setBulkData(prev => ({ ...prev, [s]: { ...prev[s], stock: e.target.value } }))}
                          className="input-shop text-xs py-1.5 px-2 h-8"
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Regular Price *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.variant_price}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            variant_price: e.target.value,
                          })
                        }
                        placeholder="e.g., 399.00"
                        className="input-shop"
                        required={!(!editingVariant && formData.size.split(",").filter(s => s.trim()).length > 1)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Sale Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.variant_sale_price}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            variant_sale_price: e.target.value,
                          })
                        }
                        placeholder="e.g., 299.00"
                        className="input-shop"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Stock *
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({ ...formData, stock: e.target.value })
                      }
                      className="input-shop"
                      required={!(!editingVariant && formData.size.split(",").filter(s => s.trim()).length > 1)}
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="btn-accent flex-1">
                  {editingVariant ? "Update" : "Create"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {variants.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No variants yet. Add one to allow customers to choose options.
        </p>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Age & Qty</th>
                  <th className="px-4 py-3 text-left font-medium">Gender</th>
                  <th className="px-4 py-3 text-left font-medium">Breed</th>
                  <th className="px-4 py-3 text-left font-medium">SKU</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Regular Price
                  </th>
                  <th className="px-4 py-3 text-left font-medium">
                    Sale Price
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Stock</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {variants.map((variant) => (
                  <tr key={variant.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">{variant.size || "-"}</td>
                    <td className="px-4 py-3">{variant.color || "-"}</td>
                    <td className="px-4 py-3">{variant.fabric || "-"}</td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {variant.sku}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {variant.variant_price != null
                        ? variant.variant_price.toFixed(2)
                        : "-"}
                    </td>
                    <td className="px-4 py-3 font-medium text-accent">
                      {(variant as any).variant_sale_price != null
                        ? (variant as any).variant_sale_price.toFixed(2)
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          variant.stock > 0
                            ? "text-success"
                            : "text-destructive"
                        }
                      >
                        {variant.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(variant)}
                          className="text-accent hover:text-accent/80 transition"
                          title="Edit variant"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(variant.id)}
                          className="text-destructive hover:text-destructive/80 transition"
                          title="Delete variant"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Variant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this variant? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
