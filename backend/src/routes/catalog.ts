import { Router, Request, Response } from 'express';
import { db } from '../db';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { MedicineCatalogEntry, LinkedGenericCompound } from '../types';

export const catalogRouter = Router();

// GET /api/catalog - list medicine catalog entries
catalogRouter.get('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
    let items = await db.getCatalog(req.tenantId);

    if (search) {
      items = items.filter(
        m =>
          m.brandName.toLowerCase().includes(search) ||
          m.activeSalt.toLowerCase().includes(search) ||
          m.therapeuticCategory.toLowerCase().includes(search) ||
          (m.genericsList && m.genericsList.some(g => g.name.toLowerCase().includes(search)))
      );
    }

    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch catalog' });
  }
});

// POST /api/catalog - add new medicine entry
catalogRouter.post('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const body = req.body as MedicineCatalogEntry;
    if (!body.brandName || !body.activeSalt) {
      res.status(400).json({ success: false, error: 'brandName and activeSalt are required' });
      return;
    }

    const created = await db.addCatalogItem(body, req.tenantId);
    res.status(201).json({
      success: true,
      data: created
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to add medicine' });
  }
});

// GET /api/catalog/:id/generics - get generics list for a specific medicine
catalogRouter.get('/:id/generics', async (req: Request, res: Response) => {
  try {
    const med = await db.getCatalogItem(req.params.id);
    if (!med) {
      res.status(404).json({ success: false, error: 'Medicine not found' });
      return;
    }

    res.json({
      success: true,
      medicineId: med.id,
      medicineName: med.brandName,
      data: med.genericsList || []
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch generics' });
  }
});

// POST /api/catalog/:id/generics - link new generic compound
catalogRouter.post('/:id/generics', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const medId = req.params.id;
    const generic = req.body as LinkedGenericCompound;

    if (!generic.name || generic.genericStripMrp === undefined) {
      res.status(400).json({ success: false, error: 'Generic name and MRP are required' });
      return;
    }

    const updatedMed = await db.linkGeneric(medId, generic, req.tenantId);
    res.status(201).json({
      success: true,
      data: updatedMed
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to link generic' });
  }
});

// PATCH /api/catalog/:medId/generics/:genId - toggle generic formulary status
catalogRouter.patch('/:medId/generics/:genId', async (req: Request, res: Response) => {
  try {
    const { medId, genId } = req.params;
    const updated = await db.toggleGenericInRx(medId, genId);

    res.json({
      success: true,
      data: updated
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to toggle generic formulary status' });
  }
});
