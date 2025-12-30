-- ============================================
-- Admin Payment Module - NeonDB Tables
-- Run this in NeonDB SQL Editor
-- SAFE: Only creates NEW tables, no modifications to existing tables
-- ============================================

-- Create Enums
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

CREATE TYPE "RefundType" AS ENUM ('FULL', 'PARTIAL');

CREATE TYPE "RefundMethod" AS ENUM (
    'ORIGINAL_METHOD',
    'BANK_TRANSFER',
    'CREDIT',
    'CASH',
    'OTHER'
);

CREATE TYPE "ReversalStatus" AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED',
    'FAILED',
    'CANCELLED'
);

CREATE TYPE "ReversalType" AS ENUM (
    'APPOINTMENT_CANCELLATION',
    'DUPLICATE_PAYMENT',
    'SYSTEM_ERROR',
    'FRAUD',
    'CHARGEBACK',
    'INCOMPLETE_TRANSACTION',
    'OTHER'
);

CREATE TYPE "MemberType" AS ENUM (
    'PATIENT',
    'DOCTOR',
    'HOSPITAL',
    'AGENT',
    'CORPORATE'
);

CREATE TYPE "TopUpStatus" AS ENUM (
    'PENDING',
    'PENDING_APPROVAL',
    'APPROVED',
    'REJECTED',
    'COMPLETED',
    'FAILED',
    'CANCELLED'
);

CREATE TYPE "TopUpMethod" AS ENUM (
    'BANK_TRANSFER',
    'CASH',
    'CREDIT_CARD',
    'DEBIT_CARD',
    'CHEQUE',
    'INTERNAL_ADJUSTMENT'
);

CREATE TYPE "ReconciliationStatus" AS ENUM (
    'IN_PROGRESS',
    'COMPLETED',
    'COMPLETED_WITH_DISCREPANCIES',
    'FAILED'
);

