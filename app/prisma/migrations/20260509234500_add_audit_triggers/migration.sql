CREATE OR REPLACE FUNCTION process_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    user_email TEXT;
BEGIN
    BEGIN
        user_email := current_setting('school_app.user_email', true);
    EXCEPTION WHEN OTHERS THEN
        user_email := 'SYSTEM';
    END;

    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, action, changed_data, created_by)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(NEW)::jsonb, user_email);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, action, changed_data, created_by)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(NEW)::jsonb, user_email);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, action, changed_data, created_by)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD)::jsonb, user_email);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for the tables you want to audit
CREATE TRIGGER students_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON students
FOR EACH ROW EXECUTE FUNCTION process_audit_log();

CREATE TRIGGER staff_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON staff
FOR EACH ROW EXECUTE FUNCTION process_audit_log();