-- ============================================
-- Admin Payment Module - Database Tables
-- Safe to run: Creates NEW tables only
-- Does NOT modify existing tables
-- ============================================

-- Create Enums (if not exists - PostgreSQL)
DO $$ BEGIN
    CREATE TYPE "AdminPaymentAction" AS ENUM (
        'VIEW_TRANSACTION',
        'SEARCH_TRANSACTIONS',
        'EXPORT_TRANSACTIONS',
        'INITIATE_REFUND',
        'APPROVE_REFUND',
        'REJECT_REFUND',
        'PROCESS_REFUND',
        'COMPLETE_REFUND',
        'INITIATE_REVERSAL',
        'COMPLETE_REVERSAL',
        'TOP_UP_MEMBER',
        'APPROVE_TOP_UP',
        'UPDATE_PAYMENT_OPTIONS',
        'RUN_RECONCILIATION',
        'VIEW_RECONCILIATION',
        'GENERATE_REPORT',
        'VIEW_AUDIT_LOG'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "RefundStatus" AS ENUM (
        'REQUESTED',
        'PENDING_APPROVAL',
        'APPROVED',
        'REJECTED',
        'PROCESSING',
        'PROCESSED',
        'COMPLETED',
        'FAILED',
        'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "RefundType" AS ENUM ('FULL', 'PARTIAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "RefundMethod" AS ENUM (
        'ORIGINAL_METHOD',
        'BANK_TRANSFER',
        'CREDIT',
        'CASH',
        'OTHER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ReversalStatus" AS ENUM (
        'PENDING',
        'IN_PROGRESS',
        'COMPLETED',
        'FAILED',
        'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ReversalType" AS ENUM (
        'APPOINTMENT_CANCELLATION',
        'DUPLICATE_PAYMENT',
        'SYSTEM_ERROR',
        'FRAUD',
        'CHARGEBACK',
        'INCOMPLETE_TRANSACTION',
        'OTHER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "MemberType" AS ENUM (
        'PATIENT',
        'DOCTOR',
        'HOSPITAL',
        'AGENT',
        'CORPORATE'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "TopUpStatus" AS ENUM (
        'PENDING',
        'PENDING_APPROVAL',
        'APPROVED',
        'REJECTED',
        'COMPLETED',
        'FAILED',
        'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "TopUpMethod" AS ENUM (
        'BANK_TRANSFER',
        'CASH',
        'CREDIT_CARD',
        'DEBIT_CARD',
        'CHEQUE',
        'INTERNAL_ADJUSTMENT'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ReconciliationStatus" AS ENUM (
        'IN_PROGRESS',
        'COMPLETED',
        'COMPLETED_WITH_DISCREPANCIES',
        'FAILED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- Table 1: Admin Payment Audit Log
-- ============================================
CREATE TABLE IF NOT EXISTS "AdminPaymentAuditLog" (
    "id" TEXT NOT NULL,
    "actionType" "AdminPaymentAction" NOT NULL,
    "paymentId" TEXT,
    "refundRequestId" TEXT,
    "reversalRequestId" TEXT,
    "topUpId" TEXT,
    "performedById" TEXT NOT NULL,
    "performedByEmail" TEXT NOT NULL,
    "performedByRole" TEXT NOT NULL,
    "previousState" JSONB,
    "newState" JSONB,
    "amount" DECIMAL(10,2),
    "currency" TEXT DEFAULT 'LKR',
    "reason" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminPaymentAuditLog_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- Table 2: Admin Refund Request
-- ============================================
CREATE TABLE IF NOT EXISTS "AdminRefundRequest" (
    "id" TEXT NOT NULL,
    "requestNumber" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "originalTransactionId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "memberId" TEXT,
    "memberType" TEXT,
    "originalAmount" DECIMAL(10,2) NOT NULL,
    "refundAmount" DECIMAL(10,2) NOT NULL,
    "refundType" "RefundType" NOT NULL DEFAULT 'FULL',
    "refundMethod" "RefundMethod" NOT NULL DEFAULT 'ORIGINAL_METHOD',
    "reason" TEXT NOT NULL,
    "internalNotes" TEXT,
    "status" "RefundStatus" NOT NULL DEFAULT 'REQUESTED',
    "requestedById" TEXT NOT NULL,
    "requestedByEmail" TEXT NOT NULL,
    "approvedById" TEXT,
    "approvedByEmail" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedById" TEXT,
    "rejectedByEmail" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "processedById" TEXT,
    "processedByEmail" TEXT,
    "processedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "gatewayRefundId" TEXT,
    "gatewayResponse" JSONB,
    "idempotencyKey" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminRefundRequest_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- Table 3: Admin Reversal Request
-- ============================================
CREATE TABLE IF NOT EXISTS "AdminReversalRequest" (
    "id" TEXT NOT NULL,
    "requestNumber" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "originalTransactionId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "memberId" TEXT,
    "memberType" TEXT,
    "originalAmount" DECIMAL(10,2) NOT NULL,
    "reversalType" "ReversalType" NOT NULL,
    "reason" TEXT NOT NULL,
    "internalNotes" TEXT,
    "status" "ReversalStatus" NOT NULL DEFAULT 'PENDING',
    "requestedById" TEXT NOT NULL,
    "requestedByEmail" TEXT NOT NULL,
    "processedById" TEXT,
    "processedByEmail" TEXT,
    "processedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "gatewayReversalId" TEXT,
    "gatewayResponse" JSONB,
    "idempotencyKey" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminReversalRequest_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- Table 4: Admin Member Top Up
-- ============================================
CREATE TABLE IF NOT EXISTS "AdminMemberTopUp" (
    "id" TEXT NOT NULL,
    "topUpNumber" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "memberType" "MemberType" NOT NULL,
    "memberEmail" TEXT,
    "memberName" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "previousBalance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "newBalance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "topUpMethod" "TopUpMethod" NOT NULL,
    "paymentReference" TEXT,
    "reason" TEXT NOT NULL,
    "internalNotes" TEXT,
    "status" "TopUpStatus" NOT NULL DEFAULT 'PENDING',
    "processedById" TEXT NOT NULL,
    "processedByEmail" TEXT NOT NULL,
    "approvedById" TEXT,
    "approvedByEmail" TEXT,
    "approvedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "idempotencyKey" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminMemberTopUp_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- Table 5: Admin Member Payment Option
-- ============================================
CREATE TABLE IF NOT EXISTS "AdminMemberPaymentOption" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "memberType" "MemberType" NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "maxTransactionLimit" DECIMAL(10,2),
    "dailyLimit" DECIMAL(10,2),
    "monthlyLimit" DECIMAL(10,2),
    "restrictions" JSONB,
    "configuredById" TEXT,
    "configuredByEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminMemberPaymentOption_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- Table 6: Admin Payment Reconciliation
-- ============================================
CREATE TABLE IF NOT EXISTS "AdminPaymentReconciliation" (
    "id" TEXT NOT NULL,
    "reconciliationNumber" TEXT NOT NULL,
    "reconciliationDate" TIMESTAMP(3) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalTransactions" INTEGER NOT NULL DEFAULT 0,
    "matchedTransactions" INTEGER NOT NULL DEFAULT 0,
    "mismatchedTransactions" INTEGER NOT NULL DEFAULT 0,
    "incompleteTransactions" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "matchedAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "mismatchedAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" "ReconciliationStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "summary" JSONB,
    "discrepancies" JSONB,
    "performedById" TEXT NOT NULL,
    "performedByEmail" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminPaymentReconciliation_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- Create Indexes
-- ============================================

-- Audit Log Indexes
CREATE INDEX IF NOT EXISTS "AdminPaymentAuditLog_paymentId_idx" ON "AdminPaymentAuditLog"("paymentId");
CREATE INDEX IF NOT EXISTS "AdminPaymentAuditLog_performedById_idx" ON "AdminPaymentAuditLog"("performedById");
CREATE INDEX IF NOT EXISTS "AdminPaymentAuditLog_actionType_idx" ON "AdminPaymentAuditLog"("actionType");
CREATE INDEX IF NOT EXISTS "AdminPaymentAuditLog_createdAt_idx" ON "AdminPaymentAuditLog"("createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "AdminPaymentAuditLog_idempotencyKey_key" ON "AdminPaymentAuditLog"("idempotencyKey") WHERE "idempotencyKey" IS NOT NULL;

-- Refund Request Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "AdminRefundRequest_requestNumber_key" ON "AdminRefundRequest"("requestNumber");
CREATE INDEX IF NOT EXISTS "AdminRefundRequest_paymentId_idx" ON "AdminRefundRequest"("paymentId");
CREATE INDEX IF NOT EXISTS "AdminRefundRequest_status_idx" ON "AdminRefundRequest"("status");
CREATE INDEX IF NOT EXISTS "AdminRefundRequest_requestedById_idx" ON "AdminRefundRequest"("requestedById");
CREATE INDEX IF NOT EXISTS "AdminRefundRequest_createdAt_idx" ON "AdminRefundRequest"("createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "AdminRefundRequest_idempotencyKey_key" ON "AdminRefundRequest"("idempotencyKey") WHERE "idempotencyKey" IS NOT NULL;

-- Reversal Request Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "AdminReversalRequest_requestNumber_key" ON "AdminReversalRequest"("requestNumber");
CREATE INDEX IF NOT EXISTS "AdminReversalRequest_paymentId_idx" ON "AdminReversalRequest"("paymentId");
CREATE INDEX IF NOT EXISTS "AdminReversalRequest_status_idx" ON "AdminReversalRequest"("status");
CREATE INDEX IF NOT EXISTS "AdminReversalRequest_requestedById_idx" ON "AdminReversalRequest"("requestedById");
CREATE INDEX IF NOT EXISTS "AdminReversalRequest_createdAt_idx" ON "AdminReversalRequest"("createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "AdminReversalRequest_idempotencyKey_key" ON "AdminReversalRequest"("idempotencyKey") WHERE "idempotencyKey" IS NOT NULL;

-- Top Up Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "AdminMemberTopUp_topUpNumber_key" ON "AdminMemberTopUp"("topUpNumber");
CREATE INDEX IF NOT EXISTS "AdminMemberTopUp_memberId_idx" ON "AdminMemberTopUp"("memberId");
CREATE INDEX IF NOT EXISTS "AdminMemberTopUp_status_idx" ON "AdminMemberTopUp"("status");
CREATE INDEX IF NOT EXISTS "AdminMemberTopUp_createdAt_idx" ON "AdminMemberTopUp"("createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "AdminMemberTopUp_idempotencyKey_key" ON "AdminMemberTopUp"("idempotencyKey") WHERE "idempotencyKey" IS NOT NULL;

-- Payment Option Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "AdminMemberPaymentOption_memberId_memberType_paymentMethod_key" ON "AdminMemberPaymentOption"("memberId", "memberType", "paymentMethod");
CREATE INDEX IF NOT EXISTS "AdminMemberPaymentOption_memberId_idx" ON "AdminMemberPaymentOption"("memberId");

-- Reconciliation Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "AdminPaymentReconciliation_reconciliationNumber_key" ON "AdminPaymentReconciliation"("reconciliationNumber");
CREATE INDEX IF NOT EXISTS "AdminPaymentReconciliation_status_idx" ON "AdminPaymentReconciliation"("status");
CREATE INDEX IF NOT EXISTS "AdminPaymentReconciliation_reconciliationDate_idx" ON "AdminPaymentReconciliation"("reconciliationDate");
CREATE INDEX IF NOT EXISTS "AdminPaymentReconciliation_performedById_idx" ON "AdminPaymentReconciliation"("performedById");

-- ============================================
-- Add indexes to existing Payment table (SAFE)
-- ============================================
CREATE INDEX IF NOT EXISTS "Payment_transactionId_idx" ON "Payment"("transactionId");
CREATE INDEX IF NOT EXISTS "Payment_status_idx" ON "Payment"("status");
CREATE INDEX IF NOT EXISTS "Payment_createdAt_idx" ON "Payment"("createdAt");

-- ============================================
-- Add Foreign Key Constraints
-- ============================================
ALTER TABLE "AdminRefundRequest" 
    DROP CONSTRAINT IF EXISTS "AdminRefundRequest_paymentId_fkey";
ALTER TABLE "AdminRefundRequest" 
    ADD CONSTRAINT "AdminRefundRequest_paymentId_fkey" 
    FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AdminReversalRequest" 
    DROP CONSTRAINT IF EXISTS "AdminReversalRequest_paymentId_fkey";
ALTER TABLE "AdminReversalRequest" 
    ADD CONSTRAINT "AdminReversalRequest_paymentId_fkey" 
    FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================
-- Done! All tables created successfully
-- ============================================
SELECT 'Admin Payment tables created successfully!' as message;
