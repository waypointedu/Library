import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const apiKey = Deno.env.get("PRINTFUL_API_KEY");

    const { action, product_id, order_data } = await req.json();

    if (action === "get_products") {
      // First, get the list of stores to find the right store_id
      const storesRes = await fetch("https://api.printful.com/stores", {
        headers: { "Authorization": `Bearer ${apiKey}` }
      });
      const storesData = await storesRes.json();
      const storeId = storesData?.result?.[0]?.id;

      // Fetch sync products using the store_id header
      const headers = { "Authorization": `Bearer ${apiKey}` };
      if (storeId) headers["X-PF-Store-Id"] = String(storeId);

      const res = await fetch("https://api.printful.com/store/products", { headers });
      const data = await res.json();
      return Response.json({ ...data, _debug: { storeId, stores: storesData?.result?.map(s => ({ id: s.id, name: s.name })) } });
    }

    if (action === "get_product") {
      const res = await fetch(`https://api.printful.com/store/products/${product_id}`, {
        headers: { "Authorization": `Bearer ${apiKey}` }
      });
      const data = await res.json();
      return Response.json(data);
    }

    if (action === "create_order") {
      const user = await base44.auth.me();
      if (!user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
      const res = await fetch("https://api.printful.com/orders", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(order_data)
      });
      const data = await res.json();
      return Response.json(data);
    }

    if (action === "estimate_shipping") {
      const res = await fetch("https://api.printful.com/shipping/rates", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(order_data)
      });
      const data = await res.json();
      return Response.json(data);
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});