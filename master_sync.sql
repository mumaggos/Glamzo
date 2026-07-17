-- 1. Create Views for missing tables requested by the codebase
CREATE OR REPLACE VIEW public.notifications AS 
SELECT * FROM public.glamzo_notifications;

CREATE OR REPLACE VIEW public.hardware_orders AS 
SELECT * FROM public.tablet_orders;

-- 2. Create missing tables that are attempted to be modified
CREATE TABLE IF NOT EXISTS public.listings_rating (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID,
  rating NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Update the RPC functions to correctly use original_service_price
CREATE OR REPLACE FUNCTION public.get_dashboard_stats(p_business_id uuid, p_start_date date, p_end_date date)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_revenue NUMERIC;
  v_bookings_count BIGINT;
  v_pending_count BIGINT;
  v_top_service TEXT;
BEGIN
  -- Resumo de Receitas e Contagem
  SELECT 
    COALESCE(SUM(COALESCE(original_service_price, total_price)), 0),
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

  -- Obter Top Service
  SELECT s.name INTO v_top_service
  FROM bookings b
  JOIN services s ON b.service_id = s.id
  WHERE b.business_id = p_business_id
    AND b.booking_status != 'cancelled'
    AND b.booking_date >= p_start_date
    AND b.booking_date <= p_end_date
  GROUP BY s.name
  ORDER BY SUM(COALESCE(b.original_service_price, b.total_price)) DESC
  LIMIT 1;

  RETURN json_build_object(
    'revenue', v_revenue,
    'total_bookings', v_bookings_count,
    'pending_bookings', v_pending_count,
    'top_service', v_top_service,
    'average_ticket', CASE WHEN v_bookings_count > 0 THEN ROUND(v_revenue / v_bookings_count, 2) ELSE 0 END
  );
END;
$function$;


CREATE OR REPLACE FUNCTION public.get_staff_performance(p_business_id uuid, p_start_date date, p_end_date date)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_agg(row_to_json(t)) INTO v_result
  FROM (
    SELECT 
      s.id AS staff_id,
      s.full_name,
      s.role_title,
      COUNT(b.id) AS total_bookings,
      COALESCE(SUM(COALESCE(b.original_service_price, b.total_price)), 0) AS total_revenue
    FROM staff s
    LEFT JOIN bookings b ON s.id = b.staff_id 
       AND b.booking_status = 'completed' 
       AND b.booking_date >= p_start_date 
       AND b.booking_date <= p_end_date
    WHERE s.business_id = p_business_id
    GROUP BY s.id, s.full_name, s.role_title
    ORDER BY total_revenue DESC
  ) t;
  
  RETURN COALESCE(v_result, '[]'::json);
END;
$function$;

-- 4. Update the RPC function to correctly handle rewards points
CREATE OR REPLACE FUNCTION public.complete_booking_and_reward(booking_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_booking RECORD;
  v_points_to_award INT;
  v_existing_points UUID;
BEGIN
  -- 1. Obter reserva
  SELECT * INTO v_booking FROM public.bookings WHERE id = booking_id_param;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reserva não encontrada';
  END IF;

  -- 2. Marcar como concluída para todos
  UPDATE public.bookings
  SET 
    booking_status = 'completed',
    business_completed = true,
    client_completed = true
  WHERE id = booking_id_param;

  -- 3. Verificar se os pontos já foram dados para esta reserva
  SELECT id INTO v_existing_points FROM public.points_history WHERE booking_id = booking_id_param LIMIT 1;
  IF v_existing_points IS NOT NULL THEN
    RETURN;
  END IF;

  -- 4. Definir pontos consoante o método de pagamento
  IF v_booking.payment_method = 'in_store' OR v_booking.payment_method = 'local' OR v_booking.payment_method = 'dinheiro' THEN
    v_points_to_award := 0;
  ELSIF v_booking.payment_method = 'stripe' OR v_booking.payment_method = 'online' THEN
    v_points_to_award := 50;
  ELSE
    v_points_to_award := 0;
  END IF;

  IF v_points_to_award > 0 THEN
    -- 5. Inserir no histórico
    INSERT INTO public.points_history (user_id, points, description, booking_id)
    VALUES (v_booking.customer_id, v_points_to_award, 'Pontos por concluir reserva', booking_id_param);

    -- 6. Adicionar ao saldo geral de pontos do perfil do cliente
    UPDATE public.profiles
    SET glamzo_points = COALESCE(glamzo_points, 0) + v_points_to_award
    WHERE id = v_booking.customer_id;
  END IF;
END;
$function$;

-- 5. Create missing RPC get_schema_info
CREATE OR REPLACE FUNCTION public.get_schema_info()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN json_build_object('status', 'ok');
END;
$$;
