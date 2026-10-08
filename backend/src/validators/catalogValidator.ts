import { z, ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const addMedicineSchema = z.object({
  brandName: z.string().trim().min(2, 'Brand name must be at least 2 characters'),
  activeSalt: z.string().trim().min(2, 'Active salt must be at least 2 characters'),
  therapeuticCategory: z.string().trim().min(2, 'Therapeutic category is required').optional(),
  saltStrength: z.string().trim().optional(),
  dosageForm: z.string().trim().optional(),
  brandedMrp: z.number().positive('Branded MRP must be a positive number'),
  lowestGenericPrice: z.number().positive('Generic price must be a positive number').optional(),
  lowestGenericBrand: z.string().trim().optional(),
  genericManufacturer: z.string().trim().optional(),
  bioequivalenceConfidence: z.number().min(0).max(100).optional(),
  cdscoRegulatoryStatus: z.enum(['Approved', 'Under Review', 'Draft']).optional(),
  whoGmpCertified: z.boolean().optional(),
});

export const linkGenericSchema = z.object({
  name: z.string().trim().min(2, 'Generic compound name is required'),
  manufacturer: z.string().trim().min(2, 'Manufacturer name is required'),
  genericStripMrp: z.number().positive('Generic MRP must be a positive number'),
  bioequivalenceScore: z.number().min(0).max(100).optional(),
  similarityFactorF2: z.number().min(0).max(100).optional(),
  batchNumber: z.string().trim().optional(),
  cooCountry: z.string().trim().optional(),
  whoGmpCertified: z.boolean().optional(),
  includedInPatientRx: z.boolean().optional(),
});

export function validateRequest(schema: ZodSchema) {
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
