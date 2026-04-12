# Nobus Cloud Partner LMS

Learning Management System for Nobus Cloud Partner Sales and Technical/Presales Enablement.

## Features

- **Two Learning Paths**: Sales Enablement Bootcamp & Technical Enablement Bootcamp
- **Interactive Quizzes**: Module-end assessments with instant feedback
- **Progress Tracking**: localStorage-based progress persistence
- **Certification Path**: Three-level partner competency framework
- **Responsive Design**: Mobile-first, works on all devices
- **Nobus Branded**: Custom color scheme matching Nobus Cloud identity

## Learning Paths

### Partner Module 1: Sales Enablement Bootcamp
- 2 Days (16 Hours) | 6 Sessions | 6 Quizzes
- Covers: Nobus overview, sales process, competitive positioning, proposals, PoC strategy, objection handling

### Partner Module 2: Technical Enablement Bootcamp
- 3 Days (24 Hours) | 12 Modules | 12 Quizzes
- Covers: Platform architecture, FCS, FBS/FOS, networking, security, containers/K8s, backup/DR, hands-on labs, migration, monitoring, objection handling, certification

## Tech Stack

- **React 18** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons
- **localStorage** for progress persistence

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
  components/     # Reusable UI components
  context/        # React context for state management
  data/           # Course curriculum data
  pages/          # Page components
  assets/         # Static assets
  index.css       # Global styles + Tailwind
  App.jsx         # Root component with routing
  main.jsx        # Entry point
```

## Deployment

Build the project and deploy the `dist/` folder to any static hosting:

```bash
npm run build
```

Compatible with: Vercel, Netlify, GitHub Pages, Cloudflare Pages, or any static file server.

---

Built for Nobus Cloud Services (Nkponani Limited) | Partner Use Only
