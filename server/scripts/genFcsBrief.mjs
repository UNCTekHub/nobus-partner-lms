// Generates the branded "FCS Compute Solution Brief" PDF into
// public/marketing/fcs-compute-solution-brief.pdf. Content flows continuously
// across pages (no forced blank gap). Re-run after editing:
//   cd server && node scripts/genFcsBrief.mjs
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, '..', '..', 'public');
const LOGO = path.join(PUBLIC, 'nobus-logo.png');
const OUT_DIR = path.join(PUBLIC, 'marketing');
const OUT = path.join(OUT_DIR, 'fcs-compute-solution-brief.pdf');
fs.mkdirSync(OUT_DIR, { recursive: true });

const NAVY = '#0a1229';
const BLUE = '#2e6bff';
const GREY = '#475569';
const LIGHT = '#eef4ff';

const doc = new PDFDocument({ size: 'A4', margin: 44, bufferPages: true });
doc.pipe(fs.createWriteStream(OUT));

const left = doc.page.margins.left;
const right = doc.page.width - doc.page.margins.right;
const width = right - left;
const bottom = doc.page.height - doc.page.margins.bottom;

// --- flow helpers (use doc.y so content paginates naturally) ---
function heading(text) {
  if (doc.y + 40 > bottom) doc.addPage();
  const y0 = doc.y;
  doc.rect(left, y0, 4, 15).fill(BLUE);
  doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(13).text(text, left + 12, y0);
  doc.moveDown(0.4);
}
function para(text) {
  doc.font('Helvetica').fontSize(9.5).fillColor(GREY).text(text, left, doc.y, { width, lineGap: 2 });
  doc.moveDown(0.55);
}
function bullets(items) {
  doc.font('Helvetica').fontSize(9.5).fillColor(GREY)
    .list(items, left + 4, doc.y, { bulletRadius: 1.6, textIndent: 12, bulletIndent: 2, lineGap: 2.5, paragraphGap: 4 });
  doc.moveDown(0.7);
}
function table(rows, c1Head, c2Head) {
  const rowH = 17; const c2 = left + 150;
  if (doc.y + rowH * (rows.length + 1) + 8 > bottom) doc.addPage();
  let y = doc.y;
  doc.rect(left, y, width, rowH).fill(BLUE);
  doc.fillColor('white').font('Helvetica-Bold').fontSize(8.5);
  doc.text(c1Head, left + 8, y + 5); doc.text(c2Head, c2 + 8, y + 5);
  y += rowH;
  rows.forEach((r, i) => {
    if (i % 2) doc.rect(left, y, width, rowH).fill(LIGHT);
    doc.fillColor('#1e293b').font('Helvetica-Bold').fontSize(9).text(r[0], left + 8, y + 5, { width: c2 - left - 12 });
    doc.font('Helvetica').fillColor(GREY).text(r[1], c2 + 8, y + 5, { width: right - c2 - 12 });
    y += rowH;
  });
  doc.x = left; doc.y = y + 8;
}

// --- header (page 1 only) ---
doc.rect(0, 0, doc.page.width, 92).fill(NAVY);
if (fs.existsSync(LOGO)) doc.image(LOGO, left, 24, { height: 30 });
doc.fillColor('white').font('Helvetica-Bold').fontSize(19).text('FCS - Flexible Compute Service', left, 58);
doc.fillColor('#9db7ff').font('Helvetica').fontSize(10).text('Solution Brief', left, 58, { width, align: 'right' });
doc.x = left; doc.y = 108;

// --- content (flows continuously) ---
para('Flexible Compute Service (FCS) is Nobus Cloud\'s on-demand virtual server platform: launch production-grade Linux or Windows instances in minutes, resize as workloads change, and pay only for what you use - billed in local currency with zero egress fees, from Tier III-certified data centres in West and East Africa.');

