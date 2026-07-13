DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pg_class' AND column_name='fake_column_xyz') THEN
        CREATE INDEX idx_fake ON pg_class (fake_column_xyz);
    END IF;
END $$;
