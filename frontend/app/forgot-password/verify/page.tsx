import { AuthLayout } from "@/components/auth/AuthLayout"
import { VerifyOTPForm } from "@/components/auth/VerifyOTPForm"

export default function VerifyOTPPage() {
  return (
    <AuthLayout>
      <VerifyOTPForm />
    </AuthLayout>
  )
}