-- ============================================
-- Table 1: Admin Payment Audit Log
-- ============================================
CREATE TABLE "admin_payment_audit_logs" (
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

    CONSTRAINT "admin_payment_audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "admin_payment_audit_logs_paymentId_idx" ON "admin_payment_audit_logs"("paymentId");
CREATE INDEX "admin_payment_audit_logs_performedById_idx" ON "admin_payment_audit_logs"("performedById");
CREATE INDEX "admin_payment_audit_logs_actionType_idx" ON "admin_payment_audit_logs"("actionType");
CREATE INDEX "admin_payment_audit_logs_createdAt_idx" ON "admin_payment_audit_logs"("createdAt");
CREATE UNIQUE INDEX "admin_payment_audit_logs_idempotencyKey_key" ON "admin_payment_audit_logs"("idempotencyKey");

-- ============================================
-- Table 2: Admin Refund Request
-- ============================================
CREATE TABLE "admin_refund_requests" (
    "id" TEXT NOT NULL,
    "requestNumber" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "originalTransactionId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "memberId" TEXT,
    "memberType" TEXT,
    "originalAmount" DECIMAL(10,2) NOT NULL,
    "refundAmount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT DEFAULT 'LKR',
    "refundType" "RefundType" NOT NULL DEFAULT 'FULL',
    "refundMethod" "RefundMethod" NOT NULL DEFAULT 'ORIGINAL_METHOD',
    "status" "RefundStatus" NOT NULL DEFAULT 'REQUESTED',
    "reason" TEXT NOT NULL,
    "internalNotes" TEXT,
    "requestedById" TEXT NOT NULL,
    "requestedByEmail" TEXT NOT NULL,
    "approvedById" TEXT,
    "approvedByEmail" TEXT,
    "approvedAt" TIMESTAMP(3),
    "processedById" TEXT,
    "processedByEmail" TEXT,
    "processedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "rejectedById" TEXT,
    "rejectedByEmail" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "gatewayRefundId" TEXT,
    "gatewayResponse" JSONB,
    "idempotencyKey" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_refund_requests_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "admin_refund_requests_requestNumber_key" ON "admin_refund_requests"("requestNumber");
CREATE UNIQUE INDEX "admin_refund_requests_idempotencyKey_key" ON "admin_refund_requests"("idempotencyKey");
CREATE INDEX "admin_refund_requests_paymentId_idx" ON "admin_refund_requests"("paymentId");
CREATE INDEX "admin_refund_requests_status_idx" ON "admin_refund_requests"("status");
CREATE INDEX "admin_refund_requests_requestedById_idx" ON "admin_refund_requests"("requestedById");
CREATE INDEX "admin_refund_requests_memberId_idx" ON "admin_refund_requests"("memberId");
CREATE INDEX "admin_refund_requests_createdAt_idx" ON "admin_refund_requests"("createdAt");

-- ============================================
-- Table 3: Admin Reversal Request
-- ============================================
CREATE TABLE "admin_reversal_requests" (
    "id" TEXT NOT NULL,
    "requestNumber" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "originalTransactionId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "memberId" TEXT,
    "memberType" TEXT,
    "originalAmount" DECIMAL(10,2) NOT NULL,
    "reversalType" "ReversalType" NOT NULL,
    "status" "ReversalStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT NOT NULL,
    "internalNotes" TEXT,
    "autoDetected" BOOLEAN NOT NULL DEFAULT false,
    "detectionSource" TEXT,
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

    CONSTRAINT "admin_reversal_requests_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "admin_reversal_requests_requestNumber_key" ON "admin_reversal_requests"("requestNumber");
CREATE UNIQUE INDEX "admin_reversal_requests_idempotencyKey_key" ON "admin_reversal_requests"("idempotencyKey");
CREATE INDEX "admin_reversal_requests_paymentId_idx" ON "admin_reversal_requests"("paymentId");
CREATE INDEX "admin_reversal_requests_status_idx" ON "admin_reversal_requests"("status");
CREATE INDEX "admin_reversal_requests_requestedById_idx" ON "admin_reversal_requests"("requestedById");
CREATE INDEX "admin_reversal_requests_memberId_idx" ON "admin_reversal_requests"("memberId");
CREATE INDEX "admin_reversal_requests_autoDetected_idx" ON "admin_reversal_requests"("autoDetected");
CREATE INDEX "admin_reversal_requests_createdAt_idx" ON "admin_reversal_requests"("createdAt");

-- ============================================
-- Table 4: Admin Member Top Up
-- ============================================
CREATE TABLE "admin_member_topups" (
    "id" TEXT NOT NULL,
    "topUpNumber" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "memberType" "MemberType" NOT NULL,
    "memberEmail" TEXT,
    "memberName" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT DEFAULT 'LKR',
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

    CONSTRAINT "admin_member_topups_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "admin_member_topups_topUpNumber_key" ON "admin_member_topups"("topUpNumber");
CREATE UNIQUE INDEX "admin_member_topups_idempotencyKey_key" ON "admin_member_topups"("idempotencyKey");
CREATE INDEX "admin_member_topups_memberId_idx" ON "admin_member_topups"("memberId");
CREATE INDEX "admin_member_topups_status_idx" ON "admin_member_topups"("status");
CREATE INDEX "admin_member_topups_createdAt_idx" ON "admin_member_topups"("createdAt");

-- ============================================
-- Table 5: Admin Member Payment Option
-- ============================================
CREATE TABLE "admin_member_payment_options" (
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

    CONSTRAINT "admin_member_payment_options_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "admin_member_payment_options_member_method_key" ON "admin_member_payment_options"("memberId", "memberType", "paymentMethod");
CREATE INDEX "admin_member_payment_options_memberId_idx" ON "admin_member_payment_options"("memberId");

-- ============================================
-- Table 6: Admin Payment Reconciliation
-- ============================================
CREATE TABLE "admin_payment_reconciliations" (
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

    CONSTRAINT "admin_payment_reconciliations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "admin_payment_reconciliations_number_key" ON "admin_payment_reconciliations"("reconciliationNumber");
CREATE INDEX "admin_payment_reconciliations_status_idx" ON "admin_payment_reconciliations"("status");
CREATE INDEX "admin_payment_reconciliations_date_idx" ON "admin_payment_reconciliations"("reconciliationDate");
CREATE INDEX "admin_payment_reconciliations_performedById_idx" ON "admin_payment_reconciliations"("performedById");

-- ============================================
-- Done!
-- ============================================
SELECT 'All 6 admin payment tables created successfully!' as result;
