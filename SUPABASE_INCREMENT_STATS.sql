-- Run this in your Supabase SQL Editor to enable view & QR scan counting!

-- 1. Ensure the columns exist
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS page_views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS qr_scans_count INTEGER DEFAULT 0;

-- 2. Create the increment function (SECURITY DEFINER allows anonymous visits to count)
CREATE OR REPLACE FUNCTION increment_store_stats(store_id uuid, stat_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF stat_type = 'page_views' THEN
    UPDATE businesses
    SET page_views = COALESCE(page_views, 0) + 1
    WHERE id = store_id;
  ELSIF stat_type = 'qr_scans_count' THEN
    UPDATE businesses
    SET qr_scans_count = COALESCE(qr_scans_count, 0) + 1
    WHERE id = store_id;
  END IF;
END;
$$;
