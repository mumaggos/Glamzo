ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_customer_id_fkey;
ALTER TABLE messages ADD CONSTRAINT messages_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES profiles(id);
