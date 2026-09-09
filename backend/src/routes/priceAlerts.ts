import { Router, Request, Response } from 'express';
import { db } from '../db';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { PriceAlert } from '../types';

export const priceAlertsRouter = Router();

// GET /api/price-alerts - list price alerts
priceAlertsRouter.get('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const recipient = typeof req.query.recipient === 'string' ? req.query.recipient : undefined;
    const alerts = await db.getPriceAlerts(req.tenantId, recipient);

    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch price alerts' });
  }
});

// POST /api/price-alerts - create new price alert
priceAlertsRouter.post('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const alertData = req.body as Omit<PriceAlert, 'id' | 'createdAt'>;

    if (!alertData.medicineId || !alertData.targetThresholdPrice) {
      res.status(400).json({ success: false, error: 'medicineId and targetThresholdPrice are required' });
      return;
    }

    const created = await db.createPriceAlert(alertData);
    res.status(201).json({
      success: true,
      data: created
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to create price alert' });
  }
});

// PATCH /api/price-alerts/:id - update / pause / resume alert
priceAlertsRouter.patch('/:id', async (req: Request, res: Response) => {
  try {
    const updated = await db.updatePriceAlert(req.params.id, req.body);
    res.json({
      success: true,
      data: updated
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to update price alert' });
  }
});

// DELETE /api/price-alerts/:id - delete alert
priceAlertsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await db.deletePriceAlert(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Price alert not found' });
      return;
    }

    res.json({
      success: true,
      message: `Price alert ${req.params.id} deleted successfully`
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to delete price alert' });
  }
});

// POST /api/price-alerts/:id/simulate-drop - simulate price drop event
priceAlertsRouter.post('/:id/simulate-drop', async (req: Request, res: Response) => {
  try {
    const { simulatedPrice } = req.body;
    if (simulatedPrice === undefined || typeof simulatedPrice !== 'number') {
      res.status(400).json({ success: false, error: 'simulatedPrice must be a valid number' });
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
    res.status(400).json({ success: false, error: err.message || 'Failed to simulate price drop' });
  }
});
