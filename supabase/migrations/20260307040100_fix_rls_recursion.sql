-- 1. Drop the problematic policies that caused the error
DROP POLICY IF EXISTS "Sellers can view orders containing their products." ON public.orders;
DROP POLICY IF EXISTS "Sellers can view order items for their products." ON public.order_items;

-- 2. Re-apply a safe order_items policy
CREATE POLICY "Sellers can view order items for their products." 
ON public.order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.products 
    WHERE public.products.id = order_items.product_id AND public.products.seller_id = auth.uid()
  )
);

-- 3. Create a helper function to bypass the recursive check
CREATE OR REPLACE FUNCTION public.check_is_seller_of_order(order_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.order_items
    JOIN public.products ON order_items.product_id = products.id
    WHERE order_items.order_id = order_uuid 
    AND products.seller_id = user_uuid
  );
$$;

-- 4. Apply the safe policy to the orders table
CREATE POLICY "Sellers can view orders containing their products." 
ON public.orders FOR SELECT USING (
  check_is_seller_of_order(id, auth.uid())
);
