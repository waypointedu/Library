import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { base44 } from '@/api/base44Client';
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function CheckoutForm({ cart, total, onBack, onSuccess }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', address1: '', city: '', state_code: '', country_code: 'US', zip: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const nameParts = form.name.trim().split(' ');
    const orderData = {
      recipient: {
        name: form.name,
        email: form.email,
        address1: form.address1,
        city: form.city,
        state_code: form.state_code,
        country_code: form.country_code,
        zip: form.zip
      },
      items: cart.map(item => ({
        variant_id: item.variant_id,
        quantity: item.qty
      }))
    };

    const res = await base44.functions.invoke('printfulProducts', {
      action: 'create_order',
      order_data: orderData
    });

    setLoading(false);
    if (res.data?.result) {
      setSubmitted(true);
      setTimeout(onSuccess, 2000);
    } else {
      toast({ title: "Order failed", description: res.data?.error?.message || "Please try again.", variant: "destructive" });
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <CheckCircle className="w-16 h-16 text-green-500" />
        <h3 className="text-xl font-semibold font-lora">Order Placed!</h3>
        <p className="text-muted-foreground text-sm">You'll receive a confirmation email shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <Button type="button" variant="ghost" size="sm" onClick={onBack} className="mb-2 -ml-2">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to cart
      </Button>

      <div className="space-y-1">
        <Label>Full Name</Label>
        <Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Jane Smith" />
      </div>
      <div className="space-y-1">
        <Label>Email</Label>
        <Input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="jane@example.com" />
      </div>
      <div className="space-y-1">
        <Label>Street Address</Label>
        <Input required value={form.address1} onChange={e => setForm({ ...form, address1: e.target.value })} placeholder="123 Main St" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>City</Label>
          <Input required value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label>State</Label>
          <Input required value={form.state_code} onChange={e => setForm({ ...form, state_code: e.target.value })} placeholder="CA" maxLength={2} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>ZIP Code</Label>
          <Input required value={form.zip} onChange={e => setForm({ ...form, zip: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label>Country</Label>
          <Input required value={form.country_code} onChange={e => setForm({ ...form, country_code: e.target.value })} placeholder="US" maxLength={2} />
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground">Subtotal</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm mb-4">
          <span className="text-muted-foreground">Shipping</span>
          <span>Calculated by Printful</span>
        </div>
        <Button type="submit" className="w-full bg-[#1B2E5E] hover:bg-[#243b78]" disabled={loading}>
          {loading ? "Placing Order..." : `Place Order · $${total.toFixed(2)}`}
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-2">Orders are fulfilled and shipped by Printful</p>
      </div>
    </form>
  );
}