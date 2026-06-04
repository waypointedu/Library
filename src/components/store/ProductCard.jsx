import React from 'react';
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

export default function ProductCard({ product, onViewProduct }) {
  const image = product.thumbnail_url || product.sync_product?.thumbnail_url;
  const name = product.name || product.sync_product?.name;

  return (
    <div
      className="group bg-white rounded-xl overflow-hidden border border-slate-100 hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={() => onViewProduct(product)}
    >
      <div className="aspect-square overflow-hidden bg-slate-50">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <ShoppingCart className="w-12 h-12" />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-slate-900 text-sm leading-tight">{name}</h3>
        <div className="flex items-center justify-between mt-2">
          <Button size="sm" className="text-xs bg-[#1B2E5E] hover:bg-[#243b78]">
            View Options
          </Button>
        </div>
      </div>
    </div>
  );
}