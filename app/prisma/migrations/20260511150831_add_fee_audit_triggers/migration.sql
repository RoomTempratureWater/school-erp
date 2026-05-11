-- Add triggers for fee management tables
CREATE TRIGGER fee_categories_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON fee_categories
FOR EACH ROW EXECUTE FUNCTION process_audit_log();

CREATE TRIGGER student_fees_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON student_fees
FOR EACH ROW EXECUTE FUNCTION process_audit_log();

CREATE TRIGGER payment_transactions_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON payment_transactions
FOR EACH ROW EXECUTE FUNCTION process_audit_log();

CREATE TRIGGER academic_years_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON academic_years
FOR EACH ROW EXECUTE FUNCTION process_audit_log();