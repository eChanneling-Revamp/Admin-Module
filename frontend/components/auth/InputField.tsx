"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface InputFieldProps {
  id: string
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  required?: boolean
  disabled?: boolean
  maxLength?: number
}

export function InputField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  maxLength,
}: InputFieldProps) {
  return (
    <div className="space-y-2">
      <Label 
        htmlFor={id} 
        className="text-sm font-semibold text-gray-700 flex items-center gap-1"
      >
        {label}
        {required && <span className="text-cyan-500 ml-0.5">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        className={cn(
          "w-full h-12 px-4 text-base rounded-xl border-2 transition-all duration-300",
          "bg-gray-50/50 text-gray-900 placeholder:text-gray-400",
          "focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100",
          "hover:border-cyan-300 hover:bg-white",
          error && "border-red-400 focus:border-red-500 focus:ring-red-100 bg-red-50/30",
          disabled && "bg-gray-100 cursor-not-allowed opacity-60"
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <div className="flex items-center gap-1.5 mt-1.5 p-2 rounded-lg bg-red-50 border border-red-100">
          <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p id={`${id}-error`} className="text-sm text-red-600 font-medium" role="alert">
            {error}
          </p>
        </div>
      )}
    </div>
  )
}
