CREATE OR REPLACE FUNCTION public.complete_booking_and_reward(booking_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking RECORD;
  v_points_to_award INT;
  v_existing_points UUID;
BEGIN
  -- 1. Get the booking
  SELECT * INTO v_booking FROM public.bookings WHERE id = booking_id_param;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reserva não encontrada';
  END IF;

  -- 2. Update booking status
  UPDATE public.bookings
  SET 
    booking_status = 'completed',
    business_completed = true,
    client_completed = true
  WHERE id = booking_id_param;

  -- 3. Check if points already awarded
  SELECT id INTO v_existing_points FROM public.points_history WHERE booking_id = booking_id_param LIMIT 1;
  IF v_existing_points IS NOT NULL THEN
    RETURN;
  END IF;

  -- 4. Calculate points (Stripe/Online = 50, otherwise = 0 for local)
  IF v_booking.payment_method = 'in_store' OR v_booking.payment_method = 'local' OR v_booking.payment_method = 'dinheiro' THEN
    v_points_to_award := 0;
  ELSIF v_booking.payment_method = 'stripe' OR v_booking.payment_method = 'online' THEN
    v_points_to_award := 50;
  ELSE
    v_points_to_award := 0;
  END IF;

  IF v_points_to_award > 0 THEN
    -- 5. Insert history
    INSERT INTO public.points_history (user_id, points, description, booking_id)
    VALUES (v_booking.customer_id, v_points_to_award, 'Pontos por concluir reserva', booking_id_param);

    -- 6. Update user's total points
    UPDATE public.profiles
    SET glamzo_points = COALESCE(glamzo_points, 0) + v_points_to_award
    WHERE id = v_booking.customer_id;
  END IF;
END;
$$;
