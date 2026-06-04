import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from '@/components/store/ProductCard';
import ProductModal from '@/components/store/ProductModal';
import CartDrawer from '@/components/store/CartDrawer';
import PublicHeader from '@/components/common/PublicHeader';

export default function Store() {
  const [lang] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('lang') || localStorage.getItem('waypoint_lang') || 'en';
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    base44.functions.invoke('printfulProducts', { action: 'get_products' })
      .then(res => {
        if (res.data?.result) {
          setProducts(res.data.result);
        } else {
          setError("No products found. Make sure your Printful store has products.");
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.variant_id === item.variant_id);
      if (existing) {
        return prev.map(i => i.variant_id === item.variant_id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, item];
    });
    setCartOpen(true);
  };

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader lang={lang} />

      <div className="pt-16">
        {/* Hero */}
        <div className="bg-[#1B2E5E] text-white py-16 px-4 text-center">
          <h1 className="text-4xl font-lora font-light mb-3">Waypoint Store</h1>
          <p className="text-white/80 max-w-xl mx-auto">
            Support our mission with Waypoint-branded merchandise. Every purchase helps fund tuition-free education.
          </p>
        </div>

        {/* Sticky cart button */}
        <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex justify-end max-w-7xl mx-auto">
          <Button
            variant="outline"
            className="relative"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#1B2E5E] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Button>
        </div>

        {/* Products grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-[#1B2E5E]" />
            </div>
          ) : error ? (
            <div className="text-center py-24 text-muted-foreground">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewProduct={setSelectedProduct}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
        />
      )}

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onUpdateCart={setCart}
      />
    </div>
  );
}