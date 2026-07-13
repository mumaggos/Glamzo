CREATE POLICY "Admins can do everything" ON public.support_messages 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
