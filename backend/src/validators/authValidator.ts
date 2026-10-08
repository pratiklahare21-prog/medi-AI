import { z, ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';
import type { UserRole } from '../types';

export const PASSWORD_REQUIREMENTS =
  'Password must be at least 8 characters and include one uppercase letter, one lowercase letter, one number, and one special character.';

const allowedRoles: readonly UserRole[] = [
  'Lead Ops Admin',
  'Clinical Pharmacist',
  'Prescribing Physician',
  'Formulary Director',
  'Patient / Consumer',
] as const;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name is too long (max 100 characters)'),
    email: z
      .string()
      .trim()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password is too long (max 128 characters)')
      .regex(/[a-z]/, 'Password must include at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
      .regex(/[0-9]/, 'Password must include at least one number')
      .regex(
        /[^A-Za-z0-9]/,
        'Password must include at least one special character (e.g. !@#$%^&*)'
      ),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
    role: z
      .enum(['Lead Ops Admin', 'Clinical Pharmacist', 'Prescribing Physician', 'Formulary Director', 'Patient / Consumer'])
      .optional(),
    title: z
      .string()
      .trim()
      .max(100, 'Title is too long')
      .optional()
      .or(z.literal('')),
    licenseNumber: z
      .string()
      .trim()
      .max(50, 'License number is too long')
      .optional()
      .or(z.literal('')),
    department: z
      .string()
      .trim()
      .max(100, 'Department is too long')
      .optional()
      .or(z.literal('')),
    phone: z
      .string()
      .trim()
      .max(30, 'Phone number is too long')
      .optional()
      .or(z.literal('')),
    tenantId: z
      .string()
      .trim()
      .max(50, 'Tenant ID is too long')
      .optional()
      .or(z.literal('')),
    tenantName: z
      .string()
      .trim()
      .max(100, 'Tenant name is too long')
      .optional()
      .or(z.literal('')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join('.') || 'body';
        if (!fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: fieldErrors,
      });
      return;
    }
    req.body = result.data;
    next();
  };
}
