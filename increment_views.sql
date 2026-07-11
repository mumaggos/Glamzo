CREATE OR REPLACE FUNCTION increment_page_views(store_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE businesses
  SET page_views = COALESCE(page_views, 0) + 1
  WHERE id = store_id;
END;
$$;
