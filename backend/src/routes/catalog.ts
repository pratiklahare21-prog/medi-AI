import { Router, Request, Response } from 'express';
import { db } from '../db';
import { optionalAuth, requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { MedicineCatalogEntry, LinkedGenericCompound, UserRole } from '../types';

export const catalogRouter = Router();

const CLINICAL_OPS_ROLES: UserRole[] = ['Lead Ops Admin', 'Clinical Pharmacist', 'Formulary Director'];

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
    const msg = err?.message || 'Failed to fetch catalog';
    res.status(500).json({ success: false, message: msg, error: msg });
  }
});

// POST /api/catalog - add new medicine entry (requires auth & clinical role)
catalogRouter.post('/', requireAuth, requireRole(CLINICAL_OPS_ROLES), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const body = req.body as MedicineCatalogEntry;
    if (!body.brandName || !body.activeSalt) {
      res.status(400).json({
        success: false,
        message: 'brandName and activeSalt are required',
        error: 'brandName and activeSalt are required'
      });
      return;
    }

    const created = await db.addCatalogItem(body, req.tenantId);
    res.status(201).json({
      success: true,
      message: 'Medicine entry added successfully',
      data: created
    });
  } catch (err: any) {
    const msg = err?.message || 'Failed to add medicine';
    res.status(400).json({ success: false, message: msg, error: msg });
  }
});

// GET /api/catalog/:id/generics - get generics list for a specific medicine
catalogRouter.get('/:id/generics', async (req: Request, res: Response) => {
  try {
    const med = await db.getCatalogItem(req.params.id);
    if (!med) {
      const msg = 'Medicine not found';
      res.status(404).json({ success: false, message: msg, error: msg });
      return;
    }

    res.json({
      success: true,
      medicineId: med.id,
      medicineName: med.brandName,
      data: med.genericsList || []
    });
  } catch (err: any) {
    const msg = err?.message || 'Failed to fetch generics';
    res.status(500).json({ success: false, message: msg, error: msg });
  }
});

// POST /api/catalog/:id/generics - link new generic compound (requires auth & clinical role)
catalogRouter.post('/:id/generics', requireAuth, requireRole(CLINICAL_OPS_ROLES), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const medId = req.params.id;
    const generic = req.body as LinkedGenericCompound;

    if (!generic.name || generic.genericStripMrp === undefined) {
      const msg = 'Generic name and MRP are required';
      res.status(400).json({ success: false, message: msg, error: msg });
      return;
    }

    const updatedMed = await db.linkGeneric(medId, generic, req.tenantId);
    res.status(201).json({
      success: true,
      message: 'Generic compound linked successfully',
      data: updatedMed
    });
  } catch (err: any) {
    const msg = err?.message || 'Failed to link generic';
    res.status(400).json({ success: false, message: msg, error: msg });
  }
});

// PATCH /api/catalog/:medId/generics/:genId - toggle generic formulary status (requires auth & clinical role)
catalogRouter.patch('/:medId/generics/:genId', requireAuth, requireRole(CLINICAL_OPS_ROLES), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { medId, genId } = req.params;
    const updated = await db.toggleGenericInRx(medId, genId);

    res.json({
      success: true,
      message: 'Formulary status updated',
      data: updated
    });
  } catch (err: any) {
    const msg = err?.message || 'Failed to toggle generic formulary status';
    res.status(400).json({ success: false, message: msg, error: msg });
  }
});
