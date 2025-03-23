import * as z from "zod";

// Login form schema
export const loginSchema = z.object({
  email: z.string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  password: z.string()
    .min(1, { message: "Password is required" })
    .min(6, { message: "Password must be at least 6 characters" }),
  rememberMe: z.boolean().optional().default(false)
});

// Signup form schema
export const signupSchema = z.object({
  name: z.string()
    .min(1, { message: "Name is required" })
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name must be less than 50 characters" }),
  email: z.string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  password: z.string()
    .min(1, { message: "Password is required" })
    .min(6, { message: "Password must be at least 6 characters" })
    .max(72, { message: "Password must be less than 72 characters" }),
  confirmPassword: z.string()
    .min(1, { message: "Please confirm your password" }),
  acceptTerms: z.boolean()
    .refine(val => val === true, { 
      message: "You must accept the terms and privacy policy" 
    })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

// Password reset schema
export const resetPasswordSchema = z.object({
  email: z.string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" })
});

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, { message: "Current password is required" }),
  newPassword: z.string()
    .min(1, { message: "New password is required" })
    .min(6, { message: "Password must be at least 6 characters" })
    .max(72, { message: "Password must be less than 72 characters" }),
  confirmPassword: z.string()
    .min(1, { message: "Please confirm your new password" })
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

// Update profile schema
export const updateProfileSchema = z.object({
  displayName: z.string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name must be less than 50 characters" })
    .optional(),
  photoURL: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
  language: z.enum(["en", "vi"]).optional(),
  theme: z.enum(["light", "dark", "system"]).optional()
});

// Types for form data
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;