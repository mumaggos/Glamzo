DO $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'public.leads'::regclass
        AND pg_get_constraintdef(oid) ILIKE '%potencial_fecho%'
    LOOP
        EXECUTE 'ALTER TABLE public.leads DROP CONSTRAINT ' || quote_ident(rec.conname);
    END LOOP;
END
$$;
