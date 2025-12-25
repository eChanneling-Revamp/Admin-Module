export interface PasswordValidation {
  minLength: boolean
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumber: boolean
  hasSpecial: boolean
}

export const validatePassword = (password: string): PasswordValidation => {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }
}

export const getPasswordStrength = (validation: PasswordValidation): "weak" | "medium" | "strong" => {
  const score = Object.values(validation).filter(Boolean).length
  if (score <= 2) return "weak"
  if (score <= 4) return "medium"
  return "strong"
}

export const isPasswordValid = (validation: PasswordValidation): boolean => {
  return Object.values(validation).every(Boolean)
}
