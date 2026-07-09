CREATE OR REPLACE FUNCTION get_dashboard_stats(p_business_id UUID, p_start_date DATE, p_end_date DATE)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_revenue NUMERIC;
  v_bookings_count BIGINT;
  v_pending_count BIGINT;
  v_top_service TEXT;
BEGIN
  -- Total Revenue & Counts
  SELECT 
    COALESCE(SUM(total_price), 0),
    COUNT(*),
    SUM(CASE WHEN booking_status = 'pending' THEN 1 ELSE 0 END)
  INTO 
    v_revenue, 
    v_bookings_count,
    v_pending_count
  FROM bookings
  WHERE business_id = p_business_id
    AND booking_status != 'cancelled'
    AND booking_date >= p_start_date
    AND booking_date <= p_end_date;

  -- Top Service
  SELECT s.name INTO v_top_service
  FROM bookings b
  JOIN services s ON b.service_id = s.id
  WHERE b.business_id = p_business_id
    AND b.booking_status != 'cancelled'
    AND b.booking_date >= p_start_date
    AND b.booking_date <= p_end_date
  GROUP BY s.name
  ORDER BY SUM(b.total_price) DESC
  LIMIT 1;

  RETURN json_build_object(
    'revenue', v_revenue,
    'total_bookings', v_bookings_count,
    'pending_bookings', v_pending_count,
    'top_service', v_top_service
  );
END;
$$;
