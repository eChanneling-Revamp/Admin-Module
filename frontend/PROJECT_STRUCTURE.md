# eChannelling Admin Dashboard - Project Structure Guide

## Overview
This project is organized using a **feature-based architecture** to make it easy for teams to work on different modules independently.

## Directory Structure

### 1. `app/` - Next.js App Router
Contains all pages and API routes. Organized by feature groups using route groups `(featureName)`.

\`\`\`
app/
├── (auth)/                    # Authentication feature
│   ├── login/page.tsx
│   ├── forgot-password/
│   │   ├── page.tsx
│   │   ├── verify/page.tsx
│   │   └── reset/page.tsx
│   └── layout.tsx
│
├── (dashboard)/               # Dashboard feature group
│   ├── layout.tsx             # Shared layout for all dashboard pages
│   ├── page.tsx               # Main dashboard
│   ├── branches/
│   │   ├── page.tsx           # Branches list
│   │   └── [id]/page.tsx      # Branch detail
│   ├── invoices/
│   │   ├── page.tsx           # Invoices list
│   │   ├── generate/page.tsx  # Generate invoice
│   │   └── [id]/page.tsx      # Invoice detail
│   └── dashboard/
│       └── page.tsx           # Dashboard home
│
├── api/                       # Backend API routes
│   ├── auth/
│   │   └── login/route.ts
│   ├── branches/
│   │   ├── route.ts           # GET all, POST create
│   │   └── [id]/route.ts      # GET one, PUT update, DELETE
│   └── invoices/
│       ├── route.ts
│       └── [id]/route.ts
│
├── layout.tsx                 # Root layout
├── page.tsx                   # Home page
└── globals.css                # Global styles
\`\`\`

**Why this structure?**
- Route groups `(auth)` and `(dashboard)` don't affect the URL
- Keeps related pages together
- Easy to add new features

---

### 2. `features/` - Feature Modules
Each feature has its own folder with components, services, types, and hooks.

\`\`\`
features/
├── auth/
│   ├── components/
│   │   ├── LoginForm.tsx
│   │   ├── ForgotPasswordForm.tsx
│   │   ├── VerifyOTPForm.tsx
│   │   ├── ResetPasswordForm.tsx
│   │   ├── InputField.tsx
│   │   └── AuthLayout.tsx
│   ├── services/
│   │   └── authService.ts     # API calls for auth
│   ├── types/
│   │   └── auth.ts            # Auth-related types
│   └── hooks/
│       └── useAuth.ts          # Custom auth hooks
│
├── branches/
│   ├── components/
│   │   └── BranchModal.tsx
│   ├── services/
│   │   └── branchService.ts
│   ├── types/
│   │   └── branch.ts
│   └── hooks/
│       └── useBranches.ts
│
├── invoices/
│   ├── components/
│   │   ├── InvoiceForm.tsx
│   │   ├── InvoiceTable.tsx
│   │   └── InvoiceDetail.tsx
│   ├── services/
│   │   └── invoiceService.ts
│   ├── types/
│   │   └── invoice.ts
│   └── hooks/
│       └── useInvoices.ts
│
└── dashboard/
    ├── components/
    │   ├── StatsCard.tsx
    │   ├── BarChart.tsx
    │   ├── PieChart.tsx
    │   └── NotificationPanel.tsx
    ├── services/
    │   └── dashboardService.ts
    ├── types/
    │   └── dashboard.ts
    └── hooks/
        └── useDashboard.ts
\`\`\`

**What goes in each folder?**
- **components/** - React components specific to this feature
- **services/** - API calls and business logic
- **types/** - TypeScript interfaces and types
- **hooks/** - Custom React hooks for this feature

---

### 3. `shared/` - Shared Code
Code used across multiple features.

\`\`\`
shared/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   └── ProtectedLayout.tsx
│   └── ui/                    # shadcn/ui components
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       └── ... (all UI components)
├── contexts/
│   └── AuthContext.tsx        # Global auth state
├── hooks/
│   ├── use-mobile.ts
│   └── use-toast.ts
├── utils/
│   └── utils.ts
└── types/
    └── common.ts              # Shared types
\`\`\`

---

## How to Add a New Feature

### Example: Adding a "Doctors" Module

**Step 1:** Create folder structure
\`\`\`
features/doctors/
├── components/
│   └── DoctorModal.tsx
├── services/
│   └── doctorService.ts
├── types/
│   └── doctor.ts
└── hooks/
    └── useDoctors.ts
\`\`\`

**Step 2:** Create pages in `app/`
\`\`\`
app/(dashboard)/doctors/
├── page.tsx           # List page
└── [id]/page.tsx      # Detail page
\`\`\`

**Step 3:** Create API routes
\`\`\`
app/api/doctors/
├── route.ts           # GET all, POST create
└── [id]/route.ts      # GET one, PUT update, DELETE
\`\`\`

**Step 4:** Import and use
\`\`\`typescript
// In app/(dashboard)/doctors/page.tsx
import { DoctorModal } from '@/features/doctors/components/DoctorModal'
import { useDoctors } from '@/features/doctors/hooks/useDoctors'
\`\`\`

---

## Import Paths

Use absolute imports for clarity:

\`\`\`typescript
// ✅ Good
import { LoginForm } from '@/features/auth/components/LoginForm'
import { authService } from '@/features/auth/services/authService'
import { Branch } from '@/features/branches/types/branch'

// ❌ Avoid
import { LoginForm } from '../../../features/auth/components/LoginForm'
\`\`\`

---

## File Naming Conventions

- **Components:** PascalCase (e.g., `LoginForm.tsx`)
- **Services:** camelCase (e.g., `authService.ts`)
- **Types:** camelCase (e.g., `branch.ts`)
- **Hooks:** camelCase with `use` prefix (e.g., `useBranches.ts`)
- **Pages:** lowercase (e.g., `page.tsx`)
- **API routes:** lowercase (e.g., `route.ts`)

---

## Feature Development Checklist

When adding a new feature, follow this checklist:

- [ ] Create feature folder in `features/`
- [ ] Create `components/` subfolder with UI components
- [ ] Create `services/` subfolder with API calls
- [ ] Create `types/` subfolder with TypeScript types
- [ ] Create `hooks/` subfolder with custom hooks
- [ ] Create pages in `app/(dashboard)/featureName/`
- [ ] Create API routes in `app/api/featureName/`
- [ ] Update Sidebar navigation if needed
- [ ] Add documentation in feature README (optional)

---

## Team Collaboration Tips

1. **Assign by Feature** - Each team member works on one feature
2. **Avoid Conflicts** - Features are isolated, minimal merge conflicts
3. **Consistent Patterns** - Follow the same structure for all features
4. **Easy Onboarding** - New team members can quickly understand the structure
5. **Scalable** - Easy to add new features without affecting existing code

---

## Example: How Auth Feature Works

\`\`\`
User visits /login
  ↓
app/(auth)/login/page.tsx loads
  ↓
Imports LoginForm from features/auth/components/LoginForm.tsx
  ↓
LoginForm uses authService from features/auth/services/authService.ts
  ↓
authService calls /api/auth/login
  ↓
API route processes and returns token
  ↓
Token stored in AuthContext (shared/contexts/AuthContext.tsx)
  ↓
User redirected to dashboard
\`\`\`

---

## Current File Mapping

### Auth Feature
- Pages: `app/(auth)/login/`, `app/(auth)/forgot-password/`
- Components: `features/auth/components/`
- Services: `features/auth/services/authService.ts`
- Types: `features/auth/types/auth.ts`
- API: `app/api/auth/`

### Branches Feature
- Pages: `app/(dashboard)/branches/`
- Components: `features/branches/components/`
- Services: `features/branches/services/branchService.ts`
- Types: `features/branches/types/branch.ts`
- API: `app/api/branches/`

### Invoices Feature
- Pages: `app/(dashboard)/invoices/`
- Components: `features/invoices/components/`
- Services: `features/invoices/services/invoiceService.ts`
- Types: `features/invoices/types/invoice.ts`
- API: `app/api/invoices/`

### Dashboard Feature
- Pages: `app/(dashboard)/dashboard/`
- Components: `features/dashboard/components/`
- Services: `features/dashboard/services/dashboardService.ts`
- Types: `features/dashboard/types/dashboard.ts`

---

## Questions?

If you have questions about the structure or need help adding a new feature, refer to this guide or check existing features as examples.
