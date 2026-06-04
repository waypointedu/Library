import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';
import { ShoppingCart, Loader2 } from "lucide-react";

export default function ProductModal({ product, onClose, onAddToCart }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const productId = product?.id || product?.sync_product?.id;
  const productName = product?.name || product?.sync_product?.name;

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    base44.functions.invoke('printfulProducts', { action: 'get_product', product_id: productId })
      .then(res => {
        setDetail(res.data?.result);
        if (res.data?.result?.sync_variants?.length > 0) {
          setSelectedVariant(res.data.result.sync_variants[0]);
        }
      })
      .finally(() => setLoading(false));
  }, [productId]);

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    onAddToCart({
      variant_id: selectedVariant.variant_id,
      sync_variant_id: selectedVariant.id,
      name: productName,
      size: selectedVariant.size,
      color: selectedVariant.color,
      price: parseFloat(selectedVariant.retail_price),
      image: selectedVariant.product?.image || detail?.sync_product?.thumbnail_url,
      qty: 1
    });
    onClose();
  };

  // Group variants by color for easier selection
  const variantsByColor = detail?.sync_variants?.reduce((acc, v) => {
    const color = v.color || 'Default';
    if (!acc[color]) acc[color] = [];
    acc[color].push(v);
    return acc;
  }, {}) || {};

  const selectedColor = selectedVariant?.color || Object.keys(variantsByColor)[0];
  const sizesForColor = variantsByColor[selectedColor] || [];

  return (
    <Dialog open={!!product} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#1B2E5E]" />
          </div>
        ) : detail ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-lora">{productName}</DialogTitle>
            </DialogHeader>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="aspect-square rounded-xl overflow-hidden bg-slate-50">
                <img
                  src={selectedVariant?.product?.image || detail.sync_product?.thumbnail_url}
                  alt={productName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-4">
                {selectedVariant && (
                  <p className="text-2xl font-semibold text-[#1B2E5E]">
                    ${parseFloat(selectedVariant.retail_price).toFixed(2)}
                  </p>
                )}

                {/* Color selection */}
                {Object.keys(variantsByColor).length > 1 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Color: <span className="font-normal text-muted-foreground">{selectedColor}</span></p>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(variantsByColor).map(color => (
                        <button
                          key={color}
                          onClick={() => {
                            const firstVariant = variantsByColor[color][0];
                            setSelectedVariant(firstVariant);
                          }}
                          className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                            selectedColor === color
                              ? 'border-[#1B2E5E] bg-[#1B2E5E] text-white'
                              : 'border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size selection */}
                {sizesForColor.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Size</p>
                    <div className="flex flex-wrap gap-2">
                      {sizesForColor.map(variant => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariant(variant)}
                          className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                            selectedVariant?.id === variant.id
                              ? 'border-[#1B2E5E] bg-[#1B2E5E] text-white'
                              : 'border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          {variant.size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  className="w-full bg-[#1B2E5E] hover:bg-[#243b78]"
                  onClick={handleAddToCart}
                  disabled={!selectedVariant}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>

                <p className="text-xs text-muted-foreground">Printed and shipped by Printful. Typical delivery 5–10 business days.</p>
              </div>
            </div>
          </>
        ) : (
          <p className="text-center text-muted-foreground py-8">Failed to load product.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}