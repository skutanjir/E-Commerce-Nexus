-- Allow sellers to view order items for their products
CREATE POLICY "Sellers can view order items for their products." 
ON public.order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.products 
    WHERE public.products.id = order_items.product_id AND public.products.seller_id = auth.uid()
  )
);

-- Allow sellers to view orders that contain their products
CREATE POLICY "Sellers can view orders containing their products." 
ON public.orders FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.order_items
    JOIN public.products ON public.order_items.product_id = public.products.id
    WHERE public.order_items.order_id = public.orders.id AND public.products.seller_id = auth.uid()
  )
);
