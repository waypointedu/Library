import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { base44 } from '@/api/base44Client';
import CheckoutForm from './CheckoutForm';

export default function CartDrawer({ open, onClose, cart, onUpdateCart }) {
  const [checkingOut, setCheckingOut] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const updateQty = (variantId, delta) => {
    onUpdateCart(cart.map(item =>
      item.variant_id === variantId
        ? { ...item, qty: Math.max(0, item.qty + delta) }
        : item
    ).filter(item => item.qty > 0));
  };

  const removeItem = (variantId) => {
    onUpdateCart(cart.filter(item => item.variant_id !== variantId));
  };

  if (checkingOut) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Checkout</SheetTitle>
          </SheetHeader>
          <CheckoutForm
            cart={cart}
            total={total}
            onBack={() => setCheckingOut(false)}
            onSuccess={() => { onUpdateCart([]); setCheckingOut(false); onClose(); }}
          />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" /> Your Cart
          </SheetTitle>
        </SheetHeader>
        {cart.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Your cart is empty
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              {cart.map(item => (
                <div key={item.variant_id} className="flex gap-3 items-center">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.size} / {item.color}</p>
                    <p className="text-sm font-semibold text-[#1B2E5E]">${(item.price * item.qty).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQty(item.variant_id, -1)}>
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-5 text-center text-sm">{item.qty}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQty(item.variant_id, 1)}>
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeItem(item.variant_id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <Button className="w-full bg-[#1B2E5E] hover:bg-[#243b78]" onClick={() => setCheckingOut(true)}>
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}