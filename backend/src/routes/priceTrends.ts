import { Router, Request, Response } from 'express';
import { MEDICINE_PRICE_HISTORIES, MEDICINE_VOLATILITY_SUMMARIES } from '../data/priceTrendsData';

export const priceTrendsRouter = Router();

// GET /api/price-trends - get volatility summaries
priceTrendsRouter.get('/', (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: MEDICINE_VOLATILITY_SUMMARIES
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch volatility summaries' });
  }
});

// GET /api/price-trends/:medId - get price trend points for a specific medicine
priceTrendsRouter.get('/:medId', (req: Request, res: Response) => {
  try {
    const medId = req.params.medId;
    const history = MEDICINE_PRICE_HISTORIES[medId];

    if (!history) {
      // Fallback to med-01 if specific history not present
      const fallback = MEDICINE_PRICE_HISTORIES['med-01'] || [];
      res.json({
        success: true,
        medicineId: medId,
        isFallback: true,
        data: fallback
      });
      return;
    }

    res.json({
      success: true,
      medicineId: medId,
      data: history
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch price trend history' });
  }
});
