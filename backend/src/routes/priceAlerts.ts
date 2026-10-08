import { Router, Response } from 'express';
import { db } from '../db';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { PriceAlert } from '../types';

export const priceAlertsRouter = Router();

// GET /api/price-alerts - list price alerts (requires auth)
priceAlertsRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const recipient = typeof req.query.recipient === 'string' ? req.query.recipient : undefined;
    const alerts = await db.getPriceAlerts(req.tenantId, recipient);

    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (err: any) {
    const msg = err?.message || 'Failed to fetch price alerts';
    res.status(500).json({ success: false, message: msg, error: msg });
  }
});

// POST /api/price-alerts - create new price alert (requires auth)
priceAlertsRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const alertData = req.body as Omit<PriceAlert, 'id' | 'createdAt'>;

    if (!alertData.medicineId || alertData.targetThresholdPrice === undefined) {
      const msg = 'medicineId and targetThresholdPrice are required';
      res.status(400).json({ success: false, message: msg, error: msg });
      return;
    }

    const created = await db.createPriceAlert(alertData);
    res.status(201).json({
      success: true,
      message: 'Price alert created successfully',
      data: created
    });
  } catch (err: any) {
    const msg = err?.message || 'Failed to create price alert';
    res.status(400).json({ success: false, message: msg, error: msg });
  }
});

// PATCH /api/price-alerts/:id - update / pause / resume alert (requires auth)
priceAlertsRouter.patch('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await db.updatePriceAlert(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Price alert updated',
      data: updated
    });
  } catch (err: any) {
    const msg = err?.message || 'Failed to update price alert';
    res.status(400).json({ success: false, message: msg, error: msg });
  }
});

// DELETE /api/price-alerts/:id - delete alert (requires auth)
priceAlertsRouter.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deleted = await db.deletePriceAlert(req.params.id);
    if (!deleted) {
      const msg = 'Price alert not found';
      res.status(404).json({ success: false, message: msg, error: msg });
      return;
    }

    res.json({
      success: true,
      message: `Price alert ${req.params.id} deleted successfully`
    });
  } catch (err: any) {
    const msg = err?.message || 'Failed to delete price alert';
    res.status(400).json({ success: false, message: msg, error: msg });
  }
});

// POST /api/price-alerts/:id/simulate-drop - simulate price drop event (requires auth)
priceAlertsRouter.post('/:id/simulate-drop', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { simulatedPrice } = req.body;
    if (simulatedPrice === undefined || typeof simulatedPrice !== 'number') {
      const msg = 'simulatedPrice must be a valid number';
      res.status(400).json({ success: false, message: msg, error: msg });
      return;
    }

    const result = await db.simulatePriceDrop(req.params.id, simulatedPrice);
    res.json({
      success: true,
      message: `Price alert triggered for simulated generic price ₹${simulatedPrice}`,
      data: result.alert,
      catalogUpdated: result.catalogUpdated
    });
  } catch (err: any) {
    const msg = err?.message || 'Failed to simulate price drop';
    res.status(400).json({ success: false, message: msg, error: msg });
  }
});