heading('Instance types');
para('Choose the shape for your workload, then the size. FCS offers four instance types:');
table([
  ['Standard', 'Balanced vCPU-to-memory - general web / app workloads'],
  ['Compute Optimized', 'More vCPU per GiB - batch, media transcoding, HPC'],
  ['Memory Optimized', 'More memory per vCPU - databases, analytics, caches'],
  ['GPU Optimized', 'GPU-accelerated - AI / ML, rendering, scientific compute'],
], 'Type', 'Best for');
para('Each type spans a wide range of sizes - 1 to 8+ vCPU and 2 to 64+ GiB, plus GPU. Example sizes include si.2.4 (2 vCPU / 4 GiB), si.4.8 (4 / 8), si.8.16 (8 / 16) and si.8.64 (8 / 64). These are examples only; larger CPU, memory and GPU configurations are available on request - confirm exact flavours in the Quote Builder.');
bullets([
  'OS images: Ubuntu 24.04 / 22.04 LTS, Debian 12, Rocky Linux 9, AlmaLinux 9; Windows Server 2022 and 2025.',
  'AES-256 FBS block storage with snapshots and FOS object storage attach to any instance; resize vCPU / RAM / disk without rebuilding.',
]);

heading('Autoscaling & load balancing');
para('Handle traffic spikes without over-provisioning. Auto Scaling adds or removes FCS instances automatically against demand, while the managed Load Balancer spreads traffic across healthy instances for resilience and zero-downtime deploys - ideal for e-commerce peaks, campaigns and fintech transaction surges.');

heading('Dedicated Hosting');
para('When a workload needs single-tenant isolation - for strict compliance, licensing or performance - Dedicated Hosting reserves dedicated physical servers for one customer: the control of bare metal with the operational simplicity of the Nobus platform.');
bullets([
  'Single-tenant physical servers - no noisy neighbours.',
  'Ideal for regulated workloads and predictable, license-bound estates, managed from one console.',
]);

heading('BYOL - Bring Your Own License');
para('Already own Microsoft or Oracle licences? Bring them to Nobus on Dedicated Hosts and avoid paying twice - re-use existing entitlements (Windows Server, SQL Server, Oracle Database) on dedicated capacity while you migrate to in-region cloud.');
bullets([
  'Re-use existing Microsoft / Oracle licences on Dedicated Hosts, or choose Nobus managed Windows licensing per instance.',
  'Right-license each workload for the lowest total cost.',
]);

heading('Why FCS');
bullets([
  'Fast - production instances in minutes, not weeks.',
  'In-region - Tier III zones in Lagos (Ikeja, Lekki) and Nairobi (ADC), 99.982% uptime guarantee.',
  'Predictable - pay-as-you-use, billed in local currency, zero egress fees.',
  'Secure & compliant - AES-256 encryption, security groups and next-generation cloud firewalls; ISO 27001 & PCI DSS certified, NDPA / ODPC aligned.',
  'Open - built on OpenStack; Terraform, OpenStack CLI and REST APIs work as your engineers expect.',
]);

// CTA strip
if (doc.y + 50 > bottom) doc.addPage();
doc.rect(left, doc.y, width, 44).fill(LIGHT);
const ctaY = doc.y;
doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(11).text('Ready to size a workload?', left + 16, ctaY + 9);
doc.fillColor(GREY).font('Helvetica').fontSize(9).text('Build a customer-ready quote in the PartnerCentral Quote Builder, or talk to your Nobus partner team.', left + 16, ctaY + 24, { width: width - 32 });

// --- footers on every page (buffered) ---
const range = doc.bufferedPageRange();
for (let i = 0; i < range.count; i++) {
  doc.switchToPage(range.start + i);
  const fy = bottom - 18;
  doc.moveTo(left, fy).lineTo(right, fy).strokeColor('#e2e8f0').lineWidth(0.7).stroke();
  doc.fillColor('#94a3b8').font('Helvetica').fontSize(7.5)
    .text('Nobus Cloud Services (Nkponani Limited) · nobus.io · Partner use - indicative; confirm final specs and pricing at order.', left, fy + 6, { width, align: 'center', lineBreak: false });
}
doc.flushPages();
doc.end();
console.log('Wrote', OUT);
