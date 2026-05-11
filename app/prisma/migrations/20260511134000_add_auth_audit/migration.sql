-- AlterTable
ALTER TABLE "audit_logs" DROP COLUMN "created_by",
ADD COLUMN     "internal_user_id" INTEGER;

-- CreateTable
CREATE TABLE "internal_users" (
    "id" SERIAL NOT NULL,
    "userid" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "internal_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "internal_users_userid_key" ON "internal_users"("userid");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_internal_user_id_fkey" FOREIGN KEY ("internal_user_id") REFERENCES "internal_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Update the audit log trigger to use the new column
CREATE OR REPLACE FUNCTION process_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    internal_user_id_val INT;
BEGIN
    BEGIN
        internal_user_id_val := current_setting('school_app.internal_user_id', true)::INT;
    EXCEPTION WHEN OTHERS THEN
        internal_user_id_val := NULL;
    END;

    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, action, changed_data, internal_user_id)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(NEW)::jsonb, internal_user_id_val);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, action, changed_data, internal_user_id)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(NEW)::jsonb, internal_user_id_val);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, action, changed_data, internal_user_id)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD)::jsonb, internal_user_id_val);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
