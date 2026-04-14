import { Router } from 'express';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { generateCertificate } from '../services/certificates.js';

const router = Router();

// GET /api/certificates/:pathId — download PDF certificate for a completed path
router.get('/:pathId', authenticate, async (req, res) => {
  const { pathId } = req.params;

  // Verify path is completed
  const completion = db.prepare('SELECT * FROM completed_paths WHERE user_id = ? AND path_id = ?')
    .get(req.user.id, pathId);

  if (!completion) {
    return res.status(403).json({ error: 'You have not completed this learning path' });
  }

  const courseNames = {
    'sales-enablement': 'Sales Enablement Bootcamp',
    'presales-enablement': 'Presales & Solution Selling',
    'technical-enablement': 'Technical Enablement Bootcamp',
  };

  const badgeNames = {
    'sales-enablement': 'Sales Certified',
    'presales-enablement': 'Presales Certified',
    'technical-enablement': 'NCS Associate',
  };

  let org = null;
  if (req.user.org_id) {
    org = db.prepare('SELECT name, partner_id FROM organizations WHERE id = ?').get(req.user.org_id);
  }

  try {
    const pdf = await generateCertificate({
      userName: req.user.name,
      courseName: courseNames[pathId] || pathId,
      completionDate: completion.completed_at,
      partnerId: org?.partner_id,
      badgeName: badgeNames[pathId],
      orgName: org?.name,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=nobus-certificate-${pathId}.pdf`);
    res.send(pdf);
  } catch (err) {
    console.error('Certificate generation error:', err);
    res.status(500).json({ error: 'Failed to generate certificate' });
  }
});

// GET /api/certificates — list all certificates for current user
router.get('/', authenticate, (req, res) => {
  const paths = db.prepare('SELECT path_id, completed_at FROM completed_paths WHERE user_id = ?')
    .all(req.user.id);

  const courseNames = {
    'sales-enablement': 'Sales Enablement Bootcamp',
    'presales-enablement': 'Presales & Solution Selling',
    'technical-enablement': 'Technical Enablement Bootcamp',
  };

  const certs = paths.map(p => ({
    pathId: p.path_id,
    courseName: courseNames[p.path_id] || p.path_id,
    completedAt: p.completed_at,
    downloadUrl: `/api/certificates/${p.path_id}`,
  }));

  res.json(certs);
});

export default router;
