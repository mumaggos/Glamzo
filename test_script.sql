DO $$
DECLARE
    index_queries text[] := ARRAY[
        'CREATE INDEX IF NOT EXISTS idx_businesses_city ON public.businesses (city);',
        'CREATE INDEX IF NOT EXISTS idx_businesses_fakecol ON public.businesses (fakecol);'
    ];
    q text;
    tbl text;
    col text;
    col_exists boolean;
BEGIN
    FOR q IN SELECT unnest(index_queries) LOOP
        tbl := substring(q from 'ON public\.([a-zA-Z0-9_]+)');
        col := substring(q from '\(([a-zA-Z0-9_]+)\)');
        
        RAISE NOTICE 'Table: %, Column: %', tbl, col;
    END LOOP;
END $$;
