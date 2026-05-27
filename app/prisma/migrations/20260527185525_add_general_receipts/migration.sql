-- CreateTable
CREATE TABLE "general_receipts" (
    "id" SERIAL NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "receivedFromName" TEXT NOT NULL,
    "receivedFromPhone" TEXT,
    "receivedFromPan" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CASH',
    "paymentReference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "general_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "general_receipts_receiptNumber_key" ON "general_receipts"("receiptNumber");
