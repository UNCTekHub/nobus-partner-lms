# Nobus PartnerCentral

The partner portal for Nobus Cloud Services (Nkponani Limited): one platform for
everything partners do with Nobus Cloud, Africa's Public Cloud.

## Modules

- **Landing & Enrollment**: country-aware public landing page (Nigeria, Kenya, Other
  Countries) with partner signup, NCS Partner Terms acceptance, and admin approval workflow
- **Training Academy**: three role-based tracks (Sales, Presales Engineering, Technical
  Engineering) with a full course player, quizzes, progress tracking and PDF certificates
- **Deal Registration**: active channel protection (protected while the account stays engaged) with duplicate detection and admin review
- **Quote Builder**: customer-ready quotes from the live Nobus pricing catalog with
  exclusive partner pricing, VAT, and branded PDF/XLSX export
- **Sales Navigator**: Kanban pipeline, activity notes and weighted revenue forecasting
- **Marketing Materials & Content Hub**: collateral library with online preview, plus
  whitepapers, datasheets, case studies and FAQs
- **Demo Labs**: guided sandbox scenarios with a slot-based booking calendar
- **Community**: discussion forum, org-scoped leaderboard and gamification
- **Operations Console**: unlisted admin console (`/ncs-console`, super admins only)
  managing organizations, users, deals, quotes, resources, labs, reports and audit logs

## Tech Stack

- **Frontend**: React 18 + Vite, Tailwind CSS, React Router, Lucide icons
- **Backend**: Node.js + Express, better-sqlite3, JWT auth, pdfkit + exceljs exports
- **Deploy**: GitHub Actions to production via SSH, PM2 + Nginx

## Getting Started

```bash
# Backend
cd server && npm install
node seed.js        # seeds demo data; safe on existing databases
node index.js       # http://localhost:3001

# Frontend (separate terminal)
npm install
npm run dev         # http://localhost:5173 (proxies /api to :3001)
```

Set `ADMIN_PASSWORD` in `server/.env` to rotate the seeded super-admin credential.

## Build & Deploy

```bash
npm run build       # production bundle in dist/
```

Pushing to `main` deploys automatically: the workflow pulls on the production server,
reseeds (preserving data), rebuilds the frontend, and restarts the app under PM2.

---

Built for Nobus Cloud Services (Nkponani Limited) | Partner Use Only
