import { z } from 'zod';

export const createPriceAlertSchema = z.object({
  medicineId: z.string().min(1, 'Medicine ID is required'),
  medicineName: z.string().min(1, 'Medicine name is required'),
  activeSalt: z.string().optional(),
  currentMarketPrice: z.number().positive('Current market price must be positive'),
  targetThresholdPrice: z.number().positive('Target threshold price must be positive'),
  recipientTarget: z.string().min(1, 'Recipient is required'),
  channel: z.enum(['Email', 'SMS', 'WhatsApp', 'Push Notification']).optional(),
  frequency: z.enum(['Instant', 'Daily Digest', 'Weekly Summary']).optional(),
  status: z.enum(['Active', 'Paused', 'Triggered']).optional(),
});

export const updatePriceAlertSchema = z.object({
  targetThresholdPrice: z.number().positive('Target threshold price must be positive').optional(),
  recipientTarget: z.string().min(1).optional(),
  channel: z.enum(['Email', 'SMS', 'WhatsApp', 'Push Notification']).optional(),
  frequency: z.enum(['Instant', 'Daily Digest', 'Weekly Summary']).optional(),
  status: z.enum(['Active', 'Paused', 'Triggered']).optional(),
});

export const simulateDropSchema = z.object({
  simulatedPrice: z.number().positive('Simulated price must be a positive number'),
});
